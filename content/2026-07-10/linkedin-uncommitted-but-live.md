---
date: 2026-07-10
pillar: compliance-protocol / dpo2u-arch
format: linkedin-post
source: /var/log/midnight-health/health.log (2026-07-10, verified) + scripts/midnight-health-check.sh (uncommitted diff) + content/2026-07-08/linkedin-attestation-integrity.md
angle: código não versionado já está tomando decisões de incidente em produção — o mesmo tipo de lacuna de governança de mudança que o Art. 37 LGPD deveria capturar, mas de um ângulo diferente do post de 08/07 (integridade da lógica em si, não da atestação que ela alimenta)
---

"Não commitado" não é o mesmo que "não implantado". Descobri isso hoje da pior forma: verificando.

Desde o dia 07 de julho, um script meu carrega uma correção que comparo aqui publicamente há uma semana — `check_proof_server()`, que verifica se o processo respondendo na porta 6300 é realmente o proof-server certo, e não o container de outro projeto meu escutando na mesma porta. O `git status` desse arquivo mostra "modified", nunca commitado. Na minha cabeça, isso significava: correção pronta, esperando revisão, ainda não em produção.

Hoje conferi o log de produção pra confirmar. Estava errado. O cron que roda `midnight-health-check.sh` a cada duas horas não verifica o histórico do git antes de executar — ele lê o arquivo que está no disco, agora, e roda. O fix "pendente" já tinha rodado nove vezes só nas últimas doze horas, e detectado corretamente o mesmo container intruso nas nove: proof-server versão 8.0.3, na porta 6300, quando o esperado é 7.0.0.

A correção funciona. Isso é a parte boa. A parte que me incomoda é outra: essa lógica — que hoje decide se um alerta de incidente dispara ou não pro meu e-mail — existe em exatamente um lugar no universo. Um arquivo em disco, numa VPS, fora de qualquer sistema de controle de versão. Não há commit, não há branch, não há backup em outro repositório. Se esse servidor cair amanhã e for reconstruído a partir do último estado versionado, essa lógica de detecção simplesmente deixa de existir — sem que ninguém saiba que ela um dia existiu, porque nunca chegou a um `git log`.

Isso é diferente do gap que documentei no dia 08 de julho, sobre tag de imagem Docker ser um ponteiro mutável em vez de um hash de conteúdo. Aquele era um problema de integridade do dado que o script verifica. Este é um problema de integridade do próprio script — de governança de mudança sobre a lógica que decide o que é "conforme" e o que é incidente. Em qualquer framework sério de gestão de mudanças (ISO 27001 inclui isso explicitamente, e a leitura mais rigorosa do Art. 37 da LGPD também caberia aqui), uma alteração em um sistema de controle e alerta que roda em produção sem estar sob controle de versão é, na prática, uma mudança não gerenciada — mesmo que o autor da mudança seja o próprio operador do sistema.

O motivo disso ter acontecido é banal, e prefiro admitir isso a dourar a pílula: editei o script direto no servidor, testei, funcionou, e segui pra outra coisa sem dar o passo final — `git add`, `git commit`. Não foi decisão técnica. Foi o tipo comum de dívida operacional que se acumula quando "já está funcionando" vira sinônimo silencioso de "está terminado".

A pergunta que fico pensando, e que ofereço sem resposta pronta: quantos sistemas na sua operação — de infraestrutura ou de compliance — estão hoje tomando decisões reais, gerando logs reais, disparando alertas reais, a partir de uma lógica que nunca passou por um commit? A resposta normalmente não é zero. E a distância entre "está funcionando" e "está sob controle de mudança auditável" costuma ser exatamente do tamanho de um `git commit` que ninguém deu.

Métricas reais de hoje:
- MRR: R$0
- Usuários: 0
- Deploys on-chain: 0
- Dias com fix ativo em produção e não commitado: 3 (midnight-health-check.sh) / 5 (pre-deploy-check.sh)
- Detecções corretas do fix não versionado, só hoje: 9/9

#LGPD #Compliance #BuildInPublic #DPO2U #DevOps
