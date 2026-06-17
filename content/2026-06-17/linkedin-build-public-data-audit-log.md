---
title: "LinkedIn — Suite DPO2U completa: 3 contratos, 3 scripts, 0 deploys reais"
date: 2026-06-17
pillar: build-public
character: Rafael
source_log: logs/2026-06-17-dev.md
---

Hoje completei o terceiro script de deploy da suite DPO2U. Nenhum deles foi testado em rede real ainda.

É uma conquista genuína com uma ressalva honesta — e acho que esse tipo de clareza é o que o build in public deveria ser.

Estou construindo a DPO2U: uma plataforma de compliance LGPD que codifica obrigações legais em contratos inteligentes na Midnight Network. Cada contrato representa um direito ou dever real da LGPD — o direito do titular de acessar seus dados (Art. 18), a obrigação do controlador de manter registros de tratamento (Art. 37), o dever de notificar violações à ANPD (Art. 48).

A vitória desta semana foi concluir o `deploy-data-audit-log.ts` — 312 linhas cobrindo o ciclo completo de auditoria: registro de eventos, solicitação de exclusão, confirmação de deleção, notificação de incidente. Com isso, os 3 contratos (ConsentRegistry, DataSubjectRights, DataAuditLog) têm scripts de deploy funcionais e verificados como compiláveis pelo compiler v0.31.0. Três sessões de desenvolvimento, distribuídas ao longo de semanas, cada uma adicionando uma peça.

O desafio que não desaparece: não tenho o compilador `compactc` instalado localmente. Cada verificação de sintaxe depende de um compilador remoto via `midnight-mcp`. Sei que a sintaxe está correta. Não sei o que acontece quando o deploy rodar de verdade — porque ainda não rodou. O primeiro deploy em ambiente standalone é o próximo passo real, e por enquanto está bloqueado na minha lista.

Isso me incomodava. Parecia frágil construir sem poder testar localmente. Mas aprendi a olhar diferente: o projeto tem um WORKAROUND-GUIDE com 7 bugs do SDK documentados e internalizados. Cada novo script copia os mesmos fixes (Bug 5: `finalizeRecipe` em vez de `signRecipe`; Bug 6: `zkConfigProvider` como segundo argumento do proof provider) — e essa replicação disciplinada criou uma consistência entre os scripts que nenhum ambiente de teste local teria gerado da mesma forma. Constraints revelam o que você realmente prioriza.

A lição que carrego desta fase: a distância entre "compila" e "roda" é real, mas não invalida o trabalho. Scripts bem escritos e documentados são ativos. O primeiro deploy vai acontecer — e quando acontecer, vai ser num código que já foi revisado três vezes. Esse é o valor da iteração disciplinada sem atalhos.

Métricas da semana:
• Contratos compilando: 3/3
• Scripts de deploy completos: 3/3
• Bugs de SDK documentados e aplicados: 7
• Deploy em rede real: 0/3

Você já ficou preso entre "está pronto no papel" e "ainda não rodou de verdade"? Como você decide quando avançar e quando testar primeiro?

#BuildInPublic #Solopreneur #IndieHacking #DPO2U #MidnightNetwork
