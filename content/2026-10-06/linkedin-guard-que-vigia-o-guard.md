---
date: 2026-10-06
pillar: midnight-dev
format: linkedin (build-public)
source: commit db14a01 + logs/2026-10-06-dev.md
evidence: check-version-consistency.sh rc=0 em sincronia; com lib/proof-server.ts em 7.0.1 -> FAIL + rc=1; revertido.
limit: sem deploy real nesta sessão.
---

Todo guard novo cria uma duplicação nova. Quem vigia?

Ontem, no projeto Midnight do DPO2U, os scripts de deploy passaram a checar a versão do proof-server no ponto de uso (scripts/lib/proof-server.ts). O efeito colateral: a versão esperada, 7.0.0, passou a existir em quatro arquivos: docker-compose.yml, pre-deploy-check.sh, midnight-health-check.sh e o próprio TS.

Já existia um check-version-consistency.sh para esse tipo de deriva, mas ele não conhecia o arquivo novo. Commit db14a01: agora ele lê a constante do TS e compara com as outras três.

Evidência:
• Em sincronia: exit 0, "all duplicated version constants agree".
• Troquei o TS para 7.0.1 de propósito: "FAIL: PROOF_SERVER_VERSION disagrees across files", exit 1. Revertido, árvore limpa.

Limites: sem deploy real nesta sessão (sem seed financiada). E o exit code só foi medido depois: o log original registrava a linha RESULT, não o código de saída, e para CI é o código que conta.

Lição: ao adicionar uma verificação, procure quem a verifica.

#BuildInPublic #MidnightForDevs #DPO2U #MidnightNetwork
