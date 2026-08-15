---
type: quest-email
template_version: "1.0"
quest_id: daily-001
date: 2026-08-08
generated_from: content/2026-08-07/twitter-thread-healthcheck-lied-nine-days.md
---

# Publish a Deep Technical Thread — Quest Zealy

---

**Quest ID:** daily-001
**Frequência:** Daily
**XP:** +120 XP
**Data:** 2026-08-08

---

## 📋 O que fazer

Publicar uma thread técnica profunda sobre Midnight Network — hoje sobre a "Parte 7" do arco de observabilidade da DPO2U: o próprio script feito pra pegar drift de versão entre produção e o que devia rodar teve um drift de versão — e mentiu a cada 2h, por 9 dias seguidos.

**Tema de hoje:** em 25/07, o commit `1a8813e` corrigiu a tag do indexer standalone (`4.0.0-rc.4` → `3.1.0`) em `docker-compose.yml` e `pre-deploy-check.sh`. Um terceiro arquivo com a mesma informação — `scripts/midnight-health-check.sh` — ficou pra trás, sem ninguém notar na hora. Resultado: o cron de 2h desse script passou a comparar o container real (correto, `3.1.0`) contra a constante velha (`4.0.0-rc.4`) do próprio verificador, disparando WARN → ALERT → e-mail ao shareholder a cada tick. 115 disparos falsos entre 26/07 22h e 05/08 10h — contado direto em `health.log`, não estimado.

O que ficou constatado ao reconferir a fonte primária, não o relatório anterior:
- Fix salvo em disco em 05/08 10:02:53. Último WARN falso: 05/08 10:00:04. Primeiro OK correto: 05/08 12:00:03 — o tick seguinte. A mentira parou no segundo em que o arquivo certo tocou o disco.
- O commit desse mesmo fix (`08f170d`) só aconteceu em 06/08 10:02:44 — 24h depois, quase ao minuto. Por um dia inteiro, `git log` dizia "ainda quebrado" enquanto produção já estava correta havia 24h.
- `docker ps` confirma o indexer real rodando `indexer-standalone:3.1.0`. `compile-contracts.sh` rerodado por garantia: ConsentRegistry 8 circuitos, DataAuditLog 11, DataSubjectRights 12 — 3/3 OK, nenhum contrato tocado.
- A ironia central: o script existe pra pegar exatamente esse tipo de drift. Ele teve o mesmo bug que foi feito pra caçar — versão duplicada em 3 arquivos, esquecida em 1.

Estado real de hoje:
```
Alertas falsos disparados: 115 em 9 dias
Gap disco→git: 24h (10:02:53 em 05/08 → 08f170d commitado 10:02:44 em 06/08)
Contratos: 3/3 compilando, 0 tocados
Squatter na porta 6300 (proof-server errado, projeto não relacionado): ainda lá, fora de escopo
```

O framework para a sua thread (pode seguir a estrutura da DPO2U ou criar a sua):

**Tweet 1:** Você já construiu uma ferramenta pra pegar um tipo específico de erro — e essa ferramenta caiu exatamente no mesmo erro que foi feita pra caçar?
**Tweet 2:** Quantos alertas/warnings falsos seu sistema já disparou porque uma mesma informação (versão, tag, config) foi corrigida em um arquivo e esquecida em outro?
**Tweet 3:** Existe um gap no seu processo entre "corrigido em produção/disco" e "corrigido em git/registrado"? Quanto tempo esse gap costuma durar — minutos, horas, dias?
**Tweet 4:** Métricas reais de hoje do seu projeto — não vibe, número.
**Tweet 5:** Fonte única de verdade para constantes que se repetem em múltiplos arquivos (versão, tag, config) — você já tem isso resolvido, ou é a próxima dívida técnica na fila?

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
*Data: 2026-08-08*
