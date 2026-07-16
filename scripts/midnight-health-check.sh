#!/usr/bin/env bash
# midnight-health-check.sh — Verifica saude dos servicos Midnight (standalone + preprod)
# Cron: 0 */2 * * * (a cada 2 horas)
set -uo pipefail

LOG="/var/log/midnight-health/health.log"
STATE_DIR="/var/log/midnight-health"
SEND_EMAIL="/root/DPO2U/03-Ferramentas/Scripts/social/send-email.sh"
SHAREHOLDER="fredericosanntana@gmail.com"
COMPOSE_DIR="/root/dpo2u-midnight-lab"
PROOF_SERVER_VERSION="7.0.0"   # keep in sync with docker-compose.yml / scripts/pre-deploy-check.sh
NODE_VERSION="0.21.0"          # keep in sync with docker-compose.yml
INDEXER_VERSION="4.0.0-rc.4"   # keep in sync with docker-compose.yml (drift vs SDK-VERSION-MATRIX.md)
LOCK_FILE="$COMPOSE_DIR/scripts/image-digests.lock"
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

# 4. Proof Server — liveness AND version. A container from an unrelated
# project can be squatting on :6300 and still answer /health with "ok"
# (found in production 2026-07-07: dpo2u-midnight-self-funding's
# proof-server:8.0.3 was the only thing listening on this port). Do NOT
# restart_service here even on mismatch: a squatter isn't managed by
# $COMPOSE_DIR, so restarting this stack's compose service wouldn't fix it.
PROOF_HEALTH=$(curl -sf --max-time 10 http://localhost:6300/health 2>/dev/null)
if [[ $? -eq 0 ]] && echo "$PROOF_HEALTH" | grep -q '"ok"'; then
    PROOF_VERSION=$(curl -sf --max-time 10 http://localhost:6300/version 2>/dev/null | tr -d '[:space:]')
    if [[ "$PROOF_VERSION" == "$PROOF_SERVER_VERSION" ]]; then
        log "OK: proof server respondendo (version $PROOF_VERSION)"
    else
        log "FAIL: proof server on :6300 is version '${PROOF_VERSION:-unknown}', expected $PROOF_SERVER_VERSION -- likely a different project's container squatting on the port. Check: docker ps --filter publish=6300"
        ERRORS=$((ERRORS + 1))
    fi
else
    log "FAIL: proof server nao responde"
    ERRORS=$((ERRORS + 1))
fi

# 5. Docker container health status + image tag drift vs docker-compose.yml
for CONTAINER in midnight-standalone-node midnight-standalone-indexer; do
    STATUS=$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null)
    if [[ "$STATUS" == "healthy" ]]; then
        log "OK: $CONTAINER docker health = healthy"
    else
        log "WARN: $CONTAINER docker health = ${STATUS:-unknown}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Digest-pinned when possible (see scripts/pin-image-digest.sh and the
# content/2026-07-08 tag-vs-digest gap): a tag is a mutable pointer, so a
# tag-string match alone cannot detect a retag. If image-digests.lock has an
# entry for this container, compare the content-addressed image ID instead.
# This was previously only wired into pre-deploy-check.sh (the manual gate)
# -- flagged 2026-07-12 as backwards, since this script is the one that
# actually runs unattended via cron and pages the shareholder on failure.
check_image_version() {
    local container="$1" expected="$2"
    local image
    image=$(docker inspect --format '{{.Config.Image}}' "$container" 2>/dev/null)
    [[ -z "$image" ]] && return  # missing container already reported above

    local pinned_id
    pinned_id=$(grep "^${container}=" "$LOCK_FILE" 2>/dev/null | cut -d= -f2-)
    if [[ -n "$pinned_id" ]]; then
        local current_id
        current_id=$(docker inspect --format '{{.Image}}' "$container" 2>/dev/null)
        if [[ "$current_id" == "$pinned_id" ]]; then
            log "OK: $container image digest-pinned, matches $pinned_id"
        else
            log "FAIL: $container image ID drifted since pinning (now $current_id, pinned $pinned_id) even though tag '$image' is unchanged -- re-verify and re-pin: ./scripts/pin-image-digest.sh $container"
            ERRORS=$((ERRORS + 1))
        fi
        return
    fi

    if [[ "$image" == *":$expected" ]]; then
        log "OK: $container image tag = $expected (tag match only, not digest-pinned -- run ./scripts/pin-image-digest.sh $container)"
    else
        log "WARN: $container running '$image', expected tag $expected -- version drift vs docker-compose.yml"
        ERRORS=$((ERRORS + 1))
    fi
}
check_image_version midnight-standalone-node "$NODE_VERSION"
check_image_version midnight-standalone-indexer "$INDEXER_VERSION"

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
