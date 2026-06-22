---
date: 2026-06-22
pillar: build-public
format: twitter-thread
source: week of 2026-06-16 to 2026-06-22 — DataAuditLog Uint upgrade + walletProvider systemic fix across DPO2U suite
---

---TWEET 1/7---
Semana 3 de build em público no DPO2U.

Três contratos compilando, um bug sistêmico encontrado no dia antes do primeiro deploy real, e uma lição sobre o que "funciona" significa quando você está construindo infraestrutura de compliance. 🧵

---TWEET 2/7---
O que ficou de pé esta semana:

DataAuditLog ganhou `block_number` como Uint<32> (estava como Uint<16>).

Sem isso: o registro de auditoria LGPD estouraria após ~45 dias de produção. Um bug de overflow silencioso nos logs que precisam existir para sempre.

---TWEET 3/7---
O que quase não descobrimos:

Os 3 scripts de deploy tinham o mesmo bug. `walletProvider: bridge` ausente no `levelPrivateStateProvider`.

Resultado: contrato deploya, tx passa, hash on-chain — mas o estado privado fica inacessível para a app. Silêncio total.

---TWEET 4/7---
Métricas reais desta semana:

• Contratos compilando: 3/3 ✅
• Scripts de deploy: 3/3 ✅
• Bugs de SDK documentados: 7
• Mesmo bug replicado em 3 contratos: sim
• MRR: R$0
• Primeiro deploy real: ainda não

---TWEET 5/7---
O desafio de verdade:

Eu "lembrava" ter aplicado o Bug 6 em todos os contratos. Estava no log de sessão. Mas quando auditei os 3 scripts lado a lado pela primeira vez — ele estava ausente nos 3.

Memória de sessão não substitui auditoria sistemática.

---TWEET 6/7---
Lição que fica:

Em sistemas de compliance, "funcionar" não é binário.

Um contrato que deploya sem erro mas não consegue servir dados privados de volta não está funcionando — está falhando silenciosamente. Silêncio em compliance é o pior diagnóstico.

---TWEET 7/7---
Próxima semana: primeiro standalone deploy via docker-compose.

Os 3 contratos rodam num ambiente local real pela primeira vez. Se tudo passar, executo `fulfillRequest()` e verifico se os dados chegam de volta.

Quem está buildando sobre SDK experimental: como você valida sincronização de estado privado?

#BuildInPublic #MidnightForDevs #DPO2U #Solopreneur
