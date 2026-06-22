---
date: 2026-06-22
pillar: thought-leadership
format: linkedin-post
source: week of 2026-06-16 to 2026-06-22 — pre-deploy hardening session finding walletProvider bug across all 3 DPO2U contracts
---

Antes do primeiro deploy real de qualquer sistema de compliance, existe uma fase que ninguém glorifica: o hardening.

Não é a fase das features novas. Não é o momento dos contratos elegantes, das integrações inteligentes, das decisões arquiteturais que vão aparecer no whitepaper. É a fase em que você abre os 3 scripts de deploy lado a lado e relê cada linha de configuração que escreveu nos últimos 30 dias.

Na semana passada, essa fase me mostrou que o DPO2U tinha um problema que eu não sabia que tinha.

O bug estava nos 3 contratos da suíte — ConsentRegistry, DataAuditLog, DataSubjectRights. Em todos eles, o `levelPrivateStateProvider` estava configurado sem `walletProvider: bridge`. No SDK Midnight, isso significa que o estado privado nunca sincroniza com a carteira após o deploy. O contrato funciona. As transações passam. Os hashes aparecem on-chain. Mas quando a aplicação tenta ler o consentimento registrado, o log de auditoria, os direitos do titular — nada. Sem erro. Sem timeout. Silêncio.

O mesmo erro, em 3 contratos, escritos em 3 sessões separadas.

Existe um padrão aqui que vai além do bug técnico: quando você constrói sistemas com contratos interdependentes em múltiplas sessões, a consistência de configuração não é garantida por memória ou por log — ela só existe se houver auditoria sistemática. Eu revisei cada contrato no momento em que o escrevi. Nunca os 3 lado a lado, antes do deploy.

Para sistemas de compliance isso é especialmente importante porque a falha silenciosa é mais perigosa do que a falha ruidosa.

Um sistema que lança uma exceção tem o problema documentado. Pode ser corrigido, auditado, reportado. Um sistema que confirma transações enquanto entrega dados inacessíveis cria um gap entre o estado documentado (o registro on-chain) e o estado operacional (o que o controlador consegue entregar ao titular). Esse gap é exatamente o que o Art. 18 da LGPD não permite: o direito de acesso não é satisfeito por "o dado existe em algum lugar" — ele é satisfeito quando o controlador consegue entregar o dado ao titular que o solicitou.

O fix foi uma linha por script. A lição foi maior.

Pre-deploy hardening, para sistemas de compliance, não é só um procedimento de engenharia — é um ato de responsabilidade regulatória. Se um sistema vai registrar consentimentos, logs de auditoria e solicitações de direitos de titulares, o mínimo exigível é que ele seja capaz de recuperar esses dados quando for preciso. Verificar isso antes do primeiro deploy real não é paranoia — é o básico.

O que implementei como protocolo para os próximos deploys:
• Auditoria lado a lado de todos os scripts antes de qualquer deploy
• Checklist de parâmetros críticos de SDK (não basta "lembrar que aplicou")
• Validação automatizada planejada: script que verifica parâmetros obrigatórios em todos os contratos antes de executar qualquer deploy

O primeiro standalone deploy ainda não aconteceu. Mas quando acontecer, será com mais garantias do que estava a ponto de ter.

Para quem constrói infraestrutura de compliance — técnica ou não: qual é o seu protocolo antes do primeiro deploy real? Existe uma fase de hardening formal na sua organização, ou é tudo "testamos, deve estar certo"?

Métricas da semana:
• MRR: R$0
• Contratos compilando: 3/3
• Scripts de deploy completos: 3/3
• Bugs de configuração encontrados antes do deploy: 3 (o mesmo, 3 vezes)
• Próximo milestone: primeiro standalone deploy com docker-compose

#BuildInPublic #Compliance #LGPD #MidnightNetwork #DPO2U #RegTech
