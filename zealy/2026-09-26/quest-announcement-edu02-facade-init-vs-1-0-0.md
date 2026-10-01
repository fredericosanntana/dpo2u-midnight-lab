---
type: quest-announcement
template_version: "1.0"
quest_id: edu-02
yaml_track: educator
date: 2026-09-26
generated_from: content/2026-09-26/article-sdk-debugging-diary-facade-init-vs-1-0-0.md +
  content/2026-09-26/twitter-thread-facade-init-nao-existe-no-1-0-0.md +
  git commit 6c9f583
---

# Publish a technical blog/tutorial 🎯

---

**Quest ID:** `edu-02`
**Frequência:** Daily
**XP:** +250 XP
**Status:** 🟢 **ABERTO**

---

## 📋 Descrição

Publicar blog/tutorial técnico sobre Midnight.

**Caso real de hoje (DPO2U):** seis scripts de deploy e interação do nosso lab
chamavam `WalletFacade.init()` — API da linha 2.0.0 do
`@midnight-ntwrk/wallet-sdk-facade` — mas o SDK instalado é o 1.0.0, onde `init`
não existe. O erro só aparece se alguém perguntar ao compilador, e o repo não tinha
nenhum comando que perguntasse. A primeira rodada de `tsc --noEmit` deu 17 erros;
seis eram este, um por script. O conserto cabe em um arquivo
(`scripts/lib/wallet-facade.ts`) e o resultado caiu de 17 para 11 erros de tipo.

O que o relato **não** prova, e diz isso no próprio texto: nada rodou contra node,
indexer ou proof-server. É evidência de tipos, não de deploy.

---

## 🎯 O que fazer

Escreva um post técnico sobre um bug real que você achou no seu stack Midnight, no
formato de diário de depuração:

1. **Sintoma** — ambiente com versões e o erro literal (não parafraseado)
2. **Investigação** — cada hipótese com o comando que a testou e o resultado,
   inclusive as que você rejeitou
3. **Causa raiz** — o que estava errado e por que ninguém viu antes
4. **Correção** — o diff ou o trecho relevante
5. **O que isto não prova** — o limite honesto da sua evidência

Uma correção só de tipos é uma boa correção, desde que o texto diga que é só de
tipos.

## 🏷️ Tags

`#blog` · `#tutorial`

## 🔗 Hashtags sugeridos

#BuildInPublic · #MidnightForDevs · #DPO2U · #NightForce · #AliitFellows

## ✅ Validação

**Método:** `manual`
Após completar, responda este post com o link do seu trabalho para validação.

---

### 💡 Dicas

- **Check diário:** Esta quest pode ser completada uma vez por dia
- **Reset às 00:00 UTC**
- Comece pelo comando que reproduz o erro. Um relato que só diz "confirmado" sem o
  comando é opinião; com o comando, é evidência.

---

#NightForce #AliitFellows #MidnightForDevs #ZealyQuest

---

*Post gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Compartilhe seu progresso nos comentários!*
