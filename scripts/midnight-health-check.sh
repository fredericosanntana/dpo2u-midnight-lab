#!/usr/bin/env bash
# midnight-health-check.sh — Verifica saude dos servicos Midnight (standalone + preprod)
# Cron: 0 */2 * * * (a cada 2 horas)
set -uo pipefail

LOG="/var/log/midnight-health/health.log"
STATE_DIR="/var/log/midnight-health"
SEND_EMAIL="/root/DPO2U/03-Ferramentas/Scripts/social/send-email.sh"
SHAREHOLDER="fredericosanntana@gmail.com"
COMPOSE_DIR="/root/dpo2u-midnight-lab"
ERRORS=0

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG"; }

alert() {
    local subject="$1"
    local body="$2"
    log "ALERT: $subject"
    if [[ -x "$SEND_EMAIL" ]]; then
        echo "$body" | "$SEND_EMAIL" "$SHAREHOLDER" "$subject" 2>/dev/null || true
    fi
}

restart_service() {
    local service="$1"
    log "RESTART: tentando reiniciar $service"
    cd "$COMPOSE_DIR" && docker-compose restart "$service" >> "$LOG" 2>&1
}

# === STANDALONE TESTNET ===

# 1. Node RPC
NODE_HEALTH=$(curl -sf --max-time 10 -H "Content-Type: application/json" \
    -d '{"id":1,"jsonrpc":"2.0","method":"system_health"}' \
    http://localhost:9944 2>/dev/null)
if [[ $? -eq 0 ]] && echo "$NODE_HEALTH" | grep -q '"result"'; then
    log "OK: node RPC respondendo"
else
    log "FAIL: node RPC nao responde"
    restart_service midnight-node
    ERRORS=$((ERRORS + 1))
fi

# 2. Node block progression (detect stalled chain)
CURRENT_BLOCK=$(curl -sf --max-time 10 -H "Content-Type: application/json" \
    -d '{"id":1,"jsonrpc":"2.0","method":"chain_getHeader"}' \
    http://localhost:9944 2>/dev/null | grep -o '"number":"[^"]*"' | cut -d'"' -f4)
LAST_BLOCK_FILE="$STATE_DIR/last-block.txt"
if [[ -n "$CURRENT_BLOCK" ]]; then
    CURRENT_DEC=$((16#${CURRENT_BLOCK#0x}))
    if [[ -f "$LAST_BLOCK_FILE" ]]; then
        LAST_DEC=$(cat "$LAST_BLOCK_FILE")
        if [[ "$CURRENT_DEC" -le "$LAST_DEC" ]]; then
            log "WARN: chain possivelmente travada (block $CURRENT_DEC <= $LAST_DEC)"
            ERRORS=$((ERRORS + 1))
        else
            log "OK: chain avancando (block $LAST_DEC -> $CURRENT_DEC)"
        fi
    else
        log "OK: block height $CURRENT_DEC (primeiro check)"
    fi
    echo "$CURRENT_DEC" > "$LAST_BLOCK_FILE"
fi

# 3. Indexer GraphQL
INDEXER_RESP=$(curl -sf --max-time 10 -X POST \
    http://localhost:8088/api/v3/graphql \
    -H 'Content-Type: application/json' \
    -d '{"query":"{ __typename }"}' 2>/dev/null)
if [[ $? -eq 0 ]] && echo "$INDEXER_RESP" | grep -q '"__typename"'; then
    log "OK: indexer GraphQL respondendo"
else
    log "FAIL: indexer GraphQL nao responde"
    restart_service indexer
    ERRORS=$((ERRORS + 1))
fi

# 4. Proof Server
PROOF_HEALTH=$(curl -sf --max-time 10 http://localhost:6300/health 2>/dev/null)
if [[ $? -eq 0 ]] && echo "$PROOF_HEALTH" | grep -q '"ok"'; then
    log "OK: proof server respondendo"
else
    log "FAIL: proof server nao responde"
    ERRORS=$((ERRORS + 1))
fi

# 5. Docker container health status
for CONTAINER in midnight-standalone-node midnight-standalone-indexer; do
    STATUS=$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null)
    if [[ "$STATUS" == "healthy" ]]; then
        log "OK: $CONTAINER docker health = healthy"
    else
        log "WARN: $CONTAINER docker health = ${STATUS:-unknown}"
        ERRORS=$((ERRORS + 1))
    fi
done

# === PREPROD (endpoints publicos) ===

PREPROD_INDEXER=$(curl -sf --max-time 15 -X POST \
    https://indexer.preprod.midnight.network/api/v3/graphql \
    -H 'Content-Type: application/json' \
    -d '{"query":"{ __typename }"}' 2>/dev/null)
if [[ $? -eq 0 ]] && echo "$PREPROD_INDEXER" | grep -q '"__typename"'; then
    log "OK: preprod indexer acessivel"
else
    log "WARN: preprod indexer inacessivel (endpoint publico)"
fi

# === RESULTADO ===

if [[ $ERRORS -gt 0 ]]; then
    alert "[MIDNIGHT] $ERRORS falha(s) detectada(s)" \
        "O health check Midnight detectou $ERRORS problema(s) no standalone testnet.
Verificar: cat $LOG
Containers: docker-compose -f $COMPOSE_DIR/docker-compose.yml ps"
fi

log "CHECK COMPLETO: $ERRORS erro(s)"
