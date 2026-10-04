---
date: 2026-10-04
pillar: build-public
format: linkedin
source: commit dc3cd0a + logs/2026-10-04-dev.md
evidence: npm run check-versions -> 4x OK; teste negativo -> NOTE e SKIP; bash -n limpo.
limit: sem deploy contra o nó; mudança só em tooling.
---

Silêncio não é evidência.

Hoje corrigi um script pequeno do nosso repo Midnight: o cross-check das versões (node, indexer, proof-server, compactc) contra a documentação de referência só imprimia algo quando encontrava divergência.

O problema: saída vazia significava duas coisas ao mesmo tempo. Ou tudo bate, ou o parser não conseguiu ler a tabela. Quem lê o log não distingue.

A correção foi fazer cada constante reportar um de três estados: OK, NOTE (diverge) ou SKIP (não consegui verificar).

Como validei: rodei contra a doc real (4 linhas OK) e contra uma cópia adulterada, com indexer 9.9.9 e uma linha renomeada. Obtive NOTE e SKIP, exatamente onde esperado. Depois removi a cópia.

Para quem trabalha com compliance, a lição é a mesma de uma trilha de auditoria: um controle que só se manifesta na falha é indistinguível de um controle quebrado. Um controle que funciona deixa rastro também quando passa.

Limite honesto: sem deploy contra o nó nesta sessão. É tooling, não feature.

#BuildInPublic #MidnightNetwork #DPO2U
