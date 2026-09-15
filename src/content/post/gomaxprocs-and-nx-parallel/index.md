---
title: "GOMAXPROCS and NX_PARALLEL: capping the ceiling made it faster"
description: "6 worktrees running tsc at once nearly crashed my Mac. Capping GOMAXPROCS and NX_PARALLEL globally, not per worktree, fixed it, and everything finished faster."
publishDate: "15 September 2026"
tags: ["performance", "developer experience", "tooling"]
draft: true
---

I run Herdr with 5-6 worktrees open at the same time, each one running `tsc` and `tscgo` for the project at work. Every worktree happily spins up its own compiler, and each compiler happily grabs as many threads as it wants. On my MacBook Pro M3 Pro, 36GB, I watched a single `tscgo` process eat 500% CPU. Multiply that by 6 worktrees running at once and the machine was basically on the floor. Fans maxed, everything else stuttering, close to a full crash.

**Capping the ceiling globally, not per job, is what fixed it. And the whole thing got faster, not slower.**

## What was actually happening

Nobody told any of these processes about each other. Each worktree's `tsc`/`tscgo` run and each Nx task assumed it owned the whole machine. That's fine with 1 worktree. With 6 running at once, they're all reaching for the same 12 or so performance cores, and the OS spends its time context-switching between way more threads than there are cores to run them on. Scheduled in, a sliver of work, scheduled back out.

500% CPU looks busy. Most of that isn't useful work.

## GOMAXPROCS

`GOMAXPROCS` is Go's runtime setting for how many OS threads can execute Go code at once. `tscgo` is Go underneath, so left alone it defaults to using every core it can see. One `tscgo` run assuming it owns all 12 cores is fine. 6 of them making the same assumption at the same time is the problem.

## NX_PARALLEL

`NX_PARALLEL` is Nx's setting for how many tasks it runs concurrently across the monorepo's task graph. Same story: left at its default, each worktree's Nx run sizes itself to the whole machine, with no idea 5 other worktrees are doing the exact same thing right now.

## The fix: cap it globally, not per worktree

My first instinct was to cap things per worktree, give each one a smaller slice. That's the wrong level. A worktree doesn't know how many siblings are running at any given moment, so there's no "right" per-worktree number to pick.

What actually worked: set both as environment variables once, globally, in my shell config, not scoped to any one project or worktree.

```bash
# ~/.zshrc (values still TBD, tuning these against my core count)
export GOMAXPROCS=4
export NX_PARALLEL=3
```

Now every worktree, no matter how many are running, respects the same shared budget. 6 worktrees running `tscgo` at once means 6 processes each capped at 4 threads, not 6 processes each grabbing 12.

## Why capping made it faster

This is the part that didn't feel right until I saw it happen: total time to finish went down, not up.

Before the cap, the machine was "busy" at 500%+ per process but most of that was contention: threads fighting for cores, getting swapped in and out, doing less real work per second than the CPU number suggested. After the cap, each process does less thrashing and more actual compiling. Less time lost to scheduling overhead means the whole batch of 6 worktrees finishes sooner, even though no single worktree is allowed to run as "fast" on paper.

Oversubscription isn't free. `htop` was lying to me about how much useful work was actually happening underneath the number.
