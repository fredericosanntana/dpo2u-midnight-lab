/**
 * wallet-facade.ts — single place that builds a started WalletFacade for the
 * PREPROD SDK line (wallet-sdk-facade 1.0.0).
 *
 * WHY THIS EXISTS: SDK-VERSION-MATRIX.md pins preprod to wallet-sdk-facade
 * 1.0.0, whose API is `new WalletFacade(shielded, unshielded, dust)` followed
 * by `wallet.start(...)` (WORKAROUND-GUIDE.md Bug 4). `WalletFacade.init()` is
 * the 2.0.0 (preview) API and does not exist on the installed 1.0.0 — every
 * deploy/interact script called it and would have crashed at wallet setup.
 * Keeping the construction here means an SDK bump is a one-file change.
 */
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import {
  type createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as ledgerLib from '@midnight-ntwrk/ledger-v7';

export interface WalletFacadeConfig {
  networkId: string;
  indexerClientConnection: { indexerHttpUrl: string; indexerWsUrl: string };
  provingServerUrl: URL;
  relayURL: URL;
  costParameters: { additionalFeeOverhead: bigint; feeBlocksMargin: number };
}

export async function startWalletFacade(
  config: WalletFacadeConfig,
  shieldedSecretKeys: ledgerLib.ZswapSecretKeys,
  dustSecretKey: ledgerLib.DustSecretKey,
  unshieldedKeystore: ReturnType<typeof createKeystore>,
): Promise<WalletFacade> {
  const shielded = ShieldedWallet(config).startWithSecretKeys(shieldedSecretKeys);
  const unshielded = UnshieldedWallet({
    ...config,
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  }).startWithPublicKey(
    PublicKey.fromKeyStore(unshieldedKeystore),
  );
  const dust = DustWallet(config).startWithSecretKey(
    dustSecretKey,
    ledgerLib.LedgerParameters.initialParameters().dust,
  );
  const wallet = new WalletFacade(shielded, unshielded, dust);
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  return wallet;
}
