---
title: "Review the Skill, Not the Diff"
description: "Our best practices live in a skill now, not in people's heads. That changes what code review is actually for."
publishDate: "12 September 2026"
tags: ["ai", "code review", "engineering", "tooling"]
draft: true
---

We had a small argument in review this week. The PR didn't match how we usually structure a
handler, and the first instinct was the usual one: "fix it to match the pattern." Except the
pattern lives in a skill file now, and the skill was 2 months old. So the actual question wasn't
"is this code wrong", it was "which one is wrong, the code or the skill".

That's a different review than the one we used to run.

**The skill is where our best practices actually live now, so when code disagrees with it, the
fix isn't always the code — sometimes it's the skill.**

## Where the practices used to live

Before, "how we do things" was spread across a few people's heads, a couple of stale wiki pages,
and whatever the last PR happened to look like. New code matched the codebase because someone
who'd internalized the conventions wrote it, or reviewed it. That worked, but it didn't scale
past the people who carried the knowledge, and it drifted — the wiki page said one thing, the
codebase had quietly moved on to another.

Now the conventions are written down as a skill: error handling shape, how we name things, when
to reach for a helper versus inlining it, the shape of a good commit. It's the thing an agent
reads before writing code, and it's specific enough to actually constrain output instead of
gesturing at "clean code".

Writing it down changed something we didn't expect. Once the practice is a document instead of a
shared instinct, disagreements about it stop being disagreements about taste. You can point at
the sentence. And you can also just be wrong about the sentence — the skill can be out of date,
overfit to one case, or flat contradicting itself. Code that breaks the skill is a signal, not
automatically a bug.

## Linting still does the cheap part

None of this replaced linting. If a rule is mechanical — import order, unused vars, a specific
API we've banned — it should still be a lint rule, not a paragraph in a skill file. A lint rule
is cheap to write and it runs in about 1 second across the whole codebase. There's no reason to
spend a review comment, or a skill sentence, on something a rule can catch before the PR even
opens.

The split that's settled for us:

- **Mechanical, binary, no judgment call**: lint rule. Fast, deterministic, no review needed.
- **Requires judgment, has exceptions, changes with context**: skill. Read before writing,
  argued about when it's wrong.

Skills are for the stuff that needs a "usually, unless" attached to it. Lint rules are for the
stuff that doesn't.

## What human review is actually for now

The part that took adjusting to: we review the skill now, not every diff that follows it. If the
skill is right, code generated against it is right by construction, and re-litigating the same
convention on every PR is just friction. The review energy moved upstream — to catching a skill
rule that's wrong, or too broad, or missing a case — instead of downstream, catching every
individual line that happens to violate it.

That's a real shift in what "reviewing" means for us. It used to be: read the diff, decide if
each line is good. Now it's closer to: decide if the rule that produced this diff is good, and
trust the diff if it is.

## Fixing where the trace points

Separately, the debugging side of this has gotten a lot better too. We've moved to Clickstack for
tracing, and the loop from a trace to an actual fix is short now: a log line points at a callsite,
the callsite points at the code, and the code is right there to fix. No jumping between three
dashboards trying to reconstruct where a request actually went. Trace, callsite, code, fix — same
session.

It's a small thing next to the skill/review change, but it's the same underlying shift: less time
spent reconstructing context by hand, more time spent on the actual decision.

Still figuring out where the edges of this are — how often a skill should get reviewed on its own
cadence, what happens when two skills quietly disagree with each other. If you've run into the
same "which one is wrong, the code or the rule" question, let me know how you've been handling it.
