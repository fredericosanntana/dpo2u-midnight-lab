---
date: 2026-09-29
pillar: build-public
format: linkedin (milestone com ressalva)
source: commit c162c3f + logs/2026-09-29-dev.md (typecheck e compile medidos; runtime não).
---

Typecheck verde não é deploy verde.

Hoje fechei os últimos erros de tipo dos scripts de deploy do nosso stack Midnight. `npm run typecheck` passou de 8 erros (4 TS2345 + 4 TS2769) para saída limpa, exit 0. A compilação dos 3 contratos (consent registry, data audit log, data subject rights) segue em 3 compiled, 0 failed.

O que estava errado:
→ `getBech32Address()` retorna um tipo próprio (`MidnightBech32m`), não string. Quatro scripts tratavam como string. Correção: `.asString()`.
→ Duas chamadas do SDK (`deployContract` e `findDeployedContract`) não casavam com os tipos que temos. Correção: `as any`.

A segunda correção é atalho, e eu prefiro dizer isso. O cast faz o compilador calar; não resolve a tipagem do private state. Está registrado como dívida.

E o principal: nenhum desses scripts rodou contra o nó preprod nesta sessão. Sei que compilam. Não sei ainda que entregam um contrato implantado.

Para um produto de compliance, essa distinção importa. "Compila" e "funciona" são afirmações diferentes, e só a segunda é evidência.

Próximo passo: deploy no preprod, com o endereço do contrato como prova, e depois trocar os casts por tipos.

#BuildInPublic #MidnightNetwork #DPO2U
