---
date: 2026-06-24
pillar: midnight-dev
format: twitter-thread
source: commit 9870a1f — fix(consent-registry): parenthesize assert() compactc 0.29+
---

---TWEET 1/5---
Contrato compilava perfeito.

Atualizamos o compactc para 0.29.

`exit 255: parse error: found "consent_status" looking for "("`

40 minutos depois: a diff inteira tinha 4 caracteres.

Thread de bug real. 🧵

---TWEET 2/5---
O problema: Compact aceita dois forms de `assert`.

❌ form quebrado no 0.29+:
`assert condition, "msg";`

✅ form correto:
`assert(condition, "msg");`

O form sem parênteses funcionava no 0.28. No 0.29, o parser quebra.
Nenhum aviso no changelog.

---TWEET 3/5---
O ConsentRegistry da DPO2U tem dois circuits críticos com assert:

→ `revokeConsent` (LGPD Art. 8 §5 — revogação tão fácil quanto concessão)
→ `updateConsentPurposes`

Ambos usavam o form antigo. Ambos falhavam na compilação.

Fix: parênteses. Resultado: 8 circuits ZK compilando — exit 0.

---TWEET 4/5---
O que isso ensina sobre Midnight Network:

→ compactc quebra compatibilidade entre minor versions
→ a mensagem de erro não diz "syntax errada" — diz "encontrei X, esperava ("
→ o caminho de saída foi ler o commit message com calma

Bug documentado no WORKAROUND-GUIDE.md. Branch criado. Vida que segue.

---TWEET 5/5---
Isso é construir em infraestrutura experimental de ZK:

Cada bug encontrado e documentado é tempo de outro dev economizado na comunidade.

3 contratos compilando. 7 bugs documentados. Primeiro standalone deploy a caminho. 🌙

#BuildInPublic #MidnightForDevs #DPO2U #CompactLang #MidnightNetwork
