---
type: quest-email
template_version: "1.0"
quest_id: daily-001
yaml_quest: adv-05
date: 2026-09-29
content_new_today: true
generated_from: content/2026-09-29/twitter-thread-typecheck-limpo-mas-as-any.md + content/2026-09-29/linkedin-typecheck-verde-nao-e-deploy-verde.md + logs/2026-09-29-dev.md
---

# Publish a Deep Technical Thread — Quest Zealy

---

**Quest ID:** adv-05 (alias interno: daily-001 — o YAML v2.0 espelhado não tem `daily-001`)
**Frequência:** Daily
**XP:** +120 XP
**Data:** 2026-09-29

---

## ✅ Estado do conteúdo

- **Há conteúdo novo hoje:** `content/2026-09-29/` (thread X + post LinkedIn), baseado no
  commit `c162c3f` e em `logs/2026-09-29-dev.md`.
- **Não gerado hoje:** leaderboard semanal (hoje é terça; o resumo é aos domingos e não
  há export de XP do Zealy nos insumos) e anúncio de quest (o único candidato recente,
  edu-02 / facade.init, já foi anunciado em `zealy/2026-09-26/`).

## 📋 O que fazer

Publicar uma thread técnica profunda sobre um trabalho real da DPO2U no stack Midnight.
Ângulo do dia: **typecheck verde não é deploy verde**.

Fatos re-medidos hoje neste ciclo (meça os seus, não copie):

```
npm run typecheck                    -> exit 0   (antes, no log do dev: 4 TS2345 + 4 TS2769)
scripts/compile-contracts.sh         -> 3 compiled, 0 failed (do log do dev; não re-executado neste ciclo)
deploy/execução contra nó preprod    -> NÃO feito (nenhuma evidência de runtime)
```

Framework (baseado na thread do dia):

**Tweet 1:** O typecheck dos scripts de deploy Midnight estava vermelho, hoje está em exit 0. Mas nenhum deploy rodou contra o preprod. O que "verde" significa aqui?
**Tweet 2:** Erro 1: `getBech32Address()` devolve `MidnightBech32m`, não string. Fix: `.asString()` em 4 scripts.
**Tweet 3:** Erros 2 e 3: `deployContract` e `findDeployedContract` não casavam com os tipos. Fix: `as any` — atalho declarado.
**Tweet 4:** O cast silencia o compilador, não resolve o tipo do private state. É dívida registrada.
**Tweet 5:** Medido: typecheck ✅, compile ✅, deploy no preprod ❌. Só o terceiro prova que entrega.
**Tweet 6:** Próximo passo: deploy no preprod com endereço on-chain como prova, depois trocar os casts por tipos. Você tipa private state ou prefere o cast?

---

## 🎯 O que entregar

1. Thread publicada no X (mínimo 4 tweets, linkados em sequência)
2. Opcional: post equivalente no LinkedIn
3. Link da thread para validação

---

## 🏷️ Hashtags sugeridas

#BuildInPublic #DPO2U #MidnightForDevs #NightForce #AliitFellows

---

## ✅ Validação

Ao completar esta quest, envie o link de prova para validação.

**Método de Validação:**
- Manual: Enviar link da thread publicada para revisão

---

## 🔴 Aviso operacional — só para o shareholder (remover se a quest for publicada)

1. **Nó standalone continua parado.** Reconferido hoje:
   `curl -s -d '{"id":1,"jsonrpc":"2.0","method":"chain_getHeader"}' -H 'Content-Type: application/json' http://localhost:9944`
   → `"number":"0x544ff"` (345343, idêntico a 25/09, 26/09 e 28/09);
   `docker ps` → `midnight-standalone-node Up 5 weeks (healthy)`. Roda e não entrega. Nada foi reiniciado.
2. **Backlog de git:** `zealy/2026-09-25/`, `zealy/2026-09-26/` e `zealy/2026-09-28/` estavam
   sem commit (o ciclo de 28/09 prometeu commitá-los mas o `git status` de hoje os mostra
   como `??`). Vão neste commit. Não confirmei se os e-mails de 25, 26 e 28/09 foram enviados.
3. **Pendência:** `git rev-list --count main..HEAD` = 60 commits na branch
   `fix/consent-registry-assert-parens`, sem PR.

---

**Boa sorte!** 🎮

Esta quest é parte do programa Night Force + Aliit Fellows.

*E-mail gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Data: 2026-09-29*
