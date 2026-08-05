---
type: quest-announcement
template_version: "1.0"
quest_id: adhoc-028
date: 2026-08-04
milestone: standalone node/indexer stack came back online 2026-07-26/07-28 (tag fix from commit 1a8813e, 2026-07-25) but three consecutive Zealy cycles (2026-07-28, 2026-07-29, 2026-08-01) kept reporting it down because none re-ran docker ps against live state — only caught 2026-08-03 by re-verifying the source instead of the prior day's report
generated_from: content/2026-08-03/twitter-thread-stack-back-nobody-noticed.md + docker inspect/ps (verified 2026-08-03) + scripts/pre-deploy-check.sh live run (verified 2026-08-03) + git log/show 1a8813e, a26356e (2026-07-25) + zealy/2026-07-28, 2026-07-29, 2026-08-01 status notes
---

# O Stack Voltou ao Ar Há Dias e 3 Ciclos Zealy Não Notaram — Seu Processo Reconfirma o Estado ou Só Repete o Relatório de Ontem? 🎯

---

**Quest ID:** `adhoc-028`
**Frequência:** One-time (Ad Hoc)
**XP:** +250 XP
**Status:** 🟢 **ABERTO**

---

## 📋 Descrição

Continuação direta do arco de observabilidade (`adhoc-025` a `adhoc-027`): em 25 de julho de 2026, o commit `1a8813e` corrigiu a tag da imagem do indexer standalone (`4.0.0-rc.4` → `3.1.0`, batendo com a versão real do preprod). No mesmo dia, o commit `a26356e` admitiu que 3 ciclos de status anteriores (18/07, 22/07, 23/07) tinham escrito "commitado" sem ter commitado nada — o padrão do arco inteiro é o mesmo: `git log`/`docker ps` não mentem, os relatórios sim.

O que ninguém checou nos 3 ciclos seguintes (28/07, 29/07, 01/08): todos reafirmaram "stack standalone fora do ar desde 01/05" com base na conclusão do relatório anterior, e nenhum rodou `docker ps` para reconferir contra o estado ao vivo. Reconferido em 03/08:

1. `docker inspect` mostra `midnight-standalone-node` de pé desde 26/07 (v0.21.0) e `midnight-standalone-indexer` de pé desde 28/07, rodando `midnightntwrk/indexer-standalone:3.1.0` — exatamente a tag corrigida 1-3 dias antes pelo `1a8813e`. Ambos `healthy`.
2. 86 dias (node) / 88 dias (indexer) de outage real, contados desde 01/05 — mas o retorno ao ar não apareceu em nenhum dos 3 status notes seguintes, todos focados em `git log`/`content/`, nenhum em estado de container.
3. `pre-deploy-check.sh --network standalone` hoje: 11 passed / 1 failed, contra 7 passed / 5 failed em 25/07. A única falha remanescente é a mesma de sempre — proof-server "squatter" na porta 6300 (v8.0.3, projeto não relacionado, documentado desde 07/07).
4. Log do node ao vivo: bloco #111582/#111583 sendo produzido e finalizado a cada ~6s — chain real, rodando.

E mesmo com a chain saudável: zero arquivo `deployment-*.json` no repo. Nenhum dos 3 contratos (`ConsentRegistry`, `DataAuditLog`, `DataSubjectRights`) foi implantado nessa instância. `deploy-all.ts` não rodou contra o stack recuperado, e `image-digests.lock` segue 0/2 pinados — mesmo com o ambiente que faltava para pinar disponível há mais de uma semana.

Isso expõe a pergunta central desta quest: **"container Up (healthy)" não é entrega, é só a pré-condição — e um processo de status que reconfirma o relatório de ontem em vez do estado ao vivo pode ficar cego tanto para regressões quanto para recuperações.** O mesmo hábito que fez 3 ciclos perderem uma queda real (arco anterior) fez 3 ciclos perderem uma recuperação real (este).

Para um sistema de compliance (LGPD Art. 37, SOC 2, ISO 27001), a implicação é a mesma dos capítulos anteriores: a métrica de saúde do processo precisa medir o estado do sistema, verificado por comando, não a continuidade de uma narrativa entre relatórios.

**Artefato disponível:** `content/2026-08-03/twitter-thread-stack-back-nobody-noticed.md` — a thread completa (autodenominada "Parte 6" do arco) com os comandos de verificação (`docker inspect`, `docker ps -a`, `pre-deploy-check.sh`) e as métricas reais do dia.

---

## 🎯 O que fazer

Escreva e publique um artigo técnico ou thread que analise a seguinte questão de design:

**"Quando o seu processo de status para de reconfirmar o estado ao vivo e passa a só repetir o relatório do ciclo anterior — e o que isso custa quando o estado muda para melhor sem ninguém perceber?"**

O seu artigo ou thread deve:

1. Descrever um caso real do seu próprio stack onde um relatório/dashboard/status ficou "congelado" repetindo a mesma conclusão por múltiplos ciclos, sem reconferir a fonte ao vivo
2. Diferenciar os dois tipos de erro que esse hábito produz: perder uma regressão real (achar que está tudo bem quando não está) e perder uma recuperação real (achar que está quebrado quando já foi corrigido) — como no caso do stack DPO2U
3. Propor uma regra objetiva de cadência: a cada quantos ciclos (ou a cada quanto tempo) um processo de status deve obrigatoriamente reconferir a fonte primária em vez de herdar a conclusão do ciclo anterior
4. Concluir com uma recomendação concreta: qual comando/verificação você adicionaria como passo obrigatório no seu próprio pipeline de status para nunca mais herdar uma conclusão sem reconferir

---

## 🏷️ Tags

`#midnight` · `#compliance` · `#lgpd` · `#devops` · `#observability` · `#buildinpublic` · `#accountability`

---

## ✅ Validação

**Método:** `manual`

Após publicar, compartilhe o link no Zealy com a tag `#adhoc028`. O post deve ser acessível publicamente (blog, LinkedIn, Substack, Mirror, GitHub Pages ou equivalente).

---

### 💡 Dicas

- **Contexto técnico:** thread autodenominada "Parte 6" de um arco iniciado em `content/2026-07-03`; commits-chave `1a8813e` e `a26356e` (25/07), branch `fix/consent-registry-assert-parens`; a recuperação real é do `midnight-standalone-node`/`-indexer` (26-28/07), confirmada por `docker inspect`/`docker ps` em 03/08
- **Referências de base:** LGPD Art. 37 (registro de operações de tratamento auditável); SOC 2 Type II / ISO 27001 Anexo A.12 (integridade e completude de logs de auditoria)
- **Diferencial:** artigos com um exemplo real do próprio pipeline do autor (não hipotético) — "que status ficou congelado no seu processo, e o que ele deixou de notar" — ganharão destaque na revisão
- **A pergunta em aberto do DPO2U:** com a chain saudável e 11/12 checks passando, o próximo passo óbvio é rodar `deploy-all.ts` contra o stack recuperado — por que isso ainda não aconteceu, e o que isso diz sobre a diferença entre "ambiente pronto" e "ação tomada"?

---

#NightForce #AliitFellows #MidnightForDevs #ZealyQuest

---

*Post gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Compartilhe seu progresso nos comentários!*
