#!/usr/bin/env bash
# pin-image-digest.sh — Record the current content-addressed image ID for a
# running Midnight container into scripts/image-digests.lock.
#
# Why: a Docker image TAG (e.g. "midnightntwrk/midnight-node:0.21.0") is a
# mutable pointer. Someone can retag different content onto the same string
# and pre-deploy-check.sh / midnight-health-check.sh's tag comparison would
# never notice. `docker inspect --format '{{.Image}}'` returns the local
# content-addressed image ID the container actually runs — pinning that lets
# later checks detect drift even when the tag string hasn't changed.
#
# Run this ONCE per container, right after verifying out-of-band (a
# `docker compose up -d` you watched pull cleanly, a digest checked against
# midnightntwrk release notes, etc.) that its current image is correct.
#
# Usage:
#   ./scripts/pin-image-digest.sh <container-name> [<container-name> ...]
#   ./scripts/pin-image-digest.sh --all

set -euo pipefail

LAB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOCK_FILE="$LAB_DIR/scripts/image-digests.lock"
ALL_CONTAINERS=(midnight-standalone-node midnight-standalone-indexer)

targets=("$@")
if [[ "${1:-}" == "--all" ]]; then
  targets=("${ALL_CONTAINERS[@]}")
fi

if [[ ${#targets[@]} -eq 0 ]]; then
  echo "Usage: $0 <container-name> [<container-name> ...] | --all" >&2
  exit 1
fi

touch "$LOCK_FILE"

for container in "${targets[@]}"; do
  image_id=$(docker inspect --format '{{.Image}}' "$container" 2>/dev/null || true)
  if [[ -z "$image_id" ]]; then
    echo "  [SKIP] $container — not running, nothing to pin" >&2
    continue
  fi

  image_ref=$(docker inspect --format '{{.Config.Image}}' "$container" 2>/dev/null || echo "?")

  if grep -q "^${container}=" "$LOCK_FILE" 2>/dev/null; then
    sed -i "s|^${container}=.*|${container}=${image_id}|" "$LOCK_FILE"
  else
    echo "${container}=${image_id}" >>"$LOCK_FILE"
  fi
  echo "  [PINNED] $container -> $image_id (currently tagged: $image_ref)"
done
