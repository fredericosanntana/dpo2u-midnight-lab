---
date: 2026-07-08
pillar: midnight-dev / upstream
format: twitter-thread
source: scripts/pre-deploy-check.sh (diff 2026-07-05) + scripts/midnight-health-check.sh (diff 2026-07-07) + content/2026-07-03/twitter-thread-proof-server-version-drift.md + content/2026-07-07/twitter-thread-squatter-confirmed.md
angle: parte 3 da mesma história — o fix escrito pra fechar o blind spot de identidade tem o próprio blind spot (tag de imagem Docker é mutável, não é conteúdo)
---

---TWEET 1/7---
Parte 3 da mesma história #BuildInPublic

03/07: bug hipotético — meu health check via "OK" mesmo sem saber qual serviço respondia
07/07: o hipotético virou real — container de outro projeto meu, squatting numa porta, há 2 semanas
08/07: o próprio fix que escrevi tem um blind spot que ainda não fechei 🧵

---TWEET 2/7---
O fix do proof-server é forte: comparo `/version`, um dado que só o binário certo, rodando agora, consegue produzir.

O fix do node e do indexer é mais fraco. Eles não têm endpoint `/version`. Comparo a tag da imagem via `docker inspect --format '{{.Config.Image}}'`.

---TWEET 3/7---
Tag de imagem Docker não é conteúdo — é um ponteiro mutável.

`docker tag outra-imagem midnightntwrk/node:0.21.0 && docker push` reaponta a tag "0.21.0" pra outros bits. Meu script lê a string "0.21.0", compara, e diz OK. Sem checar o que de fato está rodando.

---TWEET 4/7---
É a mesma classe de bug que passei a semana caçando, só que um nível mais fundo:

Liveness ≠ nome do serviço (bug de 03/07 → confirmado 07/07)
Nome/tag ≠ conteúdo real (bug que documento hoje, ainda aberto)

Cada camada de "verificação" pode ela mesma ser só teatro.

---TWEET 5/7---
A correção certa seria comparar o digest sha256 imutável — `docker inspect --format '{{.Image}}'` retorna o Image ID local, content-addressed — contra o digest fixado no docker-compose.yml. Não a tag.

Ainda não escrevi esse fix. Prefiro documentar o gap a fingir que não existe.

---TWEET 6/7---
Por que importa além da minha VPS: esse health check alimenta o registro de operações de tratamento (Art. 37 LGPD) que deveria provar qual toolchain ZK gerou cada prova.

Se a checagem de identidade tem um furo, a atestação de compliance herda o furo.

---TWEET 7/7---
Métricas reais de hoje:
MRR: R$0 | Usuários: 0 | Deploys on-chain: 0
Contratos: 3/3 compilando | Checks de identidade escritos: 2/2 | Checks por digest (não tag): 0/2

Seu pipeline de attestation confia em tag ou em digest?

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
