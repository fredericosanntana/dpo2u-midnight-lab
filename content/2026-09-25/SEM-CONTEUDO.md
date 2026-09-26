---
date: 2026-09-25
format: registro-de-ciclo
status: nenhum conteúdo gerado — sem dev novo; um achado de infra verificado hoje, para decisão
---

# 2026-09-25 — ciclo content sem peças

Terceiro dia seguido com a mesma decisão (23, 24, 25): não há trabalho de dev
novo para sustentar thread, post ou podcast. A sessão rodou até o fim e
escolheu não publicar. Este arquivo existe para o próximo ciclo saber disso.

## O que foi verificado

```
$ git log -1 --format='%h %ad' --date=short -- . ':!content' ':!zealy' ':!logs'
9b25575 2026-09-15          # último commit do lab fora de content/logs/zealy

$ git log --since='2026-09-20' -- contracts scripts package.json src
(vazio)

$ git status --short
(vazio)                     # build/ tocado depois de 24/09, byte-idêntico ao commitado

$ git -C /root/dpo2u-midnight-agent-dna log --since=2026-09-15 --oneline
(vazio)                     # DNA parado desde 05/08

$ ls logs/2026-09-2*
logs/2026-09-20-dev.md      # sem dev log de 21 a 25

$ cat /var/log/managed-agent/dev.log | wc -c
174                         # 6 x "Reached max turns (12)"; a 6ª às 10:06:00 UTC de hoje
```

Pendências humanas inalteradas:

- `MIDNIGHT_AGENT_MAX_TURNS` ausente de `/etc/cron.d/dpo2u-midnight-agent`
  (`grep -c` = 0, mtime 2026-08-17 — 39 dias). Infra compartilhada, não alterei.
- `fix/consent-registry-assert-parens`: 56 commits à frente de `main`, merge-base
  `f710015` (2026-05-01, 147 dias). Decisão de merge é do shareholder.
- `scripts/midnight-health-check.sh:29` continua chamando `send-email.sh` com
  args posicionais, que o parser rejeita (achado de 24/09). Contadores de hoje
  em `/var/log/midnight-health/health.log`: 1747 linhas `ALERT:` no total, 296
  em setembro (eram 1735 / 284 ontem — +12, uma por execução do cron).

## Achado novo de hoje: o alarme toca por uma causa real, e o "healthy" é falso

O `WARN: chain possivelmente travada` do health-check não é ruído. Medido hoje:

```
$ curl -s -d '{"id":1,"jsonrpc":"2.0","method":"chain_getHeader"}' \
    -H 'Content-Type: application/json' http://localhost:9944
"number":"0x544ff"          # = 345343

$ grep -c 'chain possivelmente travada (block 345343 <= 345343)' \
    /var/log/midnight-health/health.log
441
$ grep -n 'block 345343' /var/log/midnight-health/health.log | head -1
15221:2026-08-19 22:04:01 WARN: ...
$ grep -n 'chain avancando' /var/log/midnight-health/health.log | tail -1
15210:2026-08-19 20:04:02 OK: chain avancando (block 344172 -> 345343)
```

A altura 345343 foi atingida em 19/08 às 20:04 e não se moveu desde então: 37
dias. O container `midnight-standalone-node` (`CFG_PRESET=dev`, `StartedAt`
2026-08-19T20:01:25Z — três minutos antes do último avanço) segue
`Up 5 weeks (healthy)`. O healthcheck do Docker é
`curl -f http://localhost:9944/health`, que responde 200 com o nó vivo mesmo sem
conseguir produzir bloco. Roda e não entrega.

O que o log do nó mostra (`docker logs --tail`, 14:05 UTC de hoje):

```
Error loading Ledger State: Custom { kind: NotFound, error: "BackendLoader::get():
  key 6b4616988f…20356f not in storage arena. Are you sure you persisted this
  key or one of its ancestors?" }
panicked at /pallets/midnight/src/lib.rs:307:6:
Post block update failed: <wasm:stripped>
Proposing failed: Import failed: Error at calling runtime api: Execution failed:
  Execution aborted due to trap: wasm trap: wasm `unreachable` instruction executed
💤 Idle (0 peers), best: #345343, finalized #345341
```

`docker logs midnight-standalone-node | grep -c 'Post block update failed'` = 5319
— mas o log retido só começa em 2026-09-25 05:13:36, então isso mede as ~9h
finais, não os 37 dias.

**O que isto prova:** o nó standalone tenta propor bloco a cada ~6s, falha ao
carregar um estado do ledger que não está no storage, e entra em panic no
pallet midnight. A altura não avança há 37 dias.

**O que isto não prova:** a causa raiz. "Chave ausente no storage arena" sugere
estado persistido incompleto depois do restart de 19/08, mas é hipótese — o log
daquela hora já rotacionou. Também não sei se algum contrato/script do lab
depende hoje desse nó (o último deploy/interact do lab é anterior).

**Não corrigi.** Reiniciar ou recriar o volume do nó apaga o estado do devnet
local; é decisão do shareholder, não deste ciclo.

## Candidato a conteúdo, se o shareholder quiser

Pilar `midnight-dev` / `dpo2u-arch`, formato `sdk_debugging_diary`: "o
healthcheck que diz healthy numa chain parada há 37 dias" — dois alarmes
(health-check e Docker) e nenhum dos dois entrega o efeito que promete. Só vale
peça depois que houver diagnóstico da causa e correção ou decisão; hoje seria
narrar um bug aberto, sem o "here's the fix" que o pilar exige.

## O que falta para voltar a ter conteúdo real

1. A fase dev rodar até o fim (teto de 12 turnos — `run_claude_task.sh:24`).
2. Trabalho de produto no lab (contratos, deploy, interact).
3. Decisão sobre `fix/consent-registry-assert-parens`.
4. Decisão sobre o nó standalone travado e sobre o e-mail do health-check.
