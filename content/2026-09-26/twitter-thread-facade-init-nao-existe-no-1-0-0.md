---
date: 2026-09-26
pillar: midnight-dev
format: twitter-thread (bug fix)
source: commit 6c9f583 (fase dev, 2026-09-26 10:08 UTC) + logs/2026-09-26-dev.md.
  Reproduzido nesta sessão — `npm run typecheck` → 11 erros; `tsc --noEmit` em
  worktree descartável de HEAD~1 → 17 erros (6 TS2339 + 7 TS2345 + 4 TS2769);
  `git -C /root/dpo2u-midnight-agent-dna log -- knowledge/SDK-VERSION-MATRIX.md`
  → 1 commit (a61d953, 2026-04-08); `git log -S'WalletFacade.init' -- scripts`
  → 1º hit 2b277c4 (2026-04-09), 170 dias até 6c9f583; `grep -n facade
  logs/2026-06-{16,17,29,30}-dev.md` → "confirmed ... facade 2.0.0" nos quatro.
angle: o typecheck que ninguém rodava achou 6 scripts chamando uma API que o SDK
  instalado não tem — e o "confirmado" dos logs de junho não bate com a matriz
  do DNA, que nunca mudou. Evidência é só de tipos; nada rodou on-chain.
template-note: as métricas de negócio do template (usuários, MRR, DPIAs) foram
  omitidas — não há dado no log de hoje. Estrutura adaptada de "weekly update"
  para "bug fix" (pilar midnight-dev).
---

---TWEET 1/7---
Hoje a fase dev do lab achou um erro que ficou 170 dias invisível: os 6 scripts de deploy/interact chamavam `WalletFacade.init()` — API do facade 2.0.0 — mas o SDK instalado é o 1.0.0, onde `init` não existe. 🧵

---TWEET 2/7---
O repo não tinha script de typecheck. Primeira rodada de `tsc --noEmit`: 17 erros. Seis eram este, um por script:

TS2339: Property 'init' does not exist on type 'typeof WalletFacade'.

Em runtime seria o Bug 4 do guia: `init is not a function`.

---TWEET 3/7---
O guia do DNA já avisava. SDK-VERSION-MATRIX: preprod = facade 1.0.0 ("NOT 2.0.0"); a 2.0.0 é a tabela PREVIEW. WORKAROUND-GUIDE, Bug 4: `new WalletFacade(s, u, d)` + `start()`. Esse arquivo tem um único commit: 08/04. Nunca mudou.

---TWEET 4/7---
O que destoa são os logs de junho: 06-16, 06-17, 06-29 e 06-30 anotam "confirmado: facade 2.0.0" contra essa matriz. Ela não diz isso para preprod. Por quê? Hipótese, não fato: a tabela PREVIEW foi lida como se fosse preprod.

---TWEET 5/7---
Fix: `scripts/lib/wallet-facade.ts` constrói a carteira pela API 1.0.0 (`new WalletFacade` + `start()`) num só lugar; os 6 scripts o usam. O JSON de deployment também gravava facade "2.0.0" — metadado falso no artefato. Agora 1.0.0.

---TWEET 6/7---
NÃO provado: nada rodou contra node, indexer ou proof-server. É evidência de tipos — a API existe no 1.0.0 e os tipos batem. Deploy segue sem 🟢. Sobram 11 erros do tsc (7 `MidnightBech32m`→string, 4 overloads): pré-existentes, não corrigidos.

---TWEET 7/7---
Lição: "confirmado" sem o comando que reproduz é opinião. Um `tsc --noEmit` pegou o que 170 dias de logs não pegaram. Próximo: zerar os 11 e ligar o typecheck no pre-deploy. Que check barato já te pegou drift assim?

#BuildInPublic #MidnightForDevs #DPO2U
