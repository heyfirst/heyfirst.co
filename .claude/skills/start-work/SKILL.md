---
name: start-work
description: >
  Starts a work session. Reads the most recent worklog, checks git status,
  recent ADRs, and CONTEXT.md changes, then creates a new daily worklog with a
  welcome brief. Use when user says "start work", "good morning", "what was I
  doing", or invokes /start-work.
---

# Start Work

Begin a work session with full context restoration. Read prior state, then create
a fresh worklog for today. Docs are the source of truth: `CLAUDE.md` (how to
operate), `CONTEXT.md` (domain nouns), `docs/adr/` (architectural decisions).

> **Worklog style: short and concise.** Bullet points only, one-line sentences.
> Track *what we did*, not a transcript — capture decisions, outcomes, and
> blockers; skip narration, reasoning, and routine steps. If a line wraps, it's
> too long. A whole session is a handful of bullets, not paragraphs.

## Workflow

When user says `/start-work`:

### 1. Discover previous session

```bash
ls -1 docs/worklog/ | sort | tail -1     # most recent worklog
git status --short
git branch --show-current
git log --oneline -5
```

Read the most recent worklog file in full.

### 2. Check for context changes

- Read `CONTEXT.md` — note terms added/changed since last worklog.
- List `docs/adr/` — note any new ADRs.
- Check for uncommitted changes or stale branches.

### 3. Create today's worklog

Create `docs/worklog/YYYY-MM-DD.md` (today). If it exists, append a new session
section — don't overwrite.

### 4. Present welcome brief

Write the brief into the worklog, then show it:

```markdown
# Worklog — YYYY-MM-DD

## Session start: HH:MM

### Unfinished (from YYYY-MM-DD)
- [ ] Task (was in-progress/blocked)

### Completed last session
- [x] Finished task

### Context changes
- New ADR: 000X-...md
- CONTEXT.md: added "..." term

### Git status
- Branch: ...
- N uncommitted files
- Last commit: abc1234 ...
```

### 5. Continuous logging

Append a one-line bullet only when something *meaningful* lands — a decision, a
shipped piece, a blocker. Not every step.

```markdown
## HH:MM
- [x] One-liner: what landed (+ key file only if significant)
- [ ] Blocker: what + why
```

No `/stop-work` needed — the worklog stays current.

## Format rules

- **Bullets only, one line each.** No paragraphs, no narration, no reasoning.
- Log outcomes, not actions — *what we did*, not how. Skip routine steps.
- `[x]` done, `[ ]` pending/blocked; `HH:MM` timestamps.
- File-level mention only when significant (schema/route renames, new
  collections, brand/token changes, deploy-affecting config).
- A blocker gets one line: what + why.

## Do / Don't

**Do**
- Read the last worklog in full before writing anything.
- Log outcomes as one-line bullets: decisions, shipped pieces, blockers.
- Keep CONTEXT.md/ADRs as the source of truth; point at them, don't restate.
- Append as work lands; mark `[x]`/`[ ]`.

**Don't**
- Don't narrate steps, reasoning, or routine actions — it's a log, not a transcript.
- Don't write paragraphs or multi-line entries (if a line wraps, trim it).
- Don't overwrite an existing day's worklog — append a session section.
- Don't duplicate glossary/decision prose that already lives in `docs/`.
- Don't commit, push, or tag — that's the user's call.

## Edge cases

- **No previous worklog:** first session — skip "Unfinished", note a fresh start.
- **Worklog already exists today:** append a new session section.
