/**
 * status.ts — Live status report for deployed DPO2U contracts
 *
 * Reads deployment JSON files and queries each contract for its current
 * on-chain global counters. No lifecycle is run — pure read-only state check.
 * Useful between deploy and interact-full-suite.ts, or to verify state after.
 *
 * Usage:
 *   npx tsx scripts/status.ts [options]
 *
 * Options:
 *   --network   preprod | preview | standalone  (default: standalone)
 *   --seed      <64-char hex>  HD wallet seed (same seed used for deploy)
 *
 * Reads:
 *   deployment-consent-registry-<network>.json
 *   deployment-data-audit-log-<network>.json
 *   deployment-data-subject-rights-<network>.json
 *
 * SDK Versions (PREPROD/STANDALONE — SDK-VERSION-MATRIX.md):
 *   @midnight-ntwrk/midnight-js-*       3.0.0–3.1.0
 *   @midnight-ntwrk/wallet-sdk-facade   2.0.0  (WalletFacade.init API)
 *   @midnight-ntwrk/ledger-v7           7.0.0
 *   @midnight-ntwrk/compact-runtime     0.14.0
 *
 * CRITICAL RULES from WORKAROUND-GUIDE.md:
 *   - NEVER use npm.midnight.network (Bug 2)
 *   - NEVER mix preprod/preview SDK versions (Bug 3)
 *   - ALWAYS call setNetworkId() before any contract operation
 *   - ALWAYS add smoldot override to package.json (Bug 7)
 */

import 'dotenv/config';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import {
  type MidnightProvider,
  type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { CompiledContract } from '@midnight-ntwrk/compact-js';

import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import {
  createKeystore,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as ledgerLib from '@midnight-ntwrk/ledger-v7';

import * as ConsentRegistry from '../build/ConsentRegistry/contract/index.js';
import * as DataAuditLog from '../build/DataAuditLog/contract/index.js';
import * as DataSubjectRights from '../build/DataSubjectRights/contract/index.js';

import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
import { Buffer } from 'buffer';
import path from 'node:path';
import { parseArgs } from 'node:util';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// @ts-expect-error: global override for graphql-ws
globalThis.WebSocket = WebSocket;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BUILD = path.resolve(ROOT, 'build');

// ------------------------------------------------------------------
// Network config
// ------------------------------------------------------------------
interface NetworkConfig {
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
  networkId: string;
}

const NETWORKS: Record<string, NetworkConfig> = {
  preprod: {
    indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: process.env.PROOF_SERVER_URL ?? 'http://127.0.0.1:6300',
    networkId: 'preprod',
  },
  preview: {
    indexer: 'https://indexer.preview.midnight.network/api/v3/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v3/graphql/ws',
    node: 'https://rpc.preview.midnight.network',
    proofServer: process.env.PROOF_SERVER_URL ?? 'http://127.0.0.1:6300',
    networkId: 'preview',
  },
  standalone: {
    indexer: 'http://127.0.0.1:8088/api/v3/graphql',
    indexerWS: 'ws://127.0.0.1:8088/api/v3/graphql/ws',
    node: 'http://127.0.0.1:9944',
    proofServer: process.env.PROOF_SERVER_URL ?? 'http://127.0.0.1:6300',
    networkId: 'undeployed',
  },
};

// ------------------------------------------------------------------
// Load deployment JSON — returns null if file is missing
// ------------------------------------------------------------------
interface DeploymentInfo {
  contract: string;
  network: string;
  contractAddress: string;
  blockHeight: number;
  txId: string;
  walletAddress: string;
  timestamp: string;
}

function loadDeployment(slug: string, net: string): DeploymentInfo | null {
  const file = path.join(ROOT, `deployment-${slug}-${net}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as DeploymentInfo;
}

// ------------------------------------------------------------------
// HD key derivation
// ------------------------------------------------------------------
function deriveKeys(seed: string) {
  const hd = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hd.type !== 'seedOk') throw new Error('Bad HD seed — must be 64 hex chars');
  const result = hd.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hd.hdWallet.clear();
  return result.keys;
}

// ------------------------------------------------------------------
// Wallet init — WalletFacade.init() API (wallet-sdk-facade 2.0.0)
// ------------------------------------------------------------------
async function buildWallet(config: NetworkConfig, seed: string) {
  const keys = deriveKeys(seed);
  const shieldedSecretKeys = ledgerLib.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledgerLib.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], config.networkId);

  const walletConfig = {
    networkId: config.networkId,
    indexerClientConnection: { indexerHttpUrl: config.indexer, indexerWsUrl: config.indexerWS },
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, 'ws')),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  };

  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (cfg: any) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg: any) => UnshieldedWallet(cfg).startWithPublicKey(
      PublicKey.fromKeyStore(unshieldedKeystore),
    ),
    dust: (cfg: any) => DustWallet(cfg).startWithSecretKey(
      dustSecretKey,
      ledgerLib.LedgerParameters.initialParameters().dust,
    ),
  });

  return { wallet, shieldedSecretKeys, dustSecretKey };
}

// ------------------------------------------------------------------
// Wait for sync
// ------------------------------------------------------------------
async function waitForSync(wallet: WalletFacade) {
  console.log('Syncing wallet...');
  const sub = wallet.state().pipe(Rx.throttleTime(15_000)).subscribe((s) => {
    const nativeToken = ledgerLib.unshieldedToken().raw;
    const bal = s.unshielded?.balances?.[nativeToken] ?? 0n;
    console.log(`  ${s.isSynced ? 'SYNCED' : 'syncing...'} | balance: ${bal}`);
  });
  try {
    await wallet.waitForSyncedState();
  } finally {
    sub.unsubscribe();
  }
  console.log('  Synced ✓');
}

// ------------------------------------------------------------------
// Provider bridge
// ------------------------------------------------------------------
async function createBridge(
  wallet: WalletFacade,
  shieldedSecretKeys: ledgerLib.ZswapSecretKeys,
  dustSecretKey: ledgerLib.DustSecretKey,
): Promise<WalletProvider & MidnightProvider> {
  const state = await wallet.waitForSyncedState();
  return {
    getCoinPublicKey: () => state.shielded.coinPublicKey.toHexString(),
    getEncryptionPublicKey: () => state.shielded.encryptionPublicKey.toHexString(),
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys, dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return wallet.finalizeRecipe(recipe);
    },
    submitTx(tx: any) { return wallet.submitTransaction(tx) as any; },
  };
}

// ------------------------------------------------------------------
// Build providers for one contract
// ------------------------------------------------------------------
function buildProviders(
  bridge: WalletProvider & MidnightProvider,
  config: NetworkConfig,
  zkPath: string,
  privateStateStoreName: string,
) {
  const zkConfigProvider = new NodeZkConfigProvider<any>(zkPath);
  return {
    privateStateProvider: levelPrivateStateProvider<any>({
      privateStateStoreName,
      walletProvider: bridge,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider: bridge,
    midnightProvider: bridge,
  };
}

// ------------------------------------------------------------------
// Query ConsentRegistry global counters
// ------------------------------------------------------------------
async function queryCR(contract: any): Promise<void> {
  const [granted, revocations] = await Promise.all([
    contract.callTx.getTotalConsentsGranted(),
    contract.callTx.getTotalRevocations(),
  ]);
  console.log('  ConsentRegistry:');
  console.log(`    total_consents_granted : ${granted.data}`);
  console.log(`    total_revocations      : ${revocations.data}`);
}

// ------------------------------------------------------------------
// Query DataAuditLog global counters
// ------------------------------------------------------------------
async function queryDAL(contract: any): Promise<void> {
  const [total, deletions, breaches] = await Promise.all([
    contract.callTx.getTotalEvents(),
    contract.callTx.getTotalDeletionRequests(),
    contract.callTx.getTotalBreachEvents(),
  ]);
  console.log('  DataAuditLog:');
  console.log(`    total_events           : ${total.data}`);
  console.log(`    total_deletion_reqs    : ${deletions.data}`);
  console.log(`    total_breach_events    : ${breaches.data}`);
}

// ------------------------------------------------------------------
// Query DataSubjectRights global counters
// ------------------------------------------------------------------
async function queryDSR(contract: any): Promise<void> {
  const [total, fulfilled, rejected, overdue] = await Promise.all([
    contract.callTx.getTotalRequests(),
    contract.callTx.getTotalFulfilled(),
    contract.callTx.getTotalRejected(),
    contract.callTx.getTotalOverdue(),
  ]);
  console.log('  DataSubjectRights:');
  console.log(`    total_requests         : ${total.data}`);
  console.log(`    total_fulfilled        : ${fulfilled.data}`);
  console.log(`    total_rejected         : ${rejected.data}`);
  console.log(`    total_overdue          : ${overdue.data}`);
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function main() {
  const { values } = parseArgs({
    options: {
      network: { type: 'string', default: process.env.MIDNIGHT_NETWORK ?? 'standalone' },
      seed:    { type: 'string' },
    },
  });

  const net = values.network ?? 'standalone';
  const config = NETWORKS[net];
  if (!config) { console.error(`Unknown network: ${net}`); process.exit(1); }

  console.log('='.repeat(60));
  console.log('  DPO2U Contract Status — Midnight Network');
  console.log(`  Network: ${net.toUpperCase()}  |  ${new Date().toISOString().slice(0, 19)}Z`);
  console.log('='.repeat(60));

  // CRITICAL: must call setNetworkId() before any contract operation
  setNetworkId(config.networkId);

  // Load deployment info from JSON files
  const crInfo  = loadDeployment('consent-registry',   net);
  const dalInfo = loadDeployment('data-audit-log',     net);
  const dsrInfo = loadDeployment('data-subject-rights', net);

  const allDeployed = crInfo && dalInfo && dsrInfo;

  console.log('\n  Deployment Files:');
  const row = (label: string, info: DeploymentInfo | null) => {
    if (!info) {
      console.log(`    ${label.padEnd(20)} NOT DEPLOYED  (run deploy-all.ts first)`);
    } else {
      console.log(`    ${label.padEnd(20)} ${info.contractAddress}`);
      console.log(`    ${''.padEnd(20)} block ${info.blockHeight} | ${info.timestamp.slice(0, 19)}Z`);
    }
  };
  row('ConsentRegistry',   crInfo);
  row('DataAuditLog',      dalInfo);
  row('DataSubjectRights', dsrInfo);

  if (!allDeployed) {
    console.log('\n  One or more contracts not yet deployed.');
    console.log('  Run: npx tsx scripts/deploy-all.ts --network ' + net);
    process.exit(0);
  }

  // Build wallet and sync
  const seed = values.seed ?? process.env.MIDNIGHT_SEED ?? toHex(Buffer.from(generateRandomSeed()));
  console.log(`\n  Seed: ${seed.slice(0, 16)}...`);

  const { wallet, shieldedSecretKeys, dustSecretKey } = await buildWallet(config, seed);
  await waitForSync(wallet);

  const bridge = await createBridge(wallet, shieldedSecretKeys, dustSecretKey);

  // Build providers and join each contract
  const crProviders  = buildProviders(bridge, config, path.join(BUILD, 'ConsentRegistry'),   'status-cr-ps');
  const dalProviders = buildProviders(bridge, config, path.join(BUILD, 'DataAuditLog'),      'status-dal-ps');
  const dsrProviders = buildProviders(bridge, config, path.join(BUILD, 'DataSubjectRights'), 'status-dsr-ps');

  const emptyPrivateState = {} as Record<string, never>;

  const crContract = await findDeployedContract(crProviders as any, {
    contractAddress: crInfo!.contractAddress,
    compiledContract: CompiledContract.make('ConsentRegistry', ConsentRegistry.Contract as any).pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets(path.join(BUILD, 'ConsentRegistry')),
    ),
    privateStateId: 'status-cr-ps' as any,
    initialPrivateState: emptyPrivateState,
  });

  const dalContract = await findDeployedContract(dalProviders as any, {
    contractAddress: dalInfo!.contractAddress,
    compiledContract: CompiledContract.make('DataAuditLog', DataAuditLog.Contract as any).pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets(path.join(BUILD, 'DataAuditLog')),
    ),
    privateStateId: 'status-dal-ps' as any,
    initialPrivateState: emptyPrivateState,
  });

  const dsrContract = await findDeployedContract(dsrProviders as any, {
    contractAddress: dsrInfo!.contractAddress,
    compiledContract: CompiledContract.make('DataSubjectRights', DataSubjectRights.Contract as any).pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets(path.join(BUILD, 'DataSubjectRights')),
    ),
    privateStateId: 'status-dsr-ps' as any,
    initialPrivateState: emptyPrivateState,
  });

  // Query live on-chain state
  console.log('\n  Live On-Chain Counters:');
  await queryCR(crContract);
  await queryDAL(dalContract);
  await queryDSR(dsrContract);

  console.log('\n' + '='.repeat(60));
  console.log('  STATUS COMPLETE');
  console.log('='.repeat(60));
  console.log('  Next: run the full LGPD lifecycle demo:');
  console.log(`    npx tsx scripts/interact-full-suite.ts --network ${net} --seed <seed>`);
  console.log('='.repeat(60));

  await wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nStatus check failed:', err);
  process.exit(1);
});
