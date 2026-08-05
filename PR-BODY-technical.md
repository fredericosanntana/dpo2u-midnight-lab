# DPO2U — Privacy-preserving LGPD/GDPR compliance on Midnight

## What this adds
Nine Compact smart contracts implementing on-chain, ZK-attested data-protection compliance (LGPD Art. 7/18/19/37/48 + GDPR analogues), plus a browser **deploy console** (Lace wallet) and a 53-test suite.

- `ComplianceRegistry` — score-private / proof-public attestation
- `ConsentRegistry` — consent basis (LGPD Art. 7-8)
- `DataSubjectRights` — subject rights + deadlines (Art. 18/19)
- `DataAuditLog` — processing audit + breach notification (Art. 37/48)
- `AgentRegistry`, `AgentWalletFactory`, `FeeDistributor`, `PaymentGateway`, `LgpdKitRegistry`

## Toolchain
compactc 0.31.0 · midnight-js 4.1.1 · ledger-v8 · wallet-sdk 1.1.0

## Status / evidence
- `npm run compile` → builds all 9 contracts
- `npm run test` → 53 tests across 10 suites
- Deploy proven on local standalone (9/9 on-chain, blocks 22–51, verified via indexer)
- Preprod public testnet: blocked upstream by wallet-sdk full shielded-history sync OOM (workaround tracked)

## Source
https://github.com/fredericosanntana/dpo2u-midnight

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
