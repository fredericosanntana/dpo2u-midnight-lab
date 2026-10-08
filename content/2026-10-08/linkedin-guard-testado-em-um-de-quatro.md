---
date: 2026-10-08
pillar: build-public
format: linkedin
source: commit daccc64 + logs/2026-10-08-dev.md
evidence: npm run test:guard -> 11x "OK: rc=1", "ALL 11 drift cases detected"; árvore limpa após o teste.
limit: sem deploy real; docker-compose.yml só tem a imagem do indexer mutada (node e proof-server sem caso).
---

Um guard testado em 1 de 4 lugares onde a constante vive não é um guard testado.

No projeto Midnight do DPO2U, o `test:guard` de ontem provava a falha do check-version-consistency.sh com uma única mutação (scripts/lib/proof-server.ts). Admiti o limite no post. Hoje o commit daccc64 fecha parte dele: 11 casos de deriva em 4 arquivos.

O que entrou:
• NODE, INDEXER, PROOF_SERVER, COMPACT e TMP_MIN_FREE_KB em pre-deploy-check.sh;
• as versões em midnight-health-check.sh e compile-contracts.sh;
• a imagem do indexer no docker-compose.yml.

Desenho: uma tabela arquivo|sed. Cada caso parte do original, muta, exige exit code ≠ 0 e restaura. Se a mutação não altera o arquivo, aborta — o padrão ficou obsoleto e um "passou" seria mentira.

Evidência (rodada hoje): 11x "OK: rc=1" e "ALL 11 drift cases detected", sem resíduo no git.

Limites: sem deploy real (sem nó/seed financiada). No docker-compose só o indexer é mutado; node e proof-server ainda não têm caso.

Lição: a cobertura de um teste negativo se mede em quantos pontos de falha você injetou, não em quantos testes verdes existem.

#BuildInPublic #MidnightForDevs #DPO2U #MidnightNetwork
