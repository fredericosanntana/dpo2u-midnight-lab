---
date: 2026-06-26
pillar: midnight-dev
format: twitter-thread
source: scripts/compile-contracts.sh (POSIX portability fix)
branch: fix/consent-registry-assert-parens
---

---TWEET 1/5---
Corrigi um bug que só aparece em CI.

`((count++))` funciona no Mac. Quebra silenciosamente em sh POSIX (Docker, GitHub Actions, qualquer container com dash).

O compile-contracts.sh estava "funcionando" — mas só na minha máquina. 🧵

---TWEET 2/5---
A linha problemática:

```
compile_one "$name" && ((count++)) || ((failed++))
```

Em bash: funciona. Em sh/dash: erro silencioso ou comportamento inesperado.

`((...))` é um bashism — compound command, não disponível em POSIX puro.

---TWEET 3/5---
Fix de uma linha:

```bash
if compile_one "$name"; then
  count=$((count + 1))
else
  failed=$((failed + 1))
fi
```

`$((...))` é arithmetic expansion — POSIX desde 1992. Funciona em qualquer shell.

Parece trivial. Não é.

---TWEET 4/5---
Por que isso importa além do bash?

Se a pipeline de compilação falha silenciosamente em CI, você vai pro deploy achando que os 3 contratos estão buildados — e eles não estão.

Compliance sem automação é esperança. Automação quebrada é ilusão de compliance. 🔒

---TWEET 5/5---
Estado atual do DPO2U Lab:

→ 3 contratos Compact compilados ✓
→ 7 bugs de SDK documentados ✓
→ 12 checks automatizados no pre-deploy ✓
→ compile-contracts.sh agora POSIX-safe ✓
→ Primeiro deploy standalone: pendente

LGPD exige accountability. Accountability exige automação robusta.

#BuildInPublic #DPO2U #MidnightForDevs #CompactLang
