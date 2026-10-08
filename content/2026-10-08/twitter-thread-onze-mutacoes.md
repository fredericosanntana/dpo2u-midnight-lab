---
date: 2026-10-08
pillar: midnight-dev
format: twitter-thread (bug fix)
source: commit daccc64 + logs/2026-10-08-dev.md (scripts/test-version-guard.sh)
evidence: npm run test:guard -> 11x "OK: rc=1", "ALL 11 drift cases detected"; git status limpo depois (rodado nesta rodada de conteúdo).
limit: sem deploy real (sem nó/seed financiada). Em docker-compose.yml só a imagem do indexer é mutada; node e proof-server não.
---

---TWEET 1/4---
Ontem o test:guard provava 1 mutação: a versão do proof-server em 1 arquivo. Mas a mesma constante vive em 4 arquivos. Um guard testado em 1 de 4 lugares é um guard testado em 25%.

Hoje: 11 mutações em 4 arquivos. 🧵

---TWEET 2/4---
Cobertura nova (commit daccc64): NODE, INDEXER, PROOF_SERVER, COMPACT e TMP_MIN_FREE_KB em pre-deploy-check.sh; as versões em midnight-health-check.sh e compile-contracts.sh; a imagem do indexer no docker-compose.yml.

Cada caso muta um arquivo e exige rc≠0 do check-version-consistency.sh.

---TWEET 3/4---
Mantive a regra que custou o falso positivo de ontem: se o sed não alterou o arquivo, o teste aborta (padrão obsoleto). Backup em tmp, restore via trap, e cada caso parte do arquivo original, sem acumular mutações.

---TWEET 4/4---
Rodei agora: 11x "OK: rc=1", "ALL 11 drift cases detected", árvore limpa.

Limite honesto: no docker-compose só a imagem do indexer é mutada — node e proof-server ficaram de fora. E sem deploy real.

#BuildInPublic #DPO2U #MidnightForDevs
