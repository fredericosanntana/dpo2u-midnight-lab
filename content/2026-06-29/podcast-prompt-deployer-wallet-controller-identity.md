---
date: 2026-06-29
pillar: midnight-dev / compliance-protocol
format: podcast-prompt
source: logs/2026-06-29-dev.md — scripts/deploy-all.ts
voice: Ana + Rafael
language: English
---

# Prompt: DPO2U Insights Episode — One Wallet, Three Contracts: Is the Deployer the LGPD Controller?

## Hosts and Dynamic

**Ana** is a Data Protection Officer (DPO) and privacy compliance specialist. She approaches every technical decision through the lens of data protection law, accountability obligations, and the rights of data subjects. She cites legal frameworks (LGPD, GDPR), academic authors, and asks the uncomfortable "who is responsible?" questions that builders often avoid until regulators force the issue.

**Rafael** is a blockchain architect and lead developer at DPO2U. He built three Midnight Network smart contracts in Compact — ConsentRegistry, DataAuditLog, and DataSubjectRights — and today shipped a unified deploy orchestrator called deploy-all.ts. He explains architectural decisions with precision, uses concrete analogies, and gently resists what he sees as Ana's tendency to over-interpret infrastructure as legal intent.

Their dynamic in this episode: constructive tension between a builder who sees deploy-all.ts as a DevOps optimization and a DPO who sees it as a potential controller identity declaration under LGPD.

## Episode Context

DPO2U is building a privacy compliance infrastructure on Midnight Network — a zero-knowledge blockchain designed for privacy-preserving smart contracts. Today, the team shipped deploy-all.ts: a unified deploy orchestrator that initializes a single WalletFacade instance, syncs it once to the Midnight node, then deploys three legally distinct contracts in sequence: ConsentRegistry (consent management, LGPD Art. 7/8), DataAuditLog (processing event logging, LGPD Art. 37), and DataSubjectRights (access/erasure/portability requests, LGPD Art. 18/19).

Before this script, each contract had its own deploy script that independently synced a wallet — costing 10–30 minutes per contract on the preprod network, or 30–90 minutes total for a full deployment cycle. The new script cuts that to a single sync. Each contract still maintains its own private state provider (cr-private-state, dal-private-state, dsr-private-state) and loads its own ZK circuit assets from separate build directories. The architecture isolates data processing at the contract level.

The question this episode asks: when a single wallet address deploys all three contracts, does it become the LGPD "controlador" (controller) for all three processing purposes simultaneously? And what does that mean for accountability, responsibility, and future regulatory scrutiny?

## Discussion Topics

1. **What deploy-all.ts actually does — and why it matters**:
   Rafael explains the engineering problem: 3 contracts × 10–30 min wallet sync = 30–90 minutes of overhead per deploy cycle. He describes the solution: a shared WalletFacade instance (synced once), three independent levelPrivateStateProvider instances (cr-private-state, dal-private-state, dsr-private-state), and --skip-cr/--skip-dal/--skip-dsr flags for partial re-deployment. Total: 31 ZK circuits compiled (8 + 11 + 12), all 7 Midnight SDK bugs addressed via documented workarounds. Ana asks: "You just described a single entity deploying three separate legal processing purposes. Who authorized that?"

2. **Who is the LGPD 'controlador' in a smart contract deployment?**:
   LGPD Art. 5 VI defines the "controlador" as the natural or legal person who makes decisions about personal data processing. On Midnight, the deploying wallet address is immutable, public, and permanently linked to the deployed contract. Is the deployer the controller? Ana argues: in traditional software, the company is the controller, but on-chain, the deployer address is the closest analogue to a formal declaration. Rafael argues: the wallet is a deployment tool, not a controller declaration — like asking if the CI/CD pipeline that pushed the code is the controller.

3. **Does a shared deployer wallet link three legally distinct processing purposes?**:
   ConsentRegistry, DataAuditLog, and DataSubjectRights serve three different LGPD processing purposes: consent lifecycle (Art. 7/8), audit trail (Art. 37), and data subject rights fulfillment (Art. 18/19). Each has its own private state store. From a technical standpoint, they are isolated. From a legal standpoint: if one wallet address appears as the deployer for all three, does that create an implicit controller linkage? Ana invokes Helen Nissenbaum's "contextual integrity" concept — information flows are appropriate when they respect the norms of the context in which they originate. Is a shared deployer violating the contextual separation between these three processing purposes?

4. **Infrastructure action vs. data processing decision — where does LGPD draw the line?**:
   LGPD Art. 5 VI requires that the controller make "decisions referentes ao tratamento de dados pessoais" (decisions regarding personal data processing). Is deploying a contract a "decision about processing"? Rafael: deployment is infrastructure — the contract's logic was already written and audited before the deploy. The deploy just moves it on-chain. Ana: but that move is a decision. No processing happens until the deployer initiates that transition. The moment of deploy is the moment of operational intent.

5. **Practical implications for LGPD Art. 37 — the accountability obligation**:
   Art. 37 requires controllers and processors to maintain records of personal data processing activities. In a traditional context, this means keeping a registry. In DPO2U's architecture, the DataAuditLog contract IS the registry — every processing event is logged on-chain. But who is accountable for that log? If the deployer wallet is the controller, and the wallet is an HD-derived key from a seed, is the human holding the seed the controller? What happens if the seed is lost, rotated, or shared? Ana and Rafael should work through a realistic compliance scenario.

## Supporting Material

Excerpts from the 2026-06-29 dev log:

"Each contract gets its own levelPrivateStateProvider (separate private state store names: cr-private-state, dal-private-state, dsr-private-state) and NodeZkConfigProvider pointing to its own build dir — required for correct ZK asset loading."

"--skip-cr / --skip-dal / --skip-dsr flags allow partial re-deploy without touching already-deployed contracts."

"Standalone default: uses genesis seed 000...001 (has prefunded tNIGHT) — zero-config first run. Preprod/preview: requires explicit --seed flag (prevents accidental seed generation loss)."

"All 7 SDK workarounds applied: setNetworkId() first (Bug 4), finalizeRecipe not signRecipe (Bug 5), walletProvider in levelPrivateStateProvider (Bug 6), smoldot override assumed in package.json (Bug 7)."

"Output files: deployment-consent-registry-<network>.json, deployment-data-audit-log-<network>.json, deployment-data-subject-rights-<network>.json — exactly what interact-full-suite.ts reads via --from-json."

## Literary References

Ana should cite, organically:

- **Helen Nissenbaum**, "Privacy in Context: Technology, Policy, and the Integrity of Social Life" (2010) — the concept of contextual integrity: information flows are appropriate when they match the norms of the context. A single deployer wallet may violate the contextual separation between consent management, audit logging, and data subject rights — three distinct processing contexts with different accountability norms.

- **LGPD Art. 5 VI** — definition of "controlador": "pessoa natural ou jurídica, de direito público ou privado, a quem competem as decisões referentes ao tratamento de dados pessoais."

- **LGPD Art. 37** — accountability obligation: "O controlador e o operador devem manter registro das operações de tratamento de dados pessoais que realizarem, especialmente quando baseado no legítimo interesse."

- **ANPD Guia Orientativo para Definições dos Agentes de Tratamento** (2021) — ANPD guidance on distinguishing controller from processor, relevant to whether the deployer vs. the organization vs. the smart contract itself bears controller status.

## Point of Tension

The central disagreement: **Is the deployer wallet a legal artifact or a technical tool?**

Rafael's position: "The wallet is infrastructure. It's like asking if the server admin who provisioned the database is the data controller. They're not — the organization that commissioned the work is. The wallet is the deploy mechanism, not the decision-maker. The contracts are isolated. The private state stores are isolated. The ZK circuits are isolated. The wallet is just the delivery vehicle."

Ana's position: "In traditional infrastructure, the server admin is anonymous and replaceable. On Midnight, the deployer address is permanent, public, and cryptographically linked to every deployed contract — forever. That's not a delivery vehicle. That's a signature. Under LGPD, the entity that has authority over whether processing happens at all — the entity without whose action no data subject rights request would ever be fulfilled — is the controller. The deployer wallet is that entity."

The productive middle ground to explore: can DPO2U add on-chain controller metadata to each contract at deploy time — a separate `controller_address` field in the contract state — that is legally distinct from the deployer address? Would that satisfy ANPD scrutiny better than relying on the deployer as implicit controller?

## Tone and Instructions

- Language: English
- Duration: 10–14 minutes
- Conversation style: natural, back-and-forth dialogue — not lecture format. Ana and Rafael interrupt each other occasionally. Rafael uses analogies. Ana cites law and authors by name.
- Build in Public ethos: the hosts acknowledge they are figuring this out in real time, not presenting a finished answer. This is a genuine open question in the Midnight ecosystem.
- Avoid jargon overload — explain Midnight Network, ZK circuits, and WalletFacade when first mentioned, assuming listeners are technically curious but not Midnight specialists.
- Do not read the supporting material excerpts verbatim — they are reference context for the hosts to internalize and surface naturally.

## Closing

Rafael: deploy-all.ts is ready. The next step is the first real standalone deploy, followed by running interact-full-suite.ts to execute the complete LGPD lifecycle on-chain for the first time. 31 circuits compiled and waiting.

Ana: Before that first transaction lands, the team needs a clear answer to who the controller is — not for the regulator, but for themselves. Accountability starts with knowing who is accountable.

Call to community: if you've deployed compliance contracts on a public blockchain and had to answer "who is the controller?" to a regulator, DPO2U wants to hear how you handled it. Find the project at #DPO2U and #MidnightForDevs.
