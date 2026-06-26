---
type: quest-announcement
template_version: "1.0"
quest_id: adhoc-019
date: 2026-06-25
milestone: feat(pre-deploy) — pre-deploy-check.sh + compile-contracts.sh POSIX fix + first standalone deploy imminent
generated_from: content/2026-06-25/twitter-thread-predeploycheck.md + linkedin-documentation-becomes-automation.md + podcast-prompt-predeploycheck-accountability.md
---

# Quando Documentação Vira Automação — Pre-Deploy Hardening Completo 🎯

---

**Quest ID:** `adhoc-019`
**Frequência:** One-time (Ad Hoc)
**XP:** +80 XP
**Status:** 🟢 **ABERTO**

---

## 📋 Descrição

A DPO2U acaba de dar o passo que separa projetos que crescem em fragilidade de projetos que crescem em robustez: 7 bugs de SDK documentados ao longo de 3 meses foram transformados em código de prevenção.

O `pre-deploy-check.sh` é um script de 200 linhas que bloqueia qualquer deploy enquanto qualquer uma de 5 categorias críticas falhar:

- **Node.js ≥ 22.x** — versão mínima exigida pelo SDK
- **compactc pinado em 0.29.0** — porque o 0.29 silenciosamente quebrou o `assert()` sem parênteses (40 minutos de debug, exit 255 com mensagem que aponta para uma variável)
- **.npmrc ausente** — registry do Midnight não resolve com ele; transação confirma on-chain, estado privado fica inacessível
- **Build artifacts** — keys + contract + zkir para ConsentRegistry, DataAuditLog e DataSubjectRights
- **Docker services** — midnight-node :9944, indexer :8088, proof-server :6300 (sem ele, ZK proofs falham silenciosamente)

Ao mesmo tempo, o `compile-contracts.sh` recebeu fix de portabilidade POSIX: `((count++))` → `count=$((count + 1))` — aritmética bash-específica que falha silenciosamente em shells strict e em CI.

Estado atual: 3 contratos compilando, 3 scripts hardened, 8 workarounds codificados como gates. Primeiro standalone deploy iminente.

Mas o milestone mais importante não é o script. É a tensão que ele revela: **exit 0 significa que o ambiente está pronto. Não significa que o titular de dados pode exercer o Art. 18.** A DPO2U está sendo explícita sobre esse gap — e é isso que esta quest pede que você explore.

---

## 🎯 O que fazer

1. Leia o thread técnico da DPO2U sobre o pre-deploy-check.sh (publicado em @dpo2u no X em 2026-06-25)
2. Reflita sobre o tema central: quando documentação de incidentes vira automação de prevenção — e onde está o limite entre accountability técnica e accountability regulatória
3. Publique um post — no X, LinkedIn ou fórum da comunidade — respondendo a uma das perguntas abaixo:

**Opção A — Perspectiva de engenharia:**
Você já teve um ponto de virada em que parou de apenas documentar bugs e começou a convertê-los em checks automáticos? O que disparou essa transição? Quanto tempo levou entre "documentar o workaround" e "codificar o guardrail"?

**Opção B — Perspectiva de compliance:**
Um script de pre-deploy que valida infraestrutura (Node.js, compactc, artefatos, Docker) satisfaz o Art. 37 da LGPD (accountability do controlador)? Ou accountability exige rastreabilidade de decisões sobre os dados dos titulares — algo que nenhum script de CI pode garantir sozinho?

**Opção C — Perspectiva de portabilidade:**
A DPO2U fez um fix POSIX no `compile-contracts.sh` porque `((count++))` é bash-específico e falha silenciosamente em ambientes strict. Você tem uma política de portabilidade para scripts de infraestrutura críticos? O que levou à sua posição atual — incidente, convenção de time, requisito de CI?

---

## 🏷️ Tags

`#MidnightForDevs` · `#BuildInPublic` · `#DPO2U` · `#LGPD` · `#CompactLang` · `#ZKPrivacy` · `#NightForce`

---

## 🔗 Hashtags sugeridas

`#MidnightNetwork` · `#MidnightForDevs` · `#BuildInPublic` · `#DPO2U` · `#LGPD` · `#CompactLang` · `#ZKPrivacy` · `#NightForce` · `#AliitFellows`

---

## ✅ Validação

**Método:** `manual`

Após completar, responda este post com o link do seu trabalho para validação.

---

### 💡 Contexto técnico

**O script — para referenciar no seu post:**
- Arquivo: `scripts/pre-deploy-check.sh` (novo, 2026-06-25)
- Exit 0: "Ready to deploy" + comandos exatos para os 3 contratos
- Exit 1: lista de falhas + referência ao `WORKAROUND-GUIDE.md`
- Cada check tem origem em um bug real: não são abstrações preventivas, são memória operacional
- Suporte a redes: `--network standalone | preprod | preview`

**O fix POSIX — para referenciar no seu post:**
- Arquivo: `scripts/compile-contracts.sh`
- Mudança: `((count++))` → `count=$((count + 1))`
- Impacto: elimina falhas silenciosas em shells strict e ambientes de CI sem garantia de bash

**A tensão central (para o seu post):**
"O script valida o ambiente, não o efeito. Accountability técnica é DevOps. Accountability regulatória é o que vem depois — quando a aplicação precisa provar que o titular conseguiu exercer o Art. 18." — essa é a posição da DPO2U. Você concorda? O que falta?

---

### ⚙️ Requisitos

- Familiaridade com deploy de contratos, scripts de CI/CD, ou sistemas de compliance
- (Opcional) Experiência com LGPD Art. 37 ou frameworks de accountability em sistemas distribuídos

---

**Este quest one-time está aberto por 7 dias a partir de 2026-06-25.**

---

#NightForce #AliitFellows #MidnightForDevs #ZealyQuest

---

*Post gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Compartilhe seu progresso nos comentários!*
