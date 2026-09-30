---
date: 2026-09-30
pillar: build-public
format: linkedin
source: commit 543e24d + logs/2026-09-30-dev.md. Números: 13/1 → 14/0 com PROOF_SERVER_URL=:6301.
  Sem deploy executado; midnight-health-check.sh validado só por sintaxe.
---

Nosso pre-deploy check estava vermelho pelo motivo certo, contra o alvo errado.

O `npm run predeploy` do nosso lab Midnight dava 13 checks ok e 1 falha: o proof-server na porta 6300 respondia versão 8.0.3, e o SDK que usamos (facade 1.0.0) espera 7.0.0. Esse 8.0.3 era um container de outro projeto na mesma VPS.

O detalhe: já existia um proof-server 7.0.0 correto na porta 6301, e os scripts de deploy e status já aceitavam `PROOF_SERVER_URL` para usá-lo. Só os scripts de verificação tinham a porta 6300 fixa. Ou seja, o checador validava um servidor que o deploy nem usaria.

Correção: os dois scripts (pre-deploy-check e health-check) agora leem `PROOF_SERVER_URL`, com default na 6300 para não mudar o comportamento existente.

O que está medido:
- Com `PROOF_SERVER_URL=http://127.0.0.1:6301`: 14 passed, 0 failed.
- Sem a variável: segue falhando na 6300, agora com mensagem apontando o override.

O que NÃO está medido: o health-check só passou por checagem de sintaxe (`bash -n`), e nenhum deploy rodou contra o nó. "Pre-check verde" continua sendo pré-condição, não prova de deploy.

Princípio que fica: quem verifica precisa olhar para o mesmo lugar que quem executa. Do contrário, verde e vermelho são sobre outra coisa. (Também não derrubei o container 8.0.3: é de outro projeto.)

#BuildInPublic #MidnightNetwork #DPO2U
