---
date: 2026-08-25
pillar: midnight-dev
format: sdk-debugging-diary
source: logs/2026-08-24-dev.md (full session log, dev cycle on branch
  fix/consent-registry-assert-parens) + git show 4380861 (rescue commit, confirms /tmp
  at 26% used in the following session)
angle: a compactc crash that turns out not to be a Compact bug at all — it's ENOSPC
  on a VPS-shared /tmp, surfaced through an unguarded assert(). The interesting part
  isn't the compiler; it's that the same full tmpfs also broke the Bash tool doing the
  debugging, and the escalation channel meant to report the blocker.
---

# compactc Crashes on `--version`: A Full `/tmp` Broke the Compiler, the Shell, and the Escalation Path All at Once

## Symptom

**Environment**: `compactc` (Compact compiler) via `~/.compact/bin/compactc`, DPO2U Midnight Lab repo, branch `fix/consent-registry-assert-parens` — the `ConsentRegistry` assert-parens fix (`ce6764f`) was already committed and its build artifacts already existed under `build/ConsentRegistry/`.

**Error**:
```
Assertion failed: write(fd, contents, size) == size
(embed_target.c: maketempfile: 28)
Aborted (core dumped)
```

This showed up on the simplest possible invocation — `compactc --version` — during a routine dev cycle. The three existing Compact contracts (`ConsentRegistry`, `DataAuditLog`, `DataSubjectRights`) had just been re-read and looked syntactically correct, with well-formed `assert()` calls and no pending `TODO`/`FIXME`. The natural next step was recompiling to confirm the fix before touching deploy/interact scripts. The compiler never got that far — it aborted before printing a version string.

## Investigation

### Hypothesis 1: wrong binary / PATH shadowing

Ran with the full path instead of relying on `PATH`:

```bash
~/.compact/bin/compactc --version
```

Same crash, same assertion. Ruled out an alias or a stale binary on `PATH`.

### Hypothesis 2: redirect the compiler's tempfile elsewhere

```bash
TMPDIR=/root/some-writable-dir ~/.compact/bin/compactc --version
```

Result: no improvement — and worse, subsequent commands in the same session started failing too, including plain `echo ok`. That ruled out a `compactc`-specific tempdir setting and pointed at something session-wide.

### Hypothesis 3: disk pressure

```bash
df -h /tmp
# tmpfs   16G   16G   4.0K  100%  /tmp
```

`/tmp` was completely full. That's the actual trigger.

## Root Cause

`compactc` embeds build artifacts by writing to a tempfile during compile/version-check (`embed_target.c`, function `maketempfile`), then asserts that the `write()` syscall returned the full byte count. On this VPS, `/tmp` is a 16G tmpfs shared across every project and every Claude Code session on the box — not scoped to this repo. It was at 100%, so the `write()` for a brand-new tempfile returned short, and the unguarded `assert()` aborted the process.

This is not a Compact-specific bug. It's `ENOSPC` surfacing through an assertion instead of a graceful error message.

The wrinkle that made this session harder to debug: the Bash tool driving the session also stages stdout/stderr through `/tmp/claude-0/.../tasks`, on the exact same tmpfs. Once `/tmp` hit 100%, Bash itself stopped functioning — even `echo ok` returned `ENOSPC`. The tool being used to investigate the failure failed for the same reason as the thing under investigation, mid-session.

## Fix / Workaround

> ⚠️ **Not fixed** — the blocker is disk space, not code. No code change was needed or made.

What was explicitly *not* done: deleting anything under `/tmp` directly. Before Bash died, `du -sh /tmp/*` had already shown what was actually consuming the space — and none of it belonged to this repo:

```
/tmp/claude-0                     1.7G   # Claude Code session cache
/tmp/remotion-webpack-bundle-*    dozens of dirs, 380-460M each   # HyperFrames/marketing-video
/tmp/strix-dev19-*                hundreds of MB   # Strix project
thousands of .tmpXXXXXX/ dirs, dated 2026-06-18/19   # ~2-month-old orphans
# ls /tmp | wc  →  ~6500 entries total
```

`/tmp` is shared infrastructure across the whole VPS — multiple unrelated projects, multiple concurrent sessions. Deleting any of it without knowing which processes still reference it is a destructive, irreversible action, and it's outside the scope of a dev cycle scoped to Compact contracts. `df -h /` confirmed the root partition had 55G free, so this wasn't a general disk shortage — it was isolated to the `/tmp` tmpfs specifically.

The safe next steps were documented for a human to execute, rather than executed automatically:

```bash
# ~2-month-old orphans — safe to prune
find /tmp -maxdepth 1 -name '.tmp??????' -mtime +14

# confirm no active render before touching these
ps aux | grep remotion

# confirm with the Strix project owner before touching these
# /tmp/strix-dev19-*

# Claude Code session cache — safe if no active session depends on it
# /tmp/claude-0
```

Longer term, `mount -o remount,size=32G tmpfs /tmp` (or an `/etc/fstab` change) is worth considering, since `/` has plenty of headroom and the pressure on `/tmp` looks chronic rather than a one-off spike. `/tmp` recovered to 26% used by the following session on its own — likely another process's cleanup or rotation — and the dev log from this session was rescued and committed then.

## Upstream

- **Issue**: not reported. This isn't a `compactc` bug — the compiler is correctly aborting on a failed `write()` when the host filesystem is full. No upstream action applies.
- **Status**: N/A
- **Response**: N/A

## Prevention Checklist

- [ ] Add a pre-flight `df -h /tmp` check (fail loud below a sane threshold, e.g. 500M free) before invoking `compactc` in any automated dev cycle
- [ ] Monitor `/tmp` usage VPS-wide, not per-project — this is shared infrastructure and no single repo's health check will catch pressure caused by another project
- [ ] Treat "Bash itself stops working" as a distinct failure signal from "the command I ran failed" — don't assume the target binary is broken when the shell tool staging files under the same partition is what's actually down
- [ ] Keep an escalation path that doesn't depend on the same shell/filesystem that might be the thing that's broken — this session's email escalation script also failed, because it shells out
- [ ] Periodically prune known-safe, dated `/tmp` orphans instead of waiting for 100%
