#!/usr/bin/env bash
# compile-contracts.sh — Compile all Compact contracts in lab/contracts/
#
# Applies WORKAROUND-GUIDE Bug 1 fix: ensures compactc symlinks exist before compiling.
# Requires: compactc 0.31.0 installed via compact installer
#
# Usage:
#   ./scripts/compile-contracts.sh [--contract <name>]
#
# Examples:
#   ./scripts/compile-contracts.sh                         # compile all
#   ./scripts/compile-contracts.sh --contract ConsentRegistry

set -euo pipefail

COMPACT_VERSION="0.31.0"
COMPACT_BIN_DIR="$HOME/.compact/bin"
COMPACT_MUSL_DIR="$HOME/.compact/versions/$COMPACT_VERSION/x86_64-unknown-linux-musl"
CONTRACTS_DIR="$(cd "$(dirname "$0")/.." && pwd)/contracts"
BUILD_DIR="$(cd "$(dirname "$0")/.." && pwd)/build"

echo "============================================================"
echo "  DPO2U Lab — Compact Contract Compiler"
echo "  SDK Version: $COMPACT_VERSION"
echo "============================================================"

# ---------------------------------------------------------------
# Bug 1 Fix: ensure compactc.bin and zkir symlinks exist
# (WORKAROUND-GUIDE.md §Bug 1 — installer creates 'compactc' symlink
#  but not 'compactc.bin' or 'zkir' — causes "No such file" errors)
# ---------------------------------------------------------------
apply_bug1_fix() {
  if [ -d "$COMPACT_MUSL_DIR" ]; then
    echo "[Fix] Applying Bug 1 workaround: creating compactc.bin + zkir symlinks..."
    mkdir -p "$COMPACT_BIN_DIR"

    if [ ! -f "$COMPACT_BIN_DIR/compactc.bin" ]; then
      ln -sf "$COMPACT_MUSL_DIR/compactc.bin" "$COMPACT_BIN_DIR/compactc.bin"
      echo "  Created: $COMPACT_BIN_DIR/compactc.bin"
    fi

    if [ ! -f "$COMPACT_BIN_DIR/zkir" ]; then
      ln -sf "$COMPACT_MUSL_DIR/zkir" "$COMPACT_BIN_DIR/zkir"
      echo "  Created: $COMPACT_BIN_DIR/zkir"
    fi

    # Add to PATH if not already present
    if [[ ":$PATH:" != *":$COMPACT_BIN_DIR:"* ]]; then
      export PATH="$COMPACT_BIN_DIR:$PATH"
      echo "  Added $COMPACT_BIN_DIR to PATH"
    fi
  fi
}

# ---------------------------------------------------------------
# /tmp preflight: compactc writes a tempfile during compile/--version
# (embed_target.c: maketempfile) and hits an unguarded assert() on a
# short write instead of a readable error. On this VPS /tmp is a
# shared tmpfs across every project — it hit 100% on 2026-08-24 and
# aborted compactc with "Assertion failed: write(fd, contents, size)
# == size", which in turn broke the Bash tool staging output on the
# same tmpfs. See content/2026-08-25/article-compactc-enospc-debugging-diary.md.
# ---------------------------------------------------------------
TMP_MIN_FREE_KB=512000  # 500MB headroom

check_tmp_space() {
  local avail_kb
  avail_kb=$(df -Pk /tmp 2>/dev/null | awk 'NR==2 {print $4}')

  if [ -z "$avail_kb" ]; then
    echo "WARNING: could not determine /tmp free space — skipping preflight check"
    return
  fi

  if [ "$avail_kb" -lt "$TMP_MIN_FREE_KB" ]; then
    echo ""
    echo "ERROR: /tmp has only $((avail_kb / 1024))MB free (need >= $((TMP_MIN_FREE_KB / 1024))MB)."
    echo "  compactc will abort with an unreadable assertion failure on ENOSPC"
    echo "  instead of a normal error (2026-08-24 incident, see"
    echo "  content/2026-08-25/article-compactc-enospc-debugging-diary.md)."
    echo "  /tmp is VPS-shared infra — investigate before compiling, don't delete blindly:"
    echo "    df -h /tmp && du -sh /tmp/* 2>/dev/null | sort -rh | head -20"
    exit 1
  fi

  echo "[OK] /tmp free space: $((avail_kb / 1024))MB"
}

# ---------------------------------------------------------------
# Verify compactc is available
# ---------------------------------------------------------------
check_compiler() {
  check_tmp_space
  apply_bug1_fix

  if ! command -v compactc &>/dev/null; then
    echo ""
    echo "ERROR: compactc not found. Install it first:"
    echo "  npx @midnight-ntwrk/compact-installer@latest"
    echo "  (then re-run this script to apply Bug 1 fix automatically)"
    echo ""
    echo "Required: compactc $COMPACT_VERSION"
    exit 1
  fi

  local version
  version=$(compactc --version 2>&1 | head -1)
  echo "Compiler: $version"

  if [[ "$version" != *"$COMPACT_VERSION"* ]]; then
    echo "WARNING: Expected compactc $COMPACT_VERSION — version mismatch may cause issues"
  fi
}

# ---------------------------------------------------------------
# Bug 2 fix: remove .npmrc if it exists (npm.midnight.network doesn't exist)
# ---------------------------------------------------------------
check_npmrc() {
  if [ -f ".npmrc" ]; then
    echo "[Fix] Applying Bug 2 workaround: removing .npmrc with bad registry..."
    rm -f .npmrc
    echo "  Removed .npmrc (npm.midnight.network does not exist — Bug 2)"
  fi
}

# ---------------------------------------------------------------
# Compile a single contract
# ---------------------------------------------------------------
compile_one() {
  local name="$1"
  local src="$CONTRACTS_DIR/${name}.compact"
  local out="$BUILD_DIR/$name"

  if [ ! -f "$src" ]; then
    echo "ERROR: Contract not found: $src"
    exit 1
  fi

  mkdir -p "$out"
  echo ""
  echo "Compiling: $name"
  echo "  Source: $src"
  echo "  Output: $out"

  if compactc "$src" "$out"; then
    echo "  [OK] $name compiled successfully"
    # List generated artifacts
    echo "  Artifacts:"
    find "$out" -type f | sort | sed 's/^/    /'
  else
    echo "  [FAIL] $name compilation failed"
    exit 1
  fi
}

# ---------------------------------------------------------------
# Compile all contracts
# ---------------------------------------------------------------
compile_all() {
  local count=0
  local failed=0

  for compact_file in "$CONTRACTS_DIR"/*.compact; do
    if [ -f "$compact_file" ]; then
      local name
      name=$(basename "$compact_file" .compact)
      if compile_one "$name"; then
        count=$((count + 1))
      else
        failed=$((failed + 1))
      fi
    fi
  done

  echo ""
  echo "============================================================"
  echo "  Results: $count compiled, $failed failed"
  echo "============================================================"

  if [ "$failed" -gt 0 ]; then
    exit 1
  fi
}

# ---------------------------------------------------------------
# Main
# ---------------------------------------------------------------
check_compiler
check_npmrc

TARGET_CONTRACT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --contract)
      TARGET_CONTRACT="$2"
      shift 2
      ;;
    *)
      echo "Unknown flag: $1"
      exit 1
      ;;
  esac
done

mkdir -p "$BUILD_DIR"

if [ -n "$TARGET_CONTRACT" ]; then
  compile_one "$TARGET_CONTRACT"
else
  compile_all
fi

echo "Done."
