---
date: 2026-10-10
pillar: build-public
format: linkedin (milestone)
source: commit 4fa24d6 + logs/2026-10-10-dev.md; limite original em content/2026-10-08/
evidence: npm run test:guard -> "ALL 13 drift cases detected"; compile 3/3, typecheck e check-versions verdes (log de 10-10).
limit: sem deploy real (sem nó/seed financiada). Nenhum contrato alterado.
---

Dois dias atrás publiquei um limite: meu teste de drift de versão cobria o indexer no docker-compose.yml, mas não o node nem o proof-server.

Hoje fechei.

O que mudou (commit 4fa24d6, 2 linhas em scripts/test-version-guard.sh): o test:guard agora também troca midnight-node e proof-server por "0.0.0-drift" e exige que o check-version-consistency.sh falhe. Foi de 11 para 13 casos.

Resultado medido nesta rodada: `npm run test:guard` → "ALL 13 drift cases detected", todos com rc=1, árvore limpa depois.

A lição de build in public: registrar o limite com precisão é o que torna o próximo passo óbvio. Não precisei procurar o que fazer hoje, bastou reler o que eu mesmo disse que faltava.

O que continua faltando: deploy real. Sem nó e sem seed financiada, nada disso foi exercitado on-chain. O guard garante consistência de versão, não que o contrato roda.

#BuildInPublic #DPO2U #MidnightForDevs
