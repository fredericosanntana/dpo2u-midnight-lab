---
date: 2026-10-04
pillar: midnight-dev
format: twitter-thread (bug fix)
source: commit dc3cd0a + logs/2026-10-04-dev.md (scripts/check-version-consistency.sh)
evidence: npm run compile -> 3 compiled, 0 failed; npm run typecheck limpo; npm run check-versions -> 4 linhas OK contra o DNA real; teste negativo (cópia do DNA com indexer 9.9.9 e linha do compiler renomeada) -> NOTE no indexer, SKIP no compactc; DNA_REPO=/nonexistent -> "skipped" preservado.
limit: sem deploy contra o nó nesta sessão.
---

---TWEET 1/5---
Nosso script de consistência de versões tinha um cross-check contra a doc do DNA que só imprimia algo quando havia divergência.

Saída vazia = "tudo bate"? Ou "o regex não achou a tabela"? Não dava pra saber. 🧵

---TWEET 2/5---
Era o mesmo padrão dos últimos dias: o check roda, não falha, e não prova nada.

Com o regex quebrado, o resultado seria idêntico ao de "tudo OK": silêncio.

---TWEET 3/5---
Fix: uma função `dna_cross` que sempre fala.

• OK: repo bate com a doc
• NOTE: diverge
• SKIP: não consegui parsear o valor do DNA

Cobre NODE, INDEXER, PROOF_SERVER e COMPACT.

---TWEET 4/5---
Prova, nada de "parece certo":

• DNA real → 4x OK
• cópia temporária com indexer 9.9.9 → NOTE
• linha do compiler renomeada → SKIP
• DNA_REPO=/nonexistent → mensagem de skip preservada

Cópia removida depois.

---TWEET 5/5---
Também removi a exceção "known accepted drift" do compactc: o repo voltou pra 0.29.0 em 03/10 e o comentário estava mentindo.

Limite: sem deploy contra o nó hoje. Só tooling.

#BuildInPublic #MidnightForDevs #CompactLang
