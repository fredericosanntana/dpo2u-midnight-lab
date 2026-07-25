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
COMPACT_VERSION="0.31.0"  # keep in sync with scripts/compile-contracts.sh
PROOF_SERVER_VERSION="7.0.0"  # keep in sync with docker-compose.yml / SDK-VERSION-MATRIX.md
NODE_VERSION="0.21.0"  # keep in sync with docker-compose.yml
INDEXER_VERSION="3.1.0"  # keep in sync with docker-compose.yml — preprod-safe per SDK-VERSION-MATRIX.md (fixed 2026-07-24, was 4.0.0-rc.4, a PREVIEW-tier tag mismatched against preprod node 0.21.0)
COMPACT_BIN="$HOME/.compact/bin/compactc"
REQUIRED_NODE_MAJOR=22
LAB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$LAB_DIR/build"
LOCK_FILE="$LAB_DIR/scripts/image-digests.lock"
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

# Checks proof-server liveness AND version — a port can be answered by an
# unrelated project's container (version mismatch is otherwise silent, see
# WORKAROUND-GUIDE.md CRITICAL RULE on mixing SDK/infra versions).
check_proof_server() {
  local label="$1"
  if ! curl -sf --max-time 3 http://127.0.0.1:6300/health -o /dev/null 2>&1; then
    fail "proof-server not responding on :6300 $label — start: docker run midnightntwrk/proof-server:$PROOF_SERVER_VERSION"
    return
  fi

  local ps_version
  ps_version=$(curl -sf --max-time 3 http://127.0.0.1:6300/version 2>&1 | tr -d '[:space:]')
  if [ "$ps_version" = "$PROOF_SERVER_VERSION" ]; then
    ok "proof-server responding on :6300 $label (version $ps_version)"
  else
    fail "proof-server on :6300 is version '$ps_version', expected $PROOF_SERVER_VERSION — likely a different project's container squatting on the port. Check: docker ps --filter publish=6300"
  fi
}

# Checks a docker-compose container is running the expected image tag.
# Closes the gap flagged in content/2026-07-03: the indexer check only tested
# GraphQL liveness, never the version — same liveness-vs-version blind spot
# as check_proof_server, but the indexer has no /version endpoint, so we
# read the tag straight off the running container instead.
#
# A tag is a mutable pointer (content/2026-07-08): re-tagging different
# content onto the same string passes this check silently. If the container
# has been pinned via pin-image-digest.sh, prefer comparing the current
# content-addressed image ID against the pinned one — that catches drift a
# tag-string match cannot.
check_docker_image_version() {
  local container="$1" expected="$2" label="$3"
  local image
  image=$(docker inspect --format '{{.Config.Image}}' "$container" 2>/dev/null)
  if [ -z "$image" ]; then
    fail "$label container '$container' not running — check: docker ps -a --filter name=$container"
    return
  fi

  local pinned_id
  pinned_id=$(grep "^${container}=" "$LOCK_FILE" 2>/dev/null | cut -d= -f2-)
  if [ -n "$pinned_id" ]; then
    local current_id
    current_id=$(docker inspect --format '{{.Image}}' "$container" 2>/dev/null)
    if [ "$current_id" = "$pinned_id" ]; then
      ok "$label — $image (digest-pinned, matches $pinned_id)"
    else
      fail "$label — image ID drifted since pinning (now $current_id, pinned $pinned_id) even though tag '$image' is unchanged — this is the tag-vs-digest gap from content/2026-07-08. Re-verify and re-pin: ./scripts/pin-image-digest.sh $container"
    fi
    return
  fi

  if [[ "$image" == *":$expected" ]]; then
    ok "$label — $image (tag match only, not digest-pinned — run ./scripts/pin-image-digest.sh $container)"
  else
    fail "$label running '$image', expected tag $expected — version drift. Check docker-compose.yml vs SDK-VERSION-MATRIX.md"
  fi
}

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
    check_proof_server "(standalone)"

    # Check Docker image versions (exact tag per container, not just "a midnight image")
    echo ""
    check_docker_image_version "midnight-standalone-node" "$NODE_VERSION" "midnight-node"
    check_docker_image_version "midnight-standalone-indexer" "$INDEXER_VERSION" "indexer-standalone"
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
  check_proof_server "($NETWORK, local)"
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
