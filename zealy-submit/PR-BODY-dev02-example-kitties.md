## Problem

`example-kitties` configures its remote CLI/web flows against the public **`testnet-02`** network. That network has been **decommissioned** — its indexer and RPC hosts no longer resolve:

```
$ curl https://indexer.testnet-02.midnight.network/api/v1/graphql
curl: (6) Could not resolve host: indexer.testnet-02.midnight.network
$ curl https://rpc.testnet-02.midnight.network
curl: (6) Could not resolve host: rpc.testnet-02.midnight.network
```

So `yarn kitties-cli-remote` / `kitties-cli-remote-ps` and the browser `testnet-remote` config can no longer reach a live network — they fail with a DNS error rather than anything actionable.

The current public networks are **`preprod`** and **`preview`**, served over indexer API **v3** (both live). The canonical [`example-counter`](https://github.com/midnightntwrk/example-counter) already uses them (`indexer.preprod.midnight.network/api/v3/graphql`, `setNetworkId('preprod')`) and ships a `MIGRATION_GUIDE.md`.

## Change

This is a minimal, behaviour-preserving deprecation pass (no SDK bump):

- **`packages/api/kitties/src/common/config.ts`** — add `@deprecated` JSDoc + a runtime `console.warn` to `TestnetRemoteConfig` and `BrowserTestnetRemoteConfig` so the dead network surfaces an explicit, actionable message instead of failing silently on a DNS error.
- **`README.md`** — a "Network status" warning under *CLI Operations* explaining that the remote flows target the decommissioned `testnet-02` and pointing to `example-counter` / its `MIGRATION_GUIDE.md`. Notes that the local **standalone** flow is unaffected.
- **`CHANGELOG.md`** — entry under `[Unreleased] → Deprecated`.

A full migration to `preprod`/`preview` requires upgrading the `@midnight-ntwrk/*` SDKs (currently `midnight-js` 2.0.2, whose `NetworkId` enum has no `preprod`/`preview`), which is intentionally out of scope here — this PR makes the current breakage explicit and documents the path. Happy to follow up with the SDK migration if maintainers want it.

## Notes

- No change to the standalone (local) flow.
- Context / original investigation: a developer write-up reproducing the wallet/network incompatibility while following the Kitties tutorial.
