---
date: 2026-07-12
pillar: midnight-dev / upstream
format: twitter-thread
source: scripts/pin-image-digest.sh (new, mtime 2026-07-11) + scripts/image-digests.lock (new, mtime 2026-07-11, 0 entries) + scripts/pre-deploy-check.sh (diff, mtime 2026-07-12) + scripts/midnight-health-check.sh (unchanged since 2026-07-07) + docker ps (verified 2026-07-12) + content/2026-07-08/twitter-thread-tag-vs-digest.md
angle: parte 4 da mesma história — o fix de digest-pinning prometido em 08/07 foi escrito, mas está inerte (lock file vazio, nada pra pinar, e só existe em 1 dos 2 scripts que precisam dele)
---

---TWEET 1/7---
Parte 4 da mesma história #BuildInPublic

03/07: liveness ≠ version (hipotético)
07/07: confirmado — container de outro projeto meu, na porta 6300
08/07: achei o furo do próprio fix — tag Docker é ponteiro mutável, não digest
12/07: escrevi o fix que prometi. E ele não está fazendo nada ainda. 🧵

---TWEET 2/7---
Ontem (11/07) escrevi `scripts/pin-image-digest.sh`: grava o Image ID content-addressed de um container (`docker inspect --format '{{.Image}}'`) em `scripts/image-digests.lock`, pra comparar depois contra a tag mutável.

Hoje (12/07) liguei isso no `pre-deploy-check.sh`.

---TWEET 3/7---
`check_docker_image_version()` agora: se o container tem entrada no lock file, compara Image ID (imutável, o gap de 08/07 fechado). Se não tem, cai no fallback de sempre — tag — e avisa explicitamente: "tag match only, not digest-pinned".

Sem mentir sobre a força da checagem.

---TWEET 4/7---
Problema: `scripts/image-digests.lock` existe desde ontem e tem ZERO entradas. Nunca rodei o comando que de fato pina um container.

Resultado hoje: pra todo mundo, o fix mais forte cai no fallback mais fraco. Código escrito ≠ verificação ativa.

---TWEET 5/7---
Pior: nem dá pra rodar `pin-image-digest.sh --all` agora. `docker ps` mostra só o de sempre — `dpo2u-midnight-self-funding-proof-server-1`, versão 8.0.3, no ar há 3 semanas.

`midnight-standalone-node` e `-indexer` não existem no host. Down desde 01/05. Nada pra pinar.

---TWEET 6/7---
E o script que roda de cron de verdade — `midnight-health-check.sh`, o que manda email quando algo quebra — nem tem essa lógica ainda. Só `pre-deploy-check.sh` (o gate manual, rodado à mão antes de deploy) recebeu o fix hoje.

O check mais forte protege o script que roda menos.

---TWEET 7/7---
Métricas reais de hoje:
MRR: R$0 | Usuários: 0 | Deploys on-chain: 0
Contratos: 3/3 compilando | Digest-pinning implementado: 1/2 scripts | Containers pinados: 0/2 | Nada disso commitado ainda

Código correto e sem efeito não é a mesma coisa que problema resolvido.

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
