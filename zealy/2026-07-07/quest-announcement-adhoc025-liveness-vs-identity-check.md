---
type: quest-announcement
template_version: "1.0"
quest_id: adhoc-025
date: 2026-07-07
milestone: fix(scripts) — check_proof_server()/check_docker_image_version() em pre-deploy-check.sh e midnight-health-check.sh; incidente real confirmado (proof-server de outro projeto squatting em :6300 há 2 semanas); questão aberta: uma atestação de compliance que só verifica liveness pode ser uma atestação falsa?
generated_from: content/2026-07-03/twitter-thread-proof-server-version-drift.md + content/2026-07-07/twitter-thread-squatter-confirmed.md + scripts/pre-deploy-check.sh (diff) + scripts/midnight-health-check.sh (diff)
---

# Liveness ≠ Identidade: Sua Atestação de Compliance Sabe Diferenciar "Responde" de "É o Serviço Certo"? 🎯

---

**Quest ID:** `adhoc-025`
**Frequência:** One-time (Ad Hoc)
**XP:** +250 XP
**Status:** 🟢 **ABERTO**

---

## 📋 Descrição

Em 3 de julho de 2026, a DPO2U identificou um ponto cego em `pre-deploy-check.sh`: o script confirmava que o proof-server respondia em `:6300` (`curl /health` → "ok"), mas nunca verificava **qual** proof-server — nem em qual versão do toolchain ZK. Em 7 de julho, ao estender a mesma correção ao script de monitoramento de produção (`midnight-health-check.sh`, o que roda via cron e envia email ao shareholder), o cenário hipotético virou incidente confirmado: quem respondia na porta 6300 não era o stack `midnight-standalone-*` da DPO2U — era o proof-server (versão 8.0.3) de **outro projeto**, ativo há duas semanas, sem que o health check antigo notasse.

O fix: `check_proof_server()` agora compara `/version` contra a versão esperada e falha alto em caso de mismatch; `check_docker_image_version()` lê `docker inspect` e compara a tag da imagem do node e do indexer contra o `docker-compose.yml`. Os dois scripts — o de pré-deploy e o de monitoramento contínuo — agora testam identidade, não só vida.

Isso expõe uma questão que vai além de infraestrutura: **um sistema de auditoria de compliance que verifica apenas "o serviço responde" — sem verificar "é o serviço certo, na versão certa, com o toolchain criptográfico correto" — pode produzir uma atestação de conformidade falsa?**

O paralelo é direto. O LGPD Art. 37 exige que o controlador mantenha registros de operações de tratamento auditáveis. Se um `health-check.sh` reporta "ZK pipeline operacional" com base apenas em um HTTP 200 — e o serviço por trás na verdade é outro toolchain, outra versão, outro projeto — o registro de auditoria está tecnicamente "verde" enquanto a garantia criptográfica real (qual circuito gerou a prova, com qual proof-server) é desconhecida. Liveness virou proxy de correção, e o proxy estava errado.

**Artefato 1 — Twitter thread (técnico — 8 tweets):**
A cronologia completa: bug hipotético (03/07) → fix aplicado no pre-deploy-check.sh (05/07) → mesmo fix estendido ao script de produção e incidente real confirmado (07/07). `docker ps --filter publish=6300` como o comando que devia ter sido rodado duas semanas antes.

**Artefato 2 — LinkedIn post (founder/compliance — análise honesta):**
Por que "o serviço responde" nunca deveria ser a métrica de sucesso de um health check em ambiente compartilhado (VPS multi-projeto). O que isso significa para qualquer atestação automatizada — de infraestrutura ou de compliance — que reporta "OK" sem verificar identidade.

**Artefato 3 — Podcast prompt (design debate):**
Ana (DPO) e Rafael (dev) debatem: um relatório de auditoria gerado a partir de um health check que passou (mas testava o serviço errado) é uma atestação falsa, ou é simplesmente um bug de monitoramento sem relevância jurídica? Rafael: é só infra, o dado tratado nunca foi exposto. Ana: Art. 37 exige que o registro reflita a realidade operacional — um "OK" que não sabe o que está checando não é um registro, é ruído com aparência de evidência.

---

## 🎯 O que fazer

Escreva e publique um artigo técnico ou thread que analise a seguinte questão de design:

**"Um health check ou sistema de atestação automatizada que verifica apenas liveness (o serviço responde) — sem verificar identidade/versão (é o serviço certo) — pode invalidar retroativamente os registros de auditoria que dependeram dele?"**

O seu artigo ou thread deve:

1. Distinguir explicitamente **liveness check** (o serviço está de pé) de **identity/version check** (é o serviço esperado, na versão esperada) — com um exemplo do seu próprio stack, não só o exemplo da DPO2U
2. Propor uma **regra prática**: em que situações um liveness check sozinho é suficiente, e em que situações (produção, compliance, criptografia) ele é insuficiente e perigoso
3. Avaliar o caso concreto: um ambiente compartilhado (VPS, cluster, namespace) onde múltiplos serviços podem escutar na mesma porta/endpoint — que verificação mínima evita o falso-positivo?
4. Discutir se um registro de auditoria (LGPD Art. 37, SOC 2, ISO 27001 — qualquer framework serve) gerado a partir de um monitoramento que só testou liveness deveria ser considerado **inválido retroativamente** quando o erro é descoberto, ou apenas **incompleto**
5. Concluir com uma **recomendação concreta**: o que todo pipeline de compliance automatizado deveria checar antes de gravar um "conforme" no seu registro de auditoria

---

## 🏷️ Tags

`#midnight` · `#compliance` · `#lgpd` · `#devops` · `#observability` · `#zkp` · `#security`

---

## ✅ Validação

**Método:** `manual`

Após publicar, compartilhe o link no Zealy com a tag `#adhoc025`. O post deve ser acessível publicamente (blog, LinkedIn, Substack, Mirror, GitHub Pages ou equivalente).

---

### 💡 Dicas

- **Contexto técnico:** o incidente real está documentado em `content/2026-07-03/twitter-thread-proof-server-version-drift.md` (previsão) e `content/2026-07-07/twitter-thread-squatter-confirmed.md` (confirmação); o fix está em `scripts/pre-deploy-check.sh` e `scripts/midnight-health-check.sh` (`check_proof_server()`, `check_docker_image_version()`)
- **Referências de base:** LGPD Art. 37 (registros de operações de tratamento); frameworks de auditoria contínua (SOC 2 Type II, ISO 27001 Anexo A.12); o princípio geral de "attestation integrity" em sistemas de monitoramento distribuído
- **Diferencial:** artigos que trazem um exemplo real do próprio ambiente do autor (não hipotético) — "onde no seu stack um `curl /health` de hoje poderia estar mentindo" — ganharão destaque na revisão
- **A pergunta em aberto do DPO2U:** o indexer não tem endpoint `/version` — o fix leu a tag da imagem Docker via `docker inspect` como proxy. Isso é uma verificação de identidade suficiente, ou só desloca o mesmo problema (confiar que a tag da imagem não foi re-taggeada) um nível abaixo?

---

#NightForce #AliitFellows #MidnightForDevs #ZealyQuest

---

*Post gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Compartilhe seu progresso nos comentários!*
