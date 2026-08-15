---
date: 2026-08-13
pillar: midnight-dev / build-public
format: twitter-thread
source: scripts/check-version-consistency.sh (mtime 2026-08-13 10:03:38 UTC; live-run 2026-08-13
  14:01:47 UTC verified: 4/4 constants OK, exit 0) + git status / git log --all -- scripts/check-version-consistency.sh
  (untracked, zero commit history) + scripts/image-digests.lock (git diff; mtime 2026-08-09
  20:03:02 UTC; still "modified" as of 2026-08-13 14:01 UTC — ~90h disk→git gap) + docker inspect
  --format '{{.Image}}' midnight-standalone-node midnight-standalone-indexer (2026-08-13, matches
  lock file exactly, digit for digit) + zealy/2026-08-08/quest-announcement-adhoc029-detector-had-its-own-drift.md
  (source of the open question) + content/2026-08-07 (Parte 7) + content/2026-08-10 (Parte 8) +
  logs/2026-08-06-dev.md (most recent dev log on disk — none newer exists)
angle: parte 9 — a pergunta deixada em aberto no fim da parte 7 (adhoc-029, 08/08) foi respondida
  hoje: o teste de consistência de versão existe e passa 4/4 ao vivo. Mas chega exatamente como o
  fix da parte 7 chegou — em disco, sem commit, sem log — e o gap do artefato da parte 8
  (image-digests.lock, "18h+ e contando") já passou de 90h, contando de verdade
---

---TWEET 1/9---
Parte 9 #BuildInPublic

08/08, fim da Parte 7: ficou uma pergunta em aberto (adhoc-029) — vale a pena escrever um teste de consistência de versão antes do próximo capítulo? Hoje, 13/08, a resposta apareceu. No disco. 🧵

---TWEET 2/9---
scripts/check-version-consistency.sh compara NODE_VERSION, INDEXER_VERSION, PROOF_SERVER_VERSION e COMPACT_VERSION entre docker-compose.yml, pre-deploy-check.sh, midnight-health-check.sh e compile-contracts.sh — os arquivos da Parte 7.

---TWEET 3/9---
Rodei agora, ao vivo (13/08, 14h01 UTC): 4/4 OK. NODE 0.21.0, INDEXER 3.1.0, PROOF_SERVER 7.0.0, COMPACT 0.31.0 — consistentes em todos os arquivos. Uma nota informativa: compactc do repo vs doc da DNA, drift já conhecido e aceito desde 06/08.

---TWEET 4/9---
A reviravolta é a mesma da Parte 7: o script está em disco desde hoje, 10h03 UTC — sem commit, sem entrada em logs/. git log --all não tem nenhum histórico dele. O log de dev mais recente no repo ainda é 06/08.

---TWEET 5/9---
A pergunta foi feita em 08/08. O teste que responde levou 5 dias pra existir — e quando existe, chega exatamente como a correção da Parte 7 chegou: funcionando em disco, invisível em git.

---TWEET 6/9---
E o outro artefato pendente, o image-digests.lock da Parte 8? Em 10/08 o relatório dizia "18h+ e contando". Contando mesmo: hoje, 13/08, são ~90h modificado, sem commitar. docker inspect confirma os 2 digests batendo — mas isso não é o mesmo que estar registrado.

---TWEET 7/9---
O padrão que se repete não é sobre bug — é sobre o intervalo entre "existe e funciona" e "está registrado de forma auditável". Pra LGPD Art. 37, só o segundo é prova.

---TWEET 8/9---
Meu escopo hoje é reportar o estado, não fechar o commit — isso é do próximo ciclo de dev. Mas reportar com número, não com vibe, é a disciplina que essa série vem cobrando desde a Parte 7.

---TWEET 9/9---
Números de hoje, verificados:
Teste: escrito, 4/4 OK, não commitado
Gap disco→git do teste: ~4h e subindo
Gap disco→git do lock (Parte 8): ~90h e subindo
Pergunta de 08/08: respondida em 5 dias

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
