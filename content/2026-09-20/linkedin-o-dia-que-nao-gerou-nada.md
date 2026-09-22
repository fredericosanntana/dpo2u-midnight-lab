---
date: 2026-09-20
pillar: dpo2u-arch / compliance-protocol
format: linkedin-post
source: same evidence as twitter-thread-dia-26-zero-artefatos-tres-fases.md
  in this same folder — see that file for the exact commands, byte counts
  and mtimes.
angle: para um produto de compliance, a distinção entre "não documentado"
  e "não commitado" já importava (dia-25). Hoje ela fica mais grave:
  "não gerado". Um controle que existe só como uma linha de log genérica,
  sem nenhum artefato correspondente em lugar nenhum, é o pior dos
  estados possíveis de evidência ausente.
---

Há 25 dias documentamos um teto de execução (12 turnos por sessão) que afeta nossa pipeline autônoma. Até o dia 25, o pior cenário conhecido era: artefato gerado, nunca commitado. Hoje descobrimos um cenário pior.

Números de hoje (fonte: logs do cron, sem estimativa):

- dev.log, content.log e zealy.log: 29 bytes cada, exatamente 1 ocorrência de "Error: Reached max turns (12)" cada — logs recém-rotacionados, falha reproduzida do zero nas 3 fases.
- content/2026-09-20/: o diretório existe (criado 14h09 UTC), mas `git ls-files` não encontra nenhum arquivo dentro — a fase bateu o teto antes de escrever o primeiro artefato.
- zealy/2026-09-19/ e zealy/2026-09-20/: nenhum dos dois existe — a fase bateu o teto antes até de criar a pasta do dia.

Isso é qualitativamente diferente do que documentamos no dia 25 (`content/2026-09-18/`). Lá, o teto interrompia depois do trabalho real — o conteúdo existia em disco, só faltava o `git commit`. Resgatar era possível porque havia o que resgatar. Hoje, nas 3 fases, não havia artefato nenhum para resgatar — o teto bateu antes da primeira palavra escrita.

Para um produto cujo negócio é evidência auditável de compliance, essa escala importa: "gerado e não commitado" é um problema de processo; "nunca gerado" é ausência total, indistinguível de nunca ter havido a tentativa — exceto por uma linha de log genérica que a maioria das auditorias nem chega a olhar.

O que não mudou: 34 dias sem a env var (`MIDNIGHT_AGENT_MAX_TURNS`) que resolveria o teto na origem, e a branch com o trabalho real 142 dias e 52 commits à frente de uma main congelada desde maio. Ambas seguem sendo decisões de uma pessoa, pendentes.

O que mudou nesta sessão: em vez de escrever tudo e arriscar um quarto artefato em branco, cada fase deste ciclo — dev, content, zealy — é commitada assim que termina, em vez de acumular tudo para o fim.

Pergunta para quem opera pipelines autônomas com orçamento de execução fixo: seu sistema distingue "não gerado" de "gerado e não persistido"? As duas falhas aparecem como a mesma linha de log genérica, mas custam coisas muito diferentes para auditar depois.

#BuildInPublic #DPO2U #MidnightForDevs #NightForce #Compliance
