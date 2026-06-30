#!/usr/bin/env bash
# pre-deploy-check.sh — Pre-flight validation for Midnight Network deployment
#
# Checks all prerequisites before running any deploy-*.ts script.
# Based on SDK-VERSION-MATRIX.md and WORKAROUND-GUIDE.md (DNA repo).
#
# Usage:
#   ./scripts/pre-deploy-check.sh [--network standalone|preprod|preview]
#
# Exit codes:
#   0 = all checks passed
#   1 = one or more checks failed (deploy will likely fail)

set -uo pipefail

# ---------------------------------------------------------------
# Config
# ---------------------------------------------------------------
COMPACT_VERSION="0.29.0"
COMPACT_BIN="$HOME/.compact/bin/compactc"
REQUIRED_NODE_MAJOR=22
LAB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$LAB_DIR/build"
CONTRACTS=("ConsentRegistry" "DataAuditLog" "DataSubjectRights")

NETWORK="${NETWORK:-standalone}"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --network) NETWORK="$2"; shift 2 ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
done

# ---------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------
PASS=0
FAIL=0

ok()   { echo "  [OK]   $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  [WARN] $1"; }
section() { echo ""; echo "--- $1 ---"; }

# ---------------------------------------------------------------
# Main checks
# ---------------------------------------------------------------
echo "============================================================"
echo "  DPO2U Lab — Pre-Deploy Validation"
echo "  Network: $NETWORK"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"

# ----------- Node.js version --------------------------------
section "Runtime"
if command -v node &>/dev/null; then
  node_version=$(node --version 2>&1 | tr -d 'v')
  node_major="${node_version%%.*}"
  if [ "$node_major" -ge "$REQUIRED_NODE_MAJOR" ]; then
    ok "Node.js $node_version (requires >= $REQUIRED_NODE_MAJOR.x)"
  else
    fail "Node.js $node_version is too old — requires >= $REQUIRED_NODE_MAJOR.x (SDK-VERSION-MATRIX)"
  fi
else
  fail "Node.js not found — install Node.js $REQUIRED_NODE_MAJOR.x"
fi

# ----------- compactc version --------------------------------
section "Compact Compiler"
# Apply Bug 1 workaround: ensure PATH includes compact bin
if [[ ":$PATH:" != *":$HOME/.compact/bin:"* ]]; then
  export PATH="$HOME/.compact/bin:$PATH"
fi

if command -v compactc &>/dev/null; then
  cc_version=$(compactc --version 2>&1 | head -1)
  if [[ "$cc_version" == *"$COMPACT_VERSION"* ]]; then
    ok "compactc $cc_version"
  else
    fail "compactc version mismatch: got '$cc_version', want $COMPACT_VERSION"
  fi
elif [ -f "$COMPACT_BIN" ]; then
  cc_version=$("$COMPACT_BIN" --version 2>&1 | head -1)
  if [[ "$cc_version" == *"$COMPACT_VERSION"* ]]; then
    warn "compactc found at $COMPACT_BIN but not in PATH — run Bug 1 fix from WORKAROUND-GUIDE"
    PASS=$((PASS + 1))
  else
    fail "compactc at $COMPACT_BIN: version mismatch '$cc_version', want $COMPACT_VERSION"
  fi
else
  fail "compactc not found — install: npx @midnight-ntwrk/compact-installer@latest"
fi

# ----------- .npmrc check ------------------------------------
section "npm Configuration"
if [ -f "$LAB_DIR/.npmrc" ]; then
  fail ".npmrc exists — remove it: rm -f .npmrc (Bug 2: npm.midnight.network does not resolve)"
else
  ok "No .npmrc (Bug 2 safe)"
fi

# ----------- Build artifacts ---------------------------------
section "Build Artifacts"
all_built=true
for contract in "${CONTRACTS[@]}"; do
  contract_dir="$BUILD_DIR/$contract"
  if [ -d "$contract_dir/keys" ] && [ -d "$contract_dir/contract" ] && [ -d "$contract_dir/zkir" ]; then
    key_count=$(find "$contract_dir/keys" -name "*.prover" | wc -l)
    ok "$contract — $key_count prover keys + contract + zkir present"
  else
    fail "$contract — build artifacts missing. Run: ./scripts/compile-contracts.sh --contract $contract"
    all_built=false
  fi
done

if [ "$all_built" = false ]; then
  echo ""
  echo "  Hint: run ./scripts/compile-contracts.sh to build all contracts"
fi

# ----------- Docker / Network checks -------------------------
section "Infrastructure (network: $NETWORK)"

if [ "$NETWORK" = "standalone" ]; then
  # Check Docker is available
  if ! command -v docker &>/dev/null; then
    fail "Docker not found — required for standalone network"
  else
    ok "Docker available: $(docker --version | head -1)"

    # Check midnight-node (port 9944)
    if curl -sf --max-time 3 http://127.0.0.1:9944 \
         -d '{"jsonrpc":"2.0","method":"system_health","params":[],"id":1}' \
         -H 'Content-Type: application/json' -o /dev/null 2>&1; then
      ok "midnight-node responding on :9944"
    else
      fail "midnight-node not responding on :9944 — run: docker compose up -d"
    fi

    # Check indexer (port 8088)
    if curl -sf --max-time 3 \
         -X POST http://127.0.0.1:8088/api/v3/graphql \
         -H 'Content-Type: application/json' \
         -d '{"query":"{ __typename }"}' -o /dev/null 2>&1; then
      ok "indexer-standalone responding on :8088"
    else
      fail "indexer-standalone not responding on :8088 — check docker compose logs indexer"
    fi

    # Check proof-server (port 6300)
    if curl -sf --max-time 3 http://127.0.0.1:6300/health -o /dev/null 2>&1; then
      ok "proof-server responding on :6300"
    else
      fail "proof-server not responding on :6300 — check docker compose logs proof-server"
    fi

    # Check Docker image versions
    echo ""
    echo "  Docker container versions (expected: node 0.21.0, indexer 3.1.0, proof 7.0.0):"
    docker ps --format "  {{.Image}}" 2>/dev/null | grep midnight || warn "No midnight containers running"
  fi

elif [ "$NETWORK" = "preprod" ] || [ "$NETWORK" = "preview" ]; then
  # Remote network: check public indexer reachability
  if [ "$NETWORK" = "preprod" ]; then
    indexer_url="https://indexer.preprod.midnight.network/api/v3/graphql"
  else
    indexer_url="https://indexer.preview.midnight.network/api/v3/graphql"
  fi

  if curl -sf --max-time 10 -X POST "$indexer_url" \
       -H 'Content-Type: application/json' \
       -d '{"query":"{ __typename }"}' -o /dev/null 2>&1; then
    ok "$NETWORK indexer reachable: $indexer_url"
  else
    fail "$NETWORK indexer not reachable: $indexer_url — check network / VPN"
  fi

  # Proof server is always local
  if curl -sf --max-time 3 http://127.0.0.1:6300/health -o /dev/null 2>&1; then
    ok "proof-server responding on :6300 (local)"
  else
    fail "proof-server not responding on :6300 — start: docker run midnightntwrk/proof-server:7.0.0"
  fi
fi

# ----------- Summary -----------------------------------------
echo ""
echo "============================================================"
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "============================================================"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "  Fix the $FAIL failing check(s) above before deploying."
  echo "  Reference: dpo2u-midnight-agent-dna/knowledge/WORKAROUND-GUIDE.md"
  echo ""
  exit 1
else
  echo ""
  echo "  All checks passed. Ready to deploy:"
  echo ""
  echo "    npx tsx scripts/deploy-all.ts --network $NETWORK"
  echo ""
  echo "  Then check live contract state:"
  echo "    npx tsx scripts/status.ts --network $NETWORK --seed <seed>"
  echo ""
  echo "  Then run the full LGPD lifecycle demo:"
  echo "    npx tsx scripts/interact-full-suite.ts --network $NETWORK --seed <seed>"
  echo ""
  exit 0
fi
