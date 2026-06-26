---
date: 2026-06-26
pillar: build-public
format: linkedin-post
source: scripts/pre-deploy-check.sh, scripts/compile-contracts.sh, logs/2026-06-25-dev.md
branch: fix/consent-registry-assert-parens
---

O que significa "pronto para fazer deploy"?

Esse é o estado atual do DPO2U Lab antes do primeiro deploy na Midnight Network:

3 contratos Compact compilados (ConsentRegistry, DataAuditLog, DataSubjectRights).
7 bugs de SDK documentados e com workarounds testados.
12 checks automatizados num script de pre-deploy de 200 linhas.
1 fix de portabilidade POSIX no compile-contracts.sh — porque `((count++))` é um bashism que quebra em CI silenciosamente.
MRR: R$0.

Isso é o que "pronto" parece na realidade.

A maioria do conteúdo de "build in public" mostra o momento do lançamento — o deploy, o primeiro usuário, o primeiro real. O que raramente aparece é o que vem antes: a semana em que você corrige a aritmética de shell para garantir que o pipeline não vai falhar às 3 da manhã num container Docker.

A lição que aprendi construindo infraestrutura de compliance: preparação não é procrastinação. É o produto.

Quando o ambiente é adverso — SDK experimental, documentação fragmentada, bugs não reportados — cada bug que você documenta, cada check que você automatiza é um ativo. O script `pre-deploy-check.sh` não é apenas uma ferramenta. É memória institucional executável. É a diferença entre "funcionou na minha máquina" e "vai funcionar em qualquer ambiente".

O que me mantém aqui, com MRR zero, é que cada linha de código está resolvendo um problema real: como provar, na blockchain, que um consentimento foi dado, revogado e auditado — de forma que nem a própria empresa consegue apagar.

Isso importa mais que o número do mês.

Você tem um checklist de pre-deploy? O que ele automatiza que antes era processo manual?

#BuildInPublic #DPO2U #MidnightNetwork #CompactLang #LGPD
