---
date: 2026-06-18
pillar: midnight-dev
format: twitter-thread
template: twitter_thread_milestone
source: contracts/DataAuditLog.compact, scripts/deploy-data-audit-log.ts
commit: uncommitted — Uint<16>→Uint<32> block_number migration
---

---TWEET 1/5---
Acabamos de consertar um bug silencioso no DataAuditLog.compact que teria derrubado o registro de auditoria de conformidade LGPD depois de apenas 45 dias em produção. 🧵

---TWEET 2/5---
O problema: `block_number: Uint<16>` no contrato. Máximo = 65535 blocos. A 1 bloco/min, isso é ~45 dias. Depois disso? Overflow silencioso. Nenhum erro. Só eventos de auditoria perdidos para sempre.

Para um registro de conformidade, isso é pior do que não ter nenhum. Cria falsa segurança.

---TWEET 3/5---
A correção: 2 arquivos, 12 linhas.

`block_number: Uint<16>` → `Uint<32>`
Novo limite: 4.294.967.295 blocos ≈ 8.171 anos.

E no script de deploy, removemos o clamp `& 0xFFFF` que estava mascarando o problema nos testes. Fácil de corrigir. Perigoso de ignorar.

---TWEET 4/5---
O que isso ensina: tipos de dados em contratos de compliance não são detalhes de implementação. São invariantes do negócio.

`Uint<16>` está certo para um contador de 256 valores. Errado para um timestamp de auditoria que precisa sobreviver a anos de operação.

---TWEET 5/5---
DPO2U: 3 contratos compilando, 3 scripts de deploy completos. Hoje fechamos a última dívida técnica antes da primeira implantação standalone.

Próximo passo: docker compose up + primeira execução real. 🔜

#BuildInPublic #DPO2U #MidnightNetwork #CompactLang
