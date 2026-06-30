---
type: quest-announcement
template_version: "1.0"
quest_id: adhoc-024
date: 2026-06-30
milestone: feat(status.ts) — observabilidade read-only para contratos ZK: contadores públicos em protocolo privado; questão aberta: o que deve ser observável em um sistema ZK de consentimento?
generated_from: content/2026-06-30/podcast-prompt-public-counters-private-protocol.md + twitter-thread-status-observability.md + linkedin-three-scripts-art37.md
---

# Contadores Públicos em Protocolo Privado: o que deve ser observável em um sistema ZK de consentimento? 🎯

---

**Quest ID:** `adhoc-024`
**Frequência:** One-time (Ad Hoc)
**XP:** +250 XP
**Status:** 🟢 **ABERTO**

---

## 📋 Descrição

Hoje, 30 de junho de 2026, a DPO2U completou `scripts/status.ts` — o script de observabilidade read-only para os três contratos ZK na Midnight Network. O `status.ts` sincroniza uma carteira uma vez, conecta nos contratos e consulta apenas os **contadores públicos globais**:

- **ConsentRegistry** → `total_consents_granted`, `total_revocations`
- **DataAuditLog** → `total_events`, `total_deletion_reqs`, `total_breach_events`
- **DataSubjectRights** → `total_requests`, `total_fulfilled`, `total_rejected`, `total_overdue`

Esses são *saídas públicas de circuitos ZK* — qualquer pessoa com acesso ao endpoint da rede pode consultar esses valores. Em um protocolo cuja premissa central é que dados individuais permanecem privados, o que significa que esses agregados são leitura pública?

Isso é deliberado: o LGPD Art. 37 exige que o controlador mantenha registros de operações de tratamento auditáveis. Um sistema que não revela *nada* não pode provar accountability. Os contadores públicos são a superfície observável mínima necessária para conformidade — verificada criptograficamente via prova ZK, não via trust no operador.

Mas a tensão é real: se `total_consents_granted = 847` e o sistema tem 850 usuários registrados, um observador sabe que 3 usuários não consentiram. Em populações pequenas, contadores agregados podem estreitar o campo para re-identificação — o mesmo problema da análise de Narayanan & Shmatikoff sobre ratings da Netflix (2008).

**Artefato 1 — Twitter thread (técnico — 7 tweets):**
`status.ts` como o `kubectl get pods` dos contratos Midnight. O que muda quando você tem observabilidade antes do primeiro usuário real. Padrões SDK aplicados (WalletFacade 2.0.0, finalizeRecipe Bug 5, walletProvider:bridge Bug 6). Métricas reais: 3 contratos compilados, 31 circuitos, 0 deploys on-chain.

**Artefato 2 — LinkedIn post (founder/jurídico — análise honesta):**
O pipeline `deploy-all.ts → status.ts → interact-full-suite.ts` como implementação operacional do Art. 37 da LGPD. Cada script corresponde a uma fase de accountability: registro existe → registro é auditável → registro tem conteúdo verificável. Sem documentação de política. Em código.

**Artefato 3 — Podcast prompt (design debate):**
Ana (DPO) e Rafael (dev) debatem: por que fazer qualquer coisa pública em um protocolo de privacidade? Rafael: Art. 37 exige auditabilidade — contadores ZK são a forma mais confiável (prova, não self-report). Ana: Art. 6 VII exige minimização de dados — publicar `total_breach_events` quando há zero usuários é minimização de dados ou premissa de sistema? A questão do `total_breach_events` em tempo real de incidente (antes da notificação obrigatória do Art. 48) fica em aberto.

---

## 🎯 O que fazer

Escreva e publique um artigo técnico ou thread que analise a seguinte questão de design:

**"O que deve ser observável publicamente em um sistema ZK de consentimento — e o que deve permanecer privado? Como você equilibra accountability regulatória com minimização de dados?"**

O seu artigo ou thread deve:

1. Identificar pelo menos **dois tipos de outputs** de um sistema de consentimento: os que devem ser públicos (para auditabilidade) e os que devem ser privados (para proteção do titular)
2. Propor uma **taxonomia de observabilidade** — uma regra prática para decidir o que vai em circuito público vs. privado em um contrato Compact/ZK
3. Discutir o **risco de re-identificação por agregado** em populações pequenas — referência a Narayanan & Shmatikoff (2008) ou equivalente é encorajada, mas não obrigatória
4. Avaliar se os contadores públicos do DPO2U (`total_breach_events`, `total_revocations`) satisfazem o princípio de **minimização de dados do Art. 6 VII da LGPD** — ou se há uma tensão real com o Art. 37
5. Concluir com uma **recomendação concreta**: como um developer deveria decidir o que é público em um contrato que processa dados pessoais?

---

## 🏷️ Tags

`#midnight` · `#zkp` · `#compact` · `#lgpd` · `#compliance` · `#privacy` · `#observability`

---

## ✅ Validação

**Método:** `manual`

Após publicar, compartilhe o link no Zealy com a tag `#adhoc024`. O post deve ser acessível publicamente (blog, LinkedIn, Substack, Mirror, GitHub Pages ou equivalente).

---

### 💡 Dicas

- **Referências de base:** LGPD Arts. 6 VII (minimização), 37 (registros de operação), 48 (notificação de incidente); Helen Nissenbaum, *Privacy in Context* (2010) — integridade contextual; Narayanan & Shmatikoff, "Robust De-anonymization of Large Sparse Datasets" (2008)
- **Contexto técnico:** Na arquitetura da Midnight Network, outputs de circuitos ZK marcados como `public` ficam disponíveis para consulta on-chain por qualquer endereço. Outputs marcados como `private` são provados via ZK mas nunca revelados
- **Diferencial:** artigos que propõem uma **regra de decisão implementável** (ex: "output X é público se e somente se...") ganharão destaque na revisão. Generalidades teóricas sem critério operacional não serão destacadas
- **A pergunta em aberto do DPO2U:** o `total_breach_events` deve ser público? Se increments só após `BREACH_NOTIFICATION` finalizado (pós-notificação Art. 48), não há risco de disclosure prematuro. Mas "deve" está fazendo muito trabalho aí — é uma questão de ordem de operações no código, não de design do circuito

---

#NightForce #AliitFellows #MidnightForDevs #ZealyQuest

---

*Post gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Compartilhe seu progresso nos comentários!*
