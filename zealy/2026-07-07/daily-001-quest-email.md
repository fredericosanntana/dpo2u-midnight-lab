---
type: quest-email
template_version: "1.0"
quest_id: daily-001
date: 2026-07-07
generated_from: content/2026-07-03/twitter-thread-proof-server-version-drift.md + content/2026-07-07/twitter-thread-squatter-confirmed.md
---

# Publish a Deep Technical Thread — Quest Zealy

---

**Quest ID:** daily-001
**Frequência:** Daily
**XP:** +120 XP
**Data:** 2026-07-07

---

## 📋 O que fazer

Publicar uma thread técnica profunda sobre Midnight Network — explicando um conceito, uma decisão de arquitetura ou uma lição aprendida construindo com o protocolo.

**Tema de hoje:** Um bug hipotético virou bug real em 4 dias — o que isso ensina sobre testar suposições de infraestrutura antes que elas te encontrem.

Em 3 de julho de 2026, a DPO2U escreveu uma thread sobre um ponto cego encontrado em `pre-deploy-check.sh`: o script testava se o proof-server respondia em `:6300` (`curl /health` → "ok"), mas nunca verificava **qual** proof-server era. Liveness check ≠ version check. Qualquer container de qualquer projeto na mesma VPS podia estar escutando naquela porta e o script reportaria sucesso mesmo assim.

Hoje, 7 de julho, ao aplicar o mesmo fix no script de monitoramento de produção (`midnight-health-check.sh`, o que roda de cron e envia email), o cenário hipotético se confirmou: rodando `docker ps --filter publish=6300` antes de aplicar o patch, o proof-server respondendo na porta não era do stack `midnight-standalone-*` — era `dpo2u-midnight-self-funding-proof-server-1`, versão 8.0.3, de **outro projeto**, ativo há duas semanas sem que o health check antigo notasse.

```
03/07 → bug hipotético identificado em pre-deploy-check.sh (fio técnico)
05/07 → check_proof_server() com /version corrigido no pre-deploy-check.sh
07/07 → mesmo fix estendido a midnight-health-check.sh → incidente real confirmado
```

O fix aplicado nos dois scripts: `check_proof_server()` compara `/version` contra a versão esperada (7.0.0) e falha alto se não bater; `check_docker_image_version()` lê `docker inspect` e compara a tag da imagem do node e do indexer contra o `docker-compose.yml`. Liveness continua sendo verificado — mas agora identidade também é.

Estado real de hoje:
```
MRR: R$0 | Usuários: 0 | Deploys on-chain: 0
Contratos: 3/3 compilando | Scripts com version-check: 2/2
Incidentes reais capturados pelo fix: 1
Nenhuma das mudanças está commitada ainda
```

O framework para a sua thread (pode seguir a estrutura da DPO2U ou criar a sua):

**Tweet 1:** Que suposição de infraestrutura você nunca tinha testado — até ela falhar (ou quase falhar)?
**Tweet 2:** Qual é a diferença, no seu sistema, entre "o serviço responde" e "é o serviço certo"? Onde seu monitoramento hoje só testa a primeira?
**Tweet 3:** O que um ambiente compartilhado (VPS, cluster, namespace) esconde por padrão — e o que você precisa checar explicitamente para não confiar em "porta responde = serviço correto"?
**Tweet 4:** A lição que você tira: prevenção documentada teórica vs. incidente real capturado — quanto tempo passou entre um e outro no seu caso?
**Tweet 5:** Estado atual do seu projeto + o gap honesto que ainda falta fechar (não genérico — específico do seu stack)

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
*Data: 2026-07-07*
