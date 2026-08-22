---
date: 2026-08-21
pillar: dpo2u-arch / build-public
format: twitter-thread
source: cat /etc/cron.d/dpo2u-midnight-agent (3 fases, nenhuma com MIDNIGHT_AGENT_MAX_TURNS
  setado — confirmado de novo hoje, inalterado desde 08-19) + grep "CRON.*run_claude_task.sh
  dev" /var/log/syslog (6 gatilhos: 08-16 10:00:01, 08-17 a 08-21 10:04:01, todos UTC) +
  grep -o "Reached max turns" /var/log/managed-agent/dev.log | wc -l (=5) + grep -o "OAuth
  session expired" /var/log/managed-agent/dev.log | wc -l (=1) — 6 erros pra 6 gatilhos,
  100% de falha + stat --format=%y /var/log/managed-agent/dev.log (2026-08-21T10:06:08Z,
  2min depois do gatilho de hoje — o log recebeu escrita nova hoje, não é resíduo de dias
  anteriores) + git log -1 --format=%cI 25d24e9 (2026-08-15T10:02:46Z, último dev real) +
  date -u agora (2026-08-21T14:07:33Z, delta 6d04h) + content/2026-08-20/twitter-thread-o-
  teto-de-doze-turnos.md (achado de ontem, resgatado e commitado nesta sessão)
angle: o achado de 08-20 recomendou MIDNIGHT_AGENT_MAX_TURNS por fase no cron. Hoje é o
  6º gatilho consecutivo da fase dev falhando do mesmo jeito, e o cron ainda não mudou uma
  linha. Diagnosticado não é corrigido — e essa distância é o próprio ponto.
---

---TWEET 1/6---
Terça (9a88dcc) achamos por que zealy/ parava. Quarta (content/2026-08-20) confirmamos que dev e content tinham o mesmo bug. Hoje é sexta. O cron ainda não mudou. 6º gatilho seguido da fase dev falhando. 🧵

---TWEET 2/6---
Números: /etc/cron.d/dpo2u-midnight-agent roda dev (10h), content (14h), zealy (17h UTC). Nenhuma das 3 linhas define MIDNIGHT_AGENT_MAX_TURNS. Conferido de novo agora — igual ao que era em 08-19, quando isso foi diagnosticado pela primeira vez.

---TWEET 3/6---
syslog confirma 6 gatilhos da fase dev: 16, 17, 18, 19, 20 e hoje (21/08), todos ~10h UTC. dev.log tem 6 erros pro mesmo período: 5x "Reached max turns (12)" + 1x falha de OAuth. 6 gatilhos, 6 falhas. 100%.

---TWEET 4/6---
E não é log velho: dev.log foi escrito às 10h06 UTC de hoje — 2min depois do gatilho de hoje rodar. A fase dev falhou de novo, na nossa frente, enquanto essa thread era escrita.

---TWEET 5/6---
Último commit de dev real: 25d24e9, 15/08 10h02 UTC. Agora: 21/08 14h07 UTC. 6 dias e 4h sem um ciclo dev completar. O fix é uma linha de env var por fase no cron — já mapeado, não aplicado.

---TWEET 6/6---
A regra que a gente segue é: log sem erro não é evidência de que o serviço entrega. Aqui o log TEM erro, é claro, é contado — e mesmo assim ninguém ainda virou a chave. Diagnosticado ≠ corrigido. Essa distância é o registro de hoje.

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
