---
type: quest-email
template_version: "1.0"
quest_id: daily-001
date: 2026-06-28
generated_from: content/2026-06-28/twitter-thread-compactc-upgrade.md + linkedin-zk-keys-per-lgpd-right.md
---

# Publish a Deep Technical Thread — Quest Zealy

---

**Quest ID:** daily-001
**Frequência:** Daily
**XP:** +120 XP
**Data:** 2026-06-28

---

## 📋 O que fazer

Publicar uma thread técnica profunda sobre Midnight Network — explicando um conceito, um bug, uma decisão de arquitetura ou uma lição aprendida construindo com o protocolo.

**Tema de hoje:** O que muda quando você sobe a versão do compilador Compact — e por que `compactc 0.29.0 → 0.31.0` não é só um número.

Em 28 de junho de 2026, a DPO2U atualizou o toolchain para compactc 0.31.0 e regenerou os artefatos ZK para os 3 contratos do projeto. O resultado concreto foi 7 pares de arquivos `.prover` / `.verifier` no ConsentRegistry — um circuito criptográfico separado por função LGPD:

```
grantConsent.prover / grantConsent.verifier       → Art. 7/8 — consentimento
revokeConsent.prover / revokeConsent.verifier     → Art. 8 §5 — revogação
updateConsentPurposes.prover / .verifier          → alteração de finalidade
getConsentStatus.prover / getConsentStatus.verifier → consulta verificável
getTotalConsentsGranted.prover                    → contagem de consentimentos
getTotalRevocations.prover                        → contagem de revogações
getConsentPurposes.prover                         → finalidades ativas
```

A regra que aprendemos na prática: o `COMPACT_VERSION` no script de compilação precisa ser exatamente o mesmo que gerou os artefatos em `build/`. Mismatch silencioso aqui = prova inválida on-chain. Documentado em `WORKAROUND-GUIDE.md`.

O estado atual do DPO2U depois da atualização:

```
✓ compactc 0.31.0 — toolchain atualizado
✓ 3 contratos compilados com novos artefatos ZK
✓ interact-full-suite.ts pronto (5 fases LGPD)
⏳ Primeiro standalone deploy — próximo passo
```

O framework para a sua thread (pode seguir a estrutura da DPO2U ou criar a sua):

**Tweet 1:** Qual atualização de toolchain você fez recentemente que parecia simples — mas tinha consequências que não eram óbvias?
**Tweet 2:** O que mudou concretamente? (artefatos, garantias de segurança, compatibilidade)
**Tweet 3:** A regra que você aprendeu — o detalhe que, se ignorado, quebra o sistema silenciosamente
**Tweet 4:** Por que a versão do compilador importa além do número — o que a versão de um circuito ZK representa para compliance?
**Tweet 5:** Estado atual do seu projeto + próximo passo (específico, não genérico)

---

## 🎯 O que entregar

1. Thread publicada no X (mínimo 4 tweets, linkados em sequência)
2. Opcional: post equivalente no LinkedIn
3. Link da thread para validação

---

## 🏷️ Hashtags sugeridas

#BuildInPublic #DPO2U #MidnightForDevs #CompactLang #NightForce #AliitFellows

---

## ✅ Validação

Ao completar esta quest, envie o link de prova para validação.

**Método de Validação:**
- Manual: Enviar link da thread publicada para revisão

---

**Boa sorte!** 🎮

Esta quest é parte do programa Night Force + Aliit Fellows.

Complete todas as quests para ganhar XP, subir no leaderboard e desbloquear achievements!

*E-mail gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Data: 2026-06-28*
