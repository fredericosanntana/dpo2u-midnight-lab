---
date: 2026-10-10
pillar: midnight-dev
format: twitter-thread (bug fix)
source: commit 4fa24d6 + logs/2026-10-10-dev.md (scripts/test-version-guard.sh)
evidence: npm run test:guard -> "ALL 13 drift cases detected" (rodado nesta rodada de conteúdo); git status limpo depois.
limit: sem deploy real (sem nó/seed financiada). Nenhum contrato alterado.
---

---TWEET 1/4---
Na última thread eu admiti um buraco: o test:guard mutava só a imagem do indexer no docker-compose.yml. Node e proof-server ficavam de fora.

Fechei hoje. De 11 para 13 mutações. 🧵

---TWEET 2/4---
O commit 4fa24d6 adiciona 2 casos: midnight-node e proof-server, cada um trocado para 0.0.0-drift no docker-compose.yml.

O guard (check-version-consistency.sh) precisa devolver rc≠0 em cada um. Se não devolver, o teste falha.

---TWEET 3/4---
Por que importa: a imagem do proof-server é a que mais derrapa entre a versão do SDK e a do container. Um guard que não vê essa linha dá verde com o compose desatualizado, e você só descobre ao gerar a prova.

---TWEET 4/4---
Rodei agora: 13x "OK: rc=1", "ALL 13 drift cases detected", árvore limpa.

Limite honesto: sem deploy real, sem nó com seed financiada. Nenhum contrato foi alterado. É só o guard ficando menos cego.

#BuildInPublic #DPO2U #MidnightForDevs
