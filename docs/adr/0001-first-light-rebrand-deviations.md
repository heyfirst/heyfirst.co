# 1. First Light rebrand: deviations from the handoff spec

## Status

Accepted

## Context

The `first-light-handoff/` folder contains a design handoff (`CLAUDE-INSTRUCTIONS.md`) for
applying the "First Light" brand (green coffee bean, warm olive palette, Roboto Mono, a
soft press-down button) to this site. Working through the handoff surfaced a few points
where the spec's assumptions didn't match the current codebase, or where the spec was
silent and a real decision was needed.

## Decisions

**Font: JetBrains Mono, not Roboto Mono.**
The handoff specifies Roboto Mono throughout, and even ships `.ttf` files for it, but the
live site never actually loaded Roboto Mono as a web font — `src/layouts/Base.astro` uses
Tailwind's generic `font-mono` stack, and the `--font-body` token `buttons.css` depends on
didn't exist anywhere. Rather than wire up Roboto Mono to satisfy the handoff literally,
we're using JetBrains Mono instead, loaded via a Google Fonts CDN `<link>` for the live
site. The OG-image generator (`src/pages/og-image/[...slug].png.ts`) uses Satori, which
renders at build time and needs raw font bytes — it can't use a CDN link — so it gets its
own local JetBrains Mono `.ttf`/`.otf` files, replacing the existing Roboto Mono ones.

**OG image: light "Paper" card, not dark.**
The current OG image is a dark card (`#1d1f21` background). The handoff's §7 specifies a
light background (`#EFF1E7`) with dark text — a real flip in the social-preview look, not
just a recolor. We're following the handoff here: switching to the light card.

**Notes → Snippets rename: no redirects.**
Renaming the `note` collection to `snippet` moves `/notes/*` to `/snippets/*`, including
the RSS feed. There's no existing redirect infrastructure in `astro.config.ts`, and only
one entry (`welcome.md`) exists in the collection today, so we're not adding redirects for
the old URLs.

**Header logo: handoff's classes taken verbatim.**
The current header logo is a tall portrait mark (`viewBox="0 0 272 480"`); the handoff's
replacement is a square tile (`viewBox="0 0 240 240"`) with different Tailwind sizing
classes. We're using the handoff's classes as given rather than pre-emptively re-tuning
header spacing, and will only adjust `mb-28`/`-start-18` if the rendered result actually
looks wrong.

**About page: placeholder, not real copy.**
`src/pages/about.astro` currently has the unmodified starter-theme text ("I'm a starter
Astro..."). The handoff explicitly leaves About's copy to the author. We're wiring the
page into `menuLinks` now but replacing the starter text with a minimal TODO scaffold
rather than either shipping the starter copy or inventing bio content.

**Projects empty state: placeholder copy, not final.**
The `project` collection starts empty by design (§8.2). The handoff doesn't specify
empty-state wording for `/projects/` or the homepage Projects section. We're shipping
generic placeholder copy now, to be replaced by the author later.

## Consequences

- The site's "brand type" is JetBrains Mono, not Roboto Mono as the handoff's prose
  states — the handoff's palette/motion tokens and button spec are otherwise followed as
  written.
- `CONTEXT.md`'s glossary entry for **Note**, which explicitly said to avoid the word
  "snippet," is now stale and needs updating alongside this rebrand (see that file).
- Old `/notes/*` URLs (and its RSS feed) will 404 after this change; acceptable given the
  single-entry, low-traffic collection.
- About and Projects-empty-state copy are known placeholders, not shipped final content.
