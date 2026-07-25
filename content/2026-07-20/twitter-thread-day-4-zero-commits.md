---
date: 2026-07-20
pillar: build-public
format: twitter-thread
source: git log/status (verified 2026-07-20) + docker ps (verified 2026-07-20) + scripts/image-digests.lock + content/2026-07-16/twitter-thread-commit-finally-landed.md
angle: honestidade sobre 4 dias sem commit novo — o commit da60821 fechou a parte 5 do arco em 16/07, mas nada mudou desde então
---

---TWEET 1/6---
Dia 4 sem commit novo #BuildInPublic

16/07: o commit da60821 finalmente entrou (11 dias atrasado, ver parte 5 do fio anterior). Achei que isso ia destravar o ritmo. Reconferi hoje, 20/07: zero commits desde então. Fio sobre o que mudou de verdade — e o que continua exatamente igual 🧵

---TWEET 2/6---
Direto na fonte, hoje: `git log` ainda mostra da60821 (16/07, 10:01 UTC) como último commit. `git status` só tem arquivo de conteúdo/zealy não versionado (HUMAN-ACTIONS.md, zealy-submit/ etc) — nenhum script ou contrato tocado em 4 dias.

---TWEET 3/6---
O que da60821 resolveu: proof-server checado por `/version` (não só liveness) + digest-pinning ligado nos 2 scripts de produção. O que não mudou nem um bit desde então: `scripts/image-digests.lock` — ainda só o cabeçalho, zero containers pinados de verdade.

---TWEET 4/6---
`docker ps` hoje: o proof-server "squatter" da porta 6300 (`dpo2u-midnight-self-funding-proof-server-1`, versão 8.0.3) segue no ar — "Up 4 weeks". Descoberto em 07/07, documentado publicamente 3x, nunca desligado nem substituído pelo meu próprio stack.

---TWEET 5/6---
`midnight-standalone-node` / `-indexer`: nenhum dos dois aparece no `docker ps -a` hoje. Fora do ar desde 01/05 — 80 dias. Sem esses containers rodando, `pin-image-digest.sh` não tem o que pinar: o gap de digest-pinning não é só falta de tempo, é falta de ambiente de pé.

---TWEET 6/6---
Métricas reais:
MRR: R$0 | Usuários: 0 | Deploys on-chain: 0
Commits desde 16/07: 0
Digest-pinning: 2/2 scripts prontos, 0/2 containers pinados
Standalone stack fora do ar: 80 dias (01/05 → 20/07)

Documentar o mesmo gap de novo é diferente de fechá-lo. Qual dos dois você faria primeiro?

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
