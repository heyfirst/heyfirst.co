---
title: "What kamal deploy actually does, in order"
description: "The real step order of a Kamal deploy, where a secret actually ends up on the server, and what Kamal does and doesn't do to accessories."
publishDate: "15 September 2026"
tags: ["kamal", "deploys", "learning", "software development"]
draft: true
---

Checked against basecamp/kamal `fd335d8` (v2.12.0). I've run `kamal deploy` more times than I can count, over a decade-plus career of shipping software, and I still got the order wrong.

## The actual order

1. **Build and push, locally.** Registry login, pre-build hook, build, push.
2. **Pull on each server.** Registry login on every server, then `docker pull`.
3. **Take the lock** - `mkdir` on the primary host. This happens **after** the pull, not before. I had it first.
4. **Prepare.** Pre-deploy hook, make sure `kamal-proxy` is running, stop stale containers.
5. **Boot each host.** Upload the env file, `docker run`, then `kamal-proxy deploy` - which runs the health check and switches traffic in one step. Then the old container stops.
6. **Finish.** Prune old containers and images, release the lock, post-deploy hook.

Source: `lib/kamal/cli/main.rb` (`deploy`), `lib/kamal/cli/app/boot.rb`.

## Where a secret actually goes

Question: where does a secret written in `.kamal/secrets` end up, before your container can read it?

I guessed it lands on the `docker run` command line. It doesn't - and that's the point, since anything on the command line is visible to `ps` for every other user on the box. Kamal writes secrets to an env file on the server, at `.kamal/apps/<service>/env/roles/<role>.env`, with `0600` permissions, then runs `docker run --env-file`. Only values explicitly marked `clear` go on the command line as `--env`.

Source: `lib/kamal/configuration/role.rb`.

## Accessories aren't part of deploy at all

Question: what's the difference between how Kamal treats an accessory and an app during `kamal deploy`?

I said accessories skip the build/push lifecycle, which is true, but missed something bigger: **`kamal deploy` doesn't touch accessories at all.** Only `kamal setup` or `kamal accessory boot` does. An accessory is a ready-made image you start once and leave alone; it has no place in the regular deploy cycle.

<!-- TODO: this explains why the current infra setup is structured the way it is - worth a line connecting the two, if it stays generic enough for a public repo -->
