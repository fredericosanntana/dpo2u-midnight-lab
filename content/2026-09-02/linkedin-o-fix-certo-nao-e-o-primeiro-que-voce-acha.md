---
date: 2026-09-02
pillar: dpo2u-arch / thought-leadership
format: linkedin-post
source: df -h /tmp (hoje = 53% usado, 7.5G livres — vs. tmpfs 16G 100% cheio em
  24/08, log original do incidente) + stat dev.log (116 bytes ÷ 29 = 4 erros
  pós-rotação de 30/08, último 2026-09-02T10:06:42Z) + dev.log.1 (203 bytes = 7
  erros pré-rotação) = 11 falhas de dev consecutivas desde 23/08, zero exceções +
  stat content.log (87 bytes = 3 erros, último 2026-09-01T14:07:26Z, 28s após o
  commit e0fefc8 às 14:06:58) + grep -c MIDNIGHT_AGENT_MAX_TURNS
  /etc/cron.d/dpo2u-midnight-agent (=0, hoje, 10º dia desde o fix pronto) + grep
  run_claude_task.sh:24 (MAX_TURNS="${MIDNIGHT_AGENT_MAX_TURNS:-12}") + git log
  (e0fefc8 "dia-14") + ps aux (PID 657658, --max-turns 12, esta sessão)
angle: consertar o primeiro bloqueio que você encontra não é o mesmo que consertar
  a causa raiz. 11 dias de evidência mostram que /tmp cheio e o teto de turnos são
  bugs independentes que só pareciam ser o mesmo problema porque apareceram juntos
  na mesma semana.
---

Quinze dias documentando o mesmo pipeline ensinam uma lição que os primeiros cinco não mostravam: o primeiro bloqueio que você encontra e resolve pode não ser a causa raiz — só o mais visível.

Em 24/08, a fase dev desta pipeline travou porque `/tmp` estava 100% cheio (tmpfs de 16G, zero bytes livres). O compilador Compact (`compactc`) não conseguia nem escrever um tempfile, e a própria ferramenta Bash da sessão ficou inoperante pelo mesmo motivo. Foi documentado, escalado e — em algum momento entre então e hoje — resolvido: `df -h /tmp` agora mostra 53% de uso, 7.5G livres.

E mesmo assim, a fase dev bateu o teto de 12 turnos de novo hoje, às 10h06 UTC. 11ª falha consecutiva desde 23/08, zero exceções — 7 registradas antes da rotação de log em 30/08 (`dev.log.1`, 203 bytes) e 4 depois (`dev.log`, 116 bytes).

Isso muda a leitura do incidente de 24/08: `/tmp` cheio nunca foi A causa raiz do dev travado. Era um bloqueio real, coincidente no tempo, que consumiu a atenção de instrumentação porque era o mais fácil de provar com um `df -h`. A causa raiz — o `--max-turns 12` hardcoded como default no wrapper (`run_claude_task.sh`, linha 24: `MAX_TURNS="${MIDNIGHT_AGENT_MAX_TURNS:-12}"`) — continuou lá, sem uma linha de override em `/etc/cron.d/dpo2u-midnight-agent`, e continuou derrubando a fase todos os dias, com ou sem espaço em disco.

Uma segunda peça de evidência hoje aponta pro mesmo padrão em outro ponto do pipeline: `content.log` (87 bytes = 3 erros desde a rotação de 30/08) mostra que a sessão de ontem (dia 14) — que comitou com sucesso às 14h06m58s — registrou um novo erro de teto 28 segundos depois, às 14h07m26s. O commit não é a última etapa da rotina de conteúdo; o passo 7, o e-mail de digest pro shareholder, é. Um dia marcado como sucesso no Git pode estar, silenciosamente, sem ter fechado o loop de comunicação com quem decide.

A lição de instrumentação de hoje: quando dois bloqueios aparecem próximos no tempo, tratar o primeiro que você resolve como "o problema resolvido" é um erro comum e caro. `/tmp` cheio e teto de turnos são bugs completamente independentes — um é infraestrutura compartilhada da VPS, o outro é um parâmetro de wrapper — que só pareciam relacionados porque bloquearam a mesma fase na mesma semana. Resolver um não testa o outro. Só um log limpo depois do fix testaria.

A regra que esta série repete toda semana: log sem erro não é evidência de entrega. A versão de hoje: bloqueio resolvido não é causa raiz resolvida — só quando o log volta a ficar limpo é que dá pra fechar o caso.

#BuildInPublic #DPO2U #AIAgents #MidnightForDevs #NightForce
