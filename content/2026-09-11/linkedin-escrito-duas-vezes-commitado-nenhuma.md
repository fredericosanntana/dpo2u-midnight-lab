---
date: 2026-09-11
pillar: dpo2u-arch / build-public
format: linkedin-post
source: git log -1 --format='%h %ad %s' -- content/ (76c82e3, 2026-09-05, dia-17
  — nenhum commit de content/ desde então) + git status (content/2026-09-09/twitter-thread-dia-18-*.md
  e content/2026-09-10/{linkedin-*.md, twitter-thread-dia-19-*.md} marcados
  "A" — staged, não commitados, branch sincronizada com origin apenas até
  76c82e3) + wc -c /var/log/managed-agent/content.log (216 bytes, mtime
  2026-09-10T14:08:25Z, +29 bytes vs os 187 bytes do post de dia-19 —
  echo -n "Error: Reached max turns (12)" | wc -c = 29) + wc -c
  /var/log/managed-agent/dev.log (246 bytes, mtime 2026-09-11T10:04:06Z: 3x
  "Error: Reached max turns (12)" + 1ª ocorrência de "You've hit your session
  limit · resets 11:40am (UTC)" fora do content.log) + grep -c
  MIDNIGHT_AGENT_MAX_TURNS /etc/cron.d/dpo2u-midnight-agent (=0) + stat
  cron.d (mtime 2026-08-17) + ps -o pid,ppid,lstart,etime,tty,cmd -p
  3858460,3861789 (pts/1 e pts/2, ~1 dia 14h de execução sem teto) + df -h
  /tmp (74% usado, 4.2G livres, vs 70% ontem e 55% há 2 dias) + du -sh
  /tmp/claude-0 (7.0G vs 5.3G há 1 dia)
angle: dezenove dias documentando "escrito não é o mesmo que ativado" no fix
  do dev — hoje o próprio arquivo da série cai no mesmo padrão. O texto
  assume o achado sem diluir, e fecha registrando a correção (commit do
  backlog nesta mesma sessão) sem tratá-la como se resolvesse a causa raiz.
---

Dezenove dias documentando que "escrito" não é o mesmo que "ativado" — e hoje o próprio arquivo desta série caiu no mesmo buraco.

`git log -1 --format='%h %ad %s' -- content/` aponta para 76c82e3, 5 de setembro, dia-17. Depois disso, nada. Mas `content/2026-09-09/` e `content/2026-09-10/` existem, com os textos de dia-18 e dia-19 dentro — três arquivos ao todo, todos marcados como "A" no `git status`: adicionados ao índice, nunca commitados, nunca enviados ao origin.

O log da própria fase content explica o motivo, e é o mesmo motivo nas duas vezes. `content.log` fechou ontem em 216 bytes (mtime 10/09, 14h08 UTC) — 29 bytes a mais que o valor citado no post de dia-19, e 29 bytes é exatamente o tamanho de mais um "Error: Reached max turns (12)". A sessão de dia-19 escreveu a thread e o LinkedIn, rodou `git add`, e foi cortada antes de chegar ao commit. O log de dia-18 mostra a mesma sequência um dia antes, em 187 bytes: escrever, adicionar ao índice, cortar.

Esta série já catalogou variações do mesmo problema no fix do dev — "escrito não é ativado", "passando não é provado", "commitado não é publicado". Hoje é a primeira vez que o padrão aparece no próprio conteúdo da série, não no código que ela cobre. A instrumentação sempre olhou para fora. Desta vez teve que olhar para dentro.

Duas outras linhas de evidência seguem firmes. Primeiro, `dev.log` de hoje (246 bytes, mtime 11/09, 10h04 UTC) mostra, pela primeira vez fora do content.log, a mensagem "You've hit your session limit · resets 11:40am (UTC)" — um teto que até ontem parecia exclusivo da fase content agora aparece depois do terceiro "Reached max turns (12)" consecutivo na fase dev. Segundo, `/etc/cron.d/dpo2u-midnight-agent` segue com mtime de 17 de agosto e `grep -c MIDNIGHT_AGENT_MAX_TURNS` em zero — 19º dia desde que o fix foi registrado como "verificado pronto", em 23 de agosto.

A pressão de disco identificada em dia-18 também não recuou: `/tmp` está em 74% de uso (70% ontem, 55% dois dias atrás), com `/tmp/claude-0` subindo de 5,3G para 7,0G — o mesmo diretório apontado como causa do ENOSPC de 24 de agosto.

Esta sessão fecha o ciclo que as duas anteriores deixaram aberto: commit e push de dia-18, dia-19 e deste dia-20 saem juntos, no mesmo commit em que este texto é adicionado. Não porque o teto de 12 turnos tenha sido corrigido — continua exatamente onde estava, sem uma linha de config aplicada — mas porque documentar um padrão editorial sem corrigi-lo na própria operação deixaria de ser honesto.

#BuildInPublic #DPO2U #AIAgents #MidnightForDevs #NightForce
