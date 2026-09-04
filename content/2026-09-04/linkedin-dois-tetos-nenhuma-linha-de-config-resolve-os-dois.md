---
date: 2026-09-04
pillar: dpo2u-arch / thought-leadership
format: linkedin-post
source: od -c /var/log/managed-agent/dev.log (201 bytes: 5x "Error: Reached max
  turns (12)" + "You've hit your weekly limit · resets Sep 8, 9am (UTC)", primeira
  ocorrência desta mensagem em 16 dias de logs, mtime 2026-09-04T10:04:07Z) +
  dev.log.1 (203 bytes = 7 erros pré-rotação de 30/08) = 12 falhas "Reached max
  turns" consecutivas desde 23/08, seguidas hoje por uma 13ª falha de categoria
  diferente + stat content.log (mtime 2026-09-03T14:06:13Z: tentativa de 03/09
  falhou com "Reached max turns", zero arquivos em content/2026-09-03/, 2ª vez que
  isso ocorre na série, a 1ª em 30/08) + stat zealy.log (145 bytes = 5 falhas
  idênticas, mtime 2026-09-03T17:05:19Z) + grep -c MIDNIGHT_AGENT_MAX_TURNS
  /etc/cron.d/dpo2u-midnight-agent (=0, 12º dia desde o fix verificado pronto) +
  df -h /tmp (53%, 7.4G livres — inalterado desde o dia 15) + ps aux (esta sessão
  de content, PID 2146469/2147198, rodando normalmente 4h após o aviso de limite
  semanal no dev)
angle: instrumentar um pipeline não é só medir "falhou ou não falhou" — é
  classificar POR QUE falhou, porque cada classe de falha pede uma ferramenta
  diferente. Um teto de turnos do wrapper se resolve com uma variável de ambiente.
  Um teto de conta se resolve esperando um reset ou mudando o padrão de uso. Tratar
  os dois como "o mesmo erro" porque aparecem na mesma linha de log é o próximo
  erro de diagnóstico depois de "consertar o primeiro bloqueio que você encontra".
---

Dezesseis dias documentando o mesmo pipeline de automação ensinaram, até ontem, uma lição sobre causa raiz: o primeiro bloqueio que você encontra e resolve não é necessariamente A causa. Hoje a lição se desdobra numa segunda camada — nem toda falha que se parece igual no log é, de fato, o mesmo problema.

Desde 23 de agosto, a fase de desenvolvimento deste pipeline falhava com a mesma mensagem, sempre: `Error: Reached max turns (12)`. Doze vezes seguidas, sem uma única exceção — 7 registradas antes da rotação de log de 30/08, 5 depois. O diagnóstico, verificado e pronto há 12 dias, é conhecido: o wrapper (`run_claude_task.sh`) lê uma variável de ambiente, `MIDNIGHT_AGENT_MAX_TURNS`, que nunca foi adicionada às 4 linhas de trigger em `/etc/cron.d/dpo2u-midnight-agent`. Um `grep` no arquivo hoje ainda confirma: zero ocorrências.

Hoje, às 10h04 UTC, a fase dev falhou pela 13ª vez consecutiva — mas com uma mensagem que nunca tinha aparecido nesta série: `You've hit your weekly limit · resets Sep 8, 9am (UTC)`. Não é o teto de turnos do wrapper. É o limite de uso semanal da própria conta Claude, verificado byte a byte no log com `od -c` para eliminar qualquer dúvida de que fosse variação de formatação do mesmo erro.

A diferença entre os dois tetos não é sutil — é a diferença entre dois tipos de problema que pedem duas ferramentas completamente diferentes. O teto de turnos é um parâmetro de configuração local: uma linha em um arquivo de cron resolve. O limite semanal é uma restrição de conta, compartilhada por toda sessão que usa essas credenciais — nenhuma linha de configuração o resolve; só o reset (08/09) ou uma mudança no padrão de consumo.

O ponto que vale além deste incidente específico: instrumentar um sistema não é apenas contar falhas, é classificá-las corretamente antes de escolher o fix. Um log que diz "falhou" 13 vezes seguidas parece um único bug persistente. Só ao abrir o conteúdo byte a byte é que se vê que as primeiras 12 falhas e a 13ª pedem remédios diferentes — e que aplicar o remédio da primeira classe não teria evitado a segunda. É o mesmo erro category de "consertar o primeiro bloqueio que você encontra e chamar de causa raiz", agora um nível acima: duas falhas podem parecer idênticas no texto do log e ainda assim pertencerem a camadas de sistema inteiramente diferentes.

Uma peça de honestidade que registro sem fabricar explicação: esta própria sessão, que gera este texto, rodou normalmente às 14h04 UTC — quatro horas depois do aviso de limite semanal no dev, na mesma conta. Não sei explicar por que uma fase foi bloqueada e a outra não no mesmo dia. Isso fica registrado como lacuna de instrumentação a resolver, não como conclusão.

A regra que esta série repete toda semana continua valendo: log sem erro não é evidência de entrega. A camada de hoje: log COM erro também não é uma classe única — dois erros que imprimem quase a mesma linha podem exigir dois donos, duas soluções e dois prazos completamente diferentes.

#BuildInPublic #DPO2U #AIAgents #MidnightForDevs #NightForce
