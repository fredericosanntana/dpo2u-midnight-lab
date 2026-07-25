---
date: 2026-07-03
pillar: midnight-dev / upstream
format: twitter-thread
source: scripts/pre-deploy-check.sh (uncommitted diff, 2026-07-03) + dpo2u-midnight-agent-dna/knowledge/SDK-VERSION-MATRIX.md + WORKAROUND-GUIDE.md
angle: liveness check vs version check — meu próprio pre-deploy-check.sh tinha um ponto cego, e ele levou a um ponto cego maior na documentação
---

---TWEET 1/8---
Hoje encontrei um bug no meu próprio script de segurança #BuildInPublic

`pre-deploy-check.sh` verificava se o proof-server estava respondendo em :6300. Não verificava se era o proof-server certo.

Liveness check ≠ version check. Fio 🧵

---TWEET 2/8---
O risco real: qualquer container de qualquer outro projeto pode estar escutando na :6300 nessa VPS.

`curl :6300/health` retorna 200 de qualquer proof-server, de qualquer versão. Meu script via "OK" e seguia pro deploy — mesmo com o toolchain ZK errado por trás.

---TWEET 3/8---
Fix: `check_proof_server()` agora consulta `:6300/version` e compara contra `PROOF_SERVER_VERSION="7.0.0"`.

Se bater, OK. Se não bater, falha alto e alto:
"likely a different project's container squatting on the port. Check: docker ps --filter publish=6300"

---TWEET 4/8---
Aproveitei e corrigi outro drift: `COMPACT_VERSION` no script ainda dizia 0.29.0. Mas `compile-contracts.sh` — o script que de fato compila os 3 contratos — já exige 0.31.0 desde a última sessão.

O guardião de pré-deploy estava desatualizado em relação ao próprio pipeline.

---TWEET 5/8---
Caçando esse drift achei um maior: minha `SDK-VERSION-MATRIX.md` (última verificação: 2026-03-27) lista indexer-standalone 3.1.0 como a versão segura pra preprod.

Meu `docker-compose.yml` roda indexer-standalone **4.0.0-rc.4** — desde 1º de maio.

---TWEET 6/8---
E essa mesma matrix tem uma CRITICAL RULE, escrita por mim mesmo, em março:

"NEVER mix preprod and preview SDK versions. Mix causes waitForSyncedState() to hang forever with zero error messages."

4.0.0-rc.4 é classificado como PREVIEW na própria tabela. Node 0.21.0 é PREPROD.

---TWEET 7/8---
Estado honesto agora:
✅ Version check do proof-server — escrito, ainda não commitado
✅ COMPACT_VERSION sincronizado — 0.31.0
⚠️ Version check do indexer — não existe ainda. O script só testa se a GraphQL API responde, não qual versão

Documentação desatualizada é uma classe de bug silenciosa.

---TWEET 8/8---
Métricas de hoje:
MRR: R$0 | Usuários: 0 | Deploys on-chain: 0
Contratos: 3/3 compilando | Drift de versão encontrado: 2 (compactc, indexer)

Pergunta: seu pre-flight check testa que o serviço responde, ou que é o serviço certo?

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
