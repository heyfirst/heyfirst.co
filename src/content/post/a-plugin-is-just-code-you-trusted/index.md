---
title: "A plugin is just code you trusted"
description: "Hooks vs listeners vs middleware, how to change a function signature without breaking hundreds of plugins, and what you actually can't protect against."
publishDate: "15 September 2026"
tags: ["extensibility", "software development", "learning"]
draft: true
---

I rated myself lowest here and marked highest - the only area where the diagnostic came back better than I expected, and proof that 10+ years of writing software teaches some things by osmosis even when you never studied them directly.

Question: what's the difference between a hook, an event listener, and a middleware/filter?

Hook and listener I had right: a hook runs at a specific named point (`preDeploy`, `postBoot`), and a listener reacts to events emitted onto a shared pipeline. Middleware I got wrong - I called it "a group of hooks." It's not. Middleware **wraps** the next step through something like `next()`, so it can inspect or change the input, change the output, or stop the chain entirely before it reaches the next layer. A filter, in the WordPress sense, transforms a value and passes the transformed version on - it's not about choosing which events to care about, it's about shaping the value itself.

## Changing a signature without breaking everyone

Question: hundreds of third-party plugins use your API, and you need to change a function's signature. What are your options?

This is the one I actually knew from having lived it: deprecate before removing, add new params as optional rather than required, design the growth path in from day one if you can see it coming, give advance notice, and keep old versions installable. Worth adding to my own answer: an options object from the start avoids most of this, and a declared `apiVersion` field lets you support two shapes at once without guessing.

## What you can't actually protect

Question: a plugin is arbitrary code running in your CLI on the user's laptop. What can you realistically protect, and what can't you?

I framed this as encapsulation - expose enough surface for plugins to do their job without letting them reach into internals. That's true, but it only stops accidents, not attacks. A plugin running in your process can read `~/.ssh`, your environment variables, and the network, and no API design prevents that - it already has the same permissions you do. What's actually realistic: a narrow typed API, isolating plugin errors so one bad plugin doesn't crash the host, timeouts, trust decisions made at install time, and pinned versions. Real isolation means a separate process or a sandbox, and that's expensive enough that most tools don't do it.

<!-- TODO: state where caramel is landing on this tradeoff, once decided -->
