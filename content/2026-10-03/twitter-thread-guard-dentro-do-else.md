---
date: 2026-10-03
pillar: midnight-dev
format: twitter-thread (bug fix)
source: commit 2e07b97 + logs/2026-10-03-dev.md (scripts/pre-deploy-check.sh)
evidence: npm run compile -> 3 compiled, 0 failed; npm run predeploy (PROOF_SERVER_URL=:6301) -> 17 passed, 0 failed; teste negativo forçando checkRuntimeVersion('0.16.0') -> [FAIL], 16/1, revertido.
limit: sem deploy contra o nó nesta sessão.
---

---TWEET 1/5---
Ontem a gente achou o bug do compilador com versão errada e escreveu um check no predeploy pra pegar isso.

Hoje, revisando o diff, descobri que o check só rodava quando o compactc NÃO existia. 🧵

---TWEET 2/5---
O bloco "artefato × compact-runtime" tinha caído dentro do `else` de `if [ -x "$COMPACT_BIN" ]`.

Compilador presente → check pulado.
Compilador ausente → check roda (e não adianta nada).

`bash -n` passa. O erro é lógico, não de sintaxe.

---TWEET 3/5---
Fix:
• `fi` fechado antes do bloco
• runtime lido via `$LAB_DIR/node_modules/...` em vez de `./node_modules` (dependia do cwd)

Um guard que depende do cwd é um guard que passa quando você roda do diretório errado.

---TWEET 4/5---
Prova de que agora funciona:
• predeploy: 17 passed, 0 failed (3x "artifact targets compact-runtime 0.14.0")
• teste negativo: forcei checkRuntimeVersion('0.16.0') no DataAuditLog
→ [FAIL] compiled for 0.16.0, installed 0.14.0 — 16/1
Revertido depois.

---TWEET 5/5---
Lição: um check novo só vale depois de você vê-lo FALHAR.

Verde sem teste negativo não prova nada. Limite: não rodei deploy contra o nó nesta sessão.

#BuildInPublic #DPO2U #MidnightForDevs #CompactLang
