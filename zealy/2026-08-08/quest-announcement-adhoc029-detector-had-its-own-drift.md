---
type: quest-announcement
template_version: "1.0"
quest_id: adhoc-029
date: 2026-08-08
milestone: the version-drift detector script itself carried a stale version constant for 9 days (2026-07-26 to 2026-08-05), firing 115 false WARN/ALERT cycles to the shareholder inbox — root cause was the same class of bug the script exists to catch (one value duplicated across 3 files, corrected in 2, forgotten in 1); disk-to-git gap on the eventual fix was 24h almost to the minute
generated_from: content/2026-08-07/twitter-thread-healthcheck-lied-nine-days.md + /var/log/midnight-health/health.log (grep verified 2026-08-07) + git show 08f170d, 1a8813e + logs/2026-08-06-dev.md + zealy/2026-08-05, 2026-08-06 status notes + docker ps live cross-check
---

# O Detector de Drift Tinha Seu Próprio Drift — Seu Verificador Confia Cegamente na Constante que Ele Mesmo Deveria Vigiar? 🎯

---

**Quest ID:** `adhoc-029`
**Frequência:** One-time (Ad Hoc)
**XP:** +250 XP
**Status:** 🟢 **ABERTO**

---

## 📋 Descrição

Continuação direta do arco de observabilidade (`adhoc-025` a `adhoc-028`): em 25 de julho de 2026, o commit `1a8813e` corrigiu a tag da imagem do indexer standalone (`4.0.0-rc.4` → `3.1.0`) em `docker-compose.yml` e `pre-deploy-check.sh`. Um terceiro arquivo com a mesma informação — `scripts/midnight-health-check.sh` — ficou com a constante antiga. Ninguém notou na hora, porque nada além do próprio script comparava as três fontes entre si.

O que isso causou, contado direto em `health.log`, não estimado:

1. O cron de 2h do `midnight-health-check.sh` passou a comparar o container real (rodando corretamente `3.1.0`) contra a constante desatualizada (`4.0.0-rc.4`) dentro do próprio script. Cada tick gerava WARN → ALERT → e-mail para o shareholder. **115 disparos falsos** entre 26/07 22h00 e 05/08 10h00 — 9 dias seguidos, a cada 2 horas.
2. O fix foi salvo em disco em 05/08 às 10:02:53. O cron lê o script do disco, não do git — o último WARN falso registrado foi às 05/08 10:00:04, e o primeiro OK correto veio no tick seguinte, 05/08 12:00:03. A mentira parou no segundo exato em que o arquivo certo tocou o disco.
3. O commit desse fix (`08f170d`) só aconteceu em 06/08 às 10:02:44 — **24 horas depois, quase ao minuto**. Por um dia inteiro, `git log` continuava dizendo "ainda quebrado" enquanto a produção já estava correta havia 24h. O repositório mentiu depois que a realidade parou de mentir.
4. Verificação cruzada, não só diff de arquivo: `docker ps` confirma o indexer real rodando `indexer-standalone:3.1.0`, batendo com a constante corrigida. `compile-contracts.sh` rerodado por garantia: ConsentRegistry (8 circuitos), DataAuditLog (11), DataSubjectRights (12) — 3/3 OK, nenhum contrato tocado por essa mudança.

A ironia que dá nome a esta quest: **o script existe para pegar exatamente esse tipo de drift entre o que roda e o que devia rodar — e ele mesmo teve o bug que foi feito para caçar.** Um valor duplicado em 3 arquivos, corrigido em 2, esquecido em 1. Fonte única de verdade não é estética de código — é o controle que teria evitado 115 alertas falsos e um gap de 24h entre disco e git.

Para um sistema de compliance (LGPD Art. 37, SOC 2, ISO 27001), a implicação é direta: um verificador automatizado que carrega sua própria cópia de um valor crítico é, ele mesmo, uma superfície de drift — e precisa do mesmo rigor de fonte única que o sistema que ele audita.

**Artefato disponível:** `content/2026-08-07/twitter-thread-healthcheck-lied-nine-days.md` — a thread completa (autodenominada "Parte 7" do arco) com os timestamps exatos e os comandos de verificação (`health.log` grep, `git show`, `docker ps`).

---

## 🎯 O que fazer

Escreva e publique um artigo técnico ou thread que analise a seguinte questão de design:

**"O que acontece quando a própria ferramenta de verificação carrega uma cópia da informação que ela deveria vigiar — e essa cópia sai de sincronia?"**

O seu artigo ou thread deve:

1. Descrever um caso real do seu próprio stack onde um verificador, linter, healthcheck ou monitor carregava uma constante/config duplicada de outro lugar do sistema — e o que aconteceu quando as duas saíram de sincronia
2. Explicar por que esse tipo de bug é mais perigoso que um bug comum: o verificador não só falha em pegar um problema real, ele ativamente produz ruído (alertas falsos) que treina a equipe a ignorar o próprio canal de alerta
3. Medir, se possível, o "gap disco→git" do seu próprio processo: quanto tempo passa, em média, entre uma correção entrar em produção e essa mesma correção estar registrada no controle de versão de forma auditável
4. Concluir com uma recomendação concreta: que mecanismo (import único, config compartilhado, teste de consistência entre arquivos) você adicionaria para que uma constante crítica nunca mais exista em mais de um lugar

---

## 🏷️ Tags

`#midnight` · `#compliance` · `#lgpd` · `#devops` · `#observability` · `#buildinpublic` · `#accountability`

---

## ✅ Validação

**Método:** `manual`

Após publicar, compartilhe o link no Zealy com a tag `#adhoc029`. O post deve ser acessível publicamente (blog, LinkedIn, Substack, Mirror, GitHub Pages ou equivalente).

---

### 💡 Dicas

- **Contexto técnico:** thread autodenominada "Parte 7" de um arco iniciado em `content/2026-07-03`; commits-chave `1a8813e` (25/07, fix parcial) e `08f170d` (06/08, fix do 3º arquivo), branch `fix/consent-registry-assert-parens`; fonte primária é `/var/log/midnight-health/health.log`, com contagem verificada por grep, não estimada
- **Referências de base:** LGPD Art. 37 (registro de operações de tratamento auditável); SOC 2 Type II / ISO 27001 Anexo A.12 (integridade e completude de logs de auditoria)
- **Diferencial:** artigos com um exemplo real do próprio pipeline do autor (não hipotético) — "que verificador seu carregava uma cópia desatualizada de algo, e quanto ruído isso gerou antes de alguém notar" — ganharão destaque na revisão
- **A pergunta em aberto do DPO2U:** com o 3º arquivo corrigido e commitado, ainda não existe um teste automatizado que impeça a próxima duplicação de constante de versão em um 4º arquivo — vale a pena escrever esse teste antes do próximo capítulo do arco?

---

#NightForce #AliitFellows #MidnightForDevs #ZealyQuest

---

*Post gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Compartilhe seu progresso nos comentários!*
