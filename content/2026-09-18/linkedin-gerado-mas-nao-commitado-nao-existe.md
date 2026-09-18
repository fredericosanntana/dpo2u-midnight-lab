---
date: 2026-09-18
pillar: dpo2u-arch / compliance-protocol
format: linkedin-post
source: grep -o "Reached max turns" /var/log/managed-agent/{dev,content,zealy}.log
  | wc -l por arquivo (dev=6/174 bytes, content=5/145 bytes, zealy=5/145
  bytes, todos desde a rotação copytruncate de 2026-09-13T00:35:44 UTC
  registrada em /var/lib/logrotate/status) + git status --short (2
  diretórios untracked: content/2026-09-17/, zealy/2026-09-16/) +
  logs/2026-09-15-dev.md (única sessão dev real da janela 13→18/09,
  commit c563156) + grep -c MIDNIGHT_AGENT_MAX_TURNS
  /etc/cron.d/dpo2u-midnight-agent (=0, mtime 2026-08-17, 32 dias) + git
  merge-base main HEAD (=f710015, 2026-05-01, 140 dias) + git rev-list
  --count main..HEAD (=51)
angle: um artefato gerado por uma pipeline autônoma e nunca commitado não
  é "quase pronto" — para qualquer auditoria via git log, ele não existe.
  Isso importa mais para um produto de compliance do que para qualquer
  outro tipo de software, porque a cadeia de evidência é o próprio produto.
---

Um processo automatizado pode "fazer o trabalho" e mesmo assim não deixar rastro nenhum dele. Foi o que encontrei hoje olhando os logs da nossa pipeline de conteúdo autônoma.

Números de hoje (fonte: logs do cron, não estimativa):

- dev.log: 174 bytes, 6x "Error: Reached max turns (12)" desde a última rotação semanal (13/09). Só 1 sessão real de desenvolvimento nesses 6 dias.
- content.log: 145 bytes, 5x a mesma falha.
- zealy.log: 145 bytes, 5x a mesma falha.
- git status: 2 diretórios sem commit — content/2026-09-17/ e zealy/2026-09-16/, ambos com conteúdo real, escrito, nunca versionado.

Destaque: as 3 fases da nossa pipeline diária (dev às 10h, content às 14h, zealy às 17h) compartilham um único lock de execução e um único teto de 12 turnos por sessão. Quando o teto é atingido depois que o artefato foi gerado mas antes do `git commit`, o resultado é um arquivo real em disco que nenhuma auditoria baseada em `git log` vai encontrar. Não é um erro visível — é uma linha genérica de log e um silêncio no histórico.

Aprendizado que não é óbvio: para um produto cujo negócio é justamente produzir evidência de compliance auditável, esse é o pior tipo de bug possível — silencioso, e incidindo exatamente sobre a integridade da própria cadeia de evidência. "Gerado" e "commitado" não são sinônimos. Um DPIA escrito e nunca versionado tem o mesmo valor probatório de um DPIA que nunca foi escrito.

Desafios (sem embelezar): seguimos há 32 dias sem adicionar uma única env var (`MIDNIGHT_AGENT_MAX_TURNS`) que resolveria o teto na origem, e a branch com o trabalho real está 140 dias e 51 commits à frente de uma `main` congelada desde maio. Ambos são decisões de 1 pessoa, pendentes.

Próximo passo: este ciclo resgata os 2 diretórios órfãos junto com o conteúdo de hoje, em vez de deixar mais um para trás. O fix estrutural — a env var, o merge — continua exigindo uma decisão humana que os últimos 30+ dias de conteúdo já pediram repetidamente.

Pergunta para quem opera pipelines autônomas: como vocês garantem que "gerar" e "persistir de forma auditável" nunca ficam separados por um limite de execução?

#BuildInPublic #DPO2U #MidnightForDevs #NightForce #Compliance
