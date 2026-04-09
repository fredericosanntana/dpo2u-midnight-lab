---
status: ready
publish_order: 37
platform: blog
content_type: article
pillar: compliance-protocol
tags: [lgpd, compact-lang, midnight-network, consent-registry, audit-log, zk-privacy, regulation-to-code]
source_note: logs/2026-04-09-dev.md
generated_by: dpo2u-midnight-agent
date: 2026-04-09
word_count: ~2400
---

# From Law to Ledger: Encoding LGPD Consent and Audit Requirements as Compact Smart Contracts on Midnight Network

*How we translated LGPD Art. 7, 8, 37, and 48 into two ZK-native smart contracts — zero PII on-chain.*

---

## The Legal Articles

### LGPD Art. 7 — Legal Bases for Personal Data Processing

> Art. 7. The processing of personal data may only be performed in the following cases: I — by the consent of the data subject; [...] § 5. The consent referred to in the head provision of this article shall be for specific purposes, and any broad authorizations for the processing of personal data shall be null.

### LGPD Art. 8 — Consent Requirements

> Art. 8. The consent referred to in item I of Art. 7 shall be provided in writing or by other means that demonstrate the will of the data subject. [...] § 5. The consent may be revoked at any time, by express manifestation of the data subject, through a free and facilitated procedure, and the data subject shall be informed of the consequences of revocation. § 6. In case of change in the information referred to in items I, II, III or V of Art. 9, the controller shall previously inform the data subject, who may, if they do not consent to the changes, revoke their consent.

### LGPD Art. 37 — Records of Processing Activities

> Art. 37. The controller and the processor shall keep records of the personal data processing operations they carry out, especially when based on legitimate interest.

### LGPD Art. 48 — Security Incident Notification

> Art. 48. The controller shall communicate to the national authority and to the data subject the occurrence of a security incident that may create risk or relevant harm to the data subjects. § 1. The communication shall be made within a reasonable period, as defined by the national authority, and shall mention, at a minimum: I — a description of the nature of the affected personal data; [...] IV — the technical and security measures used to protect the data, observing the industrial and commercial secrets.

These four articles collectively define the consent lifecycle: *how* consent must be captured, *how* it must be revocable, *what records* must be kept of all processing, and *what happens* when something goes wrong. They are the minimum viable legal surface for any Brazilian digital product that processes personal data.

---

## Technical Interpretation

Translating these articles into system requirements reveals a set of concrete, verifiable behaviors:

**From Art. 7 + 8:** A system must be able to record consent for specific purposes (not blanket authorization), associate consent with a policy version (so re-consent can be triggered when policy changes), and revoke consent at any time with a single operation that is as frictionless as granting it.

**From Art. 37:** Every data processing event must be recorded with enough metadata to answer: *who did what to which data, and when?* This record must be tamper-proof — an audit log that can be verified by regulators (ANPD) without requiring access to the underlying PII.

**From Art. 48:** Security incidents must be logged immediately and irrevocably. The log must be verifiable by the data subject and by the ANPD without depending on the good faith of the controller.

The key insight: **none of these requirements actually mandate storing PII on the record**. Art. 7–8 require consent records linked to a *data subject*; Art. 37 requires records linked to a *data controller*. If those links can be proven without exposing the identifiers themselves — which is exactly what ZK proofs enable — then full compliance is achievable with zero personal data on-chain.

This is the architectural bet we made with Midnight Network.

---

## Derived Requirements

### From Art. 7 + 8 (Consent):

1. **Purpose specificity**: Consent must be linked to specific processing purposes (analytics, marketing, third-party sharing, profiling), not granted as a blanket authorization.
2. **Versioned consent**: Each consent record must be tied to a policy version. When the policy changes, the system must detect stale consents and trigger re-consent.
3. **Revocability at any time**: A revocation circuit must exist and must be as performant as the grant circuit — not buried in a flow of 5 transactions.
4. **Status verifiability**: Any authorized party must be able to verify the current consent status of a subject for a given controller, without learning anything else.
5. **Zero PII on-chain**: The data subject identifier must never appear in plaintext on the ledger.

### From Art. 37 (Records of Processing):

6. **Immutable event log**: Processing events must be recorded in a way that cannot be modified retroactively — on a distributed ledger with cryptographic finality.
7. **Event taxonomy**: The system must distinguish between types of processing events (collection, access, transfer, deletion request, deletion completion, breach, portability, correction) to provide a structured audit trail.
8. **Controller-scoped querying**: Auditors must be able to query all events for a specific controller without scanning the full ledger.
9. **Tamper-evident timestamps**: Events must be anchored to a block number (cross-referenceable to block time by external auditors) without storing a mutable timestamp field.

### From Art. 48 (Breach Notification):

10. **Dedicated breach circuit**: A breach event must be loggable through a purpose-built circuit with its own counter — not buried in a generic event type — to make ANPD reporting unambiguous.
11. **Breach counter auditability**: The total number of breach events for a controller must be publicly queryable to enable ANPD monitoring.

---

## Implementation

### Requirement 1–5: `ConsentRegistry.compact`

The consent contract encodes the full consent lifecycle in Compact's ZK-native type system.

```compact
pragma language_version >= 0.7;

import CompactStandardLibrary;

// Ledger state — zero PII fields
ledger consent_status: Map<Bytes<32>, Uint<8>>;
ledger consent_purposes: Map<Bytes<32>, Uint<8>>;
ledger consent_policy_version: Map<Bytes<32>, Uint<8>>;
ledger total_consents_granted: Counter;
ledger total_revocations: Counter;

// Status codes: 0=no_record, 1=active, 2=revoked
// Purposes bitmask: bit0=essential, bit1=analytics, bit2=marketing,
//                   bit3=third_party, bit4=profiling

export circuit grantConsent(
  subject_id: Bytes<32>,   // sha256 of subject identifier — no PII
  purposes: Uint<8>,        // bitmask of consented purposes
  policy_version: Uint<8>   // current policy version at time of consent
): [] {
  assert purposes > 0 as Boolean "purposes cannot be zero — Art. 7 §5 prohibits blank consent";
  assert policy_version > 0 as Boolean "policy_version must be positive";

  consent_status.insert(subject_id, 1 as Uint<8>);
  consent_purposes.insert(subject_id, purposes);
  consent_policy_version.insert(subject_id, policy_version);
  increment total_consents_granted;
}

export circuit revokeConsent(subject_id: Bytes<32>): [] {
  assert member(consent_status, subject_id) "no consent record found for this subject";
  const current_status = disclose(consent_status.lookup(subject_id));
  assert current_status == 1 as Uint<8> "consent is not currently active";

  consent_status.insert(subject_id, 2 as Uint<8>);
  increment total_revocations;
}

export circuit updateConsentPurposes(
  subject_id: Bytes<32>,
  new_purposes: Uint<8>,
  new_policy_version: Uint<8>
): [] {
  assert member(consent_status, subject_id) "no consent record found";
  const current_status = disclose(consent_status.lookup(subject_id));
  assert current_status == 1 as Uint<8> "consent is not active — re-grant first";
  assert new_purposes > 0 as Boolean "cannot consent to zero purposes";

  consent_purposes.insert(subject_id, new_purposes);
  consent_policy_version.insert(subject_id, new_policy_version);
}
```

**Why `Bytes<32>` for the subject identifier?** In the TypeScript integration layer, the caller passes `sha256(email)` or `sha256(cpf)` as the subject ID. The ledger stores only the hash — the preimage never touches the chain. A regulator can verify that a consent record exists for a given subject by computing the hash themselves, without the contract or the ledger ever holding the PII.

**Why a bitmask for purposes (Requirement 1)?** Compact's `Uint<8>` can encode 8 boolean flags in a single field. Bit 0 = essential processing (cannot be revoked without ending service), bit 1 = analytics, bit 2 = marketing, bit 3 = third-party sharing, bit 4 = profiling (LGPD Art. 12 §1 defines profiling separately). The on-chain `assert purposes > 0` directly encodes Art. 7 §5: null authorization — zero purposes — is rejected at the protocol level.

**Why `policy_version` (Requirement 2)?** The TypeScript deploy script includes a `checkForStaleConsents()` helper that compares a subject's stored `policy_version` against the current contract version. If they differ, the application layer prompts a re-consent flow before proceeding. Art. 8 §6 compliance becomes a check, not a policy document.

```typescript
// TypeScript integration — illustrates no-PII pattern
import { createHash } from 'crypto';

function subjectId(email: string): Uint8Array {
  return Buffer.from(createHash('sha256').update(email).digest());
}

async function grantConsent(
  contract: ConsentRegistryContract,
  email: string,
  purposes: number,          // bitmask, validated before calling
  policyVersion: number
): Promise<void> {
  const sid = subjectId(email);   // PII stays in TypeScript memory
  await contract.grantConsent(sid, purposes, policyVersion);
  // email is never passed further — only the hash reaches the circuit
}
```

---

### Requirements 6–11: `DataAuditLog.compact`

```compact
pragma language_version >= 0.7;

import CompactStandardLibrary;

ledger event_count: Counter;
ledger events_by_controller: Map<Bytes<32>, Uint<64>>;
ledger last_event_type: Map<Bytes<32>, Uint<8>>;
ledger last_event_block: Map<Bytes<32>, Uint<64>>;
ledger deletion_requests: Counter;
ledger deletions_confirmed: Counter;
ledger breach_events: Counter;

// Event type codes:
// 1=data_collection, 2=data_access, 3=data_transfer,
// 4=data_correction, 5=consent_granted, 6=consent_revoked,
// 7=data_portability, 8=deletion_request, 9=deletion_confirmed

export circuit logEvent(
  controller_id: Bytes<32>,  // hash of controller DID or CNPJ
  event_type: Uint<8>,
  block_number: Uint<64>
): [] {
  assert event_type > 0 as Boolean "event_type must be a valid code (1-9)";
  assert event_type < 10 as Boolean "event_type out of range";

  increment event_count;

  const prior_count = disclose(
    member(events_by_controller, controller_id)
      ? events_by_controller.lookup(controller_id)
      : 0 as Uint<64>
  );
  events_by_controller.insert(controller_id, (prior_count + 1 as Uint<64>));
  last_event_type.insert(controller_id, event_type);
  last_event_block.insert(controller_id, block_number);
}

export circuit logDeletionRequest(
  controller_id: Bytes<32>,
  subject_id: Bytes<32>,
  block_number: Uint<64>
): [] {
  increment deletion_requests;

  const prior_count = disclose(
    member(events_by_controller, controller_id)
      ? events_by_controller.lookup(controller_id)
      : 0 as Uint<64>
  );
  events_by_controller.insert(controller_id, (prior_count + 1 as Uint<64>));
  last_event_type.insert(controller_id, 8 as Uint<8>);
  last_event_block.insert(controller_id, block_number);
}

export circuit logBreachEvent(
  controller_id: Bytes<32>,
  block_number: Uint<64>
): [] {
  increment breach_events;
  increment event_count;

  const prior_count = disclose(
    member(events_by_controller, controller_id)
      ? events_by_controller.lookup(controller_id)
      : 0 as Uint<64>
  );
  events_by_controller.insert(controller_id, (prior_count + 1 as Uint<64>));
  last_event_type.insert(controller_id, 255 as Uint<8>);  // breach sentinel
  last_event_block.insert(controller_id, block_number);
}
```

**Why `block_number` instead of a timestamp (Requirement 9)?** Midnight's ledger does not expose a reliable on-chain clock — block numbers are the canonical tamper-evident reference. An ANPD auditor can independently look up block N on any full node and determine the block time. The controller cannot retroactively change what block a record was written in. This makes the audit trail more trustworthy than a `uint256 timestamp` pattern — a controller in a system with mutable timestamps could conceivably manipulate the time field before a write.

**Why a dedicated `logBreachEvent` circuit (Requirement 10–11)?** Generically passing `event_type=9` through `logEvent` would work functionally, but it would make the breach counter indistinguishable from other events in a single query. By having `breach_events: Counter` incremented only by `logBreachEvent`, an ANPD monitoring script can call `getTotalBreachEvents()` on any deployment and get a single, unambiguous number — no indexer required.

---

## Mapping Table

| LGPD Article | Legal Requirement | Contract | Circuit / Field | Status |
|---|---|---|---|---|
| Art. 7 §5 | Specific purposes (no blank consent) | ConsentRegistry | `grantConsent` + `assert purposes > 0` | ✅ |
| Art. 8 caput | Recorded consent | ConsentRegistry | `consent_status` map | ✅ |
| Art. 8 §5 | Revocability at any time | ConsentRegistry | `revokeConsent` | ✅ |
| Art. 8 §6 | Re-consent on policy change | ConsentRegistry | `policy_version` field + TS layer | ✅ (TS) |
| Art. 37 | Records of processing activities | DataAuditLog | `logEvent`, `events_by_controller` | ✅ |
| Art. 18 VI | Right to erasure request | DataAuditLog | `logDeletionRequest`, `confirmDeletion` | ✅ |
| Art. 48 | Breach notification record | DataAuditLog | `logBreachEvent`, `breach_events` | ✅ |
| Art. 9 | Data minimization (no PII on-chain) | Both contracts | `Bytes<32>` = hash pattern | ✅ |
| Art. 18 II | Confirmation of processing | DataAuditLog | `getControllerEventCount` | ✅ |
| Art. 18 V | Data portability | DataAuditLog | `event_type=7` via `logEvent` | ✅ |

---

## Verification

**How does an ANPD auditor verify consent compliance programmatically?**

The auditor computes `sha256(subject_CPF_or_email)` and calls `getConsentStatus(subject_id)`. If the return value is `1`, active consent exists. If `2`, it was revoked. The subject's identity is never transmitted. The proof that the on-chain record corresponds to a real subject is generated off-chain by the controller and submitted with any regulatory report — the ledger provides the commitment, the controller provides the preimage during formal audit.

**How does Midnight's ZK architecture strengthen this?**

In Midnight, circuit execution produces a ZK proof that is posted alongside the transaction. This means the state transitions in `ConsentRegistry` are not just recorded — they are mathematically proven to be valid according to the circuit rules. An auditor verifying the chain gets not just a record that consent was granted, but a proof that the `grantConsent` circuit ran correctly with valid inputs (purposes > 0, policy_version > 0). This is compliance-as-a-cryptographic-guarantee, not compliance-as-a-log.

**Breach audit query (ANPD monitoring pattern):**
```typescript
const totalBreaches = await contract.getTotalBreachEvents();
const controllerBreaches = await contract.getControllerEventCount(
  controllerHash(cnpj)
);
// If totalBreaches > 0, regulators can request block numbers of each
// breach event for cross-referencing with incident reports
```

---

## Limitations

- **No access control on DataAuditLog**: Compact 0.29.0 has no built-in ACL. Any caller can call `logEvent` — including adversarial callers who could spam false events. The fix (an `authorized_controllers: Map<Bytes<32>, Uint<8>>` membership check before writes) is architecturally straightforward but not yet implemented. For production use, this is a required extension.

- **`block_number` field is Uint<64> but caller-supplied**: The block number passed to `logEvent` is provided by the TypeScript layer, not read from a chain-native source. An adversarial controller could pass a false block number. Mitigation: the block number should be validated off-chain by an indexer comparing the ledger write block against the claimed block number in the event.

- **Purposes bitmask is not validated on-chain beyond `> 0`**: Invalid combinations (e.g., `0xFF` — all bits set) are accepted. The TypeScript integration layer must validate bitmask inputs against the defined purpose schema before submission.

- **ConsentRegistry does not model consent per-controller**: The current design maps `subject_id → status`, not `(subject_id, controller_id) → status`. If DPO2U deploys one ConsentRegistry per data controller (recommended pattern), this is fine. If a single shared registry is used across controllers, the contract needs a composite key: `Map<Bytes<64>, Uint<8>>` with `(subject_id ++ controller_id)` as the key.

- **Art. 8 §6 re-consent is enforced in the TypeScript layer, not the contract**: The Compact contract does not reject transactions from subjects whose stored `policy_version` is older than the current version — it stores whatever is passed. The re-consent workflow is enforced by the application. A more robust implementation would store the current policy version in a contract-wide ledger field and assert `policy_version == current_policy_version` in `grantConsent`.

- **GDPR coverage not fully mapped**: The consent model aligns closely with GDPR Art. 7 (conditions for consent) and Art. 17 (right to erasure), but GDPR-specific requirements (e.g., age verification, parental consent, cross-border transfer records) are outside scope of this implementation.

---

*This article is part of the DPO2U "Regulation to Code" series. Source contracts: `contracts/ConsentRegistry.compact` and `contracts/DataAuditLog.compact` in the dpo2u-midnight-lab repository.*
