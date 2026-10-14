---
date: 2026-10-14
pillar: build-public
format: linkedin post
source: commit bb6ceb8 + logs/2026-10-14-dev.md
evidence: npx tsx scripts/status.ts --help -> rc=0; npm run verify -> "3 compiled, 0 failed", "ALL 13 drift cases detected"
limit: mudança de 9 linhas; sem deploy real; nenhum contrato alterado; status.ts não foi exercitado contra rede hoje.
---

Nem todo dia de build rende marco. Hoje rendeu 9 linhas, e vale registrar o porquê.

No lab de contratos Midnight (Compact) tenho um `scripts/status.ts`: uma checagem somente-leitura dos contadores on-chain dos contratos publicados. Ele não tinha `--help`. Quem rodava só para descobrir as flags já entrava no fluxo normal, com rede e wallet.

Agora `--help`/`-h` é tratado logo após o parse dos argumentos. Imprime o usage (rede via `--network`, seed opcional, default em `$MIDNIGHT_NETWORK` ou standalone) e sai com rc=0, antes de tocar qualquer coisa externa.

Evidência:
• `npx tsx scripts/status.ts --help` → usage, rc=0
• `npm run verify` → "3 compiled, 0 failed", "ALL 13 drift cases detected"

O critério que guiou: um script que lida com seed e rede deve ser seguro de explorar. Ajuda não pode ter efeito colateral.

O que isto não prova: não rodei o status contra uma rede real hoje, e nenhum contrato foi alterado. É higiene de CLI, não validação de comportamento on-chain.

#BuildInPublic #MidnightForDevs #DPO2U
