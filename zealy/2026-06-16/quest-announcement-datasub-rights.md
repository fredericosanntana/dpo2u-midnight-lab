---
type: quest-announcement
date: 2026-06-16
triggered_by: content/2026-06-16/
contracts: DataSubjectRights.compact, ConsentRegistry.compact, DataAuditLog.compact
---

# Technical Thread on X / LinkedIn 🎯

---

**Quest ID:** `weekly-002`
**Frequência:** Weekly
**XP:** +50 XP
**Status:** 🟢 **ABERTO**

---

## 📋 Descrição

Criar uma thread técnica detalhada sobre Midnight Network — desta vez com foco na
implementação do ciclo de direitos do titular (LGPD Art. 18/19) em Compact.

## 🎯 O que fazer

Escreva uma thread técnica cobrindo **um ou mais** dos tópicos abaixo, todos derivados
do trabalho real entregue na sessão de hoje no DPO2U:

### Tema A — Codificando o Art. 18 LGPD em um contrato Compact

O DPO2U completou `DataSubjectRights.compact`: 8 circuitos que traduzem os direitos do
titular em lógica executável on-chain.

Pontos de partida para sua thread:
- `submitRequest(type)` → `fulfillRequest` → `rejectRequest`: o ciclo de vida de um
  pedido de acesso, retificação ou exclusão em código
- `markRequestOverdue()`: o Art. 19 diz "15 dias úteis" — no Midnight Network isso é
  21.600 blocos (~1 bloco/minuto). Como um prazo legal vira um clock on-chain?
- O que significa "compliance" quando o direito é imutável em ledger?

### Tema B — Zero PII on-chain: privacidade por design ou teatro de conformidade?

- `subject_id = sha256(email)` — por que o hash não é dado pessoal sob a LGPD (se o
  preimage foi apagado)
- `controller_id = sha256(CNPJ)` — mas CPNJs são um conjunto finito: rainbow tables
  funcionam. O próximo passo é adicionar salt secreto
- Tensão real: o hash do pedido de exclusão fica permanentemente on-chain. O registro
  da exclusão é, em si, um dado pessoal?

### Tema C — Compilando 3 contratos Compact sem compactc local

- Como usar `midnight-mcp` v0.31.0 para compilar remotamente
- Fix de assert() com parênteses (compactc 0.29+): `assert(condition, "msg")` →
  `(assert)(condition, "msg")`
- SDK Bugs 5 e 6: `finalizeRecipe()` no lugar de `signRecipe()`,
  `zkConfigProvider` correto

## 🏷️ Tags

`#thread` · `#technical` · `#content`

## 🔗 Hashtags sugeridos

#MidnightForDevs · #PrivacyPreserving · #BuildInPublic · #LGPD · #DPO2U · #NightForce

## ✅ Validação

**Método:** `manual`

Após completar, responda este post com o link da sua thread para validação.

---

### 💡 Dicas

- **Reset semanal:** Esta quest pode ser completada uma vez por semana
- **Reset domingo às 00:00 UTC**
- Use os arquivos de conteúdo de hoje como referência:
  - `content/2026-06-16/twitter-thread-datasub-rights.md` — modelo de thread
  - `content/2026-06-16/podcast-prompt-datasub-rights.md` — contexto técnico completo

---

#NightForce #AliitFellows #MidnightForDevs #ZealyQuest

---

*Post gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Compartilhe seu progresso nos comentários!*
