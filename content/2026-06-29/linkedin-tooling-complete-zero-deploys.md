---
date: 2026-06-29
pillar: build-public
format: linkedin-post
source: logs/2026-06-29-dev.md — scripts/deploy-all.ts
voice: founder (Frederico)
---

Hoje terminei o deploy-all.ts e percebi que tenho tudo — exceto um único contrato deployed on-chain.

Nos últimos meses, construí 3 contratos Midnight em Compact: ConsentRegistry, DataAuditLog e DataSubjectRights. 31 circuitos ZK compilados. 7 bugs do SDK documentados no WORKAROUND-GUIDE.md. Um script de 633 linhas que executa o ciclo LGPD completo on-chain em 5 fases. Uma auditoria pré-deploy com 12 verificações automáticas. E hoje: deploy-all.ts — o quarto e último script de deploy.

O problema que resolvi era sutil mas doloroso. Cada contrato tinha seu próprio script, e cada script sincronizava sua própria wallet do zero. Na rede preprod, sincronizar uma wallet Midnight pode levar de 10 a 30 minutos. Com 3 contratos, isso somava 30 a 90 minutos de overhead por ciclo de deploy completo — sem executar uma linha de lógica do contrato. Só esperando sync repetido.

A solução foi compartilhar uma única WalletFacade — sincronizada uma vez, reutilizada nos 3 deploys em sequência. Cada contrato mantém seu próprio provedor de estado privado (cr-private-state, dal-private-state, dsr-private-state) e carrega seus ZK assets do próprio diretório build/. Isolamento total onde importa para a privacidade. Eficiência onde a redundância era puro custo. Adicionei flags --skip-cr, --skip-dal, --skip-dsr para re-deploy parcial sem precisar retocar contratos já deployed.

A vitória é técnica e real: tooling de deploy completo, otimizado, com todos os 7 workarounds do SDK aplicados. O script standalone funciona com seed genesis pré-financiado — zero configuração para o primeiro teste.

A derrota é igualmente real: MRR R$0. Nenhum contrato deployed on-chain ainda. 31 circuitos ZK compilados, 0 na rede.

O que aprendi construindo isso: a preparação é o trabalho invisível que ninguém conta nos casos de sucesso. Todo post de "deployei meu primeiro smart contract" esconde semanas de SDK bugs, workarounds documentados, scripts de compile, scripts de pre-deploy, scripts de deploy-all. A versão publicada é a ponta do iceberg — e o iceberg é onde o trabalho real acontece.

Não me arrependo do tempo investido. Um ciclo de deploy confiável, reproduzível e com skip flags vale mais do que pressa. Mas também preciso ser honesto: existe um ponto onde "preparação rigorosa" e "adiamento disfarçado de capricho" ficam perigosamente próximos. Esse ponto chegou.

O próximo passo é o primeiro deploy real na standalone network. Não porque o tooling está perfeito — nunca está. Mas porque 31 circuitos compilados limpos e 7 bugs documentados são evidência suficiente de que sei o que vou encontrar. O desconhecido que resta só aparece on-chain.

Métricas da semana:
• MRR: R$0
• Contratos compilados: 3 (ConsentRegistry 8c, DataAuditLog 11c, DataSubjectRights 12c)
• Circuitos ZK totais: 31
• SDK bugs documentados: 7
• Scripts de deploy: 4 (3 individuais + deploy-all.ts)
• Ciclo LGPD on-chain executado: 0

Para quem está na fase de "tooling completo, go-live pendente": como vocês sabem quando parar de preparar e começar a executar?

#BuildInPublic #Solopreneur #IndieHacking #DPO2U #MidnightNetwork
