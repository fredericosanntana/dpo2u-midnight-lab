---
date: 2026-08-07
pillar: midnight-dev / build-public
format: twitter-thread
source: /var/log/midnight-health/health.log (grep verified 2026-08-07: 115 occurrences of the 4.0.0-rc.4 WARN, first 2026-07-26 22:00:10 UTC, last 2026-08-05 10:00:04 UTC, first correct OK 2026-08-05 12:00:03 UTC) + git show 08f170d, 1a8813e + logs/2026-08-06-dev.md + zealy/2026-08-05, 2026-08-06 status notes + docker ps (live cross-check)
angle: parte 7 — o próprio script feito pra pegar drift de versão em produção teve um drift de versão, e mentiu em 115 alertas seguidos por 9 dias; o gap entre "corrigido em disco" e "corrigido em git" foi de 24h exatas
---

---TWEET 1/8---
Parte 7 #BuildInPublic

Construímos um script pra pegar drift de versão entre o que roda em produção e o que devia rodar. Ele mesmo tinha um drift — e mentiu a cada 2h, por 9 dias seguidos. 🧵

---TWEET 2/8---
25/07, commit 1a8813e: tag do indexer corrigida em docker-compose.yml e pre-deploy-check.sh (4.0.0-rc.4 → 3.1.0). Um terceiro arquivo com a mesma info — scripts/midnight-health-check.sh — ficou pra trás. Ninguém notou na hora.

---TWEET 3/8---
Resultado: cron de 2h comparando o container real contra a tag antiga. WARN a cada tick: "indexer rodando 3.1.0, esperado 4.0.0-rc.4 — version drift". Cada WARN virava ALERT → email pro shareholder. 115 disparos entre 26/07 22h e 05/08 10h — contado no health.log, não estimado.

---TWEET 4/8---
A correção foi salva em disco em 05/08 10:02:53. Cron lê o script do disco, não do git. Último WARN falso: 05/08 10:00:04. Primeiro OK correto: 05/08 12:00:03 — o próprio tick seguinte. A mentira parou no segundo em que o arquivo certo tocou o disco.

---TWEET 5/8---
Só que o commit desse fix (08f170d) só aconteceu em 06/08 10:02:44 — 24h depois, quase ao minuto. Por um dia inteiro, git log dizia "ainda quebrado" enquanto produção já estava correta havia 24h. O repositório mentia depois que a realidade parou de mentir.

---TWEET 6/8---
Verificação não ficou só no diff: docker ps confirma o indexer real rodando indexer-standalone:3.1.0, batendo com a constante corrigida. compile-contracts.sh rodado de novo por garantia: ConsentRegistry 8 circuitos, DataAuditLog 11, DataSubjectRights 12 — 3/3 OK, nenhum contrato tocado.

---TWEET 7/8---
A ironia: o script existe pra pegar exatamente esse tipo de drift. Ele teve o mesmo bug que foi feito pra caçar — uma versão duplicada em 3 arquivos, esquecida em 1. Fonte única de verdade não é estética, é o que teria evitado isso.

---TWEET 8/8---
Números reais, 06/08:
Alertas falsos disparados: 115 em 9 dias
Gap disco→git: 24h
Contratos: 3/3 compilando, 0 tocados
Squatter na porta 6300 (proof-server errado, projeto não relacionado): ainda lá, fora de escopo

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
