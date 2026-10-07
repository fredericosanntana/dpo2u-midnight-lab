---
date: 2026-10-07
pillar: build-public
format: linkedin
source: commit 5da997d + logs/2026-10-07-dev.md
evidence: npm run test:guard -> "OK: guard exits 1 on drifted proof-server version"; árvore limpa após o teste.
limit: sem deploy real; teste cobre só scripts/lib/proof-server.ts.
---

Um teste negativo que não muta nada passa — e prova nada.

No projeto Midnight do DPO2U, fechei uma dívida admitida ontem: o exit code do check-version-consistency.sh sob deriva só tinha sido medido uma vez, na mão. Commit 5da997d transforma isso em `npm run test:guard`.

O que o script faz:
• confirma que o check passa no estado atual (senão aborta);
• troca a versão esperada do proof-server por uma inválida;
• exige exit code ≠ 0 do guard;
• restaura o arquivo via trap, usando backup em tmp.

A parte instrutiva: na minha primeira tentativa manual, o sed usou aspas duplas e o arquivo usa simples. Nada mudou, o guard saiu 0, e eu poderia ter lido isso como "funciona". O teste agora falha se a mutação não alterar o arquivo.

Evidência: "OK: guard exits 1 on drifted proof-server version", árvore sem resíduo.

Limites: sem deploy real (sem nó/seed financiada) e a cobertura é só a fonte proof-server.ts — as outras três duplicações seguem sem teste de mutação.

Lição: todo teste de falha precisa provar que a falha foi realmente injetada.

#BuildInPublic #MidnightForDevs #DPO2U #MidnightNetwork
