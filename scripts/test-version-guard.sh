#!/usr/bin/env bash
# test-version-guard.sh — proves check-version-consistency.sh actually fails
# (exit code, not just output text) when ANY guarded constant drifts in ANY
# file that carries a copy. Each case mutates one file, requires rc!=0, and
# restores it. All touched files are backed up and restored on exit.
set -u
LAB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$LAB_DIR"
CHECK="scripts/check-version-consistency.sh"

# case format: file|sed-expression (must change the file, else pattern is stale)
CASES=(
  "scripts/lib/proof-server.ts|s/EXPECTED_PROOF_SERVER_VERSION = '[^']*'/EXPECTED_PROOF_SERVER_VERSION = '0.0.0-drift'/"
  "scripts/pre-deploy-check.sh|s/NODE_VERSION=\"[^\"]*\"/NODE_VERSION=\"0.0.0-drift\"/"
  "scripts/pre-deploy-check.sh|s/INDEXER_VERSION=\"[^\"]*\"/INDEXER_VERSION=\"0.0.0-drift\"/"
  "scripts/pre-deploy-check.sh|s/PROOF_SERVER_VERSION=\"[^\"]*\"/PROOF_SERVER_VERSION=\"0.0.0-drift\"/"
  "scripts/pre-deploy-check.sh|s/COMPACT_VERSION=\"[^\"]*\"/COMPACT_VERSION=\"0.0.0-drift\"/"
  "scripts/pre-deploy-check.sh|s/TMP_MIN_FREE_KB=[0-9]*/TMP_MIN_FREE_KB=1/"
  "scripts/midnight-health-check.sh|s/NODE_VERSION=\"[^\"]*\"/NODE_VERSION=\"0.0.0-drift\"/"
  "scripts/midnight-health-check.sh|s/INDEXER_VERSION=\"[^\"]*\"/INDEXER_VERSION=\"0.0.0-drift\"/"
  "scripts/midnight-health-check.sh|s/PROOF_SERVER_VERSION=\"[^\"]*\"/PROOF_SERVER_VERSION=\"0.0.0-drift\"/"
  "scripts/compile-contracts.sh|s/COMPACT_VERSION=\"[^\"]*\"/COMPACT_VERSION=\"0.0.0-drift\"/"
  "docker-compose.yml|s#midnightntwrk/midnight-node:[0-9][^\" ]*#midnightntwrk/midnight-node:0.0.0-drift#"
  "docker-compose.yml|s#midnightntwrk/indexer-standalone:[0-9][^\" ]*#midnightntwrk/indexer-standalone:0.0.0-drift#"
  "docker-compose.yml|s#midnightntwrk/proof-server:[0-9][^\" ]*#midnightntwrk/proof-server:0.0.0-drift#"
)

declare -A BACKUP
for c in "${CASES[@]}"; do
  f="${c%%|*}"
  if [ -z "${BACKUP[$f]:-}" ]; then BACKUP[$f]="$(mktemp)"; cp "$f" "${BACKUP[$f]}"; fi
done
restore() { for f in "${!BACKUP[@]}"; do cp "${BACKUP[$f]}" "$f"; rm -f "${BACKUP[$f]}"; done; }
trap restore EXIT

bash "$CHECK" >/dev/null 2>&1 || { echo "FAIL: baseline check already failing"; exit 2; }

fails=0
for c in "${CASES[@]}"; do
  f="${c%%|*}"; expr="${c#*|}"
  cp "${BACKUP[$f]}" "$f"
  sed -i "$expr" "$f"
  if cmp -s "$f" "${BACKUP[$f]}"; then echo "FAIL: mutation did not change $f (pattern stale): $expr"; fails=$((fails+1)); continue; fi
  bash "$CHECK" >/dev/null 2>&1; rc=$?
  cp "${BACKUP[$f]}" "$f"
  if [ "$rc" -eq 0 ]; then echo "FAIL: guard returned 0 on drift in $f: $expr"; fails=$((fails+1))
  else echo "OK:   rc=$rc  $f  ${expr:0:50}"; fi
done

[ "$fails" -eq 0 ] && echo "ALL ${#CASES[@]} drift cases detected" || { echo "$fails case(s) failed"; exit 1; }
