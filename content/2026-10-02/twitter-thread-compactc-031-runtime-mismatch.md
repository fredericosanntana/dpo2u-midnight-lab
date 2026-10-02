---
date: 2026-10-02
pillar: midnight-dev
format: twitter-thread (bug fix)
source: working tree da branch fix/consent-registry-assert-parens (NÃO commitado pelo dev; sem logs/2026-10-02-dev.md).
  Medido hoje: checkRuntimeVersion nos 3 build/*/contract/index.js = '0.14.0' (HEAD tinha '0.16.0' no ConsentRegistry);
  node_modules/@midnight-ntwrk/compact-runtime = 0.14.0; compiler-version nos 3 contract-info.json = 0.29.0.
  Não medido: deploy/import em runtime — só leitura de artefatos.
angle: o symlink global do compilador apontava pra 0.31.0; o artefato exigia runtime 0.16.0; o package.json fixa 0.14.0.
---

---TWEET 1/5---
Todo deploy script do lab morria no import com "Version mismatch". Sem erro de compilação. Compilou limpo.

Causa: o compilador que rodou não era o que a gente achava. 🧵

---TWEET 2/5---
~/.compact/bin/compactc é symlink global → 0.31.0.
Saída do 0.31.0 chama checkRuntimeVersion('0.16.0').
package.json do lab fixa compact-runtime 0.14.0.

Compila OK, importa quebrado.

---TWEET 3/5---
Fix: compile-contracts.sh agora chama o binário pelo caminho versionado (~/.compact/versions/0.29.0/…/compactc), não pelo symlink.

Matriz de versões do preprod manda 0.29.0. O script passa a obedecer a matriz, não o PATH.

---TWEET 4/5---
Evidência nos artefatos recompilados:
• compiler-version = 0.29.0 nos 3 contratos
• checkRuntimeVersion('0.14.0') nos 3 (antes: '0.16.0' no ConsentRegistry)
• node_modules runtime = 0.14.0

Limite: li os artefatos; não rodei deploy.

---TWEET 5/5---
Lição: "compactc --version" via PATH responde sobre o PATH. Pra reprodutibilidade, o script tem que apontar o binário exato.

#BuildInPublic #DPO2U #MidnightForDevs #CompactLang
