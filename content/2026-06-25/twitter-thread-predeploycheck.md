---
date: 2026-06-25
pillar: midnight-dev
format: twitter-thread
source: scripts/pre-deploy-check.sh (new) + compile-contracts.sh POSIX fix
---

---TWEET 1/5---
7 bugs de SDK documentados na mão.

Cada um custou tempo. Cada um quase chegou ao deploy com o problema.

Hoje criei um script que bloqueia o deploy se qualquer um deles estiver presente.

Thread sobre transformar erros em guardrails. 🧵

---TWEET 2/5---
O `pre-deploy-check.sh` valida 5 categorias:

→ Node.js ≥ 22.x
→ compactc pinado em 0.29.0
→ .npmrc ausente (Bug 2)
→ Build artifacts: 3 contratos × keys + contract + zkir
→ Infra: midnight-node :9944, indexer :8088, proof-server :6300

---TWEET 3/5---
Cada check é um bug que já nos custou.

compactc pinado: 0.29 quebra assert() sem parênteses.
.npmrc removido: registry do Midnight não resolve com ele.
proof-server na porta: sem ele o ZK proof não gera.

Guardrail não é burocracia. É memória operacional.

---TWEET 4/5---
O script tem exit codes limpos:
→ exit 0: "Ready to deploy" + comandos exatos para os 3 contratos
→ exit 1: lista falhas + referência ao WORKAROUND-GUIDE

Suporta --network standalone | preprod | preview.

Próximo: integrar ao CI antes de qualquer push de contrato.

---TWEET 5/5---
A diferença entre um projeto que não quebra em produção:

Não encontrou menos bugs.
Transformou os bugs em checklist antes de continuar.

3 contratos. 7 workarounds. 1 script. Primeiro deploy amanhã. 🌙

#BuildInPublic #MidnightForDevs #DPO2U #CompactLang
