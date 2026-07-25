---
date: 2026-07-08
pillar: compliance-protocol / thought-leadership
format: linkedin-post
source: content/2026-07-03/twitter-thread-proof-server-version-drift.md + content/2026-07-07/twitter-thread-squatter-confirmed.md + scripts/pre-deploy-check.sh (diff) + scripts/midnight-health-check.sh (diff)
angle: um health check que só testa liveness pode invalidar retroativamente o registro de auditoria que ele alimenta
---

Há cinco dias, um script meu passava em "tudo verde" enquanto testava o serviço errado.

Em 3 de julho escrevi sobre um ponto cego encontrado no meu próprio `pre-deploy-check.sh`: o script confirmava que havia um proof-server respondendo na porta 6300, mas nunca confirmava qual proof-server. `curl /health` retorna "ok" de qualquer container que escute ali — não importa o projeto, não importa a versão do toolchain criptográfico por trás.

Em 7 de julho apliquei a mesma correção no script que roda de verdade em produção, via cron, e manda email pra mim quando algo quebra: `midnight-health-check.sh`. Rodei `docker ps --filter publish=6300` antes de aplicar o fix, só por precaução. O que respondia na porta não era o meu stack. Era o proof-server de outro projeto meu — `dpo2u-midnight-self-funding`, versão 8.0.3 — ativo há duas semanas sem que o monitoramento notasse.

Duas semanas de "OK" no log. Duas semanas em que, se alguém tivesse perguntado "seu pipeline ZK está saudável?", a resposta documentada teria sido sim — com o toolchain errado por trás.

Isso não é uma falha de criptografia. É uma falha de identidade. E é exatamente o tipo de falha que o Art. 37 da LGPD deveria impedir.

O artigo exige que o controlador mantenha registro das operações de tratamento de dados pessoais. A leitura comum é sobre *existência* do registro — ter um log, ter uma política, ter um checklist assinado. Mas um registro que existe e está errado é pior do que a ausência de registro: ele produz falsa confiança. Um auditor que aceita um "OK" gerado por um teste de liveness está confiando em um proxy que nunca foi desenhado pra provar identidade — só pra provar pulso.

O fix que escrevi troca liveness por identidade sempre que possível. `check_proof_server()` agora compara o `/version` retornado pelo processo — um dado que só o binário certo, rodando agora, pode produzir — contra a versão esperada (7.0.0). Pra node e indexer, que não expõem `/version`, uso a tag da imagem Docker via `docker inspect` como proxy de identidade.

E aqui está a parte que prefiro admitir a esconder: tag de imagem Docker é um ponteiro mutável, não um hash de conteúdo. Alguém pode reapontar a tag "0.21.0" pra outra imagem sem que meu check perceba, porque comparo string, não digest sha256. Descobri isso escrevendo o fix, documentei publicamente hoje, e ainda não corrigi. O gap está anotado, não escondido — porque um gap anotado é auditável, e um gap escondido é exatamente o problema que este post inteiro está descrevendo.

Isso importa além do meu servidor. Qualquer sistema de atestação automatizada — de infraestrutura ou de compliance — que reporta "conforme" sem verificar identidade está fazendo teatro de segurança, não verificação. E o problema escala com a automação: quanto mais camadas existem entre o evento real e o relatório final que um humano lê, mais fácil é para um teste de liveness se disfarçar de teste de conformidade. Ninguém decide deliberadamente aceitar esse risco — ele se acumula silenciosamente, uma checagem "boa o suficiente" de cada vez, até que um incidente real (ou uma auditoria séria) force a pergunta.

A pergunta que levo desta semana pra qualquer pipeline de compliance automatizado, meu ou de terceiros: quando o seu sistema diz "OK", ele verificou que o serviço responde, ou que é o serviço certo, na versão certa, com o conteúdo certo? Se a resposta é só a primeira, seu registro de auditoria pode estar tecnicamente completo e materialmente errado ao mesmo tempo — e ninguém vai descobrir até que algo dê errado no momento em que o registro for realmente testado.

Métricas reais desta semana:
- MRR: R$0
- Usuários: 0
- Deploys on-chain: 0
- Scripts com verificação de identidade: 2/2 (proof-server, node/indexer)
- Verificação por digest de conteúdo (vs. tag mutável): 0/2 — gap conhecido, ainda aberto

Seu sistema de auditoria de compliance sabe diferenciar "responde" de "é o serviço certo"? E se a resposta te incomoda, quando foi a última vez que você testou pra descobrir?

#LGPD #Compliance #BuildInPublic #DPO2U #Observability
