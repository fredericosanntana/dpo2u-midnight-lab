---
date: 2026-06-24
pillar: compliance-protocol
format: linkedin-post
source: commits 9870a1f + c8dbcb3 + c696f14 — full suite hardened, pre-standalone state
---

"Pronto para deploy" não é um estado técnico. É uma convergência entre dois tipos de prontidão que raramente andam juntos.

A DPO2U está, hoje, na véspera do primeiro deploy standalone real de sua suite de contratos LGPD. Três contratos — ConsentRegistry, DataAuditLog, DataSubjectRights — compilando, com scripts de deploy completos, sete bugs de SDK documentados, parâmetros auditados transversalmente. Do ponto de vista técnico, estamos prontos.

Mas o que significa "pronto" quando o sistema que você está deploying é infraestrutura de compliance?

Nos últimos três meses, cada bug encontrado revelou um gap diferente. Um `assert()` sem parênteses que compilava no compactc 0.28 e quebrava silenciosamente no 0.29 — descoberto só porque o commit message descrevia o form exato da falha. Um `walletProvider: bridge` ausente que fazia o contrato deployar, a transação confirmar, o hash aparecer on-chain — mas o estado privado ficava inacessível para a aplicação. Um `block_number` declarado como `Uint<16>` que, em produção, teria estourado após 65.535 blocos — cerca de 45 dias.

Nenhum desses bugs comprometia a aparência de funcionalidade. Todos comprometiam a capacidade real de cumprir a lei.

É aqui que a noção regulatória de "prontidão" diverge da noção técnica. Para o LGPD, um sistema de compliance é "pronto" quando o controlador consegue exercer as obrigações que contratou. Não quando os testes passam. Não quando a transação confirma. Quando o titular solicita acesso (Art. 18 I) e o dado pode ser entregue. Quando a revogação (Art. 8 §5) é executada e o estado privado reflete isso de forma recuperável pela aplicação. Quando o log de auditoria (Art. 37) registra a cadeia de eventos com integridade verificável.

A diferença entre as duas prontidões é o gap entre "funciona no bloco" e "funciona na aplicação". E para sistemas de proteção de dados, esse gap não é técnico — é regulatório.

O que aprendi construindo esta suite: cada bug de SDK que encontramos antes do deploy não é um problema de engenharia. É uma questão de responsabilidade. Um contrato que deploya sem erro mas não consegue entregar o dado ao titular quando solicitado não está em conformidade com o Art. 18 — independentemente do que aparece on-chain.

A preparação que fizemos — auditar os três scripts lado a lado, não um por vez; documentar cada workaround com precisão cirúrgica; validar que o estado privado é recuperável pela aplicação antes de qualquer deploy real — não foi rigor técnico por hábito. Foi rigor regulatório por necessidade.

Amanhã, `docker-compose up -d`. Standalone. Três contratos. Primeiro deploy com garantias reais.

Mas a pergunta que fica: quando você está construindo infraestrutura de compliance sobre SDKs experimentais, quem define o critério de prontidão — o engenheiro que vê os testes passarem, ou o DPO que precisa responder ao titular?

#DPO #Compliance #FutureOfWork #MidnightNetwork #LGPD
