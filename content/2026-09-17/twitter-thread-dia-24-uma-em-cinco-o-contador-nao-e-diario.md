---
date: 2026-09-17
pillar: dpo2u-arch / build-public
format: twitter-thread
source: cat /var/lib/logrotate/status | grep "managed-agent/dev.log" (última
  rotação copytruncate: 2026-09-13 00:35:44 UTC — confirma que os logs de
  dev/content/zealy são resetados semanalmente, não diariamente) + wc -c
  /var/log/managed-agent/dev.log && grep -o "Reached max turns" ... | wc -l
  (145 bytes, 5 ocorrências de "Error: Reached max turns (12)" grudadas sem
  separador, mtime 2026-09-17T10:06:54 UTC) comparado a content/2026-09-16/
  (116 bytes, 4x, lido como "hoje" mas na verdade cumulativo desde a mesma
  rotação de 13/09) + logs/2026-09-15-dev.md e git show --stat c563156
  (única sessão real da janela: 3 contratos recompilados limpo, 12 circuits,
  check-versions em package.json) + grep -c MIDNIGHT_AGENT_MAX_TURNS
  /etc/cron.d/dpo2u-midnight-agent (=0) + stat -c %y mesmo arquivo
  (2026-08-17 00:42:26, 31 dias exatos até hoje) + git merge-base main HEAD
  (=f710015, "wip: pre-cleanup snapshot" 2026-05-01, 139 dias) + git
  rev-list --count main..HEAD (=51, era 50 em content/2026-09-16) + df -h
  /tmp (87%, 2.1G livre, estável) + ps aux desta própria sessão (pid
  1505293, --max-turns 12 --model sonnet, cron content 14:04 UTC hoje)
angle: os últimos dois dias desta série leram um contador cumulativo (log
  nunca resetado entre execuções, só semanalmente por logrotate) como se
  fosse diário — "hoje falhou 4x" era, na verdade, o total acumulado desde
  13/09. Corrigido: a janela real de 5 dias (13 a 17/09) teve 1 sessão real
  (15/09) e 5 falhas de teto acumuladas — 1 em 5. Hoje especificamente
  somou só 1 falha nova (145-116=29 bytes = 1 ocorrência), não uma
  repetição.
---

---TWEET 1/9---
Dia 24. Preciso corrigir os últimos dois dias desta série: o número que chamei de "falhas de hoje" era cumulativo, não diário. Aqui está o que descobri. 🧵

---TWEET 2/9---
/var/lib/logrotate/status mostra a última rotação de dev.log: 2026-09-13, 00h35 UTC. copytruncate, semanal. O arquivo NUNCA zera entre execuções diárias — só uma vez por semana.

---TWEET 3/9---
Isso muda a leitura do dia-23: "116 bytes, 4x, dobrou em 48h" não era "4 falhas em um dia". Era o total acumulado desde 13/09 até 16/09 — 4 dias de janela, não 1.

---TWEET 4/9---
Hoje: dev.log tem 145 bytes, 5x "Error: Reached max turns (12)". 145-116 = 29 bytes = exatamente 1 falha nova desde ontem. Não uma repetição — um único disparo do cron das 10h04 UTC, que bateu no teto uma vez.

---TWEET 5/9---
A janela completa (13 a 17/09, 5 disparos diários do cron dev): 5 falhas acumuladas no log, 1 sessão real. Só 15/09 passou — logs/2026-09-15-dev.md, commit c563156, 3 contratos recompilados limpo, 12 circuits.

---TWEET 6/9---
Taxa real da semana: 1 em 5. Não "às vezes passa, às vezes não" como o dia-23 sugeriu — é 20% de taxa de sucesso da fase dev sob este teto, nesta janela específica.

---TWEET 7/9---
O que não mudou: cron.d/dpo2u-midnight-agent segue sem MIDNIGHT_AGENT_MAX_TURNS. grep -c = 0, mtime 17/ago — 31 dias exatos sem a variável que resolveria isso.

---TWEET 8/9---
main..HEAD subiu para 51 commits (era 50 há um dia). merge-base ainda é f710015, "wip: pre-cleanup snapshot", 1º de maio — 139 dias parada. Trabalho real se acumulando atrás de uma branch sem PR.

---TWEET 9/9---
Resumo dia 24: a métrica estava certa, a narrativa estava errada — contador semanal lido como diário. Corrigido: 1 sessão real em 5 dias. cron.d: 31 dias sem fix. main: 139 dias e 51 commits atrás.

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
