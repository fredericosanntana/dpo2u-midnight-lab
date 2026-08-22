---
date: 2026-08-20
pillar: dpo2u-arch / build-public
format: twitter-thread
source: commit 9a88dcc (2026-08-19T17:08:27Z, root-causa restrita a zealy.log) + git log -1
  --format=%cI 25d24e9 (2026-08-15T10:02:46Z, último commit real fora de content/zealy) +
  grep -n MAX_TURNS /root/DPO2U/03-Ferramentas/Scripts/managed-agent/run_claude_task.sh
  (linha 24: MAX_TURNS default 12, linha 120: --max-turns "$MAX_TURNS") + cat
  /etc/cron.d/dpo2u-midnight-agent (3 fases: dev 4 10 * * *, content 4 14 * * *, zealy
  4 17 * * *, nenhuma com MIDNIGHT_AGENT_MAX_TURNS setado) + grep -o "Reached max turns"
  /var/log/managed-agent/{dev,content,zealy}.log | wc -l (dev=4, content=4, zealy=4) +
  grep -o "OAuth session expired" /var/log/managed-agent/dev.log | wc -l (=1) +
  stat --format=%y /var/log/managed-agent/{dev,content,zealy}.log (rotação em
  2026-08-16T00:48:43Z para os 3) + grep "CRON.*run_claude_task.sh (dev|content|zealy)"
  /var/log/syslog (5 gatilhos dev 16-20/08, 5 gatilhos content 16-20/08 [1 em
  andamento, esta sessão], 4 gatilhos zealy 16-19/08) + ls logs/2026-08-1[6-9]-dev.md
  (nenhum existe) + git log --oneline d7b5a5b 408d42a 1d40062 (commits que resgataram
  Partes 12/13/14 do disco no dia seguinte)
angle: o achado de ontem (9a88dcc) ficou restrito ao zealy.log. Hoje cruzamos dev.log e
  content.log contra o mesmo mecanismo e contra os timestamps reais do syslog — o teto de
  12 turnos não é um problema do zealy, é do pipeline inteiro. Isso reescreve a leitura das
  Partes 11-14: não foi decisão de conteúdo, foi cron falhando 100% das vezes na fase dev por
  5 dias seguidos, sem nunca reportar erro para fora.
---

---TWEET 1/8---
Ontem (9a88dcc) achamos por que zealy/ ficou 5 dias sem rodar: cron batendo no teto de 12 turnos antes de commitar. Hoje cruzamos dev.log e content.log com o mesmo método. O bug não é do zealy. É do pipeline inteiro. 🧵

---TWEET 2/8---
Mecanismo: run_claude_task.sh:24 define MAX_TURNS="${MIDNIGHT_AGENT_MAX_TURNS:-12}" e :120 passa --max-turns "$MAX_TURNS" pro Claude CLI. /etc/cron.d/dpo2u-midnight-agent roda 3 fases (dev 10h, content 14h, zealy 17h UTC) e nenhuma sobrescreve essa variável.

---TWEET 3/8---
dev.log desde a rotação de 16/08 00:48 UTC: 5 gatilhos de cron confirmados no syslog (16 a 20/08), 5 falhas registradas — 4x "Reached max turns (12)" + 1x "Failed to authenticate: OAuth session expired and could not be refreshed". 100% de falha, 5 dias seguidos.

---TWEET 4/8---
É por isso que não existe logs/2026-08-16-dev.md, 17, 18 nem 19. Não foi "sem trabalho pra fazer" — foi cron incapaz de terminar um ciclo sequer. Último dev real commitado: 25d24e9, 15/08 10h02 UTC.

---TWEET 5/8---
content.log: 4 gatilhos completos (16 a 19/08), 4x "Reached max turns (12)" — 100% também. Mas as Partes 12, 13 e 14 existem em disco com data batendo. A sessão escreve o arquivo, esgota o turno antes do git commit. Mecanismo confirmado, não mais suposição.

---TWEET 6/8---
O achado de zealy (9a88dcc) ficou restrito a 1 log. Hoje mostra: mesmo teto, mesmas 3 fases, mesmo bug. Recomendação registrada pro shareholder: MIDNIGHT_AGENT_MAX_TURNS por fase no cron + investigar a falha de OAuth isolada (não é a mesma causa, é um segundo modo de falha).

---TWEET 7/8---
Estado real agora: 0 dev novo commitado desde 15/08 — não por decisão, por infra quebrada. content/ resgatou 3 dias de peças escritas mas não commitadas. zealy/ tem 1 correção documentada, aguardando decisão pra virar mudança de fato nas outras 2 fases.

---TWEET 8/8---
"Container Up, cron verde, log sem erro não são evidência" é regra nossa. Achamos o cron "verde" que não entrega nada — em 3 fases, no mesmo dia, com contagem exata em vez de suposição.

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
