---
type: quest-email
template_version: "1.0"
quest_id: daily-001
yaml_quest: adv-05
date: 2026-10-08
content_new_today: true
generated_from: content/2026-10-08/twitter-thread-onze-mutacoes.md + content/2026-10-08/linkedin-guard-testado-em-um-de-quatro.md
---

# Publish a Deep Technical Thread — Quest Zealy

**Quest ID:** adv-05 (alias interno: daily-001)
**Frequência:** Daily
**XP:** +120 XP
**Data:** 2026-10-08

---

## ✅ Estado do conteúdo

- **Há conteúdo novo hoje:** `content/2026-10-08/` (thread X de 4 tweets + post LinkedIn) sobre a ampliação do `npm run test:guard`.
- **Não gerado:** resumo semanal (hoje é quinta-feira) e anúncio de quest (sem tópico novo além da thread diária).

## 📋 O que fazer

Publicar uma thread técnica profunda sobre trabalho real da DPO2U no stack Midnight.
Ângulo do dia: **um guard testado em 1 de 4 lugares onde a constante vive não é um guard testado — cobertura de teste negativo se mede em pontos de falha injetados.**

Fatos reportados no conteúdo do dia (fonte: commit daccc64, `scripts/test-version-guard.sh`; não re-executados neste ciclo):

```
npm run test:guard (antes): 1 mutação, proof-server em scripts/lib/proof-server.ts
npm run test:guard (agora): 11 mutações em 4 arquivos
  pre-deploy-check.sh: NODE, INDEXER, PROOF_SERVER, COMPACT, TMP_MIN_FREE_KB
  midnight-health-check.sh e compile-contracts.sh: versões
  docker-compose.yml: imagem do indexer
cada caso: parte do original, muta, exige rc != 0, restaura (trap + backup em tmp)
aborta se o sed não alterou o arquivo (padrão obsoleto)
resultado reportado: 11x "OK: rc=1", "ALL 11 drift cases detected", árvore limpa
limites: sem deploy real (sem nó/seed financiada); no docker-compose só o indexer é mutado (node e proof-server sem caso)
```

Framework (baseado na thread do dia):

**Tweet 1:** Ontem 1 mutação em 1 arquivo; a constante vive em 4 → 25% de cobertura. Hoje: 11 em 4.
**Tweet 2:** O que entrou na cobertura (commit daccc64) e a regra rc≠0 por caso.
**Tweet 3:** Regra herdada do falso positivo: se o sed não mudou o arquivo, aborta; restore via trap; sem acumular mutações.
**Tweet 4:** Evidência (11x OK, árvore limpa) e limite honesto (node/proof-server no compose sem caso).

## 🎯 O que entregar

1. Thread publicada no X (mínimo 4 tweets, em sequência)
2. Opcional: post equivalente no LinkedIn
3. Link da thread para validação

## 🏷️ Hashtags sugeridas

#BuildInPublic #DPO2U #MidnightForDevs #NightForce #AliitFellows

## ✅ Validação

Manual: enviar o link de prova para revisão.

---

*E-mail gerado automaticamente pelo Pipeline Zealy do DPO2U*
