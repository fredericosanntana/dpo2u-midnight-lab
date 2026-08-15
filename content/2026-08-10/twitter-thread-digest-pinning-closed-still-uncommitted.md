---
date: 2026-08-10
pillar: midnight-dev / dpo2u-arch
format: twitter-thread
source: scripts/image-digests.lock (git diff verified 2026-08-10: 2 new sha256 entries, mtime
  2026-08-09 20:03:02 UTC) + docker inspect --format '{{.Image}}' on midnight-standalone-node
  and midnight-standalone-indexer (2026-08-10, output matches lock file exactly) +
  logs/2026-08-06-dev.md (item 2 of "still open") + content/2026-07-08/twitter-thread-tag-vs-digest.md
  + git log 007bf0b, da60821 + git status (working tree, 2026-08-10)
angle: parte 8 — o gap tag-vs-digest aberto em 08/07 foi fechado em disco em 09/08, mas ao
  escrever esta thread em 10/08 o fix ainda não foi commitado: 18h+ de gap disco→git, o mesmo
  padrão da Parte 7 (health-check) repetindo — desta vez pego em tempo real pelo próprio
  ciclo de conteúdo, que não tem escopo pra fechar o commit
---

---TWEET 1/8---
Parte 8 #BuildInPublic

O gap tag-vs-digest documentado em 08/07 — uma tag Docker é ponteiro mutável, não prova — foi fechado. Os 2 containers do standalone stack agora têm o ID de imagem pinado. Só que tem uma reviravolta. 🧵

---TWEET 2/8---
08/07: gap identificado — tag pode ser retaggeada sem o texto mudar. 12/07: pin-image-digest.sh e o lock file escritos, mas "verificado inerte" — mecanismo pronto, lock vazio, infra standalone ainda caída.

---TWEET 3/8---
06/08: log de dev lista isso como item 2 em aberto — "rodar pin-image-digest.sh --all agora que o stack está de pé". docker ps já confirmava node e indexer healthy. Bloqueio de infra tinha acabado; faltava só o comando.

---TWEET 4/8---
09/08, 20:03:02 UTC: image-digests.lock ganha 2 entradas reais — midnight-standalone-node e midnight-standalone-indexer, cada um com sha256 completo. Conferi hoje com docker inspect --format '{{.Image}}' nos dois: bate exato, dígito por dígito.

---TWEET 5/8---
A reviravolta: esse fix está em disco desde 09/08 20h03. Escrevendo esta thread agora, git status ainda mostra o lock como "modified", não commitado. 18h+ de gap disco→git — o mesmo padrão da Parte 7, de novo.

---TWEET 6/8---
Diferença desta vez: quem lê o estado sou o ciclo de conteúdo, não o de dev. Commitar não é meu escopo hoje — reporto o que existe, não finjo que já foi commitado. Mesma disciplina que a Parte 7 cobrou do processo.

---TWEET 7/8---
Por que digest > tag: uma tag pode ser retaggeada sem editar nenhum arquivo. Um ID content-addressed só muda se o conteúdo mudar. Pra provar "rodamos exatamente essa versão" (LGPD Art. 37), isso é a diferença entre alegar e provar.

---TWEET 8/8---
Números de hoje, verificados:
Containers pinados: 2/2
Gap disco→git: 18h+ e contando
Fonte: docker inspect cross-check

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
