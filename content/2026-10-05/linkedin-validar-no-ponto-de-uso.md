---
date: 2026-10-05
pillar: midnight-dev
format: linkedin (announcement)
source: commit 805ba1e + logs/2026-10-05-dev.md
evidence: deploy-consent-registry.ts --network preprod no default :6300 -> "version '8.0.3', expected 7.0.0", exit 1; com PROOF_SERVER_URL=http://127.0.0.1:6301 -> "Proof server version 7.0.0 OK"; npm run typecheck limpo.
limit: sem deploy real nesta sessão.
---

Um check de pré-voo só protege quem passa por ele.

No projeto Midnight do DPO2U, o pre-deploy-check.sh já apontava que a porta 6300 estava ocupada por um proof-server 8.0.3 de outro projeto, enquanto o nosso SDK espera 7.0.0. Só que os scripts TypeScript de deploy usam :6300 por padrão e nunca consultavam a versão. Rodados direto, falhariam no meio do proving, com erro opaco.

O que mudou (commit 805ba1e):
• Novo scripts/lib/proof-server.ts: assertProofServerVersion consulta /version e encerra com mensagem clara se o servidor estiver inacessível ou em versão diferente.
• Chamado antes do setNetworkId em deploy-all, nos três deploys por contrato e no interact-full-suite.
• Bypass explícito: SKIP_PROOF_SERVER_VERSION_CHECK=1.

Evidência:
• Contra o default :6300 → "version '8.0.3', expected 7.0.0", exit 1, indicando PROOF_SERVER_URL=:6301.
• Com :6301 → "Proof server version 7.0.0 OK".
• Typecheck limpo.

Limites: não houve deploy real nesta sessão (sem seed financiada). E a versão esperada ficou duplicada entre o shell e o TS, com comentário cruzado.

Lição: a validação tem que estar no ponto de uso, não só no caminho recomendado.

#BuildInPublic #MidnightForDevs #DPO2U #MidnightNetwork
