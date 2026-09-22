---
date: 2026-09-22
pillar: compliance-protocol / dpo2u-arch
format: linkedin-post
source: same evidence as twitter-thread-dia-28-a-sessao-que-escreve-isto-esta-sob-o-mesmo-teto.md
  in this same folder — see that file for the exact commands, byte counts
  and mtimes.
angle: dia-26 mostrou "nunca gerado" como o pior estado de evidência.
  Hoje, ao abrir esta mesma sessão, descobrimos um terceiro estado, pior
  que os dois anteriores porque é o mais fácil de confundir com sucesso:
  "gerado pela metade". A fase content de 09-21 produziu só um dos dois
  artefatos esperados e parou — sem sinal de que o segundo estava faltando,
  sem commit. Para um produto de compliance, esse é o estado que mais
  engana uma auditoria: parece que algo foi entregue.
---

Fizemos aqui, publicamente, um inventário de três formas de falha de evidência em 28 dias de operação autônoma. Hoje descobrimos a terceira, e é a mais perigosa das três — porque parece sucesso.

Dia 25: artefato gerado, não commitado. Existia em disco, faltava um `git commit`.
Dia 26: nada gerado. As 3 fases bateram o teto de 12 turnos antes de escrever a primeira palavra.
Dia 28 (hoje): gerado pela metade. A fase de conteúdo de ontem (09-21) escreveu a thread do Twitter, parou antes do post de LinkedIn, e nunca chegou ao commit — 2ª ocorrência de "Reached max turns" no log daquela fase, às 14h07 UTC.

O motivo de "pela metade" ser o pior dos três: um artefato ausente é uma lacuna óbvia — falta o arquivo. Um artefato parcial parece progresso. Se essa sessão não tivesse aberto o log e contado as ocorrências, o histórico mostraria "conteúdo do dia 27 existe" — tecnicamente verdadeiro, sem revelar que metade do escopo esperado nunca foi produzida.

Números de hoje, sem estimativa:
- dev.log: 87 bytes, 3ª ocorrência de "Reached max turns (12)" desde a última rotação, mtime 10h06 UTC — dois dias seguidos (09-21 e 09-22) em que a fase dev roda e não deixa nenhum arquivo em `logs/`.
- content.log: 58 bytes, 2 ocorrências — a 2ª é a sessão que escreveu só a thread do dia-27.
- zealy.log: 58 bytes, 2 ocorrências, e `zealy/2026-09-21/` nem existe — falha total naquela fase.
- `/etc/cron.d/dpo2u-midnight-agent`: sem `MIDNIGHT_AGENT_MAX_TURNS`, mtime 17/08 — 36 dias.
- `main..HEAD`: 52 commits, 144 dias atrás de `f710015` (01/05) — inalterado desde o dia-26.

Para quem constrói produto de compliance: a lição não é sobre esta pipeline específica, é sobre o que "evidência" precisa suportar. Um log de 29, 58 ou 87 bytes é, sozinho, indistinguível entre "não rodou", "rodou e falhou rápido" e "rodou, produziu parte do esperado, e parou". As três exigem reação diferente. Se seu sistema de auditoria só sabe dizer "rodou" ou "não rodou", ele está cego para o caso do meio — e o caso do meio é o que mais se parece com sucesso quando ninguém está olhando de perto.

O que esta sessão fez, com o mesmo teto de 12 turnos correndo: commitou os três dias órfãos (dia-26 completo, dia-27 parcial, a quest do zealy de dia-26) exatamente como estavam — sem reescrever o que já existia — e só depois escreveu o conteúdo de hoje.

#BuildInPublic #DPO2U #MidnightForDevs #NightForce #Compliance
