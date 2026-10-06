---
date: 2026-10-06
pillar: midnight-dev
format: twitter-thread (bug fix)
source: commit db14a01 + logs/2026-10-06-dev.md (scripts/check-version-consistency.sh)
evidence: check-version-consistency.sh -> rc=0 "all duplicated version constants agree" (4 fontes); com lib/proof-server.ts trocado temporariamente para 7.0.1 -> "FAIL: PROOF_SERVER_VERSION (proof-server) disagrees across files", rc=1; revertido via git checkout, árvore limpa.
limit: sem deploy real (sem seed financiada/nó). O exit code do script foi medido nesta rodada de conteúdo, não no log original.
---

---TWEET 1/4---
Ontem pus um guard de versão do proof-server nos scripts de deploy. Esqueci de dizer um detalhe: a versão esperada (7.0.0) agora vivia em 4 lugares — docker-compose, pre-deploy-check, health-check e o novo lib/proof-server.ts.

Guard novo, número duplicado. 🧵

---TWEET 2/4---
Duplicação sem vigia vira divergência silenciosa. Alguém sobe o proof-server para 7.0.1 em três arquivos e esquece o quarto: o guard passa a recusar o servidor certo, ou aceitar o errado.

Já tínhamos um check-version-consistency.sh. Ele só não olhava o arquivo novo.

---TWEET 3/4---
Fix (commit db14a01): o script agora lê EXPECTED_PROOF_SERVER_VERSION de scripts/lib/proof-server.ts e compara com as outras 3 fontes.

Em sincronia: rc=0.
Troquei o TS para 7.0.1 de propósito: "FAIL: PROOF_SERVER_VERSION disagrees across files", rc=1. Revertido, árvore limpa.

---TWEET 4/4---
Limite: ainda não rodei deploy real (sem seed financiada nesta sessão). E o log do dia só tinha a linha RESULT; o exit code eu medi depois, porque um check que imprime FAIL mas retorna 0 não quebra CI.

Todo guard novo precisa de quem o vigie.

#BuildInPublic #DPO2U #MidnightForDevs
