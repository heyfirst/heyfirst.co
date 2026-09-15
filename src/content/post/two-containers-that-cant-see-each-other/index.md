---
title: "Two containers that can't see each other"
description: "Default bridge vs user-defined Docker networks, docker stop vs docker kill, and why Kamal makes its own network."
publishDate: "15 September 2026"
tags: ["docker", "networking", "learning", "software development"]
draft: true
---

<!-- FACT-CHECK: docker stop/kill signal timing below is from the marker's own knowledge, not verified against a primary source. Check before publishing. -->

Question: two containers are on the default bridge network, two others are on a user-defined network. Which pair can reach each other by container name?

I said both pairs could, just not across the two networks. That's confidently wrong in the way that matters, and it's wrong after 10+ years of shipping software, most of it running in containers I assumed I understood: on the **default** bridge, containers can't resolve each other by name at all, only by IP. Name resolution comes from Docker's built-in DNS, and that DNS only runs on **user-defined** networks. This is exactly why Kamal creates its own network instead of using the default one - without it, `docker run --network kamal` containers couldn't find each other by service name.

## docker stop vs docker kill

Question: what does the app inside a container experience on `docker stop` vs `docker kill`?

`docker stop` sends SIGTERM, waits 10 seconds, then sends SIGKILL if the process hasn't exited. `docker kill` skips straight to SIGKILL. SIGKILL can't be caught or ignored, so the app gets zero chance to finish an in-flight request or close a connection cleanly. That's the whole reason zero-downtime deploys depend on `stop`, not `kill`: the grace window is what lets a process drain before it dies.

## Finding old containers without their names

Last one: how do you find and remove all exited containers of one service, except the 5 newest, without knowing their names?

I reached for `jq` and a manual loop. Docker can do the filtering itself:

```
docker ps -a -q --filter label=service=app --filter status=exited | tail -n +6 | xargs docker rm
```

`docker ps` lists newest first, so `tail -n +6` skips the 5 newest and keeps the rest for removal. The `label` filter is the part worth noticing - it's how Kamal finds "its" containers without tracking names at all.

<!-- TODO: note this is close to Kamal's actual prune command, if worth citing directly -->
