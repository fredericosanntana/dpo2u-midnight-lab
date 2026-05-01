#!/usr/bin/env bash
# test-preprod.sh — Testa conectividade com endpoints publicos Midnight preprod
set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}OK${NC}: $1"; }
fail() { echo -e "${RED}FAIL${NC}: $1"; }
warn() { echo -e "${YELLOW}WARN${NC}: $1"; }

echo "=== Midnight Preprod Connectivity Test ==="
echo "$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. Indexer (GraphQL)
echo "--- Indexer (indexer.preprod.midnight.network) ---"
RESP=$(curl -sf --max-time 15 -X POST \
    https://indexer.preprod.midnight.network/api/v3/graphql \
    -H 'Content-Type: application/json' \
    -d '{"query":"{ block { height } }"}' 2>/dev/null)
if [[ $? -eq 0 ]] && echo "$RESP" | grep -q '"height"'; then
    HEIGHT=$(echo "$RESP" | grep -o '"height":[0-9]*' | cut -d: -f2)
    ok "Indexer GraphQL respondendo (block height: $HEIGHT)"
else
    fail "Indexer GraphQL nao responde"
fi

# 2. RPC Node (WebSocket)
echo "--- RPC Node (rpc.preprod.midnight.network) ---"
RPC_RESP=$(curl -sf --max-time 10 \
    -H "Content-Type: application/json" \
    -d '{"id":1,"jsonrpc":"2.0","method":"system_health"}' \
    https://rpc.preprod.midnight.network 2>/dev/null)
if [[ $? -eq 0 ]] && echo "$RPC_RESP" | grep -q '"result"'; then
    ok "RPC node respondendo via HTTPS"
else
    # Try WSS
    if command -v wscat &>/dev/null; then
        WSS_RESP=$(echo '{"id":1,"jsonrpc":"2.0","method":"system_health"}' | \
            timeout 10 wscat -c wss://rpc.preprod.midnight.network 2>/dev/null)
        if [[ $? -eq 0 ]]; then
            ok "RPC node respondendo via WSS"
        else
            fail "RPC node nao responde (HTTPS nem WSS)"
        fi
    else
        warn "RPC node nao responde via HTTPS (wscat indisponivel para teste WSS)"
    fi
fi

# 3. Faucet
echo "--- Faucet (faucet.preprod.midnight.network) ---"
FAUCET=$(curl -sf --max-time 10 -o /dev/null -w "%{http_code}" \
    https://faucet.preprod.midnight.network/ 2>/dev/null)
if [[ "$FAUCET" == "200" || "$FAUCET" == "301" || "$FAUCET" == "302" ]]; then
    ok "Faucet acessivel (HTTP $FAUCET)"
else
    warn "Faucet retornou HTTP $FAUCET"
fi

# 4. Local proof server (serve preprod tambem)
echo "--- Local Proof Server (localhost:6300) ---"
PROOF=$(curl -sf --max-time 5 http://localhost:6300/health 2>/dev/null)
if [[ $? -eq 0 ]] && echo "$PROOF" | grep -q '"ok"'; then
    ok "Proof server local respondendo"
else
    fail "Proof server local nao responde"
fi

echo ""
echo "=== Teste completo ==="
