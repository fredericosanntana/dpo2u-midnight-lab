#!/usr/bin/env bash
# dev-02 — "Submit a Technical PR (Protocol / SDK / Examples)" (400 XP)
# Opens a PR to midnightntwrk/example-kitties flagging the decommissioned testnet-02 network.
#
# REVIEW FIRST, then run. This performs IRREVERSIBLE external actions:
#   - forks midnightntwrk/example-kitties to your account (if not already)
#   - pushes a branch to your fork
#   - opens a public PR to the midnightntwrk org
# A CLA must be signed in the PR (cla-assistant comments automatically).
set -euo pipefail

REPO=midnightntwrk/example-kitties
BRANCH=frederico-deprecate-testnet-02
BODY=/root/dpo2u-midnight-lab/zealy-submit/PR-BODY-dev02-example-kitties.md
cd /root/work-example-kitties

# Sanity: the commit must be present on the branch.
git rev-parse --verify "$BRANCH" >/dev/null

# 1. Fork to your account + add a 'fork' remote (no-op if it already exists).
gh repo fork "$REPO" --remote --remote-name fork --clone=false || true

# 2. Push the branch to your fork.
git push -u fork "$BRANCH"

# 3. Open the PR (title explicit; body from file).
gh pr create \
  --repo "$REPO" \
  --base main \
  --head "fredericosanntana:$BRANCH" \
  --title "docs(config): flag decommissioned testnet-02 network and document preprod/preview migration" \
  --body-file "$BODY"

echo
echo "PR opened. Copy its URL into the Zealy card for dev-02 (Submit a Technical PR)."
echo "Then sign the CLA when cla-assistant comments on the PR."
