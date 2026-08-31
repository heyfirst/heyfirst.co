---
title: "Design Isn't Taste"
description: "In the AI era everyone talks about 'taste'. For me design comes down to three plainer things: the story, the question, and the reason."
publishDate: "31 August 2026"
tags: ["design", "product", "ai", "software development"]
draft: true
---

<!-- TODO: open with a real, specific moment — a conversation, thread, or PR where someone said "taste" and couldn't back it up when pushed. -->

I keep sitting through the same conversation. Someone says "taste" (in a review, a tweet, a Slack thread), everyone nods, and nobody asks what it actually means. I've heard it from technical people too, people I'd otherwise trust to be precise. Push on it, ask "okay, what does that mean here," and most of the time what comes back is just ฝอย/พล่าม, rambling, waffling, words dressed up to sound like a principle.

That bugs me. Not because nothing real is being pointed at, but because "taste" as a word explains nothing. It's unfalsifiable by design: you either have it or you don't, end of conversation, no argument possible. That's a bad sign for a word people reach for constantly, right when the AI era needs more precision, not less.

So let me be precise about what I mean when I call a feature, a flow, a piece of code well designed. Not the Figma-file kind. The thinking that happens before any of that exists. For me it comes down to 3 plain questions.

## 1. What story are we telling?

Every feature is a story, whether we admit it or not. The user is somewhere, something happens, and they end up somewhere else. If I can't say what that story is in a sentence, I don't actually have a feature yet, I have a pile of components.

This is the first filter, before code, before flow. What story are we about to tell with this?

<!-- TODO: concrete example — a real feature/flow, stated as a one-sentence story, and what it looked like before someone could say that sentence. -->

## 2. What question are we answering?

Second: what problem, what question, is this actually a response to? Not "what's the request", the question underneath the request.

A feature that isn't tied to a question just floats. It might be pretty, it might even ship, but nobody can tell you why it exists six months from now, and that's the tell.

<!-- TODO: concrete example — a feature that shipped without a clear question underneath it, and what happened six months later. -->

## 3. Can you name the reason?

Third, and the one I keep coming back to: can you reason about it? Not "does it work", reason is a bigger ask than that. It's 4 things, really:

1. **You understand it.** You can explain what it does, plainly, no hand-waving.
2. **You understand why it has to be this way.** Not just what it does, but why that shape is necessary and not just convenient.
3. **You understand how it became this one.** The path. What it looked like before, what changed, why it landed here and not somewhere earlier along the way.
4. **You understand the road not taken.** What other options existed, and which tradeoffs you knowingly accepted by picking this one over them.

That's basically running a tiny decision record in your head, for every feature, every flow, every module, not only the ones big enough to write down.

This is the one AI makes sharper, not softer. It's never been easier to generate a module, a flow, a whole feature, without writing a line yourself. That's fine. What's not fine is shipping something you can't answer those four questions about. If someone asks "why is it like this and not the obvious alternative," and you shrug, that's the tell. It doesn't matter who or what wrote it. It's not done. It's not right.

<!-- TODO: concrete example — a piece of code (yours, reviewed, or AI-generated) walked through the 4 layers above, ideally one where the answer to at least one layer was "I don't actually know." -->

## Taste was never the point

Put the 3 together and you don't get "taste", you get a much more boring, much more useful checklist: a story worth telling, a real question underneath it, a reason you can actually stand behind.

None of that requires a gift. It requires asking the questions before you ship, every time, especially now that shipping something that merely works is one prompt away.

That's the part AI doesn't change. If anything it raises the price of skipping it.

<!-- TODO: closing reflection — what surfaced for you while writing/thinking this through, in the WAL "what I'm taking away" spirit. -->
