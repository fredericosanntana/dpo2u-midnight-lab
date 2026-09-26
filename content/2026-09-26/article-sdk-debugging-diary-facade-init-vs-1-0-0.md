---
date: 2026-09-26
pillar: midnight-dev
format: article — sdk-debugging-diary
language: en
source: commit 6c9f583 (dev phase, 2026-09-26 10:08 UTC) + logs/2026-09-26-dev.md.
  Re-run in this session — `npm run typecheck` → 11 errors; `tsc --noEmit` in a
  throwaway git worktree of HEAD~1 (node_modules symlinked) → 17 errors
  (6 TS2339, 7 TS2345, 4 TS2769); `git -C /root/dpo2u-midnight-agent-dna log --
  knowledge/SDK-VERSION-MATRIX.md` → one commit (a61d953, 2026-04-08);
  `git log -S'WalletFacade.init' -- scripts` → first hit 2b277c4 (2026-04-09);
  `git log --diff-filter=A -- package.json tsconfig.json package-lock.json` →
  c1cd3c3 (2026-08-23), 9b25575 (2026-09-15); `grep -n facade
  logs/2026-06-{16,17,29,30}-dev.md`; LEANN (dpo2u-knowledge) for the April draft.
status: types-only evidence — nothing was executed against node, indexer or proof-server
---

# Six deploy scripts called an API the installed SDK doesn't have — for 170 days

Six TypeScript scripts in our lab repo — three contract deploys, the all-in-one
deploy, a full-suite interaction script and a status probe — build their wallet
with `WalletFacade.init({...})`. The `@midnight-ntwrk/wallet-sdk-facade` we
install is 1.0.0, and 1.0.0 has no `init`. Nobody noticed, because nothing ever
asked the compiler. This is how it was found today, what we changed, and — just
as important — what the change does **not** prove.

## Symptom

**Environment**: `@midnight-ntwrk/wallet-sdk-facade` 1.0.0 (pinned in
`package.json`, locked in `package-lock.json`, installed in `node_modules`);
target network preprod (node 0.21.0, indexer 3.1.0, proof-server 7.0.0 per the
DNA `SDK-VERSION-MATRIX.md`). Node.js version was not recorded in this session.

**Error**: `error TS2339: Property 'init' does not exist on type 'typeof WalletFacade'.`

This is not a crash report. The symptom only exists if you ask the compiler, and
until today the repo had no command that did — the fix commit adds the first
`typecheck` script. The first `tsc --noEmit` over `scripts/` reported 17 errors.
Six of them were this one, once per script:

| Script | Line (pre-fix) |
|---|---|
| `scripts/deploy-all.ts` | 185 |
| `scripts/deploy-consent-registry.ts` | 193 |
| `scripts/deploy-data-audit-log.ts` | 205 |
| `scripts/deploy-data-subject-rights.ts` | 198 |
| `scripts/interact-full-suite.ts` | 200 |
| `scripts/status.ts` | 163 |

At runtime the same mistake is Bug 4 in our `WORKAROUND-GUIDE.md` —
`WalletFacade.init is not a function` — and it fires at the first step of wallet
setup, before any contract logic runs. We have not executed the scripts, so
"would have failed there" is inferred from the type error, not observed.

## Investigation

### Hypothesis 1: the installed SDK is the wrong one

```bash
grep -n 'wallet-sdk-facade' package.json
grep -n -A2 '"node_modules/@midnight-ntwrk/wallet-sdk-facade"' package-lock.json
grep -m1 '"version"' node_modules/@midnight-ntwrk/wallet-sdk-facade/package.json
```

Result: `1.0.0` in all three. The DNA matrix also says 1.0.0 for preprod. The
install is right; the code is wrong. Rejected.

### Hypothesis 2: the matrix changed after the scripts were written

```bash
git -C /root/dpo2u-midnight-agent-dna log --format='%h %ad' --date=short \
  -- knowledge/SDK-VERSION-MATRIX.md
# a61d953 2026-04-08
git log -S'WalletFacade.init' --reverse --format='%h %ad' --date=short -- scripts
# 2b277c4 2026-04-09   <- first hit
```

Result: the matrix has exactly one commit, the day **before** the first
`WalletFacade.init` landed in the lab. Its preprod table lists facade
`**1.0.0**` with the note "NOT 2.0.0"; 2.0.0 sits in a separate `PREVIEW (node
0.22.0) — DO NOT use with preprod infra` table. So the matrix never moved.
Rejected — and note that our own 2026-09-26 dev log words this as "the matrix
*today* says 1.0.0", which reads as if it changed. It didn't; that wording is
imprecise.

### Hypothesis 3: the logs that "confirmed" the version recorded something else

```bash
grep -n -i facade logs/2026-06-16-dev.md logs/2026-06-17-dev.md \
  logs/2026-06-29-dev.md logs/2026-06-30-dev.md
```

Result: all four say the matrix was read and 2.0.0 confirmed — e.g. 06-16:
"confirmed target: preprod, Node 0.21.0, wallet-sdk-facade 2.0.0"; 06-30:
"confirmed wallet-sdk-facade 2.0.0 + WalletFacade.init() API for preprod". That
does not match the matrix as committed. **Why** is not established. The
plausible reading is that the PREVIEW table was taken for the preprod one — but
that is a hypothesis; we did not test it, and the sessions that wrote those
lines are gone.

### Hypothesis 4: something should have caught it

```bash
git log --diff-filter=A --format='%h %ad %s' --date=short \
  -- package.json tsconfig.json package-lock.json
# c1cd3c3 2026-08-23  (package.json, tsconfig.json — "rescue")
# 9b25575 2026-09-15  (package-lock.json — "rescue")
```

Result: the manifest that pins the SDK version and the tsconfig were not in git
until August 23, and the lockfile until September 15 — both arrived as rescues
of files that had been sitting untracked. Before the fix there was no
`typecheck` script. The scripts were written against one SDK line and installed
against another, with no step in between that compared them.

## Root Cause

The library exposes two incompatible construction styles for the same class, and
which one you get is decided by the version you install:

- **1.0.0 (preprod)** — build three sub-wallets, then `new WalletFacade(shielded,
  unshielded, dust)` and `await wallet.start(shieldedSecretKeys, dustSecretKey)`.
- **2.0.0 (preview)** — `await WalletFacade.init({ configuration, shielded,
  unshielded, dust })`.

The scripts used the second style; the manifest pinned the first. This is what
every one of the six looked like:

```typescript
// scripts/deploy-consent-registry.ts — before
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
```

The wrong belief also spread into places a reader trusts. Script headers said
`wallet-sdk-facade 2.0.0 (WalletFacade.init API)`; a "critical rules" comment
said to use "`WalletFacade.init` + `finalizeRecipe`"; and the deployment record
each script writes hard-coded `'wallet-sdk-facade': '2.0.0'` — false metadata in
an artifact whose purpose is to say what a deployment was built with.

One more data point, with a label: an April draft of ours, retrieved through
LEANN (`07-Content/drafts/2026-04-27-midnight-doctor-technical-article.md`,
**not re-verified today**), says the `init` style was a 2.x-line construct that
a later major reverted to `new WalletFacade(s, u, d)` + `.start()`. If that
holds, the construction API has already flipped once and can flip again on the
next bump — which is the argument for the fix below being one file, not six.

## Fix / Workaround

> Not a workaround: the constructor style is the documented one for the preprod
> line. But it is only **type-checked**, never executed — see the next section.

One helper builds a started facade for the 1.0.0 line; the six scripts call it.

```typescript
// scripts/lib/wallet-facade.ts (excerpt)
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
  }).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
  const dust = DustWallet(config).startWithSecretKey(
    dustSecretKey,
    ledgerLib.LedgerParameters.initialParameters().dust,
  );
  const wallet = new WalletFacade(shielded, unshielded, dust);
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  return wallet;
}
```

`UnshieldedWallet` 1.0.0 requires a `txHistoryStorage`, hence
`InMemoryTransactionHistoryStorage`. Each script's call site shrinks to:

```typescript
const wallet = await startWalletFacade(walletConfig, shieldedSecretKeys, dustSecretKey, unshieldedKeystore);
```

The commit also fixes the header comments, corrects the deployment-record string
to `'1.0.0'`, and adds `"typecheck": "tsc --noEmit -p tsconfig.json"` to
`package.json`.

Result, reproduced today (before = `tsc` in a throwaway worktree of the parent
commit; after = `npm run typecheck`):

| | TS2339 (`init`) | TS2345 (`MidnightBech32m` → `string`) | TS2769 (no matching overload) | Total |
|---|---:|---:|---:|---:|
| Before | 6 | 7 | 4 | **17** |
| After | 0 | 7 | 4 | **11** |

`grep -rn 'WalletFacade.init' scripts/` now matches one line: the comment in the
helper that explains why it exists.

## What this does not prove

- **Nothing ran against a node, indexer or proof-server.** The evidence shows the
  called API exists in 1.0.0 and the types line up — not that a deploy works
  on-chain. We are not marking the deploy flow as working.
- **11 type errors remain, and they are not fixed.** They pre-date this change:
  `MidnightBech32m` passed where a `string` is expected (3 deploy scripts plus 4
  sites in `deploy-all.ts`), a `deployContract` overload mismatch involving
  `privateStateId` in `deploy-all.ts`, and a `findDeployedContract` overload
  mismatch with `CompiledContract<..., never>` in `status.ts` (3 sites).
- **Bug 5 is untested.** The guide's `signTransactionIntents` issue does not
  appear in the scripts (`grep signTransactionIntents scripts/` is empty; they
  use `balanceUnboundTransaction` + `finalizeRecipe`). Whether that is safe can
  only be settled on a live network, so we are not calling it a bug or a non-bug.
- **Some imports may now be unused** in the six scripts; `tsconfig.json` does not
  enable `noUnusedLocals`, so the compiler won't say.
- **There is currently no live network to test on locally.** Per our own
  2026-09-25 cycle note (measured then, not re-measured today), the local
  standalone node has been stuck at block 345343 since 2026-08-19. That is a
  separate open decision, but it means "just run it" is not a one-line next step.

## Upstream

- **Issue**: not reported.
- **Status**: n/a — this is not an upstream bug. Our code called an API from a
  different SDK line than the one we installed. Nothing to file against Midnight.
- **Response**: n/a. The two-styles-under-one-package-name trap is already
  written up as Bug 4 in our `WORKAROUND-GUIDE.md`; the gap was that no command
  enforced it.

## Prevention Checklist

- [ ] Run `npm run typecheck` before every deploy, and wire it into
      `scripts/pre-deploy-check.sh` — **not done yet**; it is next cycle's first
      task, after the remaining 11 errors are cleared (a check that starts red
      gets ignored).
- [ ] A "confirmed X" line in a dev log must carry the command that produced it
      (`npm ls @midnight-ntwrk/wallet-sdk-facade`, or the matrix line quoted
      verbatim). The June logs said "confirmed" with no command; that is the part
      of this story that cost the most.
- [ ] Keep SDK construction in one file (`scripts/lib/wallet-facade.ts`) so an SDK
      bump is a one-file change.
- [ ] Stop hard-coding SDK versions in deployment records. Today's fix changed the
      literal from `'2.0.0'` to `'1.0.0'`; it did not remove the literal, so the
      same drift can come back. Read it from `package.json` instead.
- [ ] Commit `package.json`, `tsconfig.json` and the lockfile with the first
      script that depends on them. Here they were untracked until 2026-08-23 and
      2026-09-15.
