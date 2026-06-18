---
date: 2026-06-18
pillar: compliance-protocol
format: linkedin-post
template: linkedin_thought_leadership
source: contracts/DataAuditLog.compact — Uint<16>→Uint<32> migration
---

# O Problema do Overflow Silencioso em Contratos de Conformidade

Hoje corrigimos uma falha no DataAuditLog.compact que teria passado despercebida até o dia em que causasse dano real.

O contrato armazena o `block_number` de cada evento de auditoria — logEvent, logDeletionRequest, confirmDeletion, logBreachEvent. Esse número é o timestampimutável on-chain exigido pelo Art. 37 da LGPD: a evidência de *quando* cada ação ocorreu.

O problema: `block_number` estava declarado como `Uint<16>`. Valor máximo: 65.535. Na Midnight Network, a 1 bloco por minuto, isso representa aproximadamente **45 dias**.

Depois desse ponto, o contador transborda silenciosamente. Sem exceção. Sem alerta. Os eventos continuam sendo registrados — mas com números de bloco inválidos. O registro de auditoria parece íntegro, mas está corrompido.

**Um sistema de conformidade que falha silenciosamente é juridicamente mais perigoso do que um sistema que não existe.**

Se não existe, você sabe que não tem evidência. Se existe mas está corrompido, você pode apresentar evidência inválida em uma auditoria — e só descobrir o problema quando for tarde demais.

---

A correção foi simples: dois arquivos, doze linhas.

`Uint<16>` → `Uint<32>`

Novo limite: 4.294.967.295 blocos — equivalente a 8.171 anos a 1 bloco por minuto. Nenhum teto prático para um contrato de conformidade.

Também removemos o clamp `& 0xFFFF` no script de deploy, que estava mascarando o problema nos testes locais ao truncar os números de bloco para o range válido do tipo antigo.

---

O que isso me lembra: **em conformidade, o tipo de dado é uma declaração de intenção regulatória, não um detalhe de implementação.**

Quando você diz que um `block_number` cabe em `Uint<16>`, você está dizendo implicitamente que o seu registro de auditoria foi projetado para menos de 45 dias de operação. Isso talvez faça sentido num protótipo. Nunca faz sentido num sistema em produção sujeito ao Art. 37 da LGPD.

A legislação não tem prazo de validade. O contrato também não pode ter.

---

DPO2U é um projeto open-source de conformidade LGPD on-chain. Construímos em público, publicamos os bugs e as correções. Esse tipo de decisão — `Uint<16>` vs `Uint<32>` — é exatamente o que separamos de protótipo para sistema confiável.

Se você está construindo infraestrutura de compliance em blockchain, preste atenção nos tipos. Eles são os seus contratos dentro do contrato.

#LGPD #DataProtection #Web3 #BuildInPublic #DPO2U #MidnightNetwork #CompactLang #ComplianceByDesign
