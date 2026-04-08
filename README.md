# DPO2U Midnight Lab

Autonomous development lab for the DPO2U Midnight Agent.

This repository is **operated by an AI agent** running on Anthropic's Managed Agents platform. The agent builds Compact smart contracts, generates Build-in-Public content, and manages NightForce Zealy campaigns — all autonomously.

## Pipeline

```
DEV (Midnight)          CONTENT (Build in Public)       ZEALY (NightForce)
─────────────────  →  ────────────────────────────  →  ──────────────────
Compile contracts      Document what was built          Create quests from
Deploy to preprod      Generate threads/articles        content produced
Debug SDK issues       Podcast dialogues (Ana+Rafael)   Track leaderboards
Write TypeScript       Transform across formats         Email quest updates
```

## Structure

```
contracts/       — Compact contract development & experiments
content/         — Generated content (threads, articles, posts, podcasts)
zealy/           — Quest outputs, leaderboards, announcements
scripts/         — Automation and deploy scripts
logs/            — Agent activity logs and reports
```

## Agent Identity

- **Model**: Claude Sonnet 4.6 on Anthropic Managed Agents
- **Knowledge Base**: [dpo2u-midnight-agent-dna](https://github.com/fredericosanntana/dpo2u-midnight-agent-dna) (private)
- **Shareholder**: Frederico Santana (@fredericosanntana)
- **Organization**: DPO2U — listed in [midnight-awesome-dapps](https://github.com/midnightntwrk/midnight-awesome-dapps)

## How It Works

The agent runs on a schedule:
1. **DEV cycle** — Compiles/tests contracts, pushes results
2. **CONTENT cycle** — Generates content based on dev work, queries LEANN for knowledge grounding
3. **ZEALY cycle** — Creates quests and sends updates based on content produced
4. **Reports** — Emails activity digest to shareholder via BillionMail SMTP

Each cycle creates a session on Anthropic's platform, does the work, commits to this repo, and shuts down.
