---
date: 2026-08-14
pillar: build-public / midnight-dev
format: twitter-thread
source: scripts/pre-deploy-check.sh (mtime 2026-08-14 10:03:02 UTC; live-run verified 2026-08-14
  ~14:01 UTC: 12 passed, 1 failed) + scripts/check-version-consistency.sh (git log --all empty;
  mtime 2026-08-13 10:03:38 UTC — ~28h disk→git gap) + scripts/image-digests.lock (git diff;
  mtime 2026-08-09 20:03:02 UTC — ~114h/4d18h disk→git gap) + content/2026-08-07 (mtime
  2026-08-07 14:03 UTC — 7.0 days uncommitted) + content/2026-08-10 (mtime 2026-08-10 14:04 UTC
  — 4.0 days) + content/2026-08-13 (3 files, mtime ~14:04-14:05 UTC — ~1.0 day) +
  zealy/2026-08-08 (2 files, mtime ~17:02-17:03 UTC — ~5.9 days) + zealy/2026-08-13 (2 files,
  mtime ~17:02 UTC — ~0.9 days) + git log a26356e (2026-07-25, prior identical incident: 10
  content/ + 11 zealy/ artifacts stuck across 3 cycles) + git status (this session, before and
  after commit)
angle: parte 10 — o teste da Parte 9 virou gate de verdade no pre-deploy-check.sh hoje, mas
  conferir os gaps de commit da própria série revelou que o pipeline de conteúdo tinha o pior
  gap de todos: 7 dias. Esta thread fecha esse gap ao ser commitada de verdade.
---

---TWEET 1/10---
Parte 10 #BuildInPublic

Hoje, 14/08: o script da Parte 9 ganhou o próximo capítulo — foi plugado no pre-deploy-check.sh. Rodei ao vivo: 12 passed, 1 failed (esperado). Mas a notícia real desta thread é outra. 🧵

---TWEET 2/10---
scripts/pre-deploy-check.sh agora chama check-version-consistency.sh como gate — não é mais um script solto. Testado agora (14/08, ~14h UTC): "OK: duplicated version constants agree" aparece no meio do relatório de deploy.

---TWEET 3/10---
O 1 failed é o de sempre: proof-server na porta 6300 rodando 8.0.3 em vez de 7.0.0 — o "squatter" de outro projeto, documentado desde 07/07, fora de escopo deste repo. Reportar FAIL nele em vez de esconder é o ponto.

---TWEET 4/10---
Só que, conferindo isso, achei outra coisa: o próprio check-version-consistency.sh (nascido 13/08, 10h03 UTC) segue sem nenhum commit — 28h e subindo. image-digests.lock (Parte 8) já passa de 114h — quase 5 dias.

---TWEET 5/10---
Isso já era a história da Parte 9. A reviravolta de hoje é maior: fui conferir há quanto tempo o CONTEÚDO desta própria série está no disco. content/2026-08-07 — a thread da Parte 7 — tem 7 dias. Nunca foi commitada.

---TWEET 6/10---
content/2026-08-10 (Parte 8): 4 dias. content/2026-08-13 (Parte 9, 3 peças): 1 dia. zealy/2026-08-08: quase 6 dias. Cinco ciclos de conteúdo rodaram, geraram material real — e nenhum chegou no git.

---TWEET 7/10---
A série inteira vem cobrando do código a disciplina de "rodar não é o mesmo que estar registrado". O próprio pipeline que cobra isso tinha o pior gap de todos — pior que o do lock file que ele estava reportando.

---TWEET 8/10---
Isso já aconteceu antes: commit a26356e (25/07) documenta 10 peças de conteúdo + 11 artefatos zealy de 07/03-07/23 presos por pelo menos 3 ciclos, cada um "declarando" um commit que nunca existiu.

---TWEET 9/10---
Diferente de antes: este ciclo termina commitando e enviando (push) de verdade — content/ e zealy/ pendentes, todos. scripts/ (o fix de hoje, a Parte 9, o lock da Parte 8) fica em aberto, de propósito: é escopo do ciclo de dev, não deste.

---TWEET 10/10---
Números de hoje, verificados:
Gate de versão plugado: sim, 12/13 checks OK
Gap do teste (Parte 9): 28h, em aberto
Gap do lock (Parte 8): ~114h, em aberto
Gap do conteúdo mais antigo: 7 dias — fechado agora
Commitado e empurrado: conferido após o push

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
