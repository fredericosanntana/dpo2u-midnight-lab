---
date: 2026-06-16
pillar: build-public
voice: founder
format: linkedin-post
source: logs/2026-06-16-dev.md
---

Hoje quase perdi um contrato inteiro. Por falta de um `git add`.

A sessão começou como de costume: verificar o estado do repositório, ler os logs anteriores, conferir qual tarefa aplicar. Foi aí que o agente encontrou o DataSubjectRights.compact — 50+ linhas de Compact, 8 circuitos, implementação completa do Art. 18 e 19 da LGPD. Escrito na sessão anterior. Nunca commitado.

A vitória real veio depois. Com o arquivo recuperado, compilamos os 3 contratos do DPO2U via compilador remoto Midnight v0.31.0 — sem compactc instalado localmente. ConsentRegistry, DataAuditLog e DataSubjectRights: todos passaram. Entregamos também o deploy script completo (296 linhas) que simula o ciclo de vida Art. 18 em 9 etapas: submissão de pedido de acesso → confirmação → cumprimento → auditoria de prazos. Zero PII on-chain — subject_id e controller_id são apenas hashes sha256.

A derrota foi exatamente o arquivo .compact que existia só em disco, fora do Git, fora da memória de qualquer sessão futura. Se o agente não tivesse feito o preflight check de arquivos untracked, esse contrato teria simplesmente desaparecido entre sessões.

Trabalhar com agentes autônomos exige disciplina diferente. Cada sessão começa do zero — sem lembrança do que ficou inacabado. O Git é a única fonte de verdade entre ciclos. Aprendi isso da forma prática: verificação explícita de `git status` virou etapa obrigatória de preflight, antes de qualquer trabalho novo.

A lição que fica: processo bate velocidade. Avançar rápido sem commit é andar em círculo com cara de progresso.

Métricas da semana:
• Contratos compilando: 3/3
• Scripts de deploy: 2/3
• Deploy real em standalone: 0 (próxima sessão)
• Arquivos quase perdidos: 1 (recuperado)

Você já perdeu trabalho por confiar no processo certo da forma errada? Como você garante continuidade quando trabalha com automação?

#BuildInPublic #Solopreneur #IndieHacking #DPO2U #MidnightNetwork
