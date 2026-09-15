---
title: "Ctrl-C doesn't do what you think"
description: "Why hitting Ctrl-C twice feels different from hitting it once, and what mkdir has to do with Kamal's deploy lock."
publishDate: "15 September 2026"
tags: ["linux", "learning", "software development"]
draft: true
---

<!-- FACT-CHECK: signals/process-groups explanation below came from the marker's own knowledge, not verified against a primary source. Check before publishing. -->

Question: you press Ctrl-C while `docker logs -f app | grep error` is running. Which signal is sent, and to which process?

My answer was that the first Ctrl-C sends SIGTERM, the second sends SIGINT, which is why some tools need two hits to actually die.

Ten-plus years writing software, and I'd never once checked. I just built a story that fit what my hands were doing.

Wrong. Ctrl-C always sends **SIGINT**. There's no first-soft-then-hard escalation built into the terminal. What's actually happening: some apps catch SIGINT and use it to shut down gently, then exit hard on a second SIGINT (or ignore the first entirely while mid-task). The escalation, if it exists, is the app's choice, not the shell's.

The other part I got right without knowing why: the signal goes to the **whole foreground process group**, not just the first command in the pipeline. So `docker logs -f app` and `grep error` both get SIGINT. The pipe doesn't shield grep.

## Why mkdir, not "check then create"

Second question: Kamal takes its deploy lock with `mkdir .kamal/lock-app`. Why `mkdir` and not "check whether a file exists, then create it"?

I knew `mkdir` fails if the directory's already there. I didn't know why that mattered enough to build a lock around it.

"Check then create" is two steps, and between them another process can slip in. Both processes check, both see nothing, both create. That gap is a race condition - specifically TOCTOU, time-of-check to time-of-use. `mkdir` collapses check-and-create into one atomic filesystem operation, so only one caller can ever win.

<!-- TODO: add a caramel-specific angle here - how the learning track's lab will actually exercise this -->
