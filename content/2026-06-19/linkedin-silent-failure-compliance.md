---
date: 2026-06-19
pillar: build-public
format: linkedin-post
source: fix/consent-registry-assert-parens branch — walletProvider: bridge pré-deploy hardening
---

Estou prestes a fazer o primeiro deploy real da DPO2U. E descobri que os 3 contratos tinham o mesmo bug silencioso.

A fase de "hardening" antes de um deploy não é glamourosa. Não é a hora das features novas, dos contratos elegantes, das grandes decisões arquiteturais. É a hora de sentar, abrir os 3 scripts lado a lado, e reler cada linha de configuração que você escreveu nos últimos 30 dias.

Foi o que fiz hoje. E encontrei o Bug 6.

A vitória da semana: os 3 contratos da suíte DPO2U — ConsentRegistry, DataAuditLog, DataSubjectRights — compilam e têm scripts de deploy completos com cenários de demo LGPD. São 6 sessões de desenvolvimento no SDK Midnight, com workarounds para 7 bugs documentados. A suíte estava funcional, no papel.

A derrota de hoje: em todos os 3 scripts, `levelPrivateStateProvider` estava sendo configurado sem `walletProvider: bridge`. No SDK Midnight, isso significa que o estado privado nunca sincroniza com a carteira. O contrato deploya. A transação passa. O hash aparece on-chain. Mas quando a aplicação tenta ler o consentimento registrado, o log de auditoria, os direitos do titular — nada. Silêncio.

O pior tipo de bug para um sistema de compliance: um bug que não falha abertamente, que parece funcionar, mas entrega dados inacessíveis na prática.

Levei tempo para entender por que esse bug é tão perigoso no contexto da LGPD. A lei exige que o titular possa consultar, revogar e solicitar a exclusão dos seus dados. Se o estado privado não sincroniza, a aplicação não pode cumprir esse direito — mas o contrato continua registrando transações. A aparência de conformidade existe. A conformidade real, não.

A lição que estou levando: audite sistematicamente, não sequencialmente. Quando você constrói 3 contratos em semanas separadas, a tendência é confiar que o que aprendeu no primeiro foi propagado para os próximos. Não foi. O Bug 6 estava no ConsentRegistry, no DataAuditLog e no DataSubjectRights — replicado 3 vezes porque eu revisava um contrato por vez, nunca os 3 lado a lado.

Fix aplicado: uma linha em cada script. Pré-deploy mais robusto do que estava há 24 horas.

Métricas da semana:
• MRR: R$ 0 (ainda em construção)
• Contratos compilando: 3/3
• Scripts de deploy completos: 3/3
• Bugs de configuração encontrados em pré-deploy: 3 (o mesmo erro, 3 vezes)
• Próximo passo: primeiro standalone deploy com docker-compose

Se você está construindo em cima de um SDK novo ou experimental: qual é o seu protocolo de auditoria antes do primeiro deploy real?

#BuildInPublic #Solopreneur #IndieHacking #DPO2U #MidnightNetwork
