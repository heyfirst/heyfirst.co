---
title: "Why my log streamer buffered everything"
description: "Bun.spawn vs Bun Shell, the exact shape of a line-by-line log reader, and what Ctrl-C actually does to five ssh children."
publishDate: "15 September 2026"
tags: ["bun", "cli", "learning", "software development"]
draft: true
---

<!-- FACT-CHECK: process group / Ctrl-C behavior for child processes below is from the marker's own knowledge, not verified against a primary source. Check before publishing. -->

Question: when would you pick `Bun.spawn` over Bun Shell (`` Bun.$`...` ``)?

I said `Bun.spawn` is async and Bun Shell is sync. Both are async - that part was just wrong, and it's the kind of mistake that's easy to make when you've spent 10+ years leaning on frameworks to hide exactly this detail. The real difference is control: Bun Shell gives you shell syntax with safe escaping and built-in commands, good for short scripts. `Bun.spawn` gives you direct access to the process and its streams, which is what you need for anything long-running or line-by-line.

## The mistake that buffers everything

Question: you spawn `ssh host 'docker logs -f app'` and want every line prefixed with `[host]` as it arrives. What's the shape of the code, and what mistake buffers everything until the process exits?

I reached for a `while true` loop reading a buffer, which is the right instinct but not the actual failure mode I guessed. I thought the risk was running out of memory. It isn't - the real mistake is something like:

```ts
await new Response(proc.stdout).text()
```

That waits for the stream to **end** before returning anything. `docker logs -f` never ends, so nothing ever prints. The fix is reading `proc.stdout` chunk by chunk, decoding with `TextDecoder({ stream: true })`, splitting on `\n`, and holding onto whatever's left after the last newline for the next chunk. An `async function*` generator fits this shape naturally - one line out per iteration, no waiting for the process to finish.

## What Ctrl-C does to five children

Question: your CLI has 5 `ssh` children running and the user hits Ctrl-C. What happens by default, and what should a well-behaved CLI do?

Half right. SIGINT does go to the whole foreground process group, which includes local `ssh` processes - that part I had. What I missed: the **remote** commands those `ssh` sessions are running may keep going on the server, since SIGINT to your local `ssh` client doesn't automatically propagate across the connection. A well-behaved CLI catches SIGINT itself, tells its children to stop, waits for them to actually exit, restores the terminal, and exits with code 130.

<!-- TODO: pick a real caramel code example here once the log-tailing command exists -->
