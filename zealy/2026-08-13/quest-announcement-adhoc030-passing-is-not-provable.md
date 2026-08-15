---
type: quest-announcement
template_version: "1.0"
quest_id: adhoc-030
date: 2026-08-13
milestone: the open question from adhoc-029 (08/08) — is it worth writing a test that stops a
  version constant from silently drifting across files — got answered 5 days later by
  scripts/check-version-consistency.sh, which passes 4/4 live but arrived uncommitted and
  unlogged, the exact pattern the arc has documented since Part 7; meanwhile the Part 8 artifact
  (image-digests.lock) crossed ~90h uncommitted in the same window
generated_from: content/2026-08-13/twitter-thread-consistency-test-lands-uncommitted.md +
  content/2026-08-13/linkedin-passing-test-is-not-evidence-yet.md +
  content/2026-08-13/podcast-prompt-passing-vs-provable.md +
  zealy/2026-08-08/quest-announcement-adhoc029-detector-had-its-own-drift.md +
  scripts/check-version-consistency.sh (live-run verified 2026-08-13 14:01:47 UTC: 4/4 OK) +
  scripts/image-digests.lock (git diff, mtime 2026-08-09 20:03:02 UTC, still modified) +
  docker inspect cross-check + logs/2026-08-06-dev.md
---

# "Passa" e "Provado" São a Mesma Coisa? Seu Teste Que Funciona Ainda Não é Sua Evidência 🎯

---

**Quest ID:** `adhoc-030`
**Frequência:** One-time (Ad Hoc)
**XP:** +250 XP
**Status:** 🟢 **ABERTO**

---

## 📋 Descrição

Continuação direta do arco de observabilidade (`adhoc-025` a `adhoc-029`): em 08 de agosto de 2026, a Parte 7 desta série terminou com uma pergunta em aberto — vale a pena escrever um teste automatizado que impeça a próxima duplicação de uma constante de versão (a mesma classe de bug que gerou 115 alertas falsos em 9 dias) num 4º arquivo?

Cinco dias depois, em 13/08, a resposta apareceu em disco: `scripts/check-version-consistency.sh`, comparando `NODE_VERSION`, `INDEXER_VERSION`, `PROOF_SERVER_VERSION` e `COMPACT_VERSION` entre os 4 arquivos que carregam cada constante (`docker-compose.yml`, `pre-deploy-check.sh`, `midnight-health-check.sh`, `compile-contracts.sh`). Rodado ao vivo às 14h01 UTC de hoje: **4/4 consistentes, exit 0**.

O que isso não resolve, contado direto do estado do repositório, não estimado:

1. O script em si está em disco desde hoje, 10h03 UTC — **zero commits**, `git log --all` retorna vazio, e nenhuma entrada em `logs/` (o log de dev mais recente ainda é de 06/08).
2. O segundo artefato desta mesma história — `scripts/image-digests.lock`, que a Parte 8 (10/08) registrou como "18h+ e contando" — está contando de verdade: hoje soma **~90 horas modificado, sem commitar**. `docker inspect` confirma os 2 digests batendo com produção, mas confirmação técnica não é a mesma coisa que registro auditável.
3. O padrão não é sobre bug — é sobre o intervalo entre "existe e funciona" e "está registrado de forma auditável". Um script que passa localmente é evidência de intenção; um commit com timestamp e autor em controle de versão é o que vira prova para LGPD Art. 37, SOC 2 ou ISO 27001.
4. O próprio processo que está reportando este estado (o ciclo de conteúdo) não tem escopo pra fechar o commit — isso fica pro próximo ciclo de dev. Reportar o número desconfortável, em vez de fingir resolução, é a mesma disciplina que a Parte 7 cobrou do processo.

A ironia que dá nome a esta quest: **o teste escrito pra fechar um gap de auditoria chegou com o mesmo gap de auditoria que ele foi feito pra prevenir.**

**Artefatos disponíveis:**
- `content/2026-08-13/twitter-thread-consistency-test-lands-uncommitted.md` — thread completa ("Parte 9"), com timestamps e comandos de verificação
- `content/2026-08-13/linkedin-passing-test-is-not-evidence-yet.md` — versão LinkedIn, foco na diferença entre "passa" e "prova"
- `content/2026-08-13/podcast-prompt-passing-vs-provable.md` — roteiro de podcast (Ana/DPO vs. Rafael/arquiteto) sobre a mesma tensão

---

## 🎯 O que fazer

Escreva e publique um artigo técnico ou thread que analise a seguinte questão de design:

**"Um teste, script ou verificação que passa localmente — no seu terminal, no seu CI local, no seu disco — já é evidência de compliance ou de qualidade? Ou é só evidência de intenção até virar um commit rastreável?"**

O seu artigo ou thread deve:

1. Descrever um caso real do seu próprio stack onde algo já estava correto e funcionando — mas ainda não estava commitado, logado ou registrado de forma auditável. Quanto tempo esse estado durou?
2. Explicar a diferença prática entre "correto agora" e "provavelmente correto num ponto específico e atribuível no tempo" — e por que frameworks de compliance (LGPD, SOC 2, ISO 27001) são construídos em torno da segunda afirmação, não da primeira
3. Medir, se possível, o "gap disco→git" médio do seu próprio processo hoje — não uma estimativa, um número real tirado de `git log` / `git status` / timestamps de arquivo
4. Concluir com um mecanismo concreto que fecharia esse gap: hook de pre-commit, gate de CI, template de log obrigatório — e por que esse mecanismo especificamente, não outro

---

## 🏷️ Tags

`#midnight` · `#compliance` · `#lgpd` · `#devops` · `#observability` · `#buildinpublic` · `#accountability`

---

## ✅ Validação

**Método:** `manual`

Após publicar, compartilhe o link no Zealy com a tag `#adhoc030`. O post deve ser acessível publicamente (blog, LinkedIn, Substack, Mirror, GitHub Pages ou equivalente).

---

### 💡 Dicas

- **Contexto técnico:** thread autodenominada "Parte 9" de um arco iniciado em `content/2026-07-03`; resolve a pergunta em aberto de `adhoc-029` (08/08); branch `fix/consent-registry-assert-parens`; fontes primárias são `scripts/check-version-consistency.sh` (live-run), `git log --all`, `git status`, e `scripts/image-digests.lock`
- **Referências de base:** LGPD Art. 37 (registro das operações de tratamento — auditável, não só correto); SOC 2 Type II / ISO 27001 Anexo A.12 (integridade e completude de logs de auditoria)
- **Diferencial:** artigos com um exemplo real do próprio pipeline do autor (não hipotético) — "algo que já funciona no seu projeto hoje, mas ainda não está commitado, e há quanto tempo" — ganharão destaque na revisão
- **A pergunta em aberto do DPO2U:** com o teste escrito e passando, ainda falta um mecanismo que impeça esse mesmo gap de se repetir — um hook de pre-commit rodando `check-version-consistency.sh` fecharia isso, ou o próximo 4º arquivo vai drift antes de alguém notar de novo?

---

#NightForce #AliitFellows #MidnightForDevs #ZealyQuest

---

*Post gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Compartilhe seu progresso nos comentários!*
