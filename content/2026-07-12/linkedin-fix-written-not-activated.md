---
date: 2026-07-12
pillar: compliance-protocol / thought-leadership
format: linkedin-post
source: scripts/pin-image-digest.sh (new, mtime 2026-07-11) + scripts/image-digests.lock (new, mtime 2026-07-11, 0 entries) + scripts/pre-deploy-check.sh (diff, mtime 2026-07-12) + scripts/midnight-health-check.sh (unchanged since 2026-07-07) + docker ps (verified 2026-07-12) + content/2026-07-08/linkedin-attestation-integrity.md
angle: "implementei o controle" e "o controle está protegendo alguma coisa" são duas afirmações diferentes — e um registro de auditoria que não distingue as duas superestima a própria maturidade
---

Em 8 de julho, escrevi aqui sobre um gap que encontrei no meu próprio fix de segurança: o script que verifica a identidade dos containers Docker do meu pipeline Midnight comparava a *tag* da imagem (ex.: "0.21.0"), não o seu conteúdo. Tag é um ponteiro mutável — pode ser reapontada pra outro binário sem que a string mude. Prometi, publicamente, corrigir isso comparando o hash de conteúdo em vez da tag.

Ontem e hoje, corrigi. `scripts/pin-image-digest.sh` grava o Image ID content-addressed de um container — o hash local que só muda se o conteúdo da imagem mudar — em um lock file (`scripts/image-digests.lock`). `pre-deploy-check.sh` agora consulta esse lock file antes de cair na comparação de tag: se o container tem uma entrada pinada, compara hash contra hash; se não tem, avisa explicitamente que a checagem que passou é mais fraca ("tag match only, not digest-pinned").

Essa deveria ser a parte boa do post. Só que, verificando antes de publicar — o mesmo hábito que venho documentando nos últimos dias —, encontrei três limitações que tornam o fix, hoje, funcionalmente inerte.

Primeiro: o lock file existe desde ontem e tem zero entradas. Nunca rodei o comando que de fato pina um container. O código está correto; o dado que ele precisa pra funcionar não existe.

Segundo: nem consigo gerar esse dado agora. `docker ps` no host mostra só um container respondendo — o mesmo "invasor" que documentei em 7 de julho, o proof-server de outro projeto meu, ativo há três semanas. Os containers que o fix foi desenhado pra proteger, `midnight-standalone-node` e `-indexer`, não existem no host. Estão fora do ar desde 1º de maio. Não há o que pinar.

Terceiro, e o mais relevante pra quem lê isso pensando em governança e não em Docker: a verificação mais forte que escrevi só existe em `pre-deploy-check.sh`, o script que rodo manualmente antes de um deploy. O script que roda de verdade, sozinho, de cron, a cada duas horas, e manda email quando algo quebra (`midnight-health-check.sh`) — o que efetivamente decide se um incidente é reportado — ainda não tem essa lógica. Ele segue comparando só a tag.

A lição que levo daqui não é sobre Docker especificamente. É que "implementei o controle" e "o controle está protegendo alguma coisa, agora, no sistema que roda de verdade" são duas afirmações diferentes. Um registro de auditoria — seja sob a leitura mais rigorosa do Art. 37 da LGPD, seja qualquer framework de gestão de mudanças como ISO 27001 — que não distingue as duas está, na prática, superestimando a própria maturidade. Um controle documentado, testado em isolamento e ainda sem efeito real é diferente de um controle documentado e ativo — mas os dois podem aparecer como "implementado" em um relatório que só confirma se o código existe, não se ele está fazendo alguma coisa neste momento, sobre dados reais.

Métricas reais desta semana:
- MRR: R$0
- Usuários: 0
- Deploys on-chain: 0
- Scripts com digest-pinning implementado: 1/2 (`pre-deploy-check.sh`; falta `midnight-health-check.sh`)
- Containers efetivamente pinados: 0/2
- Dias entre a promessa pública (08/07) e o código existir: 4

Quando você lê "implementamos verificação de integridade" em um relatório de compliance — do seu time ou de um fornecedor —, você confirma que o controle está ativo, com dados reais, no sistema que roda de verdade? Ou confirma só que o código existe em algum lugar do repositório?

#LGPD #Compliance #BuildInPublic #DPO2U #Observability
