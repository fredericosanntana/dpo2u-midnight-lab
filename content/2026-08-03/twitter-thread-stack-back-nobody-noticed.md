---
date: 2026-08-03
pillar: midnight-dev / build-public
format: twitter-thread
source: docker inspect/logs (verified 2026-08-03) + scripts/pre-deploy-check.sh live run (verified 2026-08-03) + git log/show 1a8813e, a26356e (2026-07-25) + logs/2026-07-25-dev.md + zealy/2026-07-28, 2026-07-29, 2026-08-01 status notes (confirm the gap went unnoticed for 3 cycles)
angle: parte 6 — o stack standalone voltou há dias e nenhum dos 3 ciclos zealy seguintes notou, porque nenhum deles rodava docker ps; a correção de tag do dia 25/07 é exatamente a imagem rodando hoje, mas 0 deploys em cima disso
---

---TWEET 1/8---
Parte 6 #BuildInPublic

25/07: tag do indexer corrigida (4.0.0-rc.4 → 3.1.0), commitada.
28/07, 29/07, 01/08: três ciclos Zealy confirmaram "stack fora do ar desde 01/05".
Hoje reconferi com `docker ps` em vez de confiar no último report. Estava errado. 🧵

---TWEET 2/8---
`docker inspect`: `midnight-standalone-node` de pé desde 26/07 (0.21.0), `midnight-standalone-indexer` de pé desde 28/07 — rodando `midnightntwrk/indexer-standalone:3.1.0`. Exatamente a tag que o commit 1a8813e corrigiu 1-3 dias antes. Os dois `healthy`.

---TWEET 3/8---
86 dias fora do ar (node) / 88 dias (indexer), contados desde 01/05. Nenhum dos 3 status notes seguintes (28/07, 29/07, 01/08) pegou isso — todos checaram git log e content/, nenhum rodou `docker ps`. O gap não era só de commit, era de checklist.

---TWEET 4/8---
`pre-deploy-check.sh --network standalone` rodado agora: 11 passed, 1 failed. Em 25/07 era 7 passed, 5 failed. A única falha que sobrou é a mesma de sempre — proof-server squatter na porta 6300 (versão 8.0.3, projeto não relacionado, documentado desde 07/07).

---TWEET 5/8---
Log do node ao vivo agora: bloco #111582, #111583 sendo produzido e finalizado a cada ~6s. Chain real, rodando. E mesmo assim: zero arquivo `deployment-*.json` no repo. Nenhum dos 3 contratos (ConsentRegistry, DataAuditLog, DataSubjectRights) foi implantado nessa instância.

---TWEET 6/8---
Container `Up (healthy)` não é entrega — é só a pré-condição. `deploy-all.ts` continua sem rodar contra esse stack, e `image-digests.lock` segue com 0/2 pinados, mesmo com o ambiente que faltava para pinar disponível há mais de uma semana.

---TWEET 7/8---
E no mesmo dia 25/07 que corrigiu a tag: o commit a26356e admitiu que 3 ciclos anteriores (18/07, 22/07, 23/07) tinham escrito "commitado" num status note sem ter commitado nada — `git log` não mentia, os relatórios sim. Verificação > confiança no relatório anterior, de novo.

---TWEET 8/8---
Métricas reais, 03/08:
MRR: R$0 | Usuários: 0 | Deploys on-chain: 0
pre-deploy-check: 11/12 (era 7/12 em 25/07)
Infra fora do ar: 86-88 dias → hoje healthy
Digest-pinning: 0/2 | Commits desde 25/07: 0

Chain saudável por 1 semana, zero contratos nela. Isso é vitória ou só menos uma desculpa?

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
