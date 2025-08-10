High impact, low effort

- [ ] SEO/meta hardening
- [ ] Add JSON‑LD (WebSite, Person, BlogPosting) in src/components/BaseHead.astro for posts and pages.
- [ ] Add twitter:site and twitter:creator tags; add og:image:alt.
- [ ] Ensure <meta name="theme-color"> matches theme_color in web manifest.
- [ ] Security headers on Vercel
- [ ] Add CSP, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via vercel.json headers.
- [ ] CI/quality gates
- [ ] GitHub Actions: install + pnpm check (Astro types), pnpm lint, pnpm build, and a dead‑link check.
- [ ] Add pre-commit hooks (Husky + lint-staged) running Biome and Prettier.

Performance and UX

- [ ] Image pipeline in Markdown
- [ ] Posts are .md (not MDX). Today only masthead uses astro:assets. Add a Markdown image optimizer (e.g., @astrojs/markdown-remark image service
      or a rehype plugin that rewrites img to astro:assets) to get automatic resizing, srcset, and lazy‑load.
- [ ] Caching
- [ ] Configure long‑term caching for /icons/\*, fonts, and generated assets with immutable cache headers via vercel.json.
- [ ] Prefetch tuning
- [ ] You use global prefetch: true and data-astro-prefetch in nav. Consider keeping global and removing per‑link duplication, or vice‑versa.

Content and discoverability

- [ ] RSS/feeds
- [ ] Expose a feed for notes when you add them. Consider also JSON Feed for broader client compatibility.
- [ ] Redirects and legacy
- [ ] You already rewrite /blog/_ → /posts/_. Audit other legacy slugs from the Remix era and add redirects to preserve SEO equity.
- [ ] Sitemap
- [ ] Ensure drafts are excluded (they are from build). Optionally configure changefreq and lastmod.

PWA and offline

- [ ] Manifest is in place; consider offline support
- [ ] Add @vite-pwa/astro to generate a service worker for offline reading of recent posts and assets.

Accessibility

- [ ] Check key flows with automated a11y tests (axe)
- [ ] Basic Playwright + axe run for homepage, posts, tags, 404.
- [ ] Minor polish
- [ ] Verify focus states meet contrast; confirm aria-current and mobile menu button state are announced correctly (looks good, but test with
      VoiceOver).

Analytics and observability

- [ ] Analytics
- [ ] You’ve enabled Vercel Web Analytics. If you want more, add privacy‑friendly analytics (Plausible/Umami) or event‑level PostHog, gated by
      consent.
- [ ] Error monitoring
- [ ] Sentry (browser only) to catch front‑end errors on post pages.

DX and maintenance

- [ ] Dependency hygiene
- [ ] Align Tailwind 4 stack to stable: upgrade @tailwindcss/vite from 4.0.0-beta.8 to the latest stable to match tailwindcss: 4.0.0.
- [ ] Keep Astro and @astrojs/\* integrations up to date; add Renovate to automate PRs.
- [ ] Static vs adapter
- [ ] You set output: 'static' and also use the Vercel adapter. Pick one:
- [ ] Prefer pure static: remove the adapter and keep Web Analytics via Vercel project setting or the lightweight script.
- [ ] Or keep adapter for server features and Edge analytics; then verify everything is still static‑rendered where possible.
- [ ] Developer docs
- [ ] Expand README.md with run/build/deploy, content authoring conventions (frontmatter, images), and release checklist.

Testing

- [ ] Unit/integration
- [ ] Add Vitest for utilities (src/utils/\*).
- [ ] E2E
- [ ] Playwright: no‑error console, 200 status, critical content visible; snapshot OG image endpoint (src/pages/og-image/[...slug].png.ts)
      dimensions.

Visual and content polish

- [ ] Social preview consistency
- [ ] Your dynamic OG image is solid; add a per‑post ogImage alt text in frontmatter and reflect in meta as og:image:alt.
- [ ] Notes/About
- [ ] Turn TODOs in src/site.config.ts into pages (/about, /notes, /uses) for internal link depth.

If you want, I can:

- [ ] Implement JSON‑LD in BaseHead.astro.
- [ ] Add security headers and caching rules in vercel.json.
- [ ] Set up a minimal CI workflow and pre‑commit hooks.
- [ ] Add the Markdown image optimization plugin and migrate a sample post.

Summary

- [ ] Proposed a prioritized plan across SEO, security, performance, PWA, testing, analytics, and DX.
- [ ] Key quick wins: JSON‑LD + meta fixes in BaseHead.astro, security headers and caching in vercel.json, Tailwind plugin upgrade, CI checks, and
      Markdown image optimization.
