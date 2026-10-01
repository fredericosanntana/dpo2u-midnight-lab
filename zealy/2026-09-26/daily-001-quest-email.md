---
type: quest-email
template_version: "1.0"
quest_id: daily-001
yaml_quest: adv-05
date: 2026-09-26
content_new_today: true
generated_from: content/2026-09-26/twitter-thread-facade-init-nao-existe-no-1-0-0.md +
  content/2026-09-26/article-sdk-debugging-diary-facade-init-vs-1-0-0.md
---

# Publish a Deep Technical Thread — Quest Zealy

---

**Quest ID:** adv-05 (alias interno: daily-001 — o YAML v2.0 espelhado não tem `daily-001`)
**Frequência:** Daily
**XP:** +120 XP
**Data:** 2026-09-26

---

## ⚠️ Estado do conteúdo (leia primeiro)

- **Hoje (26/09) há conteúdo novo de verdade**, o primeiro desde 15/09: uma thread de
  7 tweets e um artigo em inglês, ambos em `content/2026-09-26/` (commit `b725e07`),
  a partir do fix `6c9f583` da fase dev. Esta quest usa a thread como base.
- **Anúncio gerado:** `zealy/2026-09-26/quest-announcement-edu02-facade-init-vs-1-0-0.md`
  (quest `edu-02`, "Publish a technical blog/tutorial", 250 XP, a partir do artigo).
  Usei uma quest que existe no YAML, não um `adhoc-NNN` novo.
- **Não gerado hoje:** leaderboard semanal (hoje é sábado; só domingo, e não há export
  de XP do Zealy nos insumos deste ciclo).
- **Pendente — nada commitado:** `zealy/2026-09-25/daily-001-quest-email.md` está
  escrito e **não commitado** (o ciclo de ontem terminou em `Reached max turns (12)`
  logo após gravá-lo). Tentei commitar 25/09 + 26/09 e dar push neste ciclo; o
  classificador de permissão negou (`Out-of-Place Publication`). Os arquivos de 25 e
  26/09 estão **só em disco** (`git status` → `?? zealy/2026-09-25/`, `?? zealy/2026-09-26/`).
  Commit/push ficam para você autorizar. Não sei se o e-mail de 25/09 chegou a ser
  enviado; não reenviei.

---

## 📋 O que fazer

Publicar uma thread técnica profunda sobre Midnight Network / DPO2U. Ângulo
proposto: **o typecheck que ninguém rodava** — seis scripts chamavam
`WalletFacade.init()` (API da 2.0.0) contra o `wallet-sdk-facade` 1.0.0 instalado,
onde `init` não existe. Ficou 170 dias invisível porque o repo não tinha nenhum
comando que perguntasse ao compilador.

Números medidos em 2026-09-26 ~17:05 UTC (use os seus, medidos no seu dia — não copie estes):

```
git log -S'WalletFacade.init' --reverse --format='%h %ad' --date=short -- scripts | head -1
  = 2b277c4 2026-04-09   (1º uso; até o fix 6c9f583, 2026-09-26 10:08 UTC = 170 dias)
git -C /root/dpo2u-midnight-agent-dna log --format='%h %ad' -- knowledge/SDK-VERSION-MATRIX.md
  = a61d953 2026-04-08   (1 commit, 1 dia ANTES do 1º uso — a matriz nunca mudou)
grep -n '"typecheck"' package.json          = 11:  "typecheck": "tsc --noEmit -p tsconfig.json"
grep -rn 'WalletFacade.init' scripts/ | wc -l = 1 (o comentário do helper scripts/lib/wallet-facade.ts)
tsc --noEmit em worktree de HEAD~1 = 17 erros (6 TS2339 + 7 TS2345 + 4 TS2769)  [medido no ciclo de conteúdo, 14:15 UTC]
npm run typecheck (com o fix)      = 11 erros (7 TS2345 + 4 TS2769) — os 11 são pré-existentes, não corrigidos
```

Framework para a sua thread (siga a estrutura da DPO2U ou crie a sua):

**Tweet 1:** Seu código chama uma API que o SDK instalado não tem — e ninguém viu por
meses. O que, no seu repo, é o equivalente ao comando que pergunta ao compilador?
Existe um script `typecheck`? Ele roda antes do deploy?
**Tweet 2:** Mostre o erro literal (aqui: `TS2339: Property 'init' does not exist on
type 'typeof WalletFacade'`), quantos sites, e o comando que o produz. Erro parafraseado
não reproduz.
**Tweet 3:** A documentação já avisava (matriz de versões: preprod = 1.0.0, "NOT 2.0.0";
guia de workarounds, Bug 4). O arquivo tinha um único commit, anterior ao código
errado. Quando a documentação está certa e o código errado, o que falta é o
*enforcement* — qual é o seu?
**Tweet 4:** Um "confirmado" no log sem o comando que o gerou é opinião. Quatro logs de
junho anotam "confirmado: facade 2.0.0" contra uma matriz que não diz isso para preprod.
Hipótese (não fato): leram a tabela PREVIEW como se fosse preprod. Seus logs citam o
comando ou só o veredito?
**Tweet 5:** O conserto vale por ser um arquivo, não seis: a construção da carteira
mora num helper. Se a API virar de novo na próxima versão, a troca é num lugar só.
**Tweet 6:** O limite honesto: nada rodou contra node, indexer ou proof-server. É
evidência de tipos. Você separa "os tipos batem" de "o deploy funciona" no seu relato?
**Tweet 7:** Próximo passo e pergunta aberta: zerar os 11 erros restantes e ligar o
typecheck no pre-deploy. Que check barato já te pegou drift de versão?

---

## 🎯 O que entregar

1. Thread publicada no X (mínimo 4 tweets, linkados em sequência)
2. Opcional: post equivalente no LinkedIn
3. Link da thread para validação

---

## 🏷️ Hashtags sugeridas

#BuildInPublic #DPO2U #MidnightForDevs #NightForce #AliitFellows

---

## ✅ Validação

Ao completar esta quest, envie o link de prova para validação.

**Método de Validação:**
- Manual: Enviar link da thread publicada para revisão

---

## 🔴 Aviso operacional — só para o shareholder (remover se esta quest for publicada)

1. **Nó standalone parado há 38 dias, sem diagnóstico.** Reconferi hoje:
   `curl -s -d '{"id":1,"jsonrpc":"2.0","method":"chain_getHeader"}' -H 'Content-Type: application/json' http://localhost:9944`
   → `"number":"0x544ff"` (= 345343, inalterado desde 25/09 e desde 2026-08-19);
   `grep -n 'OK: chain avancando' /var/log/midnight-health/health.log | tail -1` →
   `15210:2026-08-19 20:04:02 OK: chain avancando (block 344172 -> 345343)`;
   `docker ps` → `midnight-standalone-node Up 5 weeks (healthy)`. Ou seja: o
   container está `Up (healthy)` e a chain não avança — roda e não entrega.
   Nada foi reiniciado; reiniciar/recriar o volume apaga o estado do devnet local.
   **Decisão sua.** Efeito prático: o artigo de hoje diz que "rodar o script" não é um
   passo de uma linha, porque não há rede local viva para testar.
2. **O alarme não chega por e-mail.** `scripts/midnight-health-check.sh:29` ainda chama
   `"$SEND_EMAIL" "$SHAREHOLDER" "$subject"` (posicional); o `send-email.sh` (mtime
   2026-06-16) só aceita `--from/--to/--subject/--body` e o `2>/dev/null || true`
   engole o `Unknown arg`. Este aviso segue pelo caminho que funciona. Não corrigi:
   sem desenho de deduplicação o health-check passaria a mandar um e-mail por execução.
3. **Pendências inalteradas:** `grep -c MIDNIGHT_AGENT_MAX_TURNS /etc/cron.d/dpo2u-midnight-agent`
   = 0 (mtime 2026-08-17, 40 dias); `zealy.log` com 5 ocorrências de
   `Reached max turns` (a mais recente em 25/09 17:07); `git rev-list --count main..HEAD`
   = 58 commits (branch `fix/consent-registry-assert-parens`).
4. **Destinatário não confirmado:** usei `fredericosanntana@gmail.com` (única fonte no
   repo: `scripts/midnight-health-check.sh:9`), que difere do e-mail da sessão.

---

**Boa sorte!** 🎮

Esta quest é parte do programa Night Force + Aliit Fellows.

*E-mail gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Data: 2026-09-26*
