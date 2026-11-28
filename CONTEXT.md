# heyfirst.co

First Sutham's personal blog/portfolio, built with Astro and served by EmDash CMS on Postgres. Publishes long-form technical writing and short snippets. Content lives in the EmDash database and is edited in the admin; the repo holds the theme and the deploy.

## Language

**Post**:
A long-form, tagged article in the EmDash `post` collection, rendered at `/posts/[slug]`. Has a cover image, description, publish/updated dates, and reading time. Read through `src/data/post.ts`.
_Avoid_: article, blog entry, blog post (fine in prose, but use "Post" as the canonical collection/type name).

**Snippet**:
A short-form entry in the EmDash `snippet` collection, rendered at `/snippets/[slug]`. Lighter-weight than a Post: no cover image, no tags, no reading time. Formerly called "Note" (renamed as part of the First Light rebrand).
_Avoid_: micro-post, note.

**Project**:
An entry in the EmDash `project` collection, listed on the homepage and at `/projects/`. Introduced by the First Light rebrand; starts empty.

**Collection**:
An EmDash content collection (`post`, `snippet`, or `project`). Its fields are defined in the database and seeded from `seed/`.

**Draft**:
An entry that is not published. Excluded from listings, RSS and the sitemap. In edit mode the editor sees the draft revision.

**Tag**:
A term in the `tag` taxonomy attached to a Post. Snippets do not have tags. Tags drive `/tags/[tag]/` listing pages.

**Edit mode**:
EmDash's visual editing on public pages. Enabled with `toolbar: "client"`; a signed-in editor sees an Edit pill that reloads the page with `?_edit`. Posts spread `entry.edit` onto the article and title; the body renders in the inline editor.

**Site config**:
The single source of truth for site-wide metadata (author, title, description, locale, url) in `src/site.config.ts`, typed by `SiteConfig` in `src/types.ts`. Consumed across meta tags, the webmanifest, and OG image generation.

**OG image**:
The auto-generated social preview image for a Post, rendered via Satori at `src/pages/og-image/[...slug].png.ts`.

**Admonition**:
A styled callout block (tip, note, important, caution, warning), stored as an `admonition` Portable Text block and rendered by `src/components/portable-text/Admonition.astro`.
