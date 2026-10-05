---
date: 2026-10-05
pillar: midnight-dev
format: twitter-thread (bug fix)
source: commit 805ba1e + logs/2026-10-05-dev.md (scripts/lib/proof-server.ts)
evidence: npm run typecheck limpo; deploy-consent-registry.ts --network preprod (default :6300) -> "version '8.0.3', expected 7.0.0", exit 1; com PROOF_SERVER_URL=http://127.0.0.1:6301 -> "Proof server version 7.0.0 OK".
limit: sem deploy real (sem seed financiada/nó nesta sessão); versão esperada duplicada em pre-deploy-check.sh e proof-server.ts.
---

---TWEET 1/5---
Ontem o pre-deploy-check pegou um proof-server 8.0.3 de outro projeto ocupando a porta 6300. O esperado era 7.0.0.

Mas o guard só existia nesse script. Quem rodasse os scripts TS direto não passava por ele. 🧵

---TWEET 2/5---
Os scripts de deploy usam :6300 por default e nunca olhavam a versão.

Rodar contra o 8.0.3 falharia lá no proving, com erro opaco. Um guard que só vale no caminho "certo" não protege quem pega o atalho.

---TWEET 3/5---
Fix: scripts/lib/proof-server.ts com assertProofServerVersion(url).

Consulta /version, sai com erro claro se estiver inacessível ou for diferente de 7.0.0. Chamado antes do setNetworkId em 5 scripts: deploy-all, 3 deploys por contrato e interact-full-suite.

---TWEET 4/5---
Prova, rodando contra o default :6300:

version '8.0.3', expected 7.0.0 → exit 1, apontando PROOF_SERVER_URL=:6301

Com :6301 → "Proof server version 7.0.0 OK".

Typecheck limpo. Não rodei deploy real: sem seed financiada nesta sessão.

---TWEET 5/5---
Limite honesto: a versão esperada agora está duplicada (shell e TS). Deixei comentário cruzado, não é DRY. Bypass: SKIP_PROOF_SERVER_VERSION_CHECK=1.

Valide no ponto de uso, não só no pré-voo.

#BuildInPublic #DPO2U #MidnightForDevs
