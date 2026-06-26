---
date: 2026-06-25
pillar: dpo2u-arch
format: linkedin-post
source: scripts/pre-deploy-check.sh (new) + compile-contracts.sh POSIX fix
---

Documentação só tem valor quando para de ser um arquivo e vira um bloqueio.

Nos últimos três meses, encontrei 7 bugs críticos no SDK do Midnight Network. Cada um foi doloroso. Cada um foi documentado com precisão — versão, sintoma, fix, referência. Esse trabalho era necessário, mas não era suficiente. Um arquivo Markdown não impede deploy. Uma checklist manual não impede que você, às 23h na véspera de um prazo, pule um item.

Hoje transformei esses 7 bugs em código.

O `pre-deploy-check.sh` é o resultado dessa mudança de postura. Um script de 200 linhas que valida cinco categorias antes de qualquer deploy: Node.js na versão certa, compactc pinado no 0.29.0 (porque o 0.29 quebra silenciosamente o assert() que funcionava no 0.28), .npmrc ausente (o registry do Midnight não resolve com ele presente), artifacts compilados para os três contratos, e toda a infraestrutura Docker respondendo nas portas certas. Exit 0: deploy liberado, com os comandos exatos. Exit 1: lista do que está errado, referência ao WORKAROUND-GUIDE.

A vitória não é o script. A vitória é o que ele representa: o momento em que a documentação de incidentes vira automação de prevenção.

A derrota foi precisar dos 7 bugs para escrevê-lo. Cada workaround que entrou nesse script entrou porque alguém — eu — aprendeu da maneira difícil. O compactc pinado está lá porque passei 40 minutos depurando um erro de parse que tinha 4 caracteres de diferença. O check do .npmrc está lá porque vi uma transação confirmar on-chain enquanto o estado privado ficava inacessível. Esses não são checks abstratos. São cicatrizes de depuração.

O que aprendi: o valor de documentação de bugs não é a documentação em si. É o momento em que você olha para o conjunto e pergunta "o que destes poderia ter sido impedido automaticamente?". Essa pergunta é o que separa um projeto que cresce em fragilidade de um que cresce em robustez.

Mas há um limite que preciso ser honesto sobre: o script valida infraestrutura, não conformidade. Ele não garante que o revokeConsent vai produzir um estado que a aplicação consegue ler. Não garante que o Art. 18 está exercível do ponto de vista do titular. Ele garante que as pré-condições técnicas estão presentes. A responsabilidade regulatória vai além — e é o passo seguinte.

Métricas da semana:
• MRR: R$0
• Contratos compilando: 3
• Bugs de SDK documentados: 7
• Checks automatizados no pre-deploy: 12

Vocês têm um ponto na jornada em que documentação virou automação? Quando esse momento chegou para vocês?

#BuildInPublic #Solopreneur #IndieHacking #DPO2U #MidnightNetwork
