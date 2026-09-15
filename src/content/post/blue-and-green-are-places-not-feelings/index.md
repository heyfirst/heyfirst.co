---
title: "Blue and green are places, not feelings"
description: "Recreate, rolling, and blue-green deploys, why drain timeouts cut both ways, and why a Kamal rollback can be nearly instant."
publishDate: "15 September 2026"
tags: ["deploys", "kamal", "learning", "software development"]
draft: true
---

I rated this area a 3 - could teach it. The mark came back a 2, and the reason is the first question: I know how to run a deploy, but I didn't have the textbook definitions clean. Ten-plus years of shipping deploys, and I couldn't define the term I've said out loud in a hundred standups.

Question: define recreate, rolling, and blue-green in one line each.

I turned "blue" and "green" into a timeline - spin up, health check, looks good, mark old one bad. That's describing a **process**. Blue and green are actually the two **environments** - two complete, independent copies of the whole stack. A blue-green deploy means both exist at once, fully separate, and traffic switches from one to the other in a single cut, not a gradual handoff. Recreate: stop the old version, then start the new one, with real downtime in between. Rolling: replace running instances a few at a time, so some old and some new serve traffic simultaneously during the switch.

## Draining, both directions

Question: what does "draining" mean, and what breaks if the timeout is too short or too long?

Got both failure modes right. Too short: in-flight requests get force-killed mid-response. Too long: the deploy takes longer than it needs to, and old code keeps running and taking traffic longer than intended - which matters if that old code has the bug you're trying to ship a fix for.

## Why a rollback can be instant

Question: why can a Kamal rollback be nearly instant, and what kind of change makes a rollback unsafe regardless of speed?

This one was exactly right. Kamal doesn't delete the previous container on deploy - it stops it and leaves it there. Rollback just starts that stopped container again; there's no image pull, no build, no fresh boot sequence. The unsafe case is anything that isn't purely additive at the data layer - a schema migration or message format change that the old code can't read. Speed doesn't help if the old version simply can't parse what's on disk now.

<!-- TODO: this is the one area where I overrated myself on process knowledge and underrated the definitional gap - worth calling out explicitly as the theme of this post -->
