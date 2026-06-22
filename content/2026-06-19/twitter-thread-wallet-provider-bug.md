---
date: 2026-06-19
pillar: midnight-dev
format: twitter-thread
source: fix/consent-registry-assert-parens branch — walletProvider: bridge added to all 3 deploy scripts
---

---TWEET 1/5---
Uma linha. Três contratos. Um bug que teria silenciado todo o estado privado da DPO2U no primeiro deploy real.

Bug 6 do SDK Midnight — ele estava nos 3 scripts sem que eu percebesse. 🧵

---TWEET 2/5---
O problema: `levelPrivateStateProvider` precisa de `walletProvider: bridge` para sincronizar estado privado.

Sem isso: o contrato deploya, a tx passa, o evento aparece on-chain — mas a app nunca lê o estado de volta. Silêncio total.

---TWEET 3/5---
Encontramos no modo "hardening" pré-deploy.

Auditamos os 3 scripts lado a lado:
• ConsentRegistry ❌ walletProvider ausente
• DataAuditLog ❌ walletProvider ausente
• DataSubjectRights ❌ walletProvider ausente

Mesmo erro de configuração nos 3. Replicado em sessões separadas.

---TWEET 4/5---
Para um sistema de compliance isso seria grave:

Usuário dá consentimento → tx confirmada on-chain → app tenta ler estado → timeout silencioso.

Compliance na blockchain. Dados inacessíveis na prática. LGPD no papel.

---TWEET 5/5---
Fix: uma linha em cada script. Auditoria: os 3 contratos sistematicamente, lado a lado.

Lição: bugs de configuração de SDK não geram erro — geram silêncio. E silêncio em compliance é o pior tipo de falha.

#BuildInPublic #MidnightForDevs #DPO2U #ZKPrivacy
