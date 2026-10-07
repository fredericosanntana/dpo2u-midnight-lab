#!/usr/bin/env bash
# test-version-guard.sh — proves check-version-consistency.sh actually fails
# (exit code, not just output text) when the proof-server version drifts in
# scripts/lib/proof-server.ts. Restores the file on exit, even on failure.
set -u
LAB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$LAB_DIR/scripts/lib/proof-server.ts"
CHECK="$LAB_DIR/scripts/check-version-consistency.sh"
BACKUP="$(mktemp)"
cp "$TARGET" "$BACKUP"
trap 'cp "$BACKUP" "$TARGET"; rm -f "$BACKUP"' EXIT

bash "$CHECK" >/dev/null 2>&1 || { echo "FAIL: baseline check already failing"; exit 2; }

sed -i "s/EXPECTED_PROOF_SERVER_VERSION = '[^']*'/EXPECTED_PROOF_SERVER_VERSION = '0.0.0-drift'/" "$TARGET"
if cmp -s "$TARGET" "$BACKUP"; then echo "FAIL: mutation did not change the file (pattern stale?)"; exit 2; fi

bash "$CHECK" >/dev/null 2>&1
rc=$?
if [ "$rc" -eq 0 ]; then echo "FAIL: guard returned 0 on drifted version"; exit 1; fi
echo "OK: guard exits $rc on drifted proof-server version"
