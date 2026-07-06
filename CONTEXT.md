# heyfirst.co

First Sutham's personal blog/portfolio, built with Astro (Astro Cactus theme). Publishes long-form technical writing and short-form notes; no backend, no user accounts — content lives as Markdown/MDX in the repo and is statically built.

## Language

**Post**:
A long-form, tagged article in the `post` content collection (`src/content/post/`), rendered at `/posts/[slug]`. Has a cover image, description, publish/updated dates, and reading time.
_Avoid_: article, blog entry, blog post (fine in prose, but use "Post" as the canonical collection/type name).

**Snippet**:
A short-form, untagged entry in the `snippet` content collection (`src/content/snippet/`), rendered at `/snippets/[slug]`. Lighter-weight than a Post — no cover image, no tags, no reading time. Formerly called "Note" (renamed as part of the First Light rebrand, see `docs/adr/0001-first-light-rebrand-deviations.md`); the old `note` collection/route no longer exist.
_Avoid_: micro-post, note.

**Project**:
An entry in the `project` content collection (`src/content/project/`), listed on the homepage and at `/projects/`. Has `name`, `stack`, `description`, `status` (`Live` | `Active` | `Maintained`), optional `url` and `order`. Introduced by the First Light rebrand; starts empty.

**Collection**:
An Astro content collection (`post`, `snippet`, or `project`) defined in `src/content.config.ts`, each with its own Zod schema. This is Astro's own term — use it as-is.

**Frontmatter**:
The Zod-validated metadata block at the top of a Post/Note's Markdown file (title, description, publishDate, tags, etc.), defined by `baseSchema` and the per-collection schema extensions in `src/content.config.ts`.

**Draft**:
A Post with `draft: true` in its frontmatter. Excluded from listing pages and RSS but still buildable for preview.

**Tag**:
A lowercase, deduplicated label attached to a Post (`src/content.config.ts` `removeDupsAndLowerCase`). Notes do not have tags. Tags drive `/tags/[tag]/` listing pages.

**Site config**:
The single source of truth for site-wide metadata (author, title, description, locale, url) in `src/site.config.ts`, typed by `SiteConfig` in `src/types.ts`. Consumed across meta tags, the webmanifest, and OG image generation.

**OG image**:
The auto-generated social preview image for a Post, rendered via Satori at `src/pages/og-image/[...slug].png.ts`.

**Admonition**:
A styled callout block (tip, note, important, caution, warning) authored in Markdown via the `remark-admonitions` plugin, typed as `AdmonitionType` in `src/types.ts`.
