---
date: 2026-08-25
pillar: dpo2u-arch / midnight-dev
format: podcast-dialogue-prompt
source: logs/2026-08-24-dev.md + content/2026-08-25/article-compactc-enospc-debugging-diary.md
angle: this incident has both a technical layer (compactc crashing via ENOSPC on a
  shared /tmp) and a governance layer (the session had safe-looking deletion
  candidates and root to spare, but chose not to touch shared infrastructure without
  confirmation — even though the confirmation channel itself was down). That
  combination, not just the bug, is what justifies a podcast episode.
---

# Prompt: DPO2U Insights Episode — When the Fix Tool Breaks Too

## Hosts and Dynamic

**Ana** — DPO2U's Data Protection Officer. Regulatory, ethical, humanistic perspective. Cites LGPD/GDPR and governance frameworks. Asks "why does this matter beyond the bug?" and "who bears the cost if this goes wrong?"

**Rafael** — DPO2U's blockchain architect and lead developer. Technical perspective: SDKs, contracts, build tooling, concrete error logs. Wants to move fast and unblock the build.

Dynamic for this episode: Rafael walks in visibly annoyed — he had a list of `/tmp` directories that looked obviously safe to delete and could have freed 16G in one command, unblocking `compactc` immediately. Ana holds the line: the question was never "was the deletion probably safe," it's "did you have a way to check with a human before an irreversible action on infrastructure shared by other projects" — and the answer was no, because the same filesystem pressure had also taken down the email escalation script. They resolve the tension not by picking a winner, but by identifying what should change so this choice isn't forced next time.

## Episode Context

On 2026-08-24, a routine dev cycle on the DPO2U Midnight Lab repo tried to recompile three already-verified Compact contracts (`ConsentRegistry`, `DataAuditLog`, `DataSubjectRights`) to confirm a prior fix (commit `ce6764f`). The simplest possible command, `compactc --version`, crashed instead: `Assertion failed: write(fd, contents, size) == size (embed_target.c: maketempfile: 28)`.

Root cause: `/tmp` — a 16G tmpfs shared across the entire VPS, not scoped to this repo — was at 100% (`tmpfs 16G 16G 4.0K 100% /tmp`). `compactc` writes a tempfile during compile/version-check and asserts the write succeeds; with zero space left, the write failed short and the process aborted. Worse, the Bash tool running the debugging session also stages stdout/stderr on that same tmpfs (`/tmp/claude-0/.../tasks`) — so once `/tmp` filled, Bash itself stopped working, down to `echo ok` returning `ENOSPC`. That took out three things at once: compiling the contracts, `git add/commit/push`, and the shell-dependent email script that would normally escalate a blocker like this to the shareholder.

Before Bash died, `du -sh /tmp/*` had already shown what was actually eating the space, and none of it belonged to this repo: 1.7G of Claude Code session cache (`/tmp/claude-0`), dozens of 380–460M Remotion webpack bundles from an unrelated video project, hundreds of MB from a project called Strix, and thousands of two-month-old orphaned `.tmpXXXXXX/` directories (~6500 entries in `/tmp` total). `df -h /` confirmed the root partition had 55G free — this was isolated disk pressure on one shared partition, not a VPS-wide shortage.

Nothing was deleted. The session documented safe-looking candidates and the exact commands a human should run, then wrote its log via a tool that doesn't touch `/tmp` (so the record survived even with Bash down). The following session found `/tmp` back down to 26% used and rescued the pending log into git.

## Discussion Topics

1. **The bug itself**: Rafael walks through the crash — why `compactc` embeds a tempfile write at version-check time, why the assertion fires on `ENOSPC`, and why this isn't a Compact-specific bug at all, just disk pressure surfacing through an unguarded assert. Cite the exact error string and the `df -h /tmp` output.
2. **The cascade**: how one full tmpfs quietly took down three unrelated tools — the compiler, git, and the escalation script — that nobody would normally think of as coupled. What does this say about hidden shared dependencies in an "autonomous" pipeline that assumes its own shell always works?
3. **The governance call**: Ana pushes on why the session didn't just delete the obviously-orphaned two-month-old directories, even with 55G free on root and a clear list of safe candidates. What does "affects shared systems beyond your local environment — confirm first" mean in practice when the confirmation channel is also down? Is documenting-and-waiting always the right call, or are there thresholds where it isn't?
4. **The irony, and the design lesson**: the tool meant to fix the problem (Bash) broke because of the same problem it was trying to fix, and the fallback escalation path (the email script) depended on that same broken shell. What's the lesson for building incident response that can survive being starved by its own incident — e.g., an escalation path that doesn't shell out, or writing critical logs through a tool that bypasses the failure surface (as happened here, via the `Write` tool instead of Bash redirection)?
5. **Resolution and what's still open**: `/tmp` recovered to 26% on its own by the next session, and the pending log got rescued and committed. But there's still no VPS-wide `/tmp` monitoring and no pre-flight disk check before `compactc` runs — name the concrete next steps from the debugging diary's prevention checklist.

## Supporting Material

- Exact crash: `Assertion failed: write(fd, contents, size) == size (embed_target.c: maketempfile: 28)` — Aborted (core dumped)
- `df -h /tmp` at time of failure: `tmpfs 16G 16G 4.0K 100% /tmp`
- `du -sh /tmp/*` breakdown: `/tmp/claude-0` 1.7G, `remotion-webpack-bundle-*` dozens of dirs at 380–460M each, `strix-dev19-*` hundreds of MB, thousands of `.tmpXXXXXX/` dated 2026-06-18/19, `ls /tmp | wc` ≈ 6500 entries
- `df -h /`: 55G free — confirms this was a `/tmp`-tmpfs-specific problem, not general VPS disk shortage
- Resolution evidence: commit `4380861` message states `/tmp` was "healthy again (26% used)" in the following session, which is when the pending dev log finally got committed

## Literary References

Ana draws the parallel to the accountability principle in LGPD (Art. 6, VIII — *responsabilização e prestação de contas*): the point isn't just whether an action turns out fine, it's whether the decision to take it (or not) is traceable and defensible after the fact, especially when taken under pressure with no one to check with. She uses that to argue the session's choice — document candidates, don't act, leave a rescuable trail — was the correct instinct even though it left the build blocked longer.

## Point of Tension

Rafael: "I had a list. Two-month-old temp directories, nothing referencing them, 55G free on root as a safety net. I could have freed 16G with one `find -delete` and had the contracts compiling five minutes later."

Ana: "None of that is the test. The test is whether you had a channel to check with a human before touching infrastructure other projects depend on — and you didn't, because the same fault took out your escalation script too. If deleting the 'obviously safe' stuff goes wrong once, on a box with NetPositive, Strix, and HyperFrames all sharing it, 'it looked safe' is not going to be a satisfying answer to whoever it broke for."

They land on: the real fix isn't "should Rafael have deleted the files" — it's making sure escalation never again depends on the exact resource that's failing.

## Tone and Instructions

Natural conversational English, enthusiastic but technical, 8–15 minutes. Build in Public — name real numbers (16G tmpfs, 100% → 26%, ~6500 entries, 1.7G cache, 55G free on root) rather than speaking in generalities. Let the disagreement in the Point of Tension play out for at least one full exchange before they converge — don't resolve it too quickly.

## Closing

Close on the concrete next steps already logged in the prevention checklist: a pre-flight disk check before `compactc` runs, VPS-wide `/tmp` monitoring instead of per-project checks, and an escalation path that doesn't shell out through the same filesystem it's reporting on. Invite the NightForce community: has anyone else hit a shared-infra failure that took out their own incident-response tooling at the same time as the incident?
