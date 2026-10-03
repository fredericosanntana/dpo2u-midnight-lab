---
date: 2026-10-03
pillar: build-public
format: linkedin (lição de processo)
source: commit 2e07b97 + logs/2026-10-03-dev.md
evidence: predeploy 17/0 após fix; teste negativo 16/1 com runtime forçado a 0.16.0 (revertido).
limit: sem deploy contra o nó nesta sessão.
---

Um check de segurança que passa em verde não é evidência de que funciona.

Ontem, no lab de contratos Midnight do DPO2U, descobrimos que o compilador global gerava artefatos para um runtime (0.16.0) diferente do instalado (0.14.0). Todo deploy morria no import. Escrevi um check no script de pré-deploy para impedir a recorrência.

Hoje, ao revisar o diff pendente, vi que o check estava dentro do `else` de "compilador existe?". Ou seja: só executava quando o compilador estava ausente. A sintaxe passava (`bash -n`). A lógica não.

O que mudou:
→ o bloco saiu do `else`
→ o caminho do runtime deixou de depender do diretório de execução
→ o build foi recompilado com o compactc 0.29.0 (a versão da matriz do preprod)

Como sei que agora funciona:
• `npm run predeploy`: 17 passed, 0 failed
• forcei `checkRuntimeVersion('0.16.0')` num contrato → `[FAIL]`, 16 passed / 1 failed. Depois reverti.

É a mesma disciplina que aplicamos a compliance: controle sem teste de falha é só documentação otimista. Para LGPD ou para scripts de deploy, o critério é o mesmo: você já viu o controle bloquear algo?

Limite honesto: não fiz deploy contra o nó nesta sessão. A evidência cobre compilação, typecheck e o pré-deploy.

#BuildInPublic #DPO2U #MidnightNetwork #LGPD
