---
type: quest-email
template_version: "1.0"
quest_id: daily-001
date: 2026-06-25
generated_from: content/2026-06-25/twitter-thread-predeploycheck.md + linkedin-documentation-becomes-automation.md + podcast-prompt-predeploycheck-accountability.md
---

# Learning Check-in Post - Quest Zealy

---

**Quest ID:** daily-001
**Frequência:** Daily
**XP:** +30 XP
**Data:** 2026-06-25

---

## 📋 O que fazer

Postar um check-in de aprendizado diário sobre seu progresso construindo na Midnight Network.

**Tema de hoje:** Quando documentação de bugs vira automação de prevenção — e o que isso significa para accountability regulatória.

Em 25 de junho de 2026, a DPO2U deu o passo que separa projetos que crescem em fragilidade de projetos que crescem em robustez: transformou 7 bugs documentados em código.

O `pre-deploy-check.sh` é um script de 200 linhas que bloqueia qualquer deploy se qualquer uma das 5 categorias críticas falhar:

1. **Node.js ≥ 22.x** — versão mínima exigida pelo SDK
2. **compactc pinado em 0.29.0** — porque o 0.29 quebra silenciosamente o `assert()` sem parênteses (o bug do dia 24/06, exit 255 com mensagem que aponta para uma variável, não para o assert)
3. **.npmrc ausente** — o registry do Midnight não resolve com ele presente; uma transação pode confirmar on-chain enquanto o estado privado fica inacessível
4. **Build artifacts completos** — keys + contract + zkir para os 3 contratos (ConsentRegistry, DataAuditLog, DataSubjectRights)
5. **Infraestrutura Docker respondendo** — midnight-node :9944, indexer :8088, proof-server :6300

Exit 0: deploy liberado, comandos exatos exibidos. Exit 1: lista de falhas, referência ao WORKAROUND-GUIDE.

Ao mesmo tempo, o `compile-contracts.sh` recebeu um fix de portabilidade POSIX: `((count++))` → `count=$((count + 1))` — substituindo aritmética bash-específica que silencia falhas em ambientes strict e em CI.

Mas há uma tensão que vale explorar: o script valida infraestrutura. Não valida accountability regulatória. Exit 0 significa "o ambiente está pronto para receber um deploy". Não significa "o titular de dados pode exercer seu direito do Art. 18 da LGPD". Essa distinção — entre infraestrutura funcional e direito exercível — é exatamente o território onde sistemas como a DPO2U são construídos.

Use o momento do pre-deploy script como âncora para o seu check-in. Perguntas que podem ajudar:

- Você já teve um momento em que documentação de bugs parou de ser um arquivo e virou um bloqueio automático? O que disparou essa transição — um incidente, um prazo, uma decisão deliberada?
- Para sistemas de compliance: você acredita que um script de pre-deploy que valida infraestrutura satisfaz o Art. 37 da LGPD (accountability)? Ou accountability exige rastreabilidade de decisões sobre os dados do titular, não só ambiente técnico?
- O WORKAROUND-GUIDE.md da DPO2U documenta 8 bugs com mensagem de erro exata, causa raiz, fix e versões afetadas. Que tipo de artefato de rastreamento você mantém para comportamentos inesperados de ferramentas que você não controla?
- Portabilidade POSIX em scripts: você escreve bash-específico e testa só no seu ambiente, ou impõe compatibilidade POSIX desde o início? O que aconteceu quando o ambiente de CI foi diferente do seu local?

Pode ser um aprendizado técnico, uma reflexão sobre processo, uma pergunta genuína para a comunidade — o que importa é a reflexão honesta sobre o que está construindo.

## 🎯 O que entregar

1. Post no X (Twitter) com check-in de aprendizado
2. Post no LinkedIn (opcional — maior alcance para devs e profissionais de compliance)

## 🏷️ Hashtags sugeridas

#MidnightForDevs #NightForce #BuildInPublic #DPO2U #LGPD #ZKPrivacy #MidnightNetwork #CompactLang

## ✅ Validação

Ao completar esta quest, envie o link do post para validação.

**Método de Validação:**
- Manual: Enviar proof (link do tweet ou post) para revisão

---

## 💡 Contexto técnico para seu post

Referência real do dia 25/06 para ancorar seu check-in:

**O script — detalhes exatos:**
- Arquivo: `scripts/pre-deploy-check.sh` (novo, 200 linhas)
- Categorias validadas: Node.js, compactc versão, .npmrc ausência, build artifacts (3 contratos × keys + contract + zkir), Docker services (:9944, :8088, :6300)
- Exit codes: 0 = pronto para deploy | 1 = lista de falhas + referência ao WORKAROUND-GUIDE
- Suporte a redes: `--network standalone | preprod | preview`
- Origem de cada check: cada um é um bug já documentado — não abstrações preventivas, mas cicatrizes de depuração

**O fix POSIX — detalhes exatos:**
- Arquivo: `scripts/compile-contracts.sh` (modificado)
- Mudança: `((count++))` → `count=$((count + 1))`
- Motivo: bash-específico falha silenciosamente em shells strict (`/bin/sh`) e em CI que não garante bash
- Impacto: portabilidade para ambientes que não garantem bashisms no shebang

**Estado atual da suite:**
- 3 contratos compilando: ConsentRegistry ✅, DataAuditLog ✅, DataSubjectRights ✅
- 3 scripts de deploy hardened (todos os workarounds aplicados após revisão cruzada)
- 8 bugs de SDK documentados no WORKAROUND-GUIDE.md — agora todos codificados como checks
- pre-deploy-check.sh: portão de qualidade antes de qualquer deploy real
- MRR: R$0 — primeiro standalone deploy iminente (amanhã: `docker-compose up -d`, 3 contratos, `--network standalone`)

**A distinção que fica:**
- "Exit 0" ≠ "Art. 37 satisfeito"
- A distância entre o ambiente estar pronto (saída do script) e o titular de dados poder exercer seu Art. 18 (saída regulatória) é o território real do DPO2U.
- O script é necessário. Não é suficiente. Essa honestidade é parte da accountability.

---

**Boa sorte!** 🎮

Esta quest é parte do programa Night Force + Aliit Fellows.

Complete todas as quests para ganhar XP, subir no leaderboard e desbloquear achievements!

*E-mail gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Data: 2026-06-25*
