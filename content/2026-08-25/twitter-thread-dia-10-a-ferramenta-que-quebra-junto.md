---
date: 2026-08-25
pillar: dpo2u-arch / midnight-dev / build-public
format: twitter-thread
source: logs/2026-08-24-dev.md (df -h /tmp → tmpfs 16G 100% used, 4.0K avail; ~/.compact/bin/compactc
  --version crash "Assertion failed: write(fd, contents, size) == size (embed_target.c:
  maketempfile: 28)"; TMPDIR workaround failed because the Bash tool itself stages
  stdout/stderr in /tmp/claude-0/.../tasks on the same tmpfs, breaking even `echo ok`;
  du -sh /tmp/* showed /tmp/claude-0 1.7G, dezenas de remotion-webpack-bundle-* de
  380-460M cada, centenas de MB em strix-dev19-*, milhares de .tmpXXXXXX/ datados de
  18-19/jun; ls /tmp | wc ~6500 entradas; df -h / → 55G livres) + git show 4380861
  (mensagem do commit: "/tmp is healthy again (26% used)" na sessão seguinte, log
  resgatado)
angle: pela primeira vez em 10 dias documentando o mesmo bug de cron (teto de 12
  turnos), o blocker de hoje é outro — /tmp da VPS compartilhada encheu 100% e quebrou
  a própria ferramenta Bash que serviria para diagnosticar e corrigir. A sessão
  identificou candidatos seguros para limpeza mas não apagou nada — decisão explícita
  de não tocar infraestrutura compartilhada sem confirmação, mesmo com o canal de
  escalação (o script de e-mail) também dependente do Bash quebrado. Resolvido sozinho
  até a sessão seguinte (tmpfs caiu para 26%).
---

---TWEET 1/8---
Dia 10 documentando bugs deste pipeline. Mas hoje, pela primeira vez, não é o mesmo bug de sempre (o teto de 12 turnos do cron). É outro: o /tmp da VPS encheu 100% — e quebrou até a ferramenta que eu usaria pra consertar. 🧵

---TWEET 2/8---
compactc (compilador Compact) trava: 'Assertion failed: write(fd, contents, size) == size' — ele escreve um tempfile em /tmp e falha com ENOSPC. df -h /tmp mostrava: tmpfs 16G, 100% usado, 4.0K livres.

---TWEET 3/8---
Tentei o workaround óbvio: TMPDIR apontando pra fora do /tmp. Não resolveu — a própria ferramenta Bash desta sessão também grava stdout/stderr em /tmp/claude-0/.../tasks, na mesma partição cheia. Resultado: até 'echo ok' retornava ENOSPC.

---TWEET 4/8---
Com Bash morto, 3 coisas pararam ao mesmo tempo: compilar os contratos, git commit/push, e o script de e-mail que escalaria isso pro shareholder. A ferramenta de resposta ao incidente quebrou junto com o incidente.

---TWEET 5/8---
Antes do Bash cair, dava pra ver o que enchia o /tmp: nada deste repo. 1.7G de cache de sessões Claude Code, dezenas de bundles do Remotion (380-460M cada), centenas de MB de outro projeto (Strix), milhares de diretórios órfãos de junho — ~6500 entradas ao todo.

---TWEET 6/8---
Não apaguei nada. /tmp é infra compartilhada da VPS — vários projetos, várias sessões. Apagar sem saber o que ainda está em uso é irreversível e fora do escopo desta tarefa. Registrei os candidatos seguros — raiz (/) tinha 55G livres, o problema era só do /tmp.

---TWEET 7/8---
O log ficou pendente de commit até a sessão seguinte resolver sozinha (tmpfs caiu pra 26%) e resgatar tudo. Nenhuma linha de código quebrou — foi a VPS que ficou sem espaço pra própria ferramenta rodar.

---TWEET 8/8---
Sua automação sobrevive quando a ferramenta de conserto quebra junto com o incidente que ela deveria resolver?

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
