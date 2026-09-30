---
date: 2026-09-30
pillar: midnight-dev
format: twitter-thread (bug fix)
source: commit 543e24d (2026-09-30) + logs/2026-09-30-dev.md. `npm run predeploy` sem variável → 13 passed / 1 failed
  (proof-server :6300 = 8.0.3); com PROOF_SERVER_URL=http://127.0.0.1:6301 → 14 passed / 0 failed (7.0.0).
  midnight-health-check.sh: só `bash -n`, não executado. Nenhum deploy contra o nó.
angle: um pre-check que sonda um endereço diferente do que o deploy usa não checa nada.
---

---TWEET 1/5---
`npm run predeploy` dava 13 ok / 1 falha: proof-server na :6300 era 8.0.3, esperado 7.0.0.

Só que existia um 7.0.0 correto na :6301. E o deploy já sabia usá-lo. O checador é que olhava para outro lugar. 🧵

---TWEET 2/5---
A :6300 era um container de OUTRO projeto. Versão errada de proof-server contra SDK 1.0.0 = falha de prova só na hora do deploy.

Os scripts de deploy e status já aceitavam PROOF_SERVER_URL. Os de verificação tinham :6300 fixo.

---TWEET 3/5---
Fix em 2 scripts (pre-deploy-check.sh e midnight-health-check.sh):

url="${PROOF_SERVER_URL:-http://127.0.0.1:6300}"

Default preservado. A mensagem de erro agora aponta o override, em vez de só culpar a porta.

---TWEET 4/5---
Evidência:
• PROOF_SERVER_URL=:6301 → 14 passed, 0 failed (7.0.0)
• sem variável → continua falhando em :6300 (8.0.3), agora com dica

Limite: health-check só passou por bash -n. E nenhum deploy rodou contra o nó.

---TWEET 5/5---
Lição: verificação tem que sondar o mesmo endereço que a ação vai usar. Senão o "verde" (ou o vermelho) é sobre outra coisa.

Não derrubei o container 8.0.3 — não é meu.

#BuildInPublic #DPO2U #MidnightForDevs
