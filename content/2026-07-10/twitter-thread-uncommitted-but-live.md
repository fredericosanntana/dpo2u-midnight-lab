---
date: 2026-07-10
pillar: midnight-dev / build-public
format: twitter-thread
source: /var/log/midnight-health/health.log (2026-07-10, verified) + scripts/midnight-health-check.sh (uncommitted diff, mtime 2026-07-07) + git log/status (lab repo, verified 2026-07-10)
angle: o fix "ainda não commitado" já está rodando em produção há dias — cron executa o arquivo em disco, não o estado do git. Descoberta nova de hoje, não repetição dos dias anteriores.
---

---TWEET 1/6---
Hoje descobri algo desconfortável sobre o fix que venho documentando desde 03/07 #BuildInPublic

Ele não está "pendente de commit". Ele já está rodando em produção, sozinho, sem nunca ter chegado ao git. 🧵

---TWEET 2/6---
Contexto: `check_proof_server()` — o fix que compara `/version` contra `7.0.0` — está em `midnight-health-check.sh` desde 07/07. `git status` mostra o arquivo como "modified", nunca commitado.

Mas esse é o MESMO arquivo que o cron executa a cada 2h, direto do disco.

---TWEET 3/6---
Cron não verifica git status. Ele executa o que está salvo no disco, ponto.

Conferi `/var/log/midnight-health/health.log` de hoje: o fix "não commitado" já rodou 9 vezes só entre 02h e 14h — e pegou o squatter certo nas 9: proof-server 8.0.3 na porta 6300, esperado 7.0.0.

---TWEET 4/6---
O ponto desconfortável: se essa VPS morrer ou for reconstruída amanhã, essa lógica — testada e correta há 3 dias em produção real — some. Ela nunca existiu em nenhum commit, nenhum backup, nenhum outro lugar.

"Não commitado" não é o mesmo que "não implantado".

---TWEET 5/6---
Dia 2 seguido sem nenhum commit novo (último: 30/06). O mesmo diff que já virou 4 peças de conteúdo (03/07 → 07/07 → 08/07 → 09/07) segue sem `git commit` — mesmo comprovadamente correto em produção, 9 vezes hoje.

MRR: R$0 | Usuários: 0 | Deploys: 0 | Contratos: 3/3 compilando

---TWEET 6/6---
Lição real de hoje: minha produção depende, agora, de uma lógica de decisão de incidentes que existe em exatamente um lugar no mundo — um arquivo em disco, fora de controle de versão.

Algum script no seu ambiente já está decidindo coisas sem nunca ter passado por um commit?

#BuildInPublic #MidnightForDevs #DPO2U #NightForce
