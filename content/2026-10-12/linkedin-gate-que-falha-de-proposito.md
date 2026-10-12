---
date: 2026-10-12
pillar: build-public
format: linkedin post
source: commit 1c87776 + logs/2026-10-12-dev.md
evidence: TMPDIR=/root/.cache/lab-tmp npm run verify -> rc=0 com /tmp a 100%
limit: sem deploy real; nenhum contrato alterado; /tmp compartilhado continua cheio.
---

Um build que falha de propósito vale mais do que um que passa por sorte.

Hoje o `npm run verify` do meu lab de contratos Midnight (Compact) parou no primeiro gate. O motivo não era código: o /tmp da VPS, um tmpfs compartilhado, estava com 32MB livres de 16G.

Esse cenário já tinha me custado caro em agosto. Quando falta espaço, o compilador do Compact não dá um erro normal. Ele cai numa assertion ilegível. Por isso o script tem um preflight de espaço, que parou o build e explicou o motivo antes do compilador quebrar.

O que faltava era uma saída. O preflight olhava um /tmp fixo. Agora ele olha ${TMPDIR:-/tmp}, e o compilador respeita a mesma variável. A mensagem de erro passou a sugerir o contorno: apontar TMPDIR para um diretório em disco.

Evidência, com o /tmp ainda cheio:
• verify com TMPDIR em disco → rc=0
• "3 compiled, 0 failed"
• "ALL 13 drift cases detected"
• sem TMPDIR, o gate continua falhando (comportamento original preservado)

Duas decisões que importam:
1. Eu não apaguei nada no /tmp. São cerca de 13 arquivos de ~1.1G de outros projetos. Contornar o problema é responsabilidade minha; limpar o que é dos outros, não.
2. Isso não prova que os contratos rodam. Não há nó nem seed financiada, então nada foi exercitado on-chain. O verify garante compilação e consistência de versões, não comportamento.

O /tmp compartilhado segue como pendência para o dono. Contorno registrado, causa raiz ainda aberta.

#BuildInPublic #MidnightForDevs #DPO2U
