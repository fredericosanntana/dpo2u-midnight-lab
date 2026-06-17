---
title: "Podcast Prompt — Art. 37 on-chain: audit trails vs. privacy-by-design"
date: 2026-06-17
pillar: compliance-protocol + web3-privacy
characters: Ana + Rafael
source_log: logs/2026-06-17-dev.md
format: NotebookLM prompt (English)
---

# Prompt: DPO2U Insights Episode — Art. 37 On-Chain: The Audit Trail Paradox

## Hosts and Dynamic

**Ana** is a Data Protection Officer with a legal and philosophical background. She reads LGPD and GDPR closely, cites scholars like Shoshana Zuboff and Stefano Rodotà, and always asks: "who is actually being protected here?" She is skeptical of technical workarounds that achieve regulatory form without regulatory substance.

**Rafael** is the blockchain architect and lead developer of DPO2U. He explains decisions through code and milestones, uses concrete analogies, and is genuinely enthusiastic about what Midnight Network makes possible. He respects Ana's questions and doesn't dismiss them — but he builds first and refines later.

Their dynamic: constructive tension. They share the same mission — privacy-first, compliance-by-design — but consistently disagree on whether a technical solution is "good enough" to satisfy a legal obligation. Neither is wrong. The best DPO2U decisions come from their friction.

## Episode Context

LGPD Article 37 requires every data controller in Brazil to maintain a record of all personal data processing activities. The law does not specify the format, but the ANPD has signaled that these records must be accessible, auditable, and attributable.

On June 17, 2026, the DPO2U project completed its DataAuditLog contract and deploy script — the third and final piece of a three-contract compliance suite running on the Midnight Network (a ZK-proof-based blockchain). The contract implements Art. 37 compliance on-chain: it logs processing events, deletion requests, deletion confirmations, and breach notifications (Art. 48).

The core design decision is radical: no PII is ever written on-chain. Controllers are identified by sha256(name + CNPJ), actors by sha256(email or ID). The event type (data_collection, data_access, data_transfer_third_party, consent_change, breach_notification) and block number are stored on-chain. Everything else — who was involved, what data was processed, what justification was used — stays in an off-chain case management system.

This design creates a genuine compliance paradox: the blockchain provides an immutable, tamper-proof audit trail that proves a record EXISTS at a given block height. But LGPD Art. 37 requires records to be accessible to the ANPD — and if the sha256 key is lost, the on-chain record becomes cryptographically opaque. Is this compliance, or the appearance of compliance?

## Discussion Topics

1. **What does LGPD Art. 37 actually require?**
   - The obligation: "manter registro das operações de tratamento de dados pessoais"
   - What "registro" means in practice: format, accessibility, granularity
   - ANPD guidance (Resolution CD/ANPD nº 2/2022) and the gap between legal text and technical implementation
   - Ana's question: does an immutable hash on a blockchain satisfy "accessible record"?

2. **The DPO2U design: hash-only on-chain**
   - Rafael walks through the DataAuditLog contract: 3 circuits (logEvent, logDeletion/confirmDeletion, logBreachEvent)
   - Demo scenario: BancoXYZ S.A. identified only by sha256(name+CNPJ) — no company name written on-chain
   - 8-step lifecycle: data_collection → data_access → data_transfer_third_party → deletion_request → deletion_confirmed → breach_notification, 6 events total
   - Why this approach: Midnight Network's ZK privacy properties mean the blockchain itself cannot leak PII even under state-level subpoena

3. **The audit trail paradox**
   - If the sha256 key is lost, the on-chain record is useless to an ANPD auditor
   - Ana's position: cryptographic opacity is not the same as privacy protection — it may be a liability
   - Rafael's position: the controller holds the key; the blockchain provides proof of timestamp and sequence that a SQL database cannot
   - The real question: who is the adversary? An external attacker? Or the ANPD itself?

4. **Block overflow and the Uint<16> constraint**
   - DataAuditLog uses block_number: Uint<16> — maximum 65,535 blocks, approximately 45 days at 1 block per minute
   - The deploy script clamps to `block & 0xFFFF` to avoid overflow
   - This is a conscious limitation: longer-lived deployments need Uint<32> (a planned upgrade)
   - Ana's question: if an Art. 37 record must cover multi-year data processing histories, does a 45-day block ceiling compromise the integrity of the audit trail?

5. **The gap between "compiles" and "runs"**
   - All three contracts (ConsentRegistry, DataSubjectRights, DataAuditLog) compile on Compact v0.31.0
   - Zero deploys to a real network have happened yet — only syntax verification via remote compiler
   - 7 SDK bugs documented and worked around (signRecipe API, provider parameter order, smoldot wallet initialization)
   - Rafael's honest assessment: the first real deploy is the next critical milestone
   - Ana's challenge: compliance exists at runtime, not compile time — what does "compliance-ready" mean before a single transaction?

6. **What comes next: cross-contract integration**
   - When revokeConsent fires in ConsentRegistry, DataAuditLog should log event_type=8 (consent_change) — currently not wired
   - Access control gap: any address can currently log events to DataAuditLog; whitelist of authorized_controllers is planned
   - keccak256 vs. sha256 for request IDs — sha256 used for Node.js compatibility, keccak256 needed for EVM ecosystem conventions

## Supporting Material

From `logs/2026-06-17-dev.md`:

> "Controller 'BancoXYZ S.A.' (identified only by sha256(name+CNPJ)) — no PII on-chain. Actor hashes for analyst and DPO officer — no PII on-chain."

> "DataAuditLog uses block_number: Uint<16> (max 65535, ≈45 days at 1 block/min). The demo clamps to & 0xFFFF to avoid overflow."

> "All three pillars of the DPO2U compliance suite now have deploy scripts. ✓"

From `logs/2026-06-16-dev.md`:

> "Note: compiler used was v0.31.0 (newer than the 0.29.0 in SDK-VERSION-MATRIX). The parenthesized assert() syntax from the prior fix commit remains valid on 0.31.0."

> "No PII on-chain — only hashes."

## Literary References

Ana should cite organically:

- **Shoshana Zuboff** — *The Age of Surveillance Capitalism* (2019): "the behavioral surplus" and the problem of opacity — when data controllers benefit from making records unreadable to regulators, they reproduce a power asymmetry that data protection law was designed to break.
- **Stefano Rodotà** — *Il diritto di avere diritti* (2012): the right of access as a prerequisite for all other data rights — you cannot exercise the right to correction or deletion if you cannot first confirm that your data is being processed.
- **ANPD Resolution CD/ANPD nº 2/2022**: the first binding ANPD regulation on data mapping and Art. 37 records — Ana should note that the ANPD explicitly requires records to be "kept accessible" and "updated regularly."

## Point of Tension

The central disagreement should happen during Topic 3:

**Ana** challenges Rafael directly: "You say this is compliance by design. But LGPD Art. 37 is not about hiding records from attackers — it's about making them accessible to regulators and data subjects. If I'm the ANPD and I ask BancoXYZ for their Art. 37 record, they show me a hash on a blockchain and say 'the key is in our CRM.' That's not the blockchain doing compliance work — that's the CRM doing compliance work. The blockchain is just a timestamp service."

**Rafael** should not dismiss this. He should say: "You're right that the key management is off-chain. But you're wrong about what the blockchain adds. Before Midnight Network, BancoXYZ could modify that CRM record retroactively — change the event type, delete the breach notification, adjust the timestamp. The blockchain makes that impossible. The immutability is the compliance contribution. The key is the accountability contribution. Both are necessary."

**Resolution (no winner)**: They agree that the DPO2U architecture satisfies the immutability requirement of Art. 37 but defers the accessibility requirement to the key management layer — which is currently undocumented. This becomes a design action item.

## Tone and Instructions

- Language: English
- Duration: 8–12 minutes
- Style: Natural, slightly informal conversation. Both hosts are smart and direct. No filler phrases. They interrupt each other when they have a strong point.
- Build in Public framing: this is a real product being built, not a theoretical discussion. Both hosts are participants in the work, not just commentators.
- Rafael should sound genuinely proud of the milestone (3/3 contracts, 3/3 scripts) while being honest about the standalone deploy gap.
- Ana should push hard on the Art. 37 paradox without being dismissive of the technical achievement.
- Avoid over-explaining — assume the audience has basic LGPD and blockchain literacy.

## Closing

Rafael closes with the next concrete step: the first docker-compose deploy of DataAuditLog on a standalone Midnight network — running the 8-step Art. 37 demo end-to-end and capturing the output as the first real proof of execution.

Ana closes with a call to the community: if you're a DPO at a Brazilian company and you've been asked to implement Art. 37 records, what format are you using? SQL? A PDF binder? A SaaS RIMS tool? She wants to know the gap between what DPO2U is building and what compliance officers are actually doing today.
