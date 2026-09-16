---
date: 2026-09-16
pillar: dpo2u-arch / build-public
format: linkedin-post
source: wc -c /var/log/managed-agent/dev.log && stat -c '%y'
  /var/log/managed-agent/dev.log (116 bytes, mtime 2026-09-16T10:05:xx UTC,
  "Error: Reached max turns (12)" x4 concatenado sem separador; 58 bytes/x2
  no dia-22, content/2026-09-14/) + logs/2026-09-15-dev.md e git show
  --stat c563156 (dev(2026-09-15): compactc --version 0.31.0; bash
  scripts/compile-contracts.sh → "3 compiled, 0 failed", 12 circuits
  ConsentRegistry/DataAuditLog/DataSubjectRights; script check-versions
  adicionado a package.json, apontando para
  scripts/check-version-consistency.sh já existente) + grep -c
  MIDNIGHT_AGENT_MAX_TURNS /etc/cron.d/dpo2u-midnight-agent (=0) + stat -c
  %y mesmo arquivo (2026-08-17, 30º dia exato) + grep -n MAX_TURNS
  run_claude_task.sh (linha 24: MAX_TURNS="${MIDNIGHT_AGENT_MAX_TURNS:-12}")
  + git merge-base main HEAD (=f710015), git log -1 f710015 e git log -1
  origin/main (ambos "wip: pre-cleanup snapshot 2026-05-01", confirmado
  idêntico no remoto) + git rev-list --count main..HEAD (=50, era 48 em
  content/2026-09-14) + date diff 2026-05-01→2026-09-16 (=138 dias) +
  df -h /tmp (87%, 14G/16G, 2.2G livre; era 88% no dia-22) + du -sh
  /tmp/claude-0 (8.1G; era 6.4G no dia-22)
angle: a série vinha tratando o teto de 12 turnos como falha binária —
  falha sempre, trava sempre. Os últimos dois dias contradizem isso:
  09-15 funcionou dentro do mesmo teto e produziu 2 commits reais; 09-16
  falhou 4x seguidas, o dobro do acumulado até o dia-22. O achado é que o
  teto é intermitente, não permanentemente quebrado — o que não muda o
  fato de que o fix de uma linha segue sem aplicar há 30 dias, e que main
  segue congelada há 138 dias e agora 50 commits atrás do trabalho real.
---

Vinte e dois dias documentando o teto de 12 turnos como se fosse um interruptor: liga, falha; desliga, não falha. Os últimos dois dias mostram que não é bem assim — e isso é uma notícia pior, não melhor.

Ontem (15/09) a fase dev funcionou. `logs/2026-09-15-dev.md` registra uma sessão real, sob o mesmo `--max-turns 12`: `compactc --version` confirmou 0.31.0, `bash scripts/compile-contracts.sh` recompilou os 3 contratos do lab — ConsentRegistry, DataAuditLog, DataSubjectRights — limpo, "3 compiled, 0 failed", 12 circuits no total. Achando o processo com folga, a sessão ainda fechou um gap pequeno de tooling: adicionou `check-versions` ao `package.json`, um atalho `npm run` para o script `check-version-consistency.sh` que já existia mas não seguia o padrão de 1 script por ferramenta dos demais comandos do lab. Commit `c563156`, 10h07 UTC.

Hoje (16/09) o mesmo teto não coube. `dev.log` fechou com 116 bytes — quatro mensagens idênticas "Error: Reached max turns (12)" grudadas sem separador. No dia-22 (14/09) eram 58 bytes, duas mensagens. O log dobrou em 48 horas, mesmo com um dia de sucesso no meio — reforçando o que a série já registrou antes: o arquivo acumula falhas entre execuções, nunca é limpo.

O mecanismo continua exatamente onde estava: `run_claude_task.sh:24` lê `MIDNIGHT_AGENT_MAX_TURNS` com fallback 12; `grep -c` no `cron.d/dpo2u-midnight-agent` segue em zero, `mtime` parado em 17 de agosto. Isso fecha 30 dias exatos sem a variável que resolveria o padrão — não um bug complexo, uma linha de configuração que ninguém escreveu ainda.

A segunda linha desta história também andou: `git rev-list --count main..HEAD` subiu de 48 para 50 — os dois commits novos são exatamente os de ontem, a verificação dos contratos e o script `check-versions`. `git merge-base main HEAD` continua em `f710015`, "wip: pre-cleanup snapshot", 1º de maio — confirmado idêntico em `origin/main`. 138 dias parada, agora com mais trabalho real acumulado atrás dela.

Uma nota de infraestrutura: `/tmp` ficou estável (87% hoje, 14G/16G, 2.2G livre, vs 88% no dia-22), mas `/tmp/claude-0` cresceu de 6,4G para 8,1G no mesmo intervalo — mais um número que se move sem explicação completa ainda.

Resumo do dia 23: o teto de 12 turnos não está permanentemente quebrado — ontem deixou passar trabalho real. Mas quando falha, falha pior: 4 tentativas hoje contra 2 há dois dias. E os dois itens que removeriam a incerteza de vez — a variável de ambiente no cron.d e uma decisão de merge para main — seguem exatamente onde estavam, só que em números redondos: 30 dias e 138 dias, nenhum com dono declarado.

#BuildInPublic #DPO2U #AIAgents #MidnightForDevs #NightForce
