---
date: 2026-10-14
pillar: midnight-dev
format: twitter thread (4 tweets)
source: commit bb6ceb8 + logs/2026-10-14-dev.md
evidence: npx tsx scripts/status.ts --help -> imprime usage, rc=0; npm run verify -> "3 compiled, 0 failed", "ALL 13 drift cases detected"
limit: mudança pequena (9 linhas em scripts/status.ts). Sem deploy real. Nenhum contrato alterado.
---

---TWEET 1/4---
Mudança pequena de hoje no lab Midnight: `scripts/status.ts` ganhou `--help`/`-h`. 9 linhas. Não é feature grande, mas o script lê estado on-chain, então "pedir ajuda" não pode tocar wallet nem rede. 🧵

---TWEET 2/4---
Antes: quem rodava `status.ts` só para ver as flags já caía na construção de config e wallet. Agora o parseArgs trata `help` primeiro, imprime o usage e sai com rc=0, antes de qualquer coisa de rede ou seed.

---TWEET 3/4---
Evidência: `npx tsx scripts/status.ts --help` imprime o usage, rc=0. E `npm run verify` segue verde: "3 compiled, 0 failed", "ALL 13 drift cases detected". Nenhum contrato mudou. Nada foi para on-chain.

---TWEET 4/4---
Limite honesto: não testei o status contra uma rede real hoje, só o caminho do --help. É higiene de CLI, não prova de comportamento. Vocês deixam o --help de scripts com wallet antes de qualquer I/O? #BuildInPublic #MidnightForDevs #DPO2U
