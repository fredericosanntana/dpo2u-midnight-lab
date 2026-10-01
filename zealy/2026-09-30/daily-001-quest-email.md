---
type: quest-email
template_version: "1.0"
quest_id: daily-001
yaml_quest: adv-05
date: 2026-09-30
content_new_today: true
generated_from: content/2026-09-30/twitter-thread-predeploy-sondava-porta-errada.md + content/2026-09-30/linkedin-checagem-que-olha-porta-errada.md + logs/2026-09-30-dev.md
---

# Publish a Deep Technical Thread — Quest Zealy

---

**Quest ID:** adv-05 (alias interno: daily-001 — o YAML v2.0 espelhado não tem `daily-001`)
**Frequência:** Daily
**XP:** +120 XP
**Data:** 2026-09-30

---

## ✅ Estado do conteúdo

- **Há conteúdo novo hoje:** `content/2026-09-30/` (thread X + post LinkedIn), baseado no
  commit `543e24d` e em `logs/2026-09-30-dev.md`.
- **Não gerado hoje:** leaderboard semanal (hoje é quarta; o resumo é aos domingos, e não há
  export de XP do Zealy nos insumos) e anúncio de quest (nenhum tópico novo de trilha além da
  thread diária; edu-02 já foi anunciado em `zealy/2026-09-26/`).

## 📋 O que fazer

Publicar uma thread técnica profunda sobre um trabalho real da DPO2U no stack Midnight.
Ângulo do dia: **um pre-check que sonda um endereço diferente do que o deploy usa não checa nada**.

Fatos re-medidos neste ciclo (meça os seus, não copie):

```
npm run predeploy                                        -> 13 passed, 1 failed (proof-server :6300 = 8.0.3, esperado 7.0.0)
PROOF_SERVER_URL=http://127.0.0.1:6301 npm run predeploy -> 14 passed, 0 failed (7.0.0)
midnight-health-check.sh                                 -> só `bash -n` (do log do dev); não executado
deploy contra o nó                                       -> NÃO feito
```

Framework (baseado na thread do dia):

**Tweet 1:** `predeploy` dava 13 ok / 1 falha: proof-server na :6300 era 8.0.3. Mas havia um 7.0.0 correto na :6301, e o deploy já sabia usá-lo. O checador olhava para outro lugar.
**Tweet 2:** A :6300 era container de outro projeto. Deploy e status aceitavam `PROOF_SERVER_URL`; os scripts de verificação tinham a porta fixa.
**Tweet 3:** Fix em 2 scripts: `url="${PROOF_SERVER_URL:-http://127.0.0.1:6300}"`. Default preservado; erro agora aponta o override.
**Tweet 4:** Evidência: com `:6301` → 14/0; sem variável → segue falhando em :6300, com dica. Limite: health-check só passou por `bash -n`; nenhum deploy rodou.
**Tweet 5:** Verificação tem que sondar o mesmo endereço que a ação vai usar. Senão o verde (ou o vermelho) é sobre outra coisa.

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

1. **Nó standalone continua parado.** `chain_getHeader` em `localhost:9944` → `"number":"0x544ff"`
   (345343, idêntico a 25/09, 26/09, 28/09 e 29/09); `docker ps` → `midnight-standalone-node Up 5 weeks (healthy)`.
   Roda e não entrega. Nada foi reiniciado.
2. **Container 8.0.3 na :6300** (`dpo2u-midnight-self-funding-proof-server-1`, Up 3 months) segue ocupando a
   porta padrão. Não foi tocado; decidir se é desligado ou se o default muda para :6301.
3. **Backlog de git:** `zealy/2026-09-25/`, `26/`, `28/` e `29/` estavam sem commit; vão neste commit.
   Não confirmei se os e-mails de 25, 26, 28 e 29/09 foram enviados.
4. **Pendência:** `git rev-list --count main..HEAD` = 62 commits na branch
   `fix/consent-registry-assert-parens`, sem PR.

---

**Boa sorte!** 🎮

Esta quest é parte do programa Night Force + Aliit Fellows.

*E-mail gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Data: 2026-09-30*
