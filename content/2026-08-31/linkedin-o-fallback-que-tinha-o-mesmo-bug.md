---
date: 2026-08-31
pillar: dpo2u-arch / thought-leadership
format: linkedin-post
source: stat /var/log/managed-agent/dev.log (9 de 9 gatilhos falhos desde a rotação
  de 23/08 — 7 pré-rotação de 30/08 + 2 pós, última falha 2026-08-31T10:05:43Z) +
  stat /var/log/managed-agent/content.log (2026-08-30T14:08:02Z, 1 erro, zero
  arquivos em content/2026-08-30/, confirmado via find) + stat
  /var/log/managed-agent/zealy.log (2026-08-30T17:06:06Z, 1 erro, zero arquivos em
  zealy/2026-08-30/) + stat /var/log/managed-agent/pipeline.log (gatilho de domingo,
  2026-08-30T20:06Z, 1 erro — o comentário no /etc/cron.d/dpo2u-midnight-agent
  descreve essa fase como "catches up anything missed") + grep -c
  MIDNIGHT_AGENT_MAX_TURNS /etc/cron.d/dpo2u-midnight-agent (=0, hoje) + git log -1
  --format='%h %ci %s' (275198e, 2026-08-29, último commit de conteúdo antes deste
  ciclo) + ps aux (PID 3400569, esta sessão, --max-turns 12, iniciada
  2026-08-31T14:04 UTC)
angle: o achado de hoje não é "o bug continua" — é que o dia 30/08 provou que o
  catch-all semanal, desenhado especificamente pra recuperar dias perdidos, herdou
  a mesma causa raiz das fases que ele deveria recuperar. Redundância que compartilha
  ponto único de falha não é redundância.
---

Treze dias documentando o mesmo bug. O que mudou ontem não foi a intensidade — foi a prova de que a rede de segurança também está furada.

O pipeline de conteúdo deste laboratório roda em 4 gatilhos de cron: dev (10h), content (14h), zealy (17h), e um quarto, aos domingos, comentado no próprio arquivo de configuração como "Sunday bonus: catches up anything missed" — o mecanismo de recuperação, pensado para pegar exatamente os dias em que algo falhou durante a semana.

No domingo passado (30/08), os quatro falharam no mesmo dia:
- dev: 9ª falha consecutiva desde a rotação de log de 23/08 — 100% de falha, sem uma exceção.
- content: pela primeira vez na série, zero arquivos gerados. Não houve nem um rascunho órfão pra resgatar depois — o diretório do dia ficou vazio.
- zealy: mesma coisa, mesmo dia.
- O catch-all de domingo, criado especificamente pra recuperar as duas fases que tinham acabado de falhar horas antes: também bateu no teto de 12 turnos e recuperou exatamente nada.

O fix da causa raiz — uma variável de ambiente por fase (`MIDNIGHT_AGENT_MAX_TURNS`) em 4 linhas de `/etc/cron.d/dpo2u-midnight-agent` — está pronto e verificado desde 23/08. `grep` no arquivo hoje: zero ocorrências. Oito dias corridos.

O ponto que vale a reflexão, além do bug específico: um catch-all só funciona como rede de segurança quando ele não compartilha a mesma causa raiz do que está tentando capturar. Aqui, os quatro gatilhos herdam o mesmo default hardcoded (`--max-turns 12`) do mesmo script. Não é "4 camadas de proteção" — é uma única configuração, chamada 4 vezes, com 4 chances independentes de expor o mesmo defeito.

Isso não é exclusivo de pipelines de conteúdo. Vale para qualquer arquitetura com "plano B": se o plano B herda a mesma dependência, o mesmo timeout, o mesmo limite hardcoded do plano A, ele não reduz o risco — só adia a hora em que ele aparece.

A regra que esta série repete toda semana: log sem erro não é evidência de entrega. A versão de hoje: ter um mecanismo de recuperação também não é — se ele nunca foi testado sob a mesma falha que deveria recuperar.

#BuildInPublic #DPO2U #AIAgents #MidnightForDevs #NightForce
