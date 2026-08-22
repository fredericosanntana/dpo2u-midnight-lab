---
date: 2026-08-22
pillar: dpo2u-arch / thought-leadership
format: linkedin-post
source: ps aux | grep -i claude (PID 698839 — esta sessão de conteúdo — rodando
  --max-turns 12, iniciada 14:04 UTC) + fuser /tmp/dpo2u-cron-midnight-agent.lock
  (lock preso por esta sessão desde 14:04) + cat /etc/cron.d/dpo2u-midnight-agent
  (nenhuma das 3 fases sobrescreve MIDNIGHT_AGENT_MAX_TURNS, confirmado de novo hoje,
  inalterado desde 08-19) + grep -c "CRON.*run_claude_task.sh (dev|content)"
  /var/log/syslog (7 gatilhos cada) + grep -o "Reached max turns"/"OAuth session
  expired" /var/log/managed-agent/dev.log | wc -l (6+1=7, 100% de falha) + grep -o
  "Reached max turns" content.log | wc -l (=6, antes desta sessão) + git status no
  início da sessão (content/2026-08-20 e content/2026-08-21 untracked — escritos por
  sessões anteriores, nunca commitados) + git log -1 --format=%cI 25d24e9
  (2026-08-15T10:02:46Z) + date -u (2026-08-22T14:04:52Z, delta 7d04h) + commits
  9a88dcc (08-19, causa raiz), content/2026-08-20 (confirmação pipeline inteiro),
  content/2026-08-21 (diagnosticado != corrigido, dia 6)
angle: quarto dia seguido reportando o mesmo achado sem remediação — mas hoje, pela
  primeira vez, a evidência não veio de analisar log depois do fato. Veio de achar o
  processo desta própria sessão de conteúdo na lista de processos do sistema, rodando
  sob o mesmo teto de turnos que estava sendo descrito. E o conteúdo de dois dias
  anteriores (08-20, 08-21) estava em disco, nunca commitado — a mesma falha, capturada
  em ato.
---

Quarto dia seguido escrevendo sobre o mesmo bug sem remediação. Desta vez a evidência não veio de um log — veio de olhar a lista de processos do sistema e achar o PID desta própria sessão de conteúdo.

O que achamos: o processo que gera este post (PID 698839, `claude -p [...] --max-turns 12`, iniciado às 14h04 UTC) segura o mesmo lock (`/tmp/dpo2u-cron-midnight-agent.lock`) e roda sob o mesmo teto de 12 turnos que terça-feira (9a88dcc) identificou como causa da fase zealy parada, e que quarta (08-20) confirmou valer para as 3 fases do pipeline — dev, content, zealy. `/etc/cron.d/dpo2u-midnight-agent` continua sem uma variável de override em nenhuma das 3 linhas.

O dado mais concreto de hoje: `content/2026-08-20/` e `content/2026-08-21/` existiam em disco, escritos, com frontmatter completo — e nenhum dos dois tinha sido commitado até esta sessão. Não foi uma decisão de conteúdo adiada. Foi a sessão de conteúdo do dia anterior escrevendo o arquivo e esgotando o turno antes de chegar no `git commit`. O diretório untracked é a prova física de um mecanismo que, até agora, só tínhamos lido em log.

Números acumulados (16 a 22/08): fase dev, 7 gatilhos de cron, 7 falhas (6x "Reached max turns (12)" + 1x sessão OAuth expirada) — 100%. Fase content, pelo menos 6 dos 7 gatilhos com o mesmo teto batido antes deste. Último commit de dev real fora do pipeline de conteúdo: `25d24e9`, 15/08 10h02 UTC — hoje são 7 dias e 4 horas depois.

Por que isso importa além do bug em si: a correção é uma linha de variável de ambiente por fase no cron, mapeada desde terça. Quatro relatos consecutivos — causa raiz, confirmação, "ainda não corrigido", e agora "capturado em ato" — e a linha continua sem ser aplicada. Isso não é mais sinal de bug técnico. É sinal de processo sem dono: alguém precisa decidir aplicar o fix, ou decidir explicitamente não aplicar e por quê. Nenhuma das duas coisas aconteceu ainda.

Regra que seguimos: log sem erro não é evidência de que o serviço entrega. A versão mais forte dessa regra, aprendida hoje: nem log COM erro garante que alguém age — é preciso um dono olhando o dado, não só o dado existindo.

#BuildInPublic #DPO2U #AIAgents #MidnightForDevs #NightForce
