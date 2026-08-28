---
date: 2026-08-27
pillar: midnight-dev / build-public
format: twitter-thread
source: git diff scripts/pre-deploy-check.sh + scripts/check-version-consistency.sh (commit
  1a72bbe) + git diff scripts/compile-contracts.sh (commit 82a4443, rescued same sessão) +
  grep -rn "compactc" scripts/ (confirma só 2 call sites diretos) + execução real de
  ./scripts/check-version-consistency.sh (exit 0)
angle: o fix do crash do compactc por /tmp cheio (documentado em 25/08) só tinha sido
  aplicado em compile-contracts.sh. pre-deploy-check.sh chama o mesmo `compactc --version`
  e ficou sem guarda — mesmo crash, segunda porta destrancada. Quem achou o buraco foi
  check-version-consistency.sh, ferramenta que já existia por causa de OUTRO incidente de
  drift (INDEXER_VERSION, 07/08). E o próprio fix + o conteúdo de ontem ficaram sem commit
  por 1-2 dias antes de serem resgatados nesta sessão — o mesmo padrão que este repo já
  documentou várias vezes.
---

---TWEET 1/7---
Ontem documentei aqui o crash do compactc por /tmp cheio. Hoje descobri que o fix só tinha sido aplicado em metade dos lugares que precisavam dele. 🧵

---TWEET 2/7---
compile-contracts.sh ganhou a checagem de /tmp livre em 25/08. Mas pre-deploy-check.sh também roda `compactc --version` — e não tinha guarda nenhuma. O mesmo "Assertion failed: write(fd, contents, size)..." continuava alcançável por outro caminho.

---TWEET 3/7---
Quem achou o buraco não foi uma releitura manual — foi o check-version-consistency.sh, script que já existia por causa de OUTRO incidente: em 07/08 uma correção de versão ficou em 2 arquivos e esqueceu um terceiro, gerando 115 alertas falsos em 9 dias.

---TWEET 4/7---
Estendi esse checker pra comparar TMP_MIN_FREE_KB entre os dois scripts. Rodei agora: exit 0, os dois concordam em 512000 (500MB). Sem essa comparação, o próximo ajuste de threshold ficaria torto de novo, em silêncio.

---TWEET 5/7---
Auditei com grep: só existem 2 pontos no repo que chamam compactc diretamente — compile-contracts.sh e pre-deploy-check.sh. Os dois agora têm a mesma guarda. Achado real, não estimado.

---TWEET 6/7---
Parte incômoda pra ser transparente: esse fix + o conteúdo de ontem sobre o incidente original ficaram sem commit por 1-2 dias. O mesmo padrão de backlog órfão que este repo já documentou várias vezes. Resgatado hoje, não em cima da hora — mas resgatado.

---TWEET 7/7---
Lição: lógica de defesa duplicada entre scripts sem fonte única de verdade vai driftar. A pergunta certa não é "isso vai acontecer de novo" — é "existe uma ferramenta que aponta quando acontecer".

#BuildInPublic #MidnightForDevs #DPO2U
