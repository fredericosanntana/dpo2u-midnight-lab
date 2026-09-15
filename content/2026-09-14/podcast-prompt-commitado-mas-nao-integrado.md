---
date: 2026-09-14
pillar: dpo2u-arch / build-public
format: podcast-dialogue-prompt
source: mesma evidência dos posts do dia — wc -c/stat dev.log (58 bytes,
  mtime 2026-09-14T10:05:48Z, "Error: Reached max turns (12)" x2) + grep -c
  MIDNIGHT_AGENT_MAX_TURNS cron.d (=0, 28º dia) + run_claude_task.sh:24 +
  git merge-base main HEAD = f710015 ("wip: pre-cleanup snapshot
  2026-05-01"), confirmado igual em origin/main + git rev-list --count
  main..HEAD (=48) + date diff (136 dias) + ps aux desta sessão (pid
  775194, flock+cron, --max-turns 12) + df -h /tmp (88%, 14G/16G vs
  71%/12G ontem) + du -sh /tmp/claude-0 (6.4G vs 6.3G)
angle: justificado como peça extra porque o achado de hoje muda de escala
  em relação aos 21 dias anteriores — não é mais sobre um parâmetro de
  execução (--max-turns) bloqueando uma fase de pipeline, é sobre a
  branch inteira de trabalho nunca ter sido integrada à branch que o
  projeto chama de destino de PR. O diálogo expõe a tensão entre "isso é
  fluxo normal de solo-dev, PR pode esperar" (Rafael) e "sem merge em
  main, nada disso é auditável como estado de produção — é rascunho
  permanente" (Ana).
---

# Prompt: DPO2U Insights Episode — Commitado, Mas Não Integrado

## Hosts and Dynamic

**Ana** — DPO, perspectiva regulatória e de governança. Vê `main` parada há 136 dias como um problema de rastreabilidade: se a branch que o repositório declara como destino de PR nunca recebe merge, nenhuma auditoria externa consegue apontar para "o estado atual do sistema" com confiança — só para uma branch de trabalho que pode ser reescrita, abandonada ou divergir ainda mais.

**Rafael** — arquiteto blockchain, perspectiva técnica. Vê como o fluxo natural de um projeto solo em fase de lab: uma branch de longa duração recebendo todo o trabalho, com `main` reservada para quando houver um corte estável de verdade. Não é urgência — é sequência.

Dinâmica: tensão construtiva. Ana argumenta que "quando houver um corte estável" é exatamente o tipo de critério sem dono e sem prazo que esta série já documentou (dia-12, "o fix que espera um humano") — e que a ausência de decisão é, ela mesma, uma decisão. Rafael concorda que falta um prazo, mas resiste à ideia de que isso é urgente: 48 commits em uma branch coerente, sempre pushed, é diferente de trabalho perdido.

## Episode Context

Há 21 dias esta série documenta que conteúdo gerado pelo pipeline (dev 10h, content 14h, zealy 17h) frequentemente fica escrito e não commitado, por causa de um teto de 12 turnos (`--max-turns 12`) nunca ajustado via variável de ambiente no cron.d. Isso se repetiu hoje: `dev.log` fechou com 58 bytes, duas falhas idênticas grudadas — a fase dev não produziu nada, pelo 28º dia sem o fix aplicado.

Hoje, porém, a investigação foi um nível acima: `git merge-base main HEAD` mostrou que o ponto de convergência entre a branch de trabalho (`fix/consent-registry-assert-parens`) e `main` é o próprio HEAD de `main` — commit `f710015`, de 1º de maio, mensagem "wip: pre-cleanup snapshot". Confirmado também em `origin/main`, não é uma referência local desatualizada. `git rev-list --count main..HEAD` retorna 48: quarenta e oito commits, incluindo toda esta série de 21 dias e os fixes de contrato, vivem só na branch de trabalho, nunca integrados.

## Discussion Topics

1. **Duas escalas do mesmo padrão**: o teto de 12 turnos trava uma fase de pipeline por poucas horas por dia; a ausência de merge trava a integração do projeto inteiro por 136 dias. São o mesmo tipo de falha (trabalho feito, não absorvido) em ordens de grandeza diferentes?
2. **O que "main" significa quando ninguém a atualiza**: para efeitos de auditoria e compliance, uma branch de trabalho com 48 commits à frente é o estado real do sistema — mas não é isso que o `git status` do projeto aponta como destino de PR. Isso importa fora do contexto de desenvolvimento?
3. **Decisão humana sem dono nem prazo**: o dia-12 desta série cunhou "o fix que espera um humano" para o teto de turnos. O merge em main é o mesmo tipo de item — correto, mas sem ninguém formalmente responsável por decidir quando.
4. **O que fica provado e o que não**: a série provou (com `wc -c`, `stat`, `grep -c`, `git merge-base`) que o fato é real. Ela não prova por que ninguém mergeou — só que ninguém mergeou. Vale a diferença entre documentar o sintoma e especular a causa?
5. **/tmp em alta, sem explicação completa**: 88% hoje contra 71% ontem, com `/tmp/claude-0` quase parado — o crescimento não bate com a hipótese óbvia. O que fazer com um dado que confirma que há um problema, mas não qual?

## Supporting Material

- `dev.log` hoje: 58 bytes, mtime 2026-09-14T10:05:48Z, conteúdo "Error: Reached max turns (12)" x2 concatenado sem separador (vs 29 bytes/1x ontem).
- `grep -c MIDNIGHT_AGENT_MAX_TURNS /etc/cron.d/dpo2u-midnight-agent` = 0, mtime ainda 2026-08-17 — 28º dia.
- `run_claude_task.sh:24` — `MAX_TURNS="${MIDNIGHT_AGENT_MAX_TURNS:-12}"`, o mecanismo exato do teto.
- `git merge-base main HEAD` = `f710015`; `git log -1 f710015` = "wip: pre-cleanup snapshot 2026-05-01"; `git log -1 origin/main` confirma o mesmo commit remotamente.
- `git rev-list --count main..HEAD` = 48 commits.
- Diferença de datas 2026-05-01 → 2026-09-14 = 136 dias.
- `ps -eo pid,ppid,lstart,etime,tty,cmd` desta sessão: pid 775194, iniciada hoje 14:04:00 UTC via flock+cron, cmdline com `--max-turns 12 --model sonnet`.
- `df -h /tmp`: 88% usado, 14G de 16G (vs 71%/12G ontem). `du -sh /tmp/claude-0`: 6.4G (vs 6.3G ontem).

## Literary References

Nenhuma referência literária disponível nesta fonte — Ana deve ancorar a fala em conceitos de rastreabilidade e "estado auditável vs. estado de trabalho" (ex.: a diferença entre um log de mudanças e o registro oficial que uma auditoria aceita como prova) sem citar autor específico.

## Point of Tension

Rafael: "48 commits numa branch só, sempre pushed, com histórico linear — isso não é trabalho perdido, é sequência normal antes de um corte estável. main vai receber tudo quando fizer sentido cortar uma versão." Ana: "'Quando fizer sentido' não tem dono nem data — é a mesma estrutura do dia-12, só que aplicada ao repositório inteiro em vez de uma linha de config. Enquanto isso, qualquer auditoria externa que olhar para main vê um snapshot de 1º de maio e nada mais."

## Tone and Instructions

Conversa natural em inglês, 8-15 minutos, entusiasmada mas tecnicamente precisa, tom Build in Public. Ana e Rafael devem citar os números exatos (136 dias, 48 commits, f710015, 28º dia do teto) em vez de generalizar. Terminar reconhecendo que a série não sabe por que ninguém decidiu mergear — só que não decidiu.

## Closing

Próximo passo do projeto: aplicar `MIDNIGHT_AGENT_MAX_TURNS` no cron.d permanece pendente havia 28 dias; a esse item se soma agora, com a mesma urgência de decisão (não de código), definir um dono e um prazo para avaliar o merge de `fix/consent-registry-assert-parens` em `main`. Chamada à comunidade: quem mais já descobriu, tarde, que a branch "de verdade" do próprio projeto nunca foi a que o `git status` recomendava usar?
