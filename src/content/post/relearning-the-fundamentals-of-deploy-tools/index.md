---
title: "Relearning the fundamentals of deploy tools"
description: "Before writing a line of caramel, I took a diagnostic across 12 areas of deploy tooling to find out where the real learning needed to start."
publishDate: "15 September 2026"
tags: ["learning", "software development"]
draft: true
---

<!-- TODO: open with the actual moment that triggered this - probably something specific about building caramel and hitting a wall on Kamal internals -->

I'm building [caramel](https://github.com/heyfirst/caramel), and before writing lesson one, I wanted to know where I actually stood. Not a résumé question, a mechanics one: if I'm going to write a tool that does what Kamal does, do I actually understand what Kamal does, or have I just been running it?

So I took a diagnostic. 12 areas - Linux and shell, SSH, Docker, registries, networking, HTTP and TLS, deploy concepts, Kamal itself, config and schema design, the Bun runtime, CLI craft, extensibility. No googling, no AI, "don't know" counts as a good answer. The point wasn't to grade myself. It was to find the actual edge of what I know, so the first real lesson starts there instead of re-teaching things I already have or skipping past things I don't.

## What starting from the edge looks like

Some of what came back was expected: I could reason clearly about draining, rollback, and merge semantics, because those are decisions I've actually made under pressure. Some of it wasn't: I couldn't say which signal Ctrl-C sends, or which direction `docker stop` and `docker kill` differ, or which way `-p 8080:80` actually maps. Mechanics I'd let a decade of tooling handle for me, quietly, without ever checking the details myself.

That's not a gap I'm embarrassed about. It's the gap the diagnostic was built to find. You can't start a curriculum at the right place without first admitting where the floor actually is, and the floor turned out to be lower on mechanics than I expected and higher on concepts than I gave myself credit for.

## What's coming

I'm going to write through each of the 12 areas, one post at a time, working through the specific questions that caught me and what the real answer actually is - Ctrl-C and process groups, SSH quoting and tunnel direction, Docker networking, image tags versus digests, port mapping, TLS for a service nobody outside a tailnet can reach, the real order Kamal deploys in, a YAML quirk that quietly changes meaning between Ruby and Bun, streaming logs without buffering, how a CLI decides to use color, and what a plugin API can and can't protect against.

This is the relearning part. Not a report card, just the start of actually knowing the ground caramel is going to stand on.
