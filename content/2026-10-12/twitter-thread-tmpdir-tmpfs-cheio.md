---
date: 2026-10-12
pillar: midnight-dev
format: twitter thread (5 tweets)
source: commit 1c87776 + logs/2026-10-12-dev.md
evidence: com /tmp a 100% (32384KB livres), TMPDIR=/root/.cache/lab-tmp npm run verify -> rc=0; "3 compiled, 0 failed"; "ALL 13 drift cases detected"
limit: sem deploy real. Nenhum contrato alterado. /tmp segue cheio (infra compartilhada, nada apagado).
---

---TWEET 1/5---
Hoje o `npm run verify` do lab Midnight quebrou no primeiro gate. Não era o contrato: o /tmp (tmpfs compartilhado da VPS) estava em 100%, 32MB livres. 🧵

---TWEET 2/5---
O compactc aborta com uma assertion ilegível quando dá ENOSPC. Por isso o compile já tinha um preflight de espaço. Ele fez o trabalho: parou antes e avisou. Mas o /tmp fixo no script não deixava saída.

---TWEET 3/5---
Fix: o preflight agora checa ${TMPDIR:-/tmp}, e o compactc respeita TMPDIR. A mensagem de erro passou a sugerir: TMPDIR=$HOME/.cache/lab-tmp npm run compile. Um diff pequeno em scripts/compile-contracts.sh.

---TWEET 4/5---
Prova, com /tmp ainda cheio: verify com TMPDIR em disco → rc=0, "3 compiled, 0 failed", "ALL 13 drift cases detected". Sem TMPDIR o gate continua falhando de propósito. Nenhum contrato mudou, nada foi para on-chain.

---TWEET 5/5---
Não apaguei nada no /tmp: são ~13 arquivos de ~1.1G de outros projetos, e o dono é outro. Contornar é meu; limpar não. O /tmp segue 🔴. Vocês apagam o que não é de vocês pra destravar build? #BuildInPublic #MidnightForDevs #DPO2U
