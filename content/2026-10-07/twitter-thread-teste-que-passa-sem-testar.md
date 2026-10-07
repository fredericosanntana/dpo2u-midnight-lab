---
date: 2026-10-07
pillar: midnight-dev
format: twitter-thread (bug fix)
source: commit 5da997d + logs/2026-10-07-dev.md (scripts/test-version-guard.sh, npm run test:guard)
evidence: npm run test:guard -> "OK: guard exits 1 on drifted proof-server version"; git status limpo depois (rodado nesta rodada de conteúdo).
limit: sem deploy real (sem nó/seed financiada). O teste cobre só a fonte scripts/lib/proof-server.ts.
---

---TWEET 1/4---
Ontem escrevi aqui: "todo guard novo precisa de quem o vigie". Hoje virou código: scripts/test-version-guard.sh, `npm run test:guard`.

Ele adultera a versão do proof-server e exige que o check-version-consistency.sh saia com rc≠0. 🧵

---TWEET 2/4---
Por que script e não "testei na mão"? Porque o exit code tinha sido medido uma vez, de passagem. Sem teste repetível, a próxima edição do guard pode quebrar o rc em silêncio e o CI continua verde.

---TWEET 3/4---
Detalhe que me custou um falso positivo: minha 1ª mutação via sed usou aspas duplas; o arquivo usa simples. O sed não casou, nada mudou, o guard saiu rc=0 — e "rc=0" parecia prova de que estava ok.

Agora o teste aborta se o arquivo não mudou após a mutação.

---TWEET 4/4---
Também: restaura o arquivo via trap + backup em tmp (não git checkout, que apagaria edição local não commitada). Rodei: "OK: guard exits 1 on drifted proof-server version", árvore limpa.

Limite: sem deploy real; cobre só proof-server.ts.

#BuildInPublic #DPO2U #MidnightForDevs
