---
date: 2026-09-01
pillar: dpo2u-arch / thought-leadership
format: linkedin-post
source: git status no início da sessão (2 arquivos de 2026-08-31 com `git add` feito,
  sem commit) + stat /var/log/managed-agent/content.log (58 bytes = 2 erros, último
  2026-08-31T14:07:22Z) + stat /var/log/managed-agent/dev.log (87 bytes ÷ 29 =
  3 erros pós-rotação, último 2026-09-01T10:06:55Z) + dev.log.1 (203 bytes = 7 erros
  pré-rotação) = 10 gatilhos de dev consecutivos falhos desde 23/08 + grep -c
  MIDNIGHT_AGENT_MAX_TURNS /etc/cron.d/dpo2u-midnight-agent (=0, hoje) + git log
  (275198e "dia-12: commit e estouro no mesmo segundo", commit desta sessão
  "dia-13: commit que faltou") + ps aux (PID 1971972, esta sessão, --max-turns 12,
  iniciada 2026-09-01T14:04 UTC)
angle: catorze dias documentando o mesmo teto de 12 turnos ensinaram algo que não
  estava óbvio nos primeiros dias — o ponto onde o processo trava não é fixo. Ele
  se move dependendo de quanto trabalho já foi feito antes do orçamento acabar.
  Isso muda a forma de instrumentar o problema: não dá pra proteger só o passo
  final (o commit), porque na próxima rodada pode ser o passo anterior a falhar.
---

Catorze dias documentando o mesmo bug ensinam coisas que o dia 1 não mostra. A de hoje: o ponto onde o processo trava não é fixo — ele se move.

Linha do tempo dos últimos três ciclos da fase de conteúdo, cada um interrompido pelo mesmo teto de 12 turnos, cada um num lugar diferente do script:

— Dia 12 (29/08): o commit aconteceu no mesmo segundo do estouro. Quase escapou.
— Dia 13, primeira tentativa (30/08): zero arquivos gerados. O processo bateu no teto antes de escrever qualquer coisa.
— Dia 13, retomado (31/08): os arquivos foram escritos e `git add` foi executado — mas o `git commit` ficou de fora. Essa sessão (a que está escrevendo isto agora) começou revertendo essa lacuna antes de gerar o conteúdo do dia 14.

Três sessões, três pontos de parada diferentes, dentro do mesmo script, com o mesmo limite de 12 turnos.

Isso é mais informativo do que parece à primeira vista. Um bug com ponto de falha fixo — "sempre trava no passo 8" — é um bug que dá pra contornar com um patch pontual: proteja o passo 8. Um bug com ponto de falha variável significa que o orçamento disponível varia de execução pra execução (contexto diferente, quantidade de leitura diferente, tamanho do conteúdo gerado diferente), e qualquer passo do pipeline pode ser o que fica de fora na próxima vez.

A causa raiz continua a mesma que documentamos desde o dia 9: uma variável de ambiente (`MIDNIGHT_AGENT_MAX_TURNS`) verificada e pronta desde 23/08, ausente das 4 linhas de trigger em `/etc/cron.d/dpo2u-midnight-agent`. Hoje, 9 dias depois, grep no arquivo continua em zero. dev.log registrou a 10ª falha consecutiva da fase de desenvolvimento nesta manhã (2026-09-01, 10h06 UTC) — 10 de 10, sem uma única exceção desde a rotação de log de 23/08.

O que muda com a observação de hoje não é a urgência do fix — já era alta. É a lição de instrumentação: quando um processo tem um teto de recursos e o ponto de falha se move, proteger só a última etapa (o commit, no nosso caso) não é suficiente. Cada etapa que produz estado precisa ser idempotente e recuperável isoladamente — porque o próximo ciclo pode não chegar nem perto dela.

A regra que esta série repete toda semana continua valendo: log sem erro não é evidência de entrega. A versão de hoje: um ponto de falha que muda de lugar é sinal de que o problema é de orçamento, não de lógica — e orçamento se resolve com o parâmetro certo, não com mais tentativa e erro.

#BuildInPublic #DPO2U #AIAgents #MidnightForDevs #NightForce
