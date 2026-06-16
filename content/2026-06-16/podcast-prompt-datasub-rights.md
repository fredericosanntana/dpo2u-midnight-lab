---
date: 2026-06-16
pillar: compliance-protocol
format: podcast-prompt
target: NotebookLM
source: logs/2026-06-16-dev.md
---

# Prompt: DPO2U Insights Episode — Encoding LGPD Art. 18 into a Zero-Knowledge Smart Contract

## Hosts and Dynamic

**Ana** is the DPO (Data Protection Officer) and privacy specialist at DPO2U. She frames every technical decision through the lens of LGPD requirements, the rights of data subjects, and the ethical obligations of data controllers. She is analytical, precise, and provocative — she pushes Rafael to justify every design choice in terms of the actual rights being protected. She cites Danielle Citron on privacy as a civil right, and Laura Schertel Mendes on LGPD legislative intent.

**Rafael** is the blockchain architect and lead developer. He explains what was actually built, why each design decision was made, and what it means in practice on the Midnight Network. He is enthusiastic, direct, and comfortable with technical analogies. He gets impatient when regulatory framing becomes abstract — he wants to know: "what does this look like in code?"

The dynamic is constructive tension: Ana asks "why does this matter for real people?", Rafael answers "here's exactly what we shipped and how it works." They share the same mission — privacy by design — but disagree on the path.

## Episode Context

In the DPO2U development cycle of June 16, 2026, the team completed the third and final contract in the LGPD compliance suite: DataSubjectRights.compact. This contract, built on the Midnight Network using the Compact language, encodes LGPD Articles 18 and 19 directly into on-chain logic — meaning the rights of Brazilian data subjects (access, rectification, deletion, objection) are no longer just legal text but verifiable, executable circuits on a zero-knowledge blockchain.

All three contracts — ConsentRegistry, DataAuditLog, and DataSubjectRights — were compiled and verified on Midnight compiler v0.31.0 via the midnight-mcp remote tool. A 296-line TypeScript deploy script was also completed, simulating a full LGPD Art. 18 rights request lifecycle end-to-end.

A critical design constraint runs through all three contracts: zero PII on-chain. Subject identities are stored as sha256 hashes. Controller identities are sha256 hashes of CNPJ numbers. The blockchain never sees a name, email, or document number — only commitments to them.

## Discussion Topics

1. **What is LGPD Art. 18 and why does it matter?**
   - Ana explains the 9 rights in Art. 18: confirmation, access, correction, anonymization, portability, deletion, sharing information, revocation of consent, review of automated decisions
   - Rafael explains how DataSubjectRights.compact encodes 3 of these (confirmation, access, rejection) as circuits: submitRequest(type), fulfillRequest, rejectRequest
   - Both discuss: what does "compliance" mean when the rights are on an immutable ledger?

2. **The Art. 19 deadline problem — and how 21,600 blocks become a legal clock**
   - Rafael explains: Art. 19 gives controllers 15 days to respond to subject requests
   - On Midnight Network, at approximately 1 block/minute, 15 days = 21,600 blocks
   - markRequestOverdue() circuit fires when current_block >= submitted_block + 21,600
   - Ana asks: is a block-based clock legally defensible? What happens during network downtime?

3. **Zero PII on-chain — privacy by design or compliance theater?**
   - Rafael explains the hash-only approach: subject_id = sha256(email), controller_id = sha256(CNPJ). request_id = sha256(subject_id || controller_id || req_type || nonce)
   - Ana pushes: if the hash is there forever and the data is erasable off-chain, is the right to erasure (Art. 18 IV) actually fulfilled?
   - This is the key tension: blockchain immutability vs. LGPD's right to deletion

4. **DataAuditLog — the immutable record of what happened and when**
   - Rafael explains DataAuditLog.compact: 11 circuits, 7 ledger fields, 9 event types (including breach notification for Art. 48)
   - Ana explains the regulatory significance: Art. 37 requires records of processing activities; an on-chain audit log is ANPD-ready evidence
   - Both discuss: who can write to DataAuditLog? (Current answer: anyone — access control is the next design gap)

5. **The near-miss: an entire contract almost lost between sessions**
   - Rafael shares: DataSubjectRights.compact was written in the prior session but never committed. The agent found it as an untracked file in the preflight check
   - Ana reframes it: what does this mean for accountability? If the contract had been lost, the work product and the audit trail would both be gone
   - Both discuss: continuous deployment vs. point-in-time state — and why git commit is the equivalent of LGPD record-keeping for code

6. **What comes next: standalone deploy and cross-contract integration**
   - Rafael describes next steps: docker compose up, first real deploy to Midnight standalone network, markRequestOverdue() integration test
   - Rafael previews the cross-contract pattern: when revokeConsent fires in ConsentRegistry, it should also call logEvent(event_type=8) in DataAuditLog
   - Ana asks: at what point does this system become a complete compliance infrastructure vs. a collection of contracts?

## Supporting Material

From the dev log (2026-06-16):

> "Subject 'Carlos Mendez' (identified only by sha256('carlos.mendez@example.com.br')). Controller 'Acme Fintech LTDA' (identified only by sha256('00.000.000/0001-00')). No PII on-chain — only hashes."

> "The markRequestOverdue() circuit requires current_block >= submitted_block + 21600. In a live network this means waiting 15 days; in standalone, set submitted_block=1 and pass current_block >= 21601."

> "DataSubjectRights.compact was untracked since the prior session. It is now being committed alongside this log."

From the dev log (2026-04-09):

> "No access control: any caller can log events in DataAuditLog. For production, this should be restricted to authorized controllers only. Compact 0.29.0 doesn't have built-in ACL; solution is to maintain an authorized_controllers: Map<Bytes<32>, Uint<8>> and assert membership before writes."

> "purposes bitmask is not verified on-chain: the contract stores whatever Uint<8> is passed. Input validation is best done in the TypeScript layer."

## Literary References

Ana should cite organically:

- **Danielle Keats Citron**, *The Fight for Privacy* (2022) — privacy as a condition for autonomy and democratic participation; relevant to why subject rights matter beyond compliance
- **Laura Schertel Mendes**, *Privacidade, proteção de dados e defesa do consumidor* (2014) — Brazilian LGPD legislative history and the intent behind titular rights in Art. 18
- **ANPD Guia Orientativo de Segurança da Informação** (2021) — official Brazilian regulatory framing of what constitutes adequate records of processing

## Point of Tension

**The LGPD Art. 18 IV right to deletion vs. blockchain immutability.**

Ana will argue that a system that stores request IDs and audit records permanently on-chain creates a tension with the very right to deletion it is designed to enforce. The record that a deletion was requested is itself potentially a piece of personal data.

Rafael will counter that the hash-only design resolves this: the hash of an email address is not personal data under LGPD if the preimage is erased. The immutable record proves an event occurred at a block height — it does not prove who the subject was. The system is designed so that destroying the off-chain mapping (email → hash) makes the on-chain record irreversible but unlinkable.

Ana should push back: but what if the hash can be reversed? (Rainbow table attack on email addresses, CNPJ numbers are a finite set.) Rafael should acknowledge: for high-risk deployments, the sha256 should be salted with a secret known only to the controller — which is itself a design gap in the current implementation.

This disagreement should end without resolution — both are right, and the next cycle will need to address it.

## Tone and Instructions

- Language: English throughout
- Duration: 10-15 minutes
- Style: Natural conversation, overlapping sentences allowed, occasional humor
- Build in Public framing: the hosts are building this in public, real bugs and gaps are admitted openly
- Technical level: intermediate — explain Compact and Midnight briefly but don't over-define terms
- Rafael should mention specific line counts, circuit names, and SDK bug numbers (Bug 5: finalizeRecipe, Bug 6: zkConfigProvider) — these ground the conversation in real code
- Ana should cite at least one author and connect the technical design to a specific LGPD article in each major segment

## Closing

Rafael's closing line: "Next cycle we're doing the first real deploy. docker compose up, standalone network, markRequestOverdue at block 21,601. If it fails, we'll log it. If it works, we'll celebrate on Twitter."

Ana's closing line: "And if someone asks whether this system actually protects people — that's the question we'll keep asking until the answer is 'yes, provably.'"

Call to community: DPO2U is building LGPD compliance infrastructure on Midnight Network in public. If you're a Compact developer, a Brazilian DPO, or a privacy-by-design advocate — we want to hear what we're missing. What right in Art. 18 did we leave unimplemented?
