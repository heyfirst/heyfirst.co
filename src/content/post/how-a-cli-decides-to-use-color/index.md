---
title: "How a CLI decides to use color"
description: "The actual signals behind terminal color detection, why spinners break in CI logs, and what a TUI has to undo before it exits."
publishDate: "15 September 2026"
tags: ["cli", "learning", "software development"]
draft: true
---

<!-- FACT-CHECK: color-detection env var list and raw-mode/mouse-reporting details below are from the marker's own knowledge, not verified against a primary source. Check before publishing. -->

This was my lowest-rated area, and it turned out to be the most fun to actually learn, because none of it was intuition I could fall back on. I use libraries for all of it, which is exactly why 10+ years of shipping CLIs never forced me to learn the mechanics underneath.

Question: how does a CLI decide whether to print color?

I didn't know any of the actual signals, just that a library handles it. Here's what's actually being checked:

- Color is off when stdout isn't a TTY (piped into a file or another program).
- Color is off when `NO_COLOR` is set, or `TERM=dumb`, or `--no-color` is passed.
- Color is forced on with `FORCE_COLOR`, or `--color`.
- `CI` being set changes the defaults, since CI runners aren't real terminals.
- `COLORTERM` signals whether the terminal supports truecolor, for libraries that care about the difference.

## Why spinners look broken in CI

Question: how does a spinner animate on a single line, and why does it look broken in CI logs?

My guess was close: a spinner writes `\r` to jump back to the start of the line, then an ANSI code to clear it, then redraws the next frame in place. CI logs aren't a real terminal - they're append-only - so every `\r` just produces a new line instead of overwriting the old one, and a spinner turns into a wall of frames.

## What a TUI has to clean up

Question: how does something like herdr receive mouse clicks, and what has to happen on exit?

I had no idea, and it's genuinely more involved than I expected. The terminal is put into raw mode, and specific ANSI escape codes turn on mouse reporting (modes like 1000, 1002, 1006), after which the terminal starts sending click events back as input rather than interpreting them itself. Most TUIs also switch to the alternate screen buffer. All of it has to be undone on exit, or on a crash - otherwise the user's shell is left in a broken state after the program closes.

<!-- TODO: this is a good candidate for a small standalone lab/demo once caramel's CLI layer exists -->
