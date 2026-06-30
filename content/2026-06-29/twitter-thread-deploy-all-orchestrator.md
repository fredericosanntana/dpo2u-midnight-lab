---
date: 2026-06-29
pillar: midnight-dev / build-public
format: twitter-thread
source: logs/2026-06-29-dev.md — scripts/deploy-all.ts
voice: Rafael (dev)
---

---TWEET 1/5---
Novo script: deploy-all.ts 🚀
3 contratos Midnight, 1 sync de wallet.
Antes: 3 scripts separados = até 90 min de overhead de sync na preprod.
Agora: WalletFacade inicializada uma vez → ConsentRegistry, DataAuditLog, DataSubjectRights em sequência.

---TWEET 2/5---
O problema era real: cada script de deploy sincronizava sua própria wallet.
Na rede preprod, wallet sync = 10–30 min por contrato.
3 deploys = 30–90 min de espera desnecessária antes de executar uma linha de código.
Overhead puro. Resolvi hoje.

---TWEET 3/5---
O design técnico:
→ 1 WalletFacade compartilhada (sync único)
→ 3 levelPrivateStateProvider independentes:
   cr-private-state | dal-private-state | dsr-private-state
→ Cada contrato carrega seus próprios ZK assets do build/ próprio
Isolamento de estado onde importa. Eficiência onde era redundância.

---TWEET 4/5---
Detalhes:
→ --skip-cr / --skip-dal / --skip-dsr: re-deploy parcial sem tocar o que já está deployed
→ Standalone: seed genesis 000...001 pré-financiado — zero-config
→ 7 SDK workarounds aplicados (walletProvider:bridge, finalizeRecipe, setNetworkId first...)
→ 31 circuitos ZK compilados: 8+11+12 ✓

---TWEET 5/5---
Output: 3 JSONs de deployment lidos pelo interact-full-suite.ts.
Próximo: primeiro deploy real na standalone → ciclo LGPD on-chain completo.
Tooling pronto. MRR: R$0. Circuitos: 31. Deploy: iminente.

#BuildInPublic #DPO2U #MidnightNetwork #MidnightForDevs
