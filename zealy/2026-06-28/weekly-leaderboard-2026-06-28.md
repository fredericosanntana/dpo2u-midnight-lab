---
type: leaderboard
template_version: "1.0"
period: 2026-06-22 a 2026-06-28
generated: 2026-06-28
note: >
  Leaderboard da semana de construção solo. Dados do board Zealy serão consolidados
  quando a submissão de evidências estiver em curso. Este sumário reflete os marcos
  técnicos da semana que sustentam as quests elegíveis.
---

# Leaderboard Night Force + Aliit Fellows — Semana 26/2026

**Período:** 22 de junho a 28 de junho de 2026
**Status do board:** Solo builder — quests geradas, submissão de evidências em curso

---

## Marcos da Semana (DPO2U Build Log)

Esta semana o projeto DPO2U avançou em 5 frentes distintas, cada uma elegível para quests no board:

| Data | Milestone | Quest elegível | XP potencial |
|------|-----------|---------------|-------------|
| Jun 24 | Fix de assert com parênteses no ConsentRegistry + pre-deploy-check.sh | `rec-03` (fix PR) | 80 XP |
| Jun 25 | POSIX portability em compile-contracts.sh (macOS/Linux) | `dev-02` (technical PR) | 400 XP |
| Jun 26 | Narrativa launchpad POSIX/solo-builder + deploy-console demo | `adv-05` (technical thread) | 120 XP |
| Jun 27 | interact-full-suite.ts — 633 linhas, 3 contratos, 5 fases LGPD cross-contract | `dev-08` (dapp) + `adv-05` | 520 XP |
| Jun 28 | compactc 0.29.0 → 0.31.0 + 7 pares prover/verifier por função LGPD | `edda-06` (compact contract) + `adv-05` | 220 XP |

**XP elegível acumulado na semana: 1.340 XP (estimado)**

---

## Destaque da Semana

**Maior marco técnico:** `interact-full-suite.ts` — o primeiro script que coordena ConsentRegistry + DataAuditLog + DataSubjectRights em ciclo LGPD completo de 5 fases, sem dado pessoal on-chain (apenas hashes SHA-256).

**Maior marco de toolchain:** compactc 0.31.0 — cada função do ConsentRegistry agora tem seu próprio par `.prover` / `.verifier`. São 7 circuitos ZK, um por obrigação LGPD. Primeiro projeto DPO2U com artefatos ZK function-level.

**Questão aberta da semana:** Um `.verifier` on-chain constitui "registro" nos termos do Art. 37 da LGPD? — *(adhoc-022)*

---

## Próximos Passos da Semana 27/2026

| Milestone | Status |
|-----------|--------|
| Primeiro standalone deploy (pre-deploy-check.sh --network standalone) | ⏳ Próximo |
| Deploy dos 3 contratos na testnet Midnight | ⏳ Pendente |
| Submissão de evidências Zealy (dev-02, edda-06, adv-05) | ⏳ Pendente |
| Endereço on-chain do ConsentRegistry | ⏳ Após deploy |

---

## Tier Distribution (board em crescimento)

| Tier | Usuários | Nota |
|------|---------|------|
| 🌟 Legendary (5.000+ XP) | — | Board em fase inicial |
| 💎 Diamond (2.500+ XP) | — | |
| 🥇 Gold (1.000+ XP) | — | |
| 🥈 Silver (500+ XP) | — | |
| 🥉 Bronze (100+ XP) | 1 | Solo builder ativo |
| 🔰 Novo | — | |

---

## Quests Abertas Esta Semana

| ID | Nome | XP | Cadência | Status |
|----|------|----|----------|--------|
| `daily-001` (adv-05) | Publish a Deep Technical Thread | 120 XP | Diária | Aberta |
| `adhoc-021` | Quando a Lei Vira Código (cross-contract lifecycle) | 80 XP | One-time | Aberta até 2026-07-04 |
| `adhoc-022` | ZK Verifier como Prova Jurídica (Art. 37 LGPD) | 80 XP | One-time | Aberta até 2026-07-05 |
| `edda-06` | Write a Compact Contract | 100 XP | One-time | Elegível |
| `dev-02` | Submit a Technical PR | 400 XP | Diária | Elegível |

---

## Resumo Narrativo da Semana

A semana 26/2026 foi a semana do **assembly final** do DPO2U. Os 3 contratos Compact que vêm sendo construídos desde março passaram a se comunicar — o `interact-full-suite.ts` é o primeiro artefato que faz ConsentRegistry, DataAuditLog e DataSubjectRights conversarem em sequência, replicando um ciclo LGPD completo em código.

Depois, o toolchain foi atualizado para compactc 0.31.0. O resultado visível é técnico: 7 pares `.prover`/`.verifier`, um por função de consentimento. O resultado invisível é epistemológico: pela primeira vez, cada obrigação legal do projeto tem um circuito matemático verificável que a representa. Isso levanta a questão central da semana — que é também a questão que o projeto vai levar para a ANPD quando chegar a hora: um ZK verifier é mais do que auditoria. É verificação.

O primeiro standalone deploy está pendente. Quando acontecer, os verifiers saem do `build/` e vão para a chain. A discussão sobre o Art. 37 para de ser teórica.

---

*Leaderboard gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Atualizado em 2026-06-28*

#NightForce #AliitFellows #MidnightForDevs #Community
