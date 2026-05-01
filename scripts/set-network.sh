#!/usr/bin/env bash
# set-network.sh — Atualiza MIDNIGHT_NETWORK em todos os repos ativos
# Uso: bash set-network.sh standalone|preprod
set -uo pipefail

NETWORK="${1:-}"
TEMPLATE="/root/dpo2u-midnight-lab/.env.template"

REPOS=(
    /root/midnight-hello-world
    /root/dpo2u-midnight-agents
    /root/dpo2u-midnight-self-funding
    /root/dpo2u-wallet
)

if [[ -z "$NETWORK" || ("$NETWORK" != "standalone" && "$NETWORK" != "preprod") ]]; then
    echo "Uso: $0 <standalone|preprod>"
    exit 1
fi

echo "Setando MIDNIGHT_NETWORK=$NETWORK em ${#REPOS[@]} repos..."

for REPO in "${REPOS[@]}"; do
    ENV_FILE="$REPO/.env"
    if [[ ! -f "$ENV_FILE" ]]; then
        # Create from template
        if [[ -f "$TEMPLATE" ]]; then
            cp "$TEMPLATE" "$ENV_FILE"
        else
            echo "MIDNIGHT_NETWORK=$NETWORK" > "$ENV_FILE"
            echo "PROOF_SERVER_URL=http://127.0.0.1:6300" >> "$ENV_FILE"
        fi
    fi

    if grep -q '^MIDNIGHT_NETWORK=' "$ENV_FILE"; then
        sed -i "s/^MIDNIGHT_NETWORK=.*/MIDNIGHT_NETWORK=$NETWORK/" "$ENV_FILE"
    else
        echo "MIDNIGHT_NETWORK=$NETWORK" >> "$ENV_FILE"
    fi

    echo "  $(basename "$REPO")/.env -> MIDNIGHT_NETWORK=$NETWORK"
done

echo "Done. Verificar com: grep MIDNIGHT_NETWORK /root/{midnight-hello-world,dpo2u-midnight-agents,dpo2u-midnight-self-funding,dpo2u-wallet}/.env"
