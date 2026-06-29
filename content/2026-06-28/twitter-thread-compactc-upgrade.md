---
title: Twitter Thread — compactc 0.31.0 upgrade
date: 2026-06-28
pillar: midnight-dev
format: twitter-thread
source: scripts/compile-contracts.sh (compactc 0.29.0 → 0.31.0)
---

---TWEET 1/5---
compactc 0.29.0 → 0.31.0 ⬆️

Atualizamos o toolchain do DPO2U hoje. Parece um detalhe. Não é.

Cada versão do compilador Compact muda como os circuitos ZK são gerados — e isso afeta diretamente as chaves prover/verifier dos 3 contratos.

---TWEET 2/5---
O que muda na prática:

• `compile-contracts.sh` agora exige compactc 0.31.0
• Symlinks revalidados em ~/.compact/bin
• Build artifacts regenerados: compiler/, contract/, keys/, zkir/ por contrato

Nenhuma API mudou. O que mudou foi a garantia de segurança do circuito.

---TWEET 3/5---
Por que isso importa para compliance?

O ConsentRegistry tem 7 funções com pares prover/verifier:

grantConsent, revokeConsent, updateConsentPurposes
getConsentStatus, getConsentPurposes
getTotalConsentsGranted, getTotalRevocations

Cada uma é um circuito ZK separado. Versão do compilador = versão da prova.

---TWEET 4/5---
Regra que aprendemos na prática:

Antes de qualquer deploy em preprod, o `COMPACT_VERSION` no script de compilação precisa ser idêntico ao que gerou os artefatos em build/.

Mismatch silencioso aqui = prova inválida on-chain.

Documentamos no WORKAROUND-GUIDE.md.

---TWEET 5/5---
Estado atual do DPO2U:

✓ compactc 0.31.0 — toolchain atualizado
✓ 3 contratos compilados com novos artefatos ZK
✓ interact-full-suite.ts pronto (5 fases LGPD)
⏳ Primeiro standalone deploy — próximo passo

#BuildInPublic #DPO2U #MidnightForDevs #CompactLang
