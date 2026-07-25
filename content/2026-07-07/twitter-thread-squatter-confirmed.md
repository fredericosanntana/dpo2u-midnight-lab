---
date: 2026-07-07
pillar: midnight-dev / build-public
format: twitter-thread
source: scripts/pre-deploy-check.sh (diff 2026-07-05, uncommitted) + scripts/midnight-health-check.sh (diff 2026-07-07, uncommitted) + content/2026-07-03/twitter-thread-proof-server-version-drift.md
angle: o bug hipotético do dia 03/07 se confirmou de verdade em produção no dia 07/07 — liveness check falso-positivo com container de outro projeto
---

---TWEET 1/8---
Dia 03/07 escrevi um fio sobre um bug hipotético: "e se outro container estivesse escutando na minha porta 6300?"

Hoje, 07/07, apliquei o mesmo fix no meu script de monitoramento de produção e encontrei o cenário. De verdade. Rodando há 2 semanas. #BuildInPublic 🧵

---TWEET 2/8---
Contexto: `pre-deploy-check.sh` e `midnight-health-check.sh` só testavam `curl :6300/health` → "ok". Isso é liveness. Não diz QUEM está respondendo.

Corrigi o pre-deploy-check.sh dia 05/07: agora compara `/version` contra "7.0.0" esperado.

---TWEET 3/8---
Hoje estendi o mesmo fix pro script de produção (o que roda de cron e me manda email). Rodei `docker ps --filter publish=6300` pra confirmar antes de aplicar.

Resultado: nenhum container meu. Meu stack midnight-standalone-* nem existe no host agora.

---TWEET 4/8---
Quem responde na 6300 é `dpo2u-midnight-self-funding-proof-server-1` — proof-server 8.0.3, de OUTRO projeto meu, no ar há 2 semanas.

O health check antigo via HTTP 200 "ok" e reportava sucesso. Toolchain ZK errado, "tudo verde" mesmo assim.

---TWEET 5/8---
Fix aplicado nos dois scripts:

`check_proof_server()` — compara /version contra o esperado (7.0.0), falha alto se não bater
`check_docker_image_version()` — lê `docker inspect` e compara a tag da imagem do node e do indexer contra docker-compose.yml

---TWEET 6/8---
Isso fecha um gap que eu mesmo tinha documentado no fio de 03/07: "version check do indexer não existe ainda". Agora existe — pro node E pro indexer, nos dois scripts.

Liveness ≠ identidade. Bug previsto virou bug confirmado em 4 dias.

---TWEET 7/8---
Métricas reais de hoje:
MRR: R$0 | Usuários: 0 | Deploys on-chain: 0
Contratos: 3/3 compilando | Scripts com version-check: 2/2 | Incidentes reais capturados pelo fix: 1

Nenhuma das mudanças está commitada ainda.

---TWEET 8/8---
A lição não é "tive sorte hoje". É que VPS compartilhado entre projetos é vetor de falso-positivo silencioso — só teste de identidade pega isso, não teste de vida.

Seu health check sabe diferenciar "responde" de "é o serviço certo"?

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
