---
title: "A tag is a promise, a digest is a fact"
description: "Why myapp:v1 can point to different content tomorrow, and what actually makes docker pull node:22 work across architectures."
publishDate: "15 September 2026"
tags: ["docker", "learning", "software development"]
draft: true
---

<!-- FACT-CHECK: multi-arch image index explanation below is from the marker's own knowledge, not verified against a primary source. Check before publishing. -->

Question: can `myapp:v1` point to different image contents tomorrow? Can `myapp@sha256:...`?

Got the shape right, missed the reason - which is a strange place to land after a decade-plus of pulling and pushing images without ever asking what actually makes a tag different from a hash. A tag is a label someone assigned, and anyone with push access can move it to point at new content tomorrow. A digest is a SHA-256 hash of the image's actual contents, so it can only ever mean one thing. Nobody "chooses" a digest the way you choose a tag - it's computed. Kamal tags images with the git SHA, which looks similar to a digest but is really a tag that happens to be unlikely to collide.

## Same image, different machine

Question: you `docker pull node:22` on an arm64 Mac and an amd64 VPS. Same image?

I said no, and guessed the registry does some architecture magic. Half right: they're different images, but the registry isn't the one deciding. `node:22` actually points to an **image index** - a manifest listing one image per architecture. Your local Docker reads the index and picks the entry matching your machine. The registry just serves whatever's asked for.

## Why every server needs its own login

Question: why does each server need its own `docker login`, even though you're already logged in on your laptop?

This one I had right: credentials live per-machine, in `~/.docker/config.json`, and nothing shares that file across machines. Kamal logs in on every server as part of its pull step for exactly this reason.

<!-- TODO: tie back to how caramel will handle multi-server registry auth, if that's decided yet -->
