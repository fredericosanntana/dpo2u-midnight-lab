---
date: 2026-08-13
pillar: compliance-protocol / dpo2u-arch
format: linkedin-post
source: scripts/check-version-consistency.sh (mtime 2026-08-13 10:03:38 UTC; live-run verified
  2026-08-13 14:01:47 UTC: 4/4 OK, exit 0) + git status / git log --all (untracked, no history) +
  scripts/image-digests.lock (mtime 2026-08-09 20:03:02 UTC, still "modified" 2026-08-13 — ~90h
  gap) + zealy/2026-08-08/quest-announcement-adhoc029-detector-had-its-own-drift.md +
  content/2026-08-07, content/2026-08-10 (Parts 7 and 8) + logs/2026-08-06-dev.md
angle: um teste que passa e responde a pergunta em aberto da Parte 7 — mas chega sem commit e sem
  log, repetindo o próprio padrão que a série documenta desde 07/08
---

Um script que passa em todos os testes já é prova de alguma coisa?

Hoje, 13/08, rodei ao vivo o scripts/check-version-consistency.sh do nosso lab Midnight. Ele existe pra responder uma pergunta que ficou em aberto há 5 dias, feita na Parte 7 desta mesma série (adhoc-029): vale a pena testar se uma constante de versão — duplicada em docker-compose.yml, pre-deploy-check.sh, midnight-health-check.sh e compile-contracts.sh — nunca mais sai de sincronia sem ninguém perceber? Resultado: 4 de 4 constantes consistentes. NODE_VERSION, INDEXER_VERSION, PROOF_SERVER_VERSION e COMPACT_VERSION batem em todos os arquivos que carregam cada uma.

Isso resolve exatamente o problema que gerou 115 alertas falsos pro e-mail do shareholder entre 26/07 e 05/08 — quando um terceiro arquivo ficou pra trás numa correção de versão, e nada comparava os quatro arquivos entre si pra pegar isso automaticamente.

Só que o teste em si chegou do jeito que foi feito pra evitar: gravado em disco às 10h03 de hoje, sem commit, sem entrada em logs/. E o outro artefato desta mesma história — image-digests.lock, que a Parte 8 registrou como "18h+ e contando" — está contando mesmo: passou de 90 horas modificado, sem commitar.

O que isso me ensina: um teste que passa localmente não é evidência de compliance — é evidência de intenção. Pra LGPD Art. 37, SOC 2 ou ISO 27001, o que vira prova auditável é o commit, com timestamp e autor no controle de versão — não um terminal verde na minha tela.

Estado real de hoje:
- Teste escrito: sim, e passa 4/4
- Commitado: não
- Registrado em log de dev: não
- Gap disco→git do lock anterior: 90h+ e contando
- Pergunta de 08/08: respondida em 5 dias

Meu processo de conteúdo consegue ler e reportar esse estado — mas fechar o commit não é escopo dele. Isso fica pro próximo ciclo de dev.

Você mede o intervalo entre "funciona no meu terminal" e "está registrado de forma auditável" no seu próprio pipeline? Ou isso só aparece quando alguém pergunta?

#BuildInPublic #DPO2U #MidnightForDevs #LGPD #DevOps
