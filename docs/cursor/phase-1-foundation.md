# Phase 1 — Foundation: Next.js static site + data pipeline + deploy

**Attach:** `@docs/cursor/01-MASTER-BRIEF.md` `@docs/cursor/phase-1-foundation.md`
**Branch:** `rebuild/next` (long-lived until launch; merge phase PRs into it) · **Size:** about 1 week

## Goal
A production-grade skeleton: Next.js App Router with static export, a validated build-time catalog from GamePix, real URLs, CI that blocks bad builds, and automated deploys to Hostinger. Pages can be plain in this phase — Phase 2 brings the design.

## Before you start
Reply with: the folder tree you will create, the exact Next.js / Tailwind / zod / MiniSearch / Vitest / Playwright versions (latest stable — check, don't guess), and the migration approach for the old app (move it to `legacy/` and exclude it from the build; delete it at launch). Wait for my OK.

## Tasks

### 1.1 Project setup
- Next.js latest stable, App Router, TypeScript `strict` + `noUncheckedIndexedAccess`, ESLint strict + Prettier, path alias `@/`.
- `next.config.ts`: `output: 'export'`, `trailingSlash: true`, `images: { loader: 'custom', loaderFile: './lib/gamepix-loader.ts' }` (sets the `w` param on GamePix URLs; local images pass through).
- Tailwind CSS v4; tokens from brief §7 as CSS variables in `app/globals.css` (Phase 2 fills the full system).
- Remove Bootstrap and `react-icons` from the new app. Add `lucide-react`.
- `config/site.ts`: `SITE_NAME = 'PlayHubPlace'`, `SITE_URL = 'https://playhubplace.com'`, `GAMEPIX_SID = 'LC991'`, `CONTACT_EMAIL = 'TODO(Pavan)'`. Build fails in CI if any `TODO(Pavan)` value is still present **on `main`** (warn only on other branches).

### 1.2 Catalog pipeline (`scripts/build-catalog.ts`, runs before `next build`)
1. Fetch all feed pages (`pagination=96`, follow `next_url` until empty), concurrency 5, 10 s timeout, 3 retries with exponential backoff.
2. Validate each item with a zod schema (brief §4). Drop invalid items, count them; **fail the build** if total valid < `MIN_VALID_GAMES` or invalid > `MAX_INVALID_RATIO` (both in `config/site.ts`: 10,000 and 0.01). On failure, reuse the last good catalog and mark the build "stale". Restore order: GitHub Actions cache, then the committed `catalog.json` + `meta.json` on the `catalog-snapshot` branch. Actions cache entries unused for 7 days are evicted, and the nightly cron runs only from `main`, so the snapshot branch is the durable copy. If neither exists, fail. Never publish an empty site.
3. Normalize into `GameRecord`: `id`, `slug` (= `namespace`, lowercase, validated `^[a-z0-9-]+$`, unique), `title`, `publisherDescription`, `rawCategory`, `hub` (via taxonomy), `tags`, `orientation`, `quality`, `publishedAt`, `updatedAt` (ISO), `aspect` (`width/height`), `cover` and `icon` (base URLs without query), `embedUrl` (guarantee `sid=LC991`).
4. Measure the real cover aspect ratio on 50 random covers (image dimensions) and write it to `data/meta.json`.
5. Write: `data/catalog.json` (all valid games), `data/curated.json` (pages to build, see 1.3), `data/search-index.json` (curated only: slug, title, hub, tags), `public/data/legacy-ids.json` (id → slug for every curated game, served as a static file for 1.6; git-ignored like `data/`), `data/meta.json` (counts, build time, feed modified date, stale flag).
6. Unit tests: schema accepts the real sample item in `tests/fixtures/gamepix-item.json`; rejects a bad one; slug collisions resolved deterministically; embed URL always has the sid.

### 1.3 Curation + taxonomy (`config/curation.ts`, `config/taxonomy.ts`)
- Curated set = `quality ≥ 0.70` ∪ 200 newest by `publishedAt` ∪ `ALLOWLIST` − `DENYLIST`. Log the resulting count (expected ~1,600–1,800).
- `DENYLIST` starts with games whose raw category or title names a third-party brand (mario, minecraft, skibidi-toilet, ninja-turtle, granny — extend as found). They are excluded from pages, search and sitemaps.
- Taxonomy: every one of the 147 raw categories maps to exactly one hub from brief §6 (a unit test fails if a raw category is unmapped — new categories in the feed must be mapped by a human). Raw category stays as a tag.
- Collections from brief §6 as typed predicate functions in `config/collections.ts`.

### 1.4 Routes (plain markup for now, real data, correct metadata)
- `app/page.tsx` (home), `app/game/[slug]/page.tsx` with `generateStaticParams` over curated games and `dynamicParams = false`, `app/category/[hub]/page.tsx`, `app/collection/[slug]/page.tsx`, `app/new/page.tsx`, `app/search/page.tsx`, `app/my-games/page.tsx`, `app/originals/[slug]/page.tsx` (CPS test + reaction test ported from `src/components/quick-games/`), trust pages, `app/not-found.tsx`.
- Every page sets `generateMetadata` (title, description, canonical with trailing slash, robots per index gate in brief §5 A5). Shared helpers in `lib/seo.ts`.
- `app/sitemap.ts` and `app/robots.ts` marked `dynamic = 'force-static'`; sitemap contains only indexable URLs.

### 1.5 `public/.htaccess` (static host config — Next can't do headers/redirects in export mode)
- One canonical host: `https://playhubplace.com/`. Checked 2 Oct 2026: `http://playhubplace.com` already 301s to `https://playhubplace.com/`. `http://www.playhubplace.com` 301s to `https://www.playhubplace.com/`, and that www URL returns 200. Add a 301 from the www host to the apex, and an HTTP→HTTPS rule with a loop guard (`%{HTTPS} off` AND `%{HTTP:X-Forwarded-Proto} !https`). Re-test with curl after deploy. Do not add a second redirect if Hostinger already sends that host to the apex.
- `ErrorDocument 404 /404.html`.
- Cache: `/_next/static/*` → `public, max-age=31536000, immutable`; HTML → `no-cache`.
- Security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (allow `fullscreen`, `autoplay`, `gamepad`, `accelerometer`, `gyroscope` for the GamePix frame origin only), `Content-Security-Policy` in **report-only** first, with `frame-src https://play.gamepix.com` plus ad/consent domains added in Phase 6.
- Tools redirects (brief A11): `?page=tools` and `?page=tool-<id>` → `https://workutilities.com/` (the home page, not a per-tool URL). `?page=tool-reaction`, `?page=reaction-test` → `/originals/reaction-time-test/`. `?page=tool-cps`, `?page=cps-test` → `/originals/cps-test/`.

### 1.6 Old game links keep working
Old URLs `/?page=game&game=<id>` arrive at the home page. A tiny inline script in the root layout `<head>` (runs before React, `next/script` `beforeInteractive` or a plain inline script; it exits immediately unless the path is `/` and `page=game` is in the query) fetches `/data/legacy-ids.json`, finds the slug and `location.replace('/game/<slug>/')`. Unknown or non-curated id → `/search/?q=<title-if-known>`. No cost for normal visitors (script exits immediately without the param).

### 1.7 CI/CD (`.github/workflows/`)
- `ci.yml` on every PR to `main` and to `rebuild/next`: install with lockfile → typecheck → lint → unit tests → catalog build → `next build` → Playwright smoke (brief §11) → Lighthouse CI on `/`, one game page, one category page with the budgets from brief §1 (fail below).
- **Extend `publish.yml`.** Do not add an FTP workflow and do not restore `deploy.yml`. Hostinger Git tracks `deploy` and pulls built files; it does not build. On push to `main` and `workflow_dispatch`: run the catalog build, then `next build`, then commit `out/` onto `deploy` (no force, no orphan). Keep the guard checks, pointed at `out/` and a `/_next/static/` asset instead of `dist/` and `assets/index-*.js`. `timeout-minutes: 30`. Nightly `schedule` at 21:00 UTC (`0 21 * * *`). GitHub runs scheduled workflows from the default branch only, so the cron stays dormant until this file is on `main`.
- After a good catalog build, commit `catalog.json` and `meta.json` to the `catalog-snapshot` branch so a later feed failure can restore them when the Actions cache has been evicted.
- Do not run Publish from `rebuild/next`. That push would update the live site. The cut-over from Vite `dist/` to Next `out/` happens when this branch merges to `main`.
- The README dry run records the file count of `out/`, total size, the 5 largest JS chunks, and Lighthouse scores for home, one game page, and search.
- Extend the smoke test to `/`, `/robots.txt`, `/sitemap.xml`, `/ads.txt` and one game page; fail loudly if any status isn't 200.
- Dependabot for npm + actions, weekly.

## Acceptance
- [ ] `npm run build` produces `out/` with ~1,600–1,800 game folders, each `index.html` containing the game title in `<h1>` and the canonical URL.
- [ ] View-source of a game page shows real content (no client-only rendering of the main text).
- [ ] `/?page=game&game=737HCH` redirects to `/game/prism-match-3d/`.
- [ ] Every raw category maps to a hub (test proves it).
- [ ] Killing the feed (mock 500) during build uses the cached catalog and marks the build stale — never ships an empty site.
- [ ] CI is green; deploy workflow dry-run documented in README.

## Report back
Tree of the new app, curated count, hub counts, the five slowest pages in the build, Lighthouse numbers, anything in the feed that surprised you.
