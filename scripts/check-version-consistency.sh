#!/usr/bin/env bash
# check-version-consistency.sh — Cross-check version constants that are
# duplicated across docker-compose.yml, pre-deploy-check.sh,
# midnight-health-check.sh and compile-contracts.sh, so a partial version
# bump (fixed in some files, forgotten in one) is caught immediately
# instead of silently drifting.
#
# Why this exists: content/2026-08-07 ("Part 7") documented a real incident
# where commit 1a8813e corrected INDEXER_VERSION in docker-compose.yml and
# pre-deploy-check.sh but missed midnight-health-check.sh. The stale copy
# fired 115 false WARN/ALERT cycles over 9 days before anyone noticed —
# nothing compared the 3 copies of the same value against each other.
# adhoc-029 (zealy/2026-08-08) asked directly: "vale a pena escrever esse
# teste antes do próximo capítulo do arco?" This is that test.
#
# Usage: ./scripts/check-version-consistency.sh
# Exit: 0 if every duplicated constant agrees across all files that carry
#       it, 1 otherwise (with each disagreement listed file-by-file).

set -euo pipefail

LAB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$LAB_DIR"

FAIL=0

get_val() {
  # $1 = file, $2 = ERE pattern matching "KEY=value" or "image:tag" style text
  grep -oE "$2" "$1" 2>/dev/null | head -1 || true
}

check_constant() {
  local name="$1"; shift
  local -a labels=() values=()
  local pair
  for pair in "$@"; do
    labels+=("${pair%%=*}")
    values+=("${pair#*=}")
  done

  local ref="" mismatch=0 v
  for v in "${values[@]}"; do
    if [ -n "$v" ]; then
      if [ -z "$ref" ]; then ref="$v"; fi
      [ "$v" != "$ref" ] && mismatch=1
    fi
  done

  if [ "$mismatch" -eq 1 ]; then
    echo "FAIL: $name disagrees across files:"
    local i
    for i in "${!labels[@]}"; do
      echo "  ${labels[$i]} = ${values[$i]:-<missing>}"
    done
    FAIL=1
  else
    echo "OK: $name consistent = ${ref:-<not found in any file>}"
  fi
}

echo "============================================================"
echo "  DPO2U Lab — Version Constant Consistency Check"
echo "============================================================"
echo ""

# --- NODE_VERSION (midnight-node) ---
dc_node=$(get_val docker-compose.yml 'midnightntwrk/midnight-node:[0-9][^" '\''<>]*' | cut -d: -f2)
pdc_node=$(get_val scripts/pre-deploy-check.sh 'NODE_VERSION="[^"]+"' | cut -d'"' -f2)
mhc_node=$(get_val scripts/midnight-health-check.sh 'NODE_VERSION="[^"]+"' | cut -d'"' -f2)
check_constant "NODE_VERSION (midnight-node)" \
  "docker-compose.yml=$dc_node" \
  "pre-deploy-check.sh=$pdc_node" \
  "midnight-health-check.sh=$mhc_node"

# --- INDEXER_VERSION (indexer-standalone) ---
dc_idx=$(get_val docker-compose.yml 'midnightntwrk/indexer-standalone:[0-9][^" '\''<>]*' | cut -d: -f2)
pdc_idx=$(get_val scripts/pre-deploy-check.sh 'INDEXER_VERSION="[^"]+"' | cut -d'"' -f2)
mhc_idx=$(get_val scripts/midnight-health-check.sh 'INDEXER_VERSION="[^"]+"' | cut -d'"' -f2)
check_constant "INDEXER_VERSION (indexer-standalone)" \
  "docker-compose.yml=$dc_idx" \
  "pre-deploy-check.sh=$pdc_idx" \
  "midnight-health-check.sh=$mhc_idx"

# --- PROOF_SERVER_VERSION (proof-server) ---
dc_ps=$(get_val docker-compose.yml 'midnightntwrk/proof-server:[0-9][^" '\''<>]*' | cut -d: -f2)
pdc_ps=$(get_val scripts/pre-deploy-check.sh 'PROOF_SERVER_VERSION="[^"]+"' | cut -d'"' -f2)
mhc_ps=$(get_val scripts/midnight-health-check.sh 'PROOF_SERVER_VERSION="[^"]+"' | cut -d'"' -f2)
check_constant "PROOF_SERVER_VERSION (proof-server)" \
  "docker-compose.yml=$dc_ps" \
  "pre-deploy-check.sh=$pdc_ps" \
  "midnight-health-check.sh=$mhc_ps"

# --- COMPACT_VERSION (compactc) ---
cc_compile=$(get_val scripts/compile-contracts.sh 'COMPACT_VERSION="[^"]+"' | cut -d'"' -f2)
cc_predeploy=$(get_val scripts/pre-deploy-check.sh 'COMPACT_VERSION="[^"]+"' | cut -d'"' -f2)
check_constant "COMPACT_VERSION (compactc)" \
  "compile-contracts.sh=$cc_compile" \
  "pre-deploy-check.sh=$cc_predeploy"

# --- TMP_MIN_FREE_KB (compactc /tmp preflight, content/2026-08-25 incident) ---
tmp_compile=$(get_val scripts/compile-contracts.sh 'TMP_MIN_FREE_KB=[0-9]+' | cut -d= -f2)
tmp_predeploy=$(get_val scripts/pre-deploy-check.sh 'TMP_MIN_FREE_KB=[0-9]+' | cut -d= -f2)
check_constant "TMP_MIN_FREE_KB (/tmp preflight)" \
  "compile-contracts.sh=$tmp_compile" \
  "pre-deploy-check.sh=$tmp_predeploy"

echo ""

# --- Informational only: cross-check against the DNA repo's documented
# preprod table. Not a hard fail. Each constant prints OK or NOTE, and an
# unparsed DNA value prints SKIP — silence must never mean "parse failed".
# (compactc once drifted: repo 0.31.0 vs DNA 0.29.0, logs/2026-08-06-dev.md;
# the repo is pinned back to 0.29.0 since 2026-10-03.)
DNA_MATRIX="${DNA_REPO:-/root/dpo2u-midnight-agent-dna}/knowledge/SDK-VERSION-MATRIX.md"
if [ -f "$DNA_MATRIX" ]; then
  echo "--- Informational: cross-check vs DNA repo's SDK-VERSION-MATRIX.md preprod table ---"
  dna_cross() {
    # $1 = name, $2 = repo value, $3 = ERE for the matrix row
    local dna
    dna=$(get_val "$DNA_MATRIX" "$3" | awk '{print $NF}')
    if [ -z "$dna" ]; then
      echo "  SKIP: $1 -- could not parse DNA doc"
    elif [ "$dna" = "$2" ]; then
      echo "  OK:   $1 repo=$2 matches DNA doc"
    else
      echo "  NOTE: $1 repo=$2 vs DNA doc=$dna"
    fi
  }
  dna_cross NODE_VERSION "$dc_node" 'midnight-node \(Docker\) \| [0-9][^ ]*'
  dna_cross INDEXER_VERSION "$dc_idx" 'indexer-standalone \(Docker\) \| [0-9][^ ]*'
  dna_cross PROOF_SERVER_VERSION "$dc_ps" 'proof-server \(Docker\) \| [0-9][^ ]*'
  dna_cross COMPACT_VERSION "$cc_compile" 'compact compiler *\| [0-9][^ ]*'
  echo ""
else
  echo "--- Informational cross-check skipped: DNA repo not found at $DNA_MATRIX ---"
  echo ""
fi

echo "============================================================"
if [ "$FAIL" -eq 1 ]; then
  echo "RESULT: version constants out of sync within this repo -- see FAIL lines above."
  echo "============================================================"
  exit 1
else
  echo "RESULT: all duplicated version constants agree across scripts/docker-compose.yml."
  echo "============================================================"
fi
