---
type: quest-email
template_version: "1.0"
quest_id: daily-001
yaml_quest: adv-05
date: 2026-10-02
content_new_today: true
generated_from: content/2026-10-02/twitter-thread-compactc-031-runtime-mismatch.md + content/2026-10-02/linkedin-symlink-global-compilador.md
---

# Publish a Deep Technical Thread — Quest Zealy

---

**Quest ID:** adv-05 (alias interno: daily-001)
**Frequência:** Daily
**XP:** +120 XP
**Data:** 2026-10-02

---

## ✅ Estado do conteúdo

- **Há conteúdo novo hoje:** `content/2026-10-02/` (thread X + post LinkedIn), sobre o symlink global do compactc.
- **Não gerado:** leaderboard (hoje é sexta; resumo aos domingos) e anúncio de quest (sem tópico novo além da thread diária).

## 📋 O que fazer

Publicar uma thread técnica profunda sobre trabalho real da DPO2U no stack Midnight.
Ângulo do dia: **compilar sem erro não significa que o artefato roda no runtime que você tem**.

Fatos medidos neste ciclo (meça os seus, não copie):

```
grep checkRuntimeVersion build/{ConsentRegistry,DataAuditLog,DataSubjectRights}/contract/index.js -> '0.14.0' nos 3
deploy / import em runtime -> NÃO executado (só leitura de artefatos)
mudanças em scripts/ -> ainda não commitadas (working tree)
```

Framework (baseado na thread do dia):

**Tweet 1:** Todo deploy script morria no import com "Version mismatch"; a compilação passava limpa.
**Tweet 2:** O symlink global do compactc apontava para 0.31.0, que gera checkRuntimeVersion('0.16.0'); o package.json fixa runtime 0.14.0.
**Tweet 3:** Fix: compile-contracts.sh chama o binário versionado (0.29.0, da matriz do preprod), não o PATH.
**Tweet 4:** Evidência: 3 artefatos com checkRuntimeVersion('0.14.0') = runtime instalado. Limite: nenhum deploy rodou.
**Tweet 5:** `compactc --version` via PATH responde sobre o PATH. Aponte o binário exato.

---

## 🎯 O que entregar

1. Thread publicada no X (mínimo 4 tweets, em sequência)
2. Opcional: post equivalente no LinkedIn
3. Link da thread para validação

---

## 🏷️ Hashtags sugeridas

#BuildInPublic #DPO2U #MidnightForDevs #NightForce #AliitFellows

---

## ✅ Validação

**Método de Validação:**
- Manual: Enviar link da thread publicada para revisão

---

## 🔴 Aviso operacional — só para o shareholder (remover se a quest for publicada)

1. **Nó standalone continua parado.** `chain_getHeader` em `localhost:9944` → `"number":"0x544ff"` (345343, igual a 25/09–30/09); `docker ps` → `midnight-standalone-node Up 6 weeks (healthy)`. Roda e não entrega. Nada reiniciado.
2. **Container 8.0.3 na :6300** (`dpo2u-midnight-self-funding-proof-server-1`, Up 3 months) segue ocupando a porta padrão.
3. **Pendência no código:** o conteúdo do dia declara que a checagem runtime-vs-artefato em `pre-deploy-check.sh` está dentro do ramo "compactc ausente"; não verifiquei nem corrigi neste ciclo. Alterações em `scripts/` e `build/` seguem sem commit.
4. **Branch:** `git rev-list --count main..HEAD` = 64 commits em `fix/consent-registry-assert-parens`, sem PR.
5. Não há `logs/2026-10-02-dev.md`; o último log é de 30/09.

---

**Boa sorte!** 🎮

*E-mail gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Data: 2026-10-02*
