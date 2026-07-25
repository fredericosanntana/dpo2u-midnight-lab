---
type: quest-announcement
template_version: "1.0"
quest_id: adhoc-027
date: 2026-07-22
milestone: 4 days with zero new commits after da60821 (2026-07-16) landed; re-verification on 2026-07-20 found the same digest-pinning gap undisturbed, plus a newly-quantified 80-day outage (2026-05-01 → 2026-07-20) of the standalone-node/-indexer stack that explains why the gap hasn't moved — there is nothing running to pin a real digest against
generated_from: content/2026-07-20/twitter-thread-day-4-zero-commits.md + git log/status (verified 2026-07-20) + docker ps (verified 2026-07-20) + scripts/image-digests.lock
---

# Documentar o Mesmo Gap de Novo Não É Fechar Ele. O Seu Changelog Já Confundiu os Dois? 🎯

---

**Quest ID:** `adhoc-027`
**Frequência:** One-time (Ad Hoc)
**XP:** +250 XP
**Status:** 🟢 **ABERTO**

---

## 📋 Descrição

Continuação direta do arco de observabilidade (`adhoc-025`, `adhoc-026`): em 16 de julho de 2026, o commit `da60821` finalmente entrou no `git log` — proof-server passou a ser checado por `/version` (não só liveness) e os 2 scripts de produção passaram a comparar digest de imagem, com fallback para tag.

Reconferido direto na fonte em 20 de julho (não em relatório de dia anterior): `git log` ainda mostra `da60821` como último commit. Quatro dias, zero commits novos em script ou contrato. Dois achados específicos, ambos verificados por comando, não por vibe:

1. `scripts/image-digests.lock` segue com zero entradas reais — exatamente o estado de 16/07, intocado.
2. `docker ps` mostra o proof-server "squatter" da porta 6300 (`dpo2u-midnight-self-funding-proof-server-1`, v8.0.3) ainda no ar, "Up 4 weeks" — descoberto em 07/07 (`adhoc-025`), documentado publicamente 3 vezes desde então, nunca desligado nem substituído pelo stack próprio.

O achado novo de hoje: `docker ps -a` não lista `midnight-standalone-node` nem `midnight-standalone-indexer` — nenhum dos dois. Cruzando com o histórico, esses containers estão fora do ar desde 1º de maio, **80 dias**. Sem esse ambiente de pé, `pin-image-digest.sh` literalmente não tem imagem própria para pinar — o gap de digest-pinning parado não é (só) falta de tempo do dev, é falta de ambiente rodando para gerar um digest real contra o qual comparar.

Isso expõe a pergunta central desta quest: **documentar o mesmo gap conhecido pela segunda, terceira vez num thread de build-in-public tem valor de honestidade, mas não é o mesmo ato que fechar o gap — e um pipeline de conformidade real precisa de um sinal que diferencie os dois, não apenas mais um post reconhecendo o problema.**

Para um sistema de compliance (LGPD Art. 37, SOC 2, ISO 27001), a implicação é prática: se a métrica de saúde do processo é "existe um post recente sobre o problema", ela pode ficar verde para sempre sem o problema nunca fechar. A métrica correta tem que medir o estado do sistema (containers pinados, ambiente de pé), não a frequência de menção do problema.

**Artefato disponível:** `content/2026-07-20/twitter-thread-day-4-zero-commits.md` — a thread completa com os 3 comandos de verificação (`git log`, `docker ps`, `docker ps -a`) e as métricas reais do dia.

---

## 🎯 O que fazer

Escreva e publique um artigo técnico ou thread que analise a seguinte questão de design:

**"Quando documentar repetidamente um gap conhecido no seu log de build-in-public vira substituto de fechar esse gap — e o que força a virada de 'documentar' para 'remediar'?"**

O seu artigo ou thread deve:

1. Descrever um caso real do seu próprio stack onde o mesmo gap foi mencionado/anunciado mais de uma vez sem ser fechado — e por quê (falta de tempo, falta de prioridade, ou falta de ambiente/infra para sequer testar o fix, como no caso do standalone stack caído há 80 dias)
2. Propor uma métrica objetiva que diferencie "gap documentado" de "gap fechado" — algo verificável por comando, não por leitura de post
3. Avaliar se a ausência prolongada do ambiente necessário para fechar um gap (não só falta de tempo) deveria ser tratada como um tipo de dívida técnica separado, com seu próprio dono e prazo
4. Concluir com uma recomendação concreta: qual sinal automatizável (ex.: dias desde o último commit relevante, dias com o ambiente de teste fora do ar) você adicionaria ao seu próprio dashboard de saúde de processo para pegar esse padrão antes que vire hábito

---

## 🏷️ Tags

`#midnight` · `#compliance` · `#lgpd` · `#devops` · `#observability` · `#buildinpublic` · `#accountability`

---

## ✅ Validação

**Método:** `manual`

Após publicar, compartilhe o link no Zealy com a tag `#adhoc027`. O post deve ser acessível publicamente (blog, LinkedIn, Substack, Mirror, GitHub Pages ou equivalente).

---

### 💡 Dicas

- **Contexto técnico:** cronologia completa em `content/2026-07-03` → `content/2026-07-20` (6 partes); o commit real é `da60821`, branch `fix/consent-registry-assert-parens`; o outage de 80 dias é do `midnight-standalone-node`/`-indexer` (01/05 → 20/07), confirmado por ausência em `docker ps -a`
- **Referências de base:** LGPD Art. 37 (registro de operações de tratamento auditável); SOC 2 Type II / ISO 27001 Anexo A.12 (integridade e completude de logs de auditoria)
- **Diferencial:** artigos com um exemplo real do próprio pipeline do autor (não hipotético) — "que gap você já anunciou mais de uma vez sem fechar, e o que faltava de verdade" — ganharão destaque na revisão
- **A pergunta em aberto do DPO2U:** dos dois gaps abertos (proof-server squatter há 4 semanas; standalone stack caído há 80 dias), qual fechar primeiro muda o resultado da métrica de digest-pinning — e qual só adia o mesmo post de novo daqui a 10 dias?

---

#NightForce #AliitFellows #MidnightForDevs #ZealyQuest

---

*Post gerado automaticamente pelo Pipeline Zealy do DPO2U*
*Compartilhe seu progresso nos comentários!*
