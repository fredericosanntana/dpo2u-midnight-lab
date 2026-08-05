# 🙋 HUMAN-ACTIONS — Zealy Midnight (o que só você pode finalizar)

> Gerado 2026-06-18. Acompanha `ZEALY-LEVANTAMENTO.md` (status por quest).
> Regra: nada aqui foi inventado — onde a URL exata não é conhecida (Zealy/board/partner), está marcado **`<confirmar>`**.

---

## ✅ LLM = Claude (configurado, sem Gemini)

`LLM_PROVIDER=claude-cli` em `.env` e `.env.content`; todas as referências a Gemini foram removidas do pipeline. A geração usa o `/root/.local/bin/claude` local — **testado e funcionando** (5 peças geradas via Claude). O binário `claude` exige **root**, então geração/review com LLM rodam como root (a review cron foi movida do crontab da lionel para `/etc/cron.d/dpo2u-content-reviewer`). `chairman_voice` (TTS) e publicação/email seguem como `lionel`.

**Geração/review manual (funciona já):**
```bash
cd /root/DPO2U/03-Ferramentas/Scripts/social
/root/DPO2U/03-Ferramentas/leann-env/.venv/bin/python3 zk_midnight_batch.py            # gera 5 peças taggeadas
/root/DPO2U/03-Ferramentas/leann-env/.venv/bin/python3 content_reviewer.py --general --queue   # revisa+aprova
```

> Tradeoff: review agora roda como root (não mais na usuária confinada `lionel`), porque o binário claude não é executável por ela. Para manter a lionel 100% confinada seria preciso um endpoint OpenAI-compat (ex.: Gemini) — você optou por Claude.

## ⚠️ OmniVoice — token (cosmético; já há fallback)

OmniVoice em 401 (host de pé). Edge-TTS já é o fallback e gera áudio (testado, 26KB). Para voltar à voz clonada do Chairman: pôr `OMNIVOICE_TOKEN=<novo>` em `.env.content` (o código já lê via `os.getenv`). Sem isso, vídeos saem com voz Edge-TTS — aceitável.

---

## ✅ SEÇÃO A — Pronto pra SUBMETER agora (12 quests · ~1530 XP)

Para cada uma: poste/abra onde indicado e cole o link no card do Zealy. Os textos abaixo são rascunhos prontos.

### A1 · Identify Dormant Midnight dApps — 250 XP `READY`
- **Evidência:** `/root/midnight-awesome-dapps-fork/dormant_projects/README.md` (14 dApps catalogados).
- **Ação:** garantir que o `dormant_projects/README.md` está no fork público no GitHub e colar o link no Zealy.
- **Blurb Zealy:** "Catalogued 14 dormant Midnight dApps across governance, identity, gaming, DeFi and starter templates, each with repo link and a 'proof-of-life' status, in `dormant_projects/`. PR/list: <link>."

### A2 · Submit a PR to docs/tutorials — 200 XP `DONE`
- **Evidência:** PRs #75/#82/#102/#117 merjados em `midnight-awesome-dapps`. Cole os links dos PRs no Zealy (já aceitos).

### A3 · Bug Report/Fix (SDK/tooling) — 200 XP `READY`
- **Evidência:** `/root/DPO2U/docs-site/blog/_archive/2026-03-04-midnight-kitties-wallet-incompatibility.md` + bugs #597/#598.
- **Ação:** confirmar que os issues #597/#598 estão no tracker oficial; colar links. Se ainda forem só post de blog, abrir o issue (corpo já no post).

### A4 · Publish a technical blog/tutorial — 250 XP `READY`
- **Evidência:** `_archive/2026-03-05-midnight-developer-experience-report.md` (+7 posts Midnight).
- **Ação:** publicar 1 no canal público (blog/Mirror/Substack) e colar link.

### A5 · Write a new Midnight Doc/Tutorial — 100 XP `READY`
- **Evidência:** `dpo2u-landing-page/docs/01..03` + `dpo2u-midnight-self-funding/TUTORIAL.md`. Colar a URL pública dos docs.

### A6 · Publish Technical Blog Post — 100 XP `READY`
- **Evidência:** `_archive` (8 posts Midnight). Mesmo fluxo de A4, post distinto.

### A7 · Publish a Deep Technical Thread — 120 XP `READY`
- **Evidência:** `dpo2u-midnight-lab/content/2026-06-17/twitter-thread-data-audit-log.md`.
- **Ação:** postar a thread no X (conteúdo pronto) e colar link.

### A8 · Technical Thread on X/LinkedIn — XP `<confirmar>` `READY`
- **Evidência:** threads em `dpo2u-midnight-lab/content/`. Postar outra thread (DataSubjectRights) e colar link.

### A9 · Publish a Lightweight Technical Post — 80 XP `READY`
- **Evidência:** posts LinkedIn em `dpo2u-midnight-lab/content/`. Postar 1 e colar link.

### A10 · Translate/Localize Technical Documentation — 100 XP `READY`
- **Evidência:** `dpo2u-midnight-self-funding/TUTORIAL.md` (PT-BR). Abrir PR de tradução PT-BR de uma doc oficial (base pronta).

### A11 · Write a Compact Contract (Edda) — 100 XP `READY`
- **Evidência:** `dpo2u-midnight-lab/contracts/*.compact` (3) + `dpo2u-midnight-self-funding/compact` (9). Colar link do repo.

### A12 · Learning Check-in Post — 30 XP `READY`
- **Evidência:** check-ins diários em `dpo2u-midnight-lab/zealy/`. Postar o do dia no X/LinkedIn e colar link.

---

## 🔧 SEÇÃO B — One-click: artefato pronto, você só abre o PR / posta

### B1 · Technical PR (Protocol/SDK/Examples) — 400 XP `PARTIAL`
- Repo pronto: `/root/dpo2u-midnight-self-funding` (9 contratos, 53 testes).
- **Comando (após escolher o repo upstream alvo `<confirmar>`):**
  ```bash
  cd /root/dpo2u-midnight-self-funding
  gh pr create --repo <upstream-org/repo> --title "feat: DPO2U LGPD Compact contracts + deploy console" \
    --body-file /root/dpo2u-midnight-lab/PR-BODY-technical.md
  ```

### B2 · Ship a dapp into example repo — 400 XP `PARTIAL`
- `deploy-console` (browser, Lace) + `midnight-kitties`. Mesmo fluxo de B1 contra o repo de exemplos `<confirmar>`.

### B3 · Ship a Usable DApp (Edda) — 150 XP `PARTIAL`
- `dpo2u-midnight-self-funding/deploy-console` já é um dApp utilizável. Colar link do repo/deploy.

### B4 · Review Someone Else's PR — 120 XP / B5 · Help resolve dev issue — 150 XP / B6 · Answer technical question — 150 XP
- **`PARTIAL`/`TODO`** — assim que o LLM voltar (Bloqueio #1), o pipeline rascunha a review/resposta; você cola no GitHub/Discord/SO. Sem LLM, posso rascunhar manualmente sob demanda.

### B7 · Developer Pulse Form — 50 XP
- Form `<confirmar URL>`. Respostas sugeridas (DPO2U): stack compactc 0.31.0 / midnight-js 4.1.1 / ledger-v8; 9 contratos Compact; maior atrito = sync de histórico shielded da wallet-sdk (OOM em preprod); pedido = harness de deploy preprod estável.

### B8 · Produce Technical/Demo Video — 150–300 XP `PARTIAL`
- Pipeline: HyperFrames (`07-Content/hyperframes-dpo2u`) + narração `chairman_voice.py` (Edge-TTS funciona). Roteiro precisa do LLM ou rascunho manual; render e voz já funcionam.

---

## 🔑 SEÇÃO C — Wallet / Social / Presença (só humano)

### Módulo Midnames (~230 XP no total)
1. **Explore Midnames** (5) — visitar `<URL Midnames>`.
2. **Claim .night domain on Preprod** (10) — assinar com sua wallet Midnight (Lace) no preprod.
3. **Configure Domain Profile** (10) — após o claim.
4. **Explore Midnames SDK** (5) — abrir os docs da SDK.
5. **Query Domain Data** (50) — rodar a query da SDK (precisa do domínio do passo 2; posso scriptar quando você tiver o domínio).
6. **Build Midnames-Powered dApp** (150) — scaffold eu preparo; deploy precisa da sua wallet.

### Módulo 1AM (~355 XP)
- Follow 1AM no X (5) · Create 1AM Wallet (30) · Visit Proof Station (5) · No-Code Builder (100) · List dApp (50) → **todos exigem você** (carteira/conta/social). Explore 1AM (10) e Explorer (5) eu documento; o dApp 1AM (150) eu scaffold.

### Módulo Edda Labs (~310 XP)
- Follow X&LinkedIn (10) · Follow Midnight Sessions YouTube (10) · Play Midnight Album (30) · Star Edda Repos (XP `<confirmar>`) → **só você** (social/star). Explore (10), Write Compact Contract (100, **já pronto** — ver A11), Ship Usable DApp (150, ver B3), Extend Edda Resource (XP `<confirmar>`) eu preparo.

### Presença ao vivo (Advocate + Community + Educator) — ~5210 XP `BLOCKED-HUMAN`
Palestras (conf/meetup), podcasts/X Spaces (host/guest), booth, organizar/julgar hackathons, fireside, mentoria, workshops, partner intro, attend event, partner with fellow. Pipeline só rastreia no levantamento; quando agendar, eu preparo slides/abstract/thread de apoio.

---

## 📌 Ordem sugerida de execução
1. LLM já é Claude (configurado) → geração contínua disponível.
2. Submeter as **12 da Seção A** (~1530 XP) — já têm evidência; é só postar + colar link.
3. Varrer **Módulos** (Midnames/1AM/Edda explores+follows+claims) — XP baixo mas rápido, e destrava os "Build *-Powered dApp".
4. Abrir os **PRs da Seção B** (escolher repos upstream alvo).
5. Agendar a **presença ao vivo** conforme calendário.

_Regenere `ZEALY-LEVANTAMENTO.md` após cada submissão: `python3 /root/DPO2U/07-Content/zealy/zealy_pipeline.py levantamento`._
