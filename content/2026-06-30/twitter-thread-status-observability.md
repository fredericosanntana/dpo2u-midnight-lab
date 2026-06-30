---
date: 2026-06-30
pillar: midnight-dev / build-public
format: twitter-thread
source: logs/2026-06-30-dev.md
angle: status.ts como observabilidade para contratos ZK — o gap entre deploy e lifecycle
---

---TWEET 1/7---
Semana do DPO2U #BuildInPublic ✅

Adicionei `scripts/status.ts` — o script que estava faltando entre deploy e ciclo de vida completo.

3 contratos ZK na Midnight. 31 circuitos. 7 bugs do SDK documentados e contornados.

Pipeline de operação finalmente completo. Fio 🧵

---TWEET 2/7---
O problema que resolvi hoje:

Depois de deployar um contrato ZK na Midnight, não tinha como saber o que estava on-chain sem rodar o ciclo de vida inteiro.

status.ts preenche esse gap: sincroniza a carteira uma vez, conecta nos 3 contratos e consulta apenas os contadores públicos globais.

---TWEET 3/7---
Os contadores que consulta por contrato:

ConsentRegistry → total_consents_granted, total_revocations
DataAuditLog → total_events, total_deletion_reqs, total_breach_events
DataSubjectRights → total_requests, total_fulfilled, total_rejected, total_overdue

Tudo em uma única execução. Read-only.

---TWEET 4/7---
Padrões SDK aplicados (mesmos do deploy-all.ts):

→ WalletFacade.init() — API 2.0.0
→ finalizeRecipe, não signRecipe (Bug 5)
→ walletProvider: bridge no levelPrivateStateProvider (Bug 6)
→ setNetworkId() antes de qualquer operação (Bug 4)
→ levelPrivateStateProvider separado por contrato (Bug 6 variante)

---TWEET 5/7---
Métricas reais de hoje:

MRR: R$0
Usuários: 0
Deploys on-chain: 0 (standalone local ainda pendente)
Contratos compilados: 3/3 ✅
Pipeline completo: deploy-all.ts → status.ts → interact-full-suite.ts ✅

A infraestrutura existe. O uso real, ainda não.

---TWEET 6/7---
A lição:

Observabilidade em sistemas ZK é tão importante quanto o contrato em si.

status.ts é o `kubectl get pods` dos contratos Midnight — simples, read-only, essencial.

Você não sabe o que está on-chain até ter uma ferramenta que pergunte.

---TWEET 7/7---
Próximos passos:
→ Primeiro deploy standalone real
→ Verificar com status.ts
→ Rodar interact-full-suite.ts completo
→ 12 quests Zealy prontas para submeter (~1530 XP)

Pergunta: você buildou observabilidade antes do primeiro usuário — ou só depois que precisou?

#BuildInPublic #MidnightForDevs #DPO2U #ZKPrivacy
