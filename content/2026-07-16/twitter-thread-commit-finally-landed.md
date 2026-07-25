---
date: 2026-07-16
pillar: midnight-dev / upstream
format: twitter-thread
source: logs/2026-07-15-dev.md + logs/2026-07-16-dev.md + git log/show da60821 (verified 2026-07-16) + docker ps (verified 2026-07-16) + content/2026-07-09, content/2026-07-12
angle: parte 5 — o commit que faltava há 11 dias finalmente aconteceu, e o log de ontem (07-15) que dizia "arquivos commitados" estava errado
---

---TWEET 1/7---
Parte 5 #BuildInPublic

03/07: liveness ≠ version (hipótese)
07/07: confirmado, squatter na 6300
08/07: furo no fix — tag ≠ digest
09/07: sem commit, admiti publicamente
12/07: fix de digest escrito, inerte
Hoje: commitado. 11 dias depois. 🧵

---TWEET 2/7---
O log de ontem (15/07) tinha uma seção "Files committed" listando 5 arquivos como já commitados no git.

Não estavam. `git log` mostrava só 2 commits recentes, ambos só de conteúdo (09/07, 12/07). O diff inteiro seguia `git add`-ado, nunca `git commit`-ado.

---TWEET 3/7---
Hoje não confiei no log de ontem — reconferi direto no `git log`. Antes de commitar: `bash -n` nos 3 scripts, `compactc --version` batendo com 0.31.0, versões do `docker-compose.yml` cruzadas contra as constantes novas, e recompilei os 3 contratos (3/3 OK).

---TWEET 4/7---
Commit da60821: `pre-deploy-check.sh` e `midnight-health-check.sh` — check de versão do proof-server (não só liveness) + digest-pinning quando disponível, fallback pra tag com aviso explícito. Essa lógica já rodava em produção via cron desde 07/07, só não estava no git.

---TWEET 5/7---
Isso fecha o gap de 12/07: a checagem mais forte só existia no gate manual (`pre-deploy-check.sh`). O script que roda sozinho de cron a cada 2h e manda email (`midnight-health-check.sh`) usava só tag. Agora os dois têm a mesma lógica.

---TWEET 6/7---
O que continua aberto: `image-digests.lock` com ZERO entradas reais — nada pra pinar, `midnight-standalone-node`/`-indexer` seguem fora do ar desde 01/05. E o squatter na porta 6300 (proof-server de outro projeto meu) já tá lá há 4 semanas.

---TWEET 7/7---
Métricas reais:
MRR: R$0 | Usuários: 0 | Deploys on-chain: 0
Contratos: 3/3 | Fix escrito → commitado: 11 dias
Digest-pinning: 2/2 scripts (antes 1/2) | Pinados: 0/2

Seu processo reconfere o relatório anterior, ou confia nele?

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
