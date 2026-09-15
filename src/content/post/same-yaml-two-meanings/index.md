---
title: "Same YAML, two meanings"
description: "Ruby reads NO as false. Bun keeps it as the string NO. The same deploy.yml, parsed two different ways."
publishDate: "15 September 2026"
tags: ["yaml", "bun", "kamal", "learning", "software development"]
draft: true
---

Checked with Ruby 3.4 (what Kamal runs on) and Bun 1.4.0. This one isn't a knowledge gap I can shrug off - it's a real bug shape in [caramel](https://github.com/heyfirst/caramel), which reads the same `deploy.yml` files Kamal does.

Question: in YAML, what do `version: 1.10`, `country: NO`, and `mode: 0755` parse as?

I said `1.10` becomes a number, `NO` becomes a string, `0755` becomes a string too. Confidently wrong, after 10+ years of writing YAML config files and never once wondering if "YAML" was even one thing. The actual answer depends on something I didn't know was a variable at all: **which YAML spec version the parser implements.**

| | `version: 1.10` | `country: NO` | `mode: 0755` |
|---|---|---|---|
| Ruby / Kamal (YAML 1.1) | `1.1` | `false` | `493` (parsed as octal) |
| Bun.YAML (YAML 1.2) | `1.1` | `"NO"` | `755` |

`1.10` loses its trailing zero either way, since YAML numbers don't preserve trailing zeros - that part I'd have gotten right by accident.

The other two don't just differ, they actively disagree. YAML 1.1 treats `NO`, `no`, `Off`, `off`, and a handful of others as boolean literals, a holdover from YAML trying to guess your intent. YAML 1.2 narrowed that list down to just `true`/`false`, so `NO` stays a plain string. Same story with `0755`: YAML 1.1 treats a leading zero as octal notation, so it becomes the number 493. YAML 1.2 dropped that rule, so it stays 755.

## Why this isn't just trivia

Kamal runs on Ruby, which means YAML 1.1. caramel runs on Bun, which means YAML 1.2. The exact same `deploy.yml` - written once, unaware of any of this - can mean two different things depending on which tool reads it. A `country: NO` field silently becomes `false` under Kamal and `"NO"` under caramel. Nobody wrote a bug. The spec changed.

<!-- TODO: say what caramel actually does about this - does it warn, coerce to match Kamal's behavior, or just document the gotcha? -->
