---
date: 2026-09-29
pillar: midnight-dev
format: twitter-thread (bug fix / build-public)
source: commit c162c3f (2026-09-29) + logs/2026-09-29-dev.md. Antes → `npm run typecheck`
  = 4 TS2345 (Bech32) + TS2769 em deploy-all:302 e status:346/356/366; depois → exit 0.
  `scripts/compile-contracts.sh` → 3 compiled, 0 failed. Sem execução contra nó preprod.
angle: typecheck verde não é deploy verde — e três `as any` são dívida declarada.
---

---TWEET 1/6---
Ontem o typecheck dos scripts de deploy Midnight estava vermelho. Hoje: exit 0.

Antes: 4x TS2345 + 4x TS2769. Depois: zero erros.

Mas antes de comemorar: nenhum deploy rodou contra o preprod. Vou explicar o que "verde" significa aqui. 🧵

---TWEET 2/6---
Erro 1 (4 scripts): getBech32Address() não devolve string. Devolve MidnightBech32m, um tipo próprio.

Passar direto em template string "funcionava" na leitura, mas o tipo não bate.

Fix: .asString() em deploy-all, consent-registry, data-audit-log e data-subject-rights.

---TWEET 3/6---
Erro 2: deployContract em deploy-all.ts. compiledContract é `any`, mas a sobrecarga do SDK exigia `args`.

Erro 3: findDeployedContract em status.ts (3 chamadas), private state inferido como `never` vs `any`.

Fix nos dois: `as any`. Sim, é atalho.

---TWEET 4/6---
Prefiro dizer isso do que esconder: os `as any` silenciam o compilador, não resolvem o tipo.

Tipar o private state de verdade continua como dívida, registrada no log do dia.

Typecheck limpo com cast é sinal mais fraco do que parece.

---TWEET 5/6---
O que foi medido hoje:
✅ npm run typecheck → exit 0
✅ compile-contracts.sh → 3 compiled, 0 failed
❌ deploy/execução no preprod → não feito

Só o terceiro prova que os scripts entregam. Os dois primeiros provam que compilam.

---TWEET 6/6---
Próximo passo: rodar deploy-all no preprod e ver o endereço on-chain, depois trocar os `as any` por tipos.

Você tipa private state do Midnight ou prefere o cast e segue? Quero ver como outros lidam.

#BuildInPublic #MidnightForDevs #DPO2U
