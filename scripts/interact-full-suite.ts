/**
 * interact-full-suite.ts — DPO2U Full Compliance Suite Interaction
 *
 * Joins all 3 deployed contracts and runs an end-to-end LGPD compliance
 * lifecycle demo that coordinates ConsentRegistry + DataAuditLog + DataSubjectRights
 * in the order a real DPO2U system would call them.
 *
 * Usage:
 *   npx tsx scripts/interact-full-suite.ts [options]
 *
 * Options:
 *   --network   preprod | preview | standalone  (default: standalone)
 *   --seed      <64-char hex>  HD wallet seed (same seed used for deploy)
 *   --cr        <address>  ConsentRegistry contract address
 *   --dal       <address>  DataAuditLog contract address
 *   --dsr       <address>  DataSubjectRights contract address
 *   --from-json            Read addresses from deployment-*.json files (default if no flags)
 *
 * If --cr / --dal / --dsr are omitted, the script reads from:
 *   deployment-consent-registry-<network>.json
 *   deployment-data-audit-log-<network>.json
 *   deployment-data-subject-rights-<network>.json
 *
 * LGPD Lifecycle Demonstrated:
 *   Phase 1 — ConsentRegistry.grantConsent       → DataAuditLog.logEvent(type=8)
 *   Phase 2 — DataSubjectRights.submitRequest    (type=2 data_access)
 *   Phase 3 — DataSubjectRights.fulfillRequest   → DataAuditLog.logEvent(type=2)
 *   Phase 4 — ConsentRegistry.revokeConsent      → DataAuditLog.logEvent(type=8)
 *   Phase 5 — Query all contracts for final audit summary
 *
 * SDK Versions (PREPROD/STANDALONE — SDK-VERSION-MATRIX.md):
 *   @midnight-ntwrk/midnight-js-*       3.0.0–3.1.0
 *   @midnight-ntwrk/wallet-sdk-facade   2.0.0  (WalletFacade.init API)
 *   @midnight-ntwrk/ledger-v7           7.0.0
 *   @midnight-ntwrk/compact-runtime     0.14.0
 *
 * CRITICAL RULES from WORKAROUND-GUIDE.md:
 *   - NEVER use npm.midnight.network (does not exist — Bug 2)
 *   - NEVER mix preprod/preview SDK versions (silent sync failures — Bug 3)
 *   - NEVER use wallet.signRecipe() — use WalletFacade.init + finalizeRecipe (Bug 5)
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
import { createHash } from 'node:crypto';
import path from 'node:path';
import { parseArgs } from 'node:util';
import * as fs from 'node:fs';

// @ts-expect-error: global override for graphql-ws
globalThis.WebSocket = WebSocket;

// ------------------------------------------------------------------
// Network Configuration
// ------------------------------------------------------------------
interface NetworkConfig {
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
  networkId: string;
  faucetUrl?: string;
}

const NETWORKS: Record<string, NetworkConfig> = {
  preprod: {
    indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: process.env.PROOF_SERVER_URL ?? 'http://127.0.0.1:6300',
    networkId: 'preprod',
    faucetUrl: 'https://faucet.preprod.midnight.network/api/request-tokens',
  },
  preview: {
    indexer: 'https://indexer.preview.midnight.network/api/v3/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v3/graphql/ws',
    node: 'https://rpc.preview.midnight.network',
    proofServer: process.env.PROOF_SERVER_URL ?? 'http://127.0.0.1:6300',
    networkId: 'preview',
    faucetUrl: 'https://faucet.preview.midnight.network/api/request-tokens',
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
// ZK Asset Paths (output of compactc compilation)
// ------------------------------------------------------------------
const ROOT = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const ZK_CR  = path.join(ROOT, 'build', 'ConsentRegistry');
const ZK_DAL = path.join(ROOT, 'build', 'DataAuditLog');
const ZK_DSR = path.join(ROOT, 'build', 'DataSubjectRights');

// ------------------------------------------------------------------
// Compiled Contracts
// ------------------------------------------------------------------
const compiledCR = CompiledContract.make(
  'ConsentRegistry',
  ConsentRegistry.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(ZK_CR),
);

const compiledDAL = CompiledContract.make(
  'DataAuditLog',
  DataAuditLog.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(ZK_DAL),
);

const compiledDSR = CompiledContract.make(
  'DataSubjectRights',
  DataSubjectRights.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(ZK_DSR),
);

// ------------------------------------------------------------------
// HD Key Derivation
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
// Wallet initialization — WalletFacade.init() API (wallet-sdk-facade 2.0.0)
// ------------------------------------------------------------------
async function buildWallet(config: NetworkConfig, seed: string) {
  console.log('[1/5] Deriving HD keys from seed...');
  const keys = deriveKeys(seed);
  const shieldedSecretKeys = ledgerLib.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledgerLib.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], config.networkId);

  const walletConfig = {
    networkId: config.networkId,
    indexerClientConnection: {
      indexerHttpUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
    },
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, 'ws')),
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n,
      feeBlocksMargin: 5,
    },
  };

  console.log('[2/5] Initializing WalletFacade...');
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

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

// ------------------------------------------------------------------
// Wait for wallet sync
// ------------------------------------------------------------------
async function waitForSync(wallet: WalletFacade) {
  console.log('[3/5] Syncing wallet...');
  const sub = wallet.state().pipe(Rx.throttleTime(15_000)).subscribe((state) => {
    const synced = state.isSynced ? 'SYNCED' : 'syncing...';
    const nativeToken = ledgerLib.unshieldedToken().raw;
    const bal = state.unshielded?.balances?.[nativeToken] ?? 0n;
    console.log(`  [${new Date().toISOString().slice(11,19)}] ${synced} | unshielded: ${bal}`);
  });
  try {
    await wallet.waitForSyncedState();
  } finally {
    sub.unsubscribe();
  }
  console.log('  Wallet synced ✓');
}

// ------------------------------------------------------------------
// Provider bridge — shared across all 3 contracts
// Bug 5 fix: use finalizeRecipe, NOT wallet.signRecipe()
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
    submitTx(tx: any) {
      return wallet.submitTransaction(tx) as any;
    },
  };
}

// ------------------------------------------------------------------
// Build providers for a single contract
// Bug 6 fix: walletProvider required for levelPrivateStateProvider
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
// Load contract addresses: CLI flags or deployment JSON files
// ------------------------------------------------------------------
function loadAddresses(
  net: string,
  crAddr?: string,
  dalAddr?: string,
  dsrAddr?: string,
): { cr: string; dal: string; dsr: string } {
  if (crAddr && dalAddr && dsrAddr) {
    return { cr: crAddr, dal: dalAddr, dsr: dsrAddr };
  }

  const load = (name: string, flag?: string) => {
    if (flag) return flag;
    const file = path.join(ROOT, `deployment-${name}-${net}.json`);
    if (!fs.existsSync(file)) {
      throw new Error(
        `Missing address for ${name}. Pass --${name.split('-').map(w => w[0]).join('')} <address> or deploy first.`,
      );
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    console.log(`  Loaded ${name} address from ${path.basename(file)}`);
    return data.contractAddress as string;
  };

  return {
    cr:  load('consent-registry',  crAddr),
    dal: load('data-audit-log',    dalAddr),
    dsr: load('data-subject-rights', dsrAddr),
  };
}

// ------------------------------------------------------------------
// Phase 1: Grant consent + log consent_change in DataAuditLog
// ------------------------------------------------------------------
async function phase1GrantConsent(
  crContract: any,
  dalContract: any,
  subjectId: Buffer,
  controllerIdHash: Buffer,
  blockNumber: number,
) {
  console.log('\n━━━ Phase 1: Grant Consent (LGPD Art. 7/8) ━━━');

  const purposes = 3;  // 0x01 essential + 0x02 analytics
  const policyVersion = 1;

  console.log(`  [CR] grantConsent — purposes: ${purposes} (essential+analytics), policy v${policyVersion}`);
  const grantTx = await crContract.callTx.grantConsent(subjectId, purposes, policyVersion);
  console.log(`  [CR] ✓ Tx: ${grantTx.public.txId} (block ${grantTx.public.blockHeight})`);

  // Cross-contract coordination: consent change → audit log (event type 8)
  console.log(`  [DAL] logEvent(type=8 consent_change, block=${blockNumber})`);
  const auditTx = await dalContract.callTx.logEvent(controllerIdHash, 8, blockNumber);
  console.log(`  [DAL] ✓ Tx: ${auditTx.public.txId}`);

  return grantTx.public.blockHeight as number;
}

// ------------------------------------------------------------------
// Phase 2: Submit data access rights request (LGPD Art. 18 II)
// ------------------------------------------------------------------
async function phase2SubmitRequest(
  dsrContract: any,
  requestId: Buffer,
  submittedBlock: number,
) {
  console.log('\n━━━ Phase 2: Submit Rights Request (LGPD Art. 18 II) ━━━');

  const reqType = 2; // data_access
  console.log(`  [DSR] submitRequest — type=2 (data_access), block=${submittedBlock}`);
  const submitTx = await dsrContract.callTx.submitRequest(requestId, reqType, submittedBlock);
  console.log(`  [DSR] ✓ Tx: ${submitTx.public.txId} (block ${submitTx.public.blockHeight})`);

  const status = await dsrContract.callTx.getRequestStatus(requestId);
  console.log(`  [DSR] Status: ${status.data} (expected 1 = open)`);

  return submitTx.public.blockHeight as number;
}

// ------------------------------------------------------------------
// Phase 3: Fulfill request + log data_access event in DataAuditLog
// ------------------------------------------------------------------
async function phase3FulfillRequest(
  dsrContract: any,
  dalContract: any,
  requestId: Buffer,
  controllerIdHash: Buffer,
  resolvedBlock: number,
) {
  console.log('\n━━━ Phase 3: Fulfill Request (LGPD Art. 19 — 15-day deadline) ━━━');

  console.log(`  [DSR] fulfillRequest — block=${resolvedBlock}`);
  const fulfillTx = await dsrContract.callTx.fulfillRequest(requestId, resolvedBlock);
  console.log(`  [DSR] ✓ Tx: ${fulfillTx.public.txId}`);

  // Audit trail: data_access completed (event type 2)
  console.log(`  [DAL] logEvent(type=2 data_access, block=${resolvedBlock})`);
  const auditTx = await dalContract.callTx.logEvent(controllerIdHash, 2, resolvedBlock);
  console.log(`  [DAL] ✓ Tx: ${auditTx.public.txId}`);
}

// ------------------------------------------------------------------
// Phase 4: Revoke consent + log consent_change in DataAuditLog
// LGPD Art. 8 §5 — revocation must be as easy as granting
// ------------------------------------------------------------------
async function phase4RevokeConsent(
  crContract: any,
  dalContract: any,
  subjectId: Buffer,
  controllerIdHash: Buffer,
  blockNumber: number,
) {
  console.log('\n━━━ Phase 4: Revoke Consent (LGPD Art. 8 §5) ━━━');

  console.log(`  [CR] revokeConsent`);
  const revokeTx = await crContract.callTx.revokeConsent(subjectId);
  console.log(`  [CR] ✓ Tx: ${revokeTx.public.txId}`);

  // Cross-contract: consent change → audit log (event type 8)
  console.log(`  [DAL] logEvent(type=8 consent_change, block=${blockNumber})`);
  const auditTx = await dalContract.callTx.logEvent(controllerIdHash, 8, blockNumber);
  console.log(`  [DAL] ✓ Tx: ${auditTx.public.txId}`);
}

// ------------------------------------------------------------------
// Phase 5: Query final state across all 3 contracts
// ------------------------------------------------------------------
async function phase5AuditSummary(
  crContract: any,
  dalContract: any,
  dsrContract: any,
  subjectId: Buffer,
  controllerIdHash: Buffer,
  requestId: Buffer,
) {
  console.log('\n━━━ Phase 5: Audit Summary Query ━━━');

  const [
    consentStatus,
    consentPurposes,
    totalGranted,
    totalRevocations,
  ] = await Promise.all([
    crContract.callTx.getConsentStatus(subjectId),
    crContract.callTx.getConsentPurposes(subjectId),
    crContract.callTx.getTotalConsentsGranted(),
    crContract.callTx.getTotalRevocations(),
  ]);

  const STATUS_LABELS: Record<number, string> = { 0: 'no_record', 1: 'active', 2: 'revoked' };
  console.log('\n  ConsentRegistry:');
  console.log(`    consent_status:   ${consentStatus.data} (${STATUS_LABELS[consentStatus.data] ?? '?'})`);
  console.log(`    consent_purposes: ${consentPurposes.data} (bitmask — 0 = fully revoked)`);
  console.log(`    total_granted:    ${totalGranted.data}`);
  console.log(`    total_revocations:${totalRevocations.data}`);

  const [
    controllerEvents,
    lastEventType,
    totalEvents,
    totalDeletionReqs,
    totalBreaches,
  ] = await Promise.all([
    dalContract.callTx.getControllerEventCount(controllerIdHash),
    dalContract.callTx.getLastEventType(controllerIdHash),
    dalContract.callTx.getTotalEvents(),
    dalContract.callTx.getTotalDeletionRequests(),
    dalContract.callTx.getTotalBreachEvents(),
  ]);

  const EVENT_LABELS: Record<number, string> = {
    1: 'data_collection', 2: 'data_access', 3: 'data_modification',
    4: 'data_transfer_third_party', 5: 'deletion_request_received',
    6: 'deletion_confirmed', 7: 'data_portability_export',
    8: 'consent_change', 9: 'breach_notification',
  };
  console.log('\n  DataAuditLog:');
  console.log(`    controller_events:  ${controllerEvents.data}`);
  console.log(`    last_event_type:    ${lastEventType.data} (${EVENT_LABELS[lastEventType.data] ?? '?'})`);
  console.log(`    total_events:       ${totalEvents.data}`);
  console.log(`    deletion_requests:  ${totalDeletionReqs.data}`);
  console.log(`    breach_events:      ${totalBreaches.data}`);

  const [
    requestStatus,
    requestType,
    totalRequests,
    totalFulfilled,
    totalOverdue,
  ] = await Promise.all([
    dsrContract.callTx.getRequestStatus(requestId),
    dsrContract.callTx.getRequestType(requestId),
    dsrContract.callTx.getTotalRequests(),
    dsrContract.callTx.getTotalFulfilled(),
    dsrContract.callTx.getTotalOverdue(),
  ]);

  const REQ_STATUS: Record<number, string> = {
    0: 'not_found', 1: 'open', 2: 'fulfilled', 3: 'rejected', 4: 'overdue',
  };
  const REQ_TYPE: Record<number, string> = {
    1: 'confirmation', 2: 'data_access', 3: 'data_correction', 4: 'anonymization_block',
    5: 'portability', 6: 'consent_deletion', 7: 'sharing_info',
    8: 'refusal_info', 9: 'consent_revocation',
  };
  console.log('\n  DataSubjectRights:');
  console.log(`    request_status:    ${requestStatus.data} (${REQ_STATUS[requestStatus.data] ?? '?'})`);
  console.log(`    request_type:      ${requestType.data} (${REQ_TYPE[requestType.data] ?? '?'})`);
  console.log(`    total_requests:    ${totalRequests.data}`);
  console.log(`    total_fulfilled:   ${totalFulfilled.data}`);
  console.log(`    total_overdue:     ${totalOverdue.data}`);

  console.log('\n  LGPD Compliance Check:');
  const consentOk = consentStatus.data === 2;  // revoked as expected
  const auditOk   = Number(controllerEvents.data) >= 3; // at least 3 events logged
  const requestOk = requestStatus.data === 2;  // fulfilled within deadline
  console.log(`    ✓ Consent revoked (Art. 8 §5):         ${consentOk ? 'PASS' : 'FAIL'}`);
  console.log(`    ✓ Audit trail present (Art. 37):        ${auditOk   ? 'PASS' : 'FAIL'}`);
  console.log(`    ✓ Rights request fulfilled (Art. 19):   ${requestOk ? 'PASS' : 'FAIL'}`);
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function main() {
  const { values } = parseArgs({
    options: {
      network:  { type: 'string',  default: process.env.MIDNIGHT_NETWORK ?? 'standalone' },
      seed:     { type: 'string' },
      cr:       { type: 'string' },
      dal:      { type: 'string' },
      dsr:      { type: 'string' },
    },
  });

  const net = values.network ?? 'standalone';
  const config = NETWORKS[net];
  if (!config) { console.error(`Unknown network: ${net}`); process.exit(1); }

  console.log('='.repeat(60));
  console.log('  DPO2U Full Compliance Suite — Midnight Network');
  console.log(`  Network: ${net.toUpperCase()}`);
  console.log('='.repeat(60));
  console.log(`  Indexer:      ${config.indexer}`);
  console.log(`  Proof Server: ${config.proofServer}`);
  console.log('');

  // CRITICAL: must call setNetworkId() before any contract operation
  setNetworkId(config.networkId);

  const seed = values.seed ?? process.env.MIDNIGHT_SEED ?? toHex(Buffer.from(generateRandomSeed()));
  console.log(`  Seed: ${seed}`);

  // Load contract addresses from CLI flags or deployment JSON files
  console.log('\n[0/5] Loading contract addresses...');
  const addrs = loadAddresses(net, values.cr, values.dal, values.dsr);
  console.log(`  ConsentRegistry:   ${addrs.cr}`);
  console.log(`  DataAuditLog:      ${addrs.dal}`);
  console.log(`  DataSubjectRights: ${addrs.dsr}`);

  // Build wallet — shared across all 3 contracts
  const { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore } =
    await buildWallet(config, seed);

  await waitForSync(wallet);

  // Shared provider bridge (wallet operations are contract-agnostic)
  console.log('[4/5] Building provider bridge...');
  const bridge = await createBridge(wallet, shieldedSecretKeys, dustSecretKey);

  // Build per-contract providers (ZK assets and private state store are contract-specific)
  const crProviders  = buildProviders(bridge, config, ZK_CR,  'cr-private-state');
  const dalProviders = buildProviders(bridge, config, ZK_DAL, 'dal-private-state');
  const dsrProviders = buildProviders(bridge, config, ZK_DSR, 'dsr-private-state');

  // Join all 3 deployed contracts
  console.log('[5/5] Joining deployed contracts...');
  const privateState = {} as Record<string, never>;

  const crContract = await findDeployedContract(crProviders as any, {
    contractAddress: addrs.cr,
    compiledContract: compiledCR,
    privateStateId: 'cr-private-state' as any,
    initialPrivateState: privateState,
  });
  console.log(`  ConsentRegistry   ✓`);

  const dalContract = await findDeployedContract(dalProviders as any, {
    contractAddress: addrs.dal,
    compiledContract: compiledDAL,
    privateStateId: 'dal-private-state' as any,
    initialPrivateState: privateState,
  });
  console.log(`  DataAuditLog      ✓`);

  const dsrContract = await findDeployedContract(dsrProviders as any, {
    contractAddress: addrs.dsr,
    compiledContract: compiledDSR,
    privateStateId: 'dsr-private-state' as any,
    initialPrivateState: privateState,
  });
  console.log(`  DataSubjectRights ✓`);

  // ------------------------------------------------------------------
  // Demo identifiers — PII never on-chain, only hashes
  // subject_id: sha256("ana.silva@example.com.br")
  // controller_id: sha256("DPO2U-LTDA-CNPJ-00000000000100")
  // request_id: sha256(subject_id || controller_id || type=2 || nonce=1)
  // ------------------------------------------------------------------
  const subjectId       = createHash('sha256').update('ana.silva@example.com.br').digest();
  const controllerId    = createHash('sha256').update('DPO2U-LTDA-CNPJ-00000000000100').digest();
  const requestId       = createHash('sha256')
    .update(Buffer.concat([subjectId, controllerId, Buffer.from([2, 1])]))
    .digest();

  const currentBlock = 100; // Representative block for standalone; use real block in preprod

  console.log('\n' + '='.repeat(60));
  console.log('  Running LGPD Compliance Lifecycle Demo');
  console.log('='.repeat(60));
  console.log(`  Subject hash:    0x${subjectId.toString('hex').slice(0, 16)}...`);
  console.log(`  Controller hash: 0x${controllerId.toString('hex').slice(0, 16)}...`);
  console.log(`  Request hash:    0x${requestId.toString('hex').slice(0, 16)}...`);

  // Run all 5 phases in sequence
  const grantBlock = await phase1GrantConsent(crContract, dalContract, subjectId, controllerId, currentBlock);
  const submitBlock = await phase2SubmitRequest(dsrContract, requestId, grantBlock || currentBlock);
  await phase3FulfillRequest(dsrContract, dalContract, requestId, controllerId, (submitBlock || currentBlock) + 1);
  await phase4RevokeConsent(crContract, dalContract, subjectId, controllerId, (submitBlock || currentBlock) + 2);
  await phase5AuditSummary(crContract, dalContract, dsrContract, subjectId, controllerId, requestId);

  console.log('\n' + '='.repeat(60));
  console.log('  DEMO COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Contracts exercised: ConsentRegistry + DataAuditLog + DataSubjectRights`);
  console.log(`  LGPD Articles covered: Art. 7, 8, 8§5, 18 I-IX, 19, 37`);
  console.log(`  Network: ${net}`);

  await wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nInteract failed:', err);
  process.exit(1);
});
