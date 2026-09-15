---
name: writer
description: >
  Draft and revise Posts and Snippets for heyfirst.co in this blog's real voice — not
  generic advice, but patterns mined from this repo's own revision history (opening hooks,
  closing moves, the de-AI wording pass, em-dash/heading/list conventions). Runs a two-pass
  draft-then-fix workflow. Use when the user wants to write a new blog post or snippet,
  draft content for src/content/post or src/content/snippet, or asks to revise, tighten, or
  "de-AI" an existing draft post.
---

# Writer

Write like this blog actually writes, not like a generic AI blog post. The voice rules in
`references/voice-style-guide.md` aren't taste — they're extracted from real before/after diffs
in this repo's own commits, so read that file before the fix pass below.

## Post vs Snippet

- **Post** (`src/content/post/<slug>/index.md`): long-form, tagged, optional cover image, has
  reading time. Use for anything with real depth — a mechanism, a story, an argument.
- **Snippet** (`src/content/snippet/<slug>.md`): short, untagged, no cover image, no reading
  time. Use for a small tip, a tool, a code trick.

Schema source of truth: `src/content.config.ts`. Terminology source of truth: `CONTEXT.md`
(this project calls them "Post" and "Snippet" — never "note", "blog entry", or "micro-post").

## Frontmatter

**Post:**
```yaml
---
title: "..." # max 60 chars
description: "..."
publishDate: "31 August 2026" # human string, not ISO
tags: ["...", "..."] # lowercase, deduped automatically
draft: true # flip to false when ready to publish
---
```

**Snippet:**
```yaml
---
title: "..." # max 60 chars
description: "..." # optional
lang: "ts" # optional, powers the language badge
publishDate: "2026-08-31T09:00:00Z" # ISO datetime WITH offset — different format from Post!
---
```

The `publishDate` format is not interchangeable between the two collections — Post wants a
human-readable string, Snippet wants ISO-8601 with a timezone offset. Getting this backwards
fails the Zod schema.

Cover images (Post only, optional) are colocated and referenced relatively: `coverImage: { src:
"./cover.jpg", alt: "..." }`.

## Workflow: draft, then fix

Don't try to nail the voice in one shot — the real posts in this repo didn't. They went through
a rough draft, sometimes several structural revisions, then a dedicated tightening pass.

### 1. Draft pass

Get the actual idea down:
- Open with what really happened (Rule 1) — the conversation, the bug, the trip.
- State the one-line thesis early, bolded (Rule 7).
- Use ` ```mermaid ` fences for anything mechanistic — `astro-mermaid` is already wired up in
  `astro.config.ts`, no setup needed.
- Don't stop to fix typos or word-polish yet. A rough, run-on, casual-grammar draft is fine at
  this stage — that's normal here (see Rule 14).

### 2. Fix pass

Now work through `references/voice-style-guide.md`, rule by rule. In particular:
- **Rule 3** is the core "remove AI slop" checklist — cut hedges, restated sentences, filler
  intensifiers, foreshadowing bookends. This is the single most important rule if the draft
  reads generic.
- **Rule 14** is the batched typo/grammar/run-on-sentence sweep — do it once, at the end, not
  as you go.
- **Rule 11** (links) is genuinely its own separate pass after the prose is stable — don't mix
  link-adding into a wording rewrite.
- Check headings (Rule 6), bullets (Rule 8), em dashes (Rule 5), and pronoun choice (Rule 12)
  against the post's register — technical/thesis posts and personal-narrative posts follow
  different defaults.

## File placement

- Post: `src/content/post/<slug>/index.md`, images colocated in the same directory
  (`./cover.jpg`, `./diagram.png`).
- Snippet: `src/content/snippet/<slug>.md`, no directory, no images.

## Do / Don't

**Do**
- Read `references/voice-style-guide.md` before the fix pass, not just this file.
- Keep `draft: true` until the post is actually ready to publish.
- Match em-dash and pronoun usage to the post's register (technical vs. narrative).

**Don't**
- Don't reach for a generic AI-buzzword blocklist (delve/leverage/seamless/etc.) — this
  author's drafts never had that vocabulary to begin with; the real de-AI pass targets hedges
  and restatements instead (Rule 3).
- Don't add a table, blockquote, or link "to look more structured" — every one of those devices
  in this blog's real posts is load-bearing, not decorative (Rules 9, 10, 11).
- Don't polish wording before the structure and content are actually right.
