# Phase 4 — SEO and the content system

**Attach:** `@docs/cursor/01-MASTER-BRIEF.md` `@docs/cursor/phase-4-seo-content.md`
**Branch:** `feat/seo-content` → into `rebuild/next` · **Size:** 3–4 days of code; content writing continues every week after launch

## Goal
Google sees a fast site of genuinely useful pages — not 13,904 copies of the GamePix feed. Build the machinery (metadata, structured data, sitemaps, index gate, content pipeline) and a writing guide so Pavan can add original game write-ups every week.

## Tasks

### 4.1 Metadata (`lib/seo.ts`)
| Page | `<title>` (≤ 60 chars) | Meta description (140–160 chars) |
|---|---|---|
| Home | "Free Online Games – Play Instantly \| PlayHubPlace" | from `content/pages/home.mdx` frontmatter |
| Game | "{Game} – Play Free Online \| PlayHubPlace" (drop the suffix if over 60) | from the game's MDX `summary`; if none, page is `noindex` anyway |
| Category | "{Hub} Games – Play Free Online \| PlayHubPlace" | from category MDX |
| Collection | "{Collection name} – Free Online Games \| PlayHubPlace" | from collection MDX |
- Canonical: absolute, `https://playhubplace.com`, trailing slash, no query strings. Paginated category pages canonical to themselves.
- Open Graph / Twitter: `og:type` (`website` / `article` for originals), image = game cover at `w=1200` (falls back to a branded default 1200×630 in `public/og-default.png` — design it in our colors), `og:site_name`.
- `<html lang="en">`; `theme-color` = `--night`.
- Unit test: no two indexable pages share a title or description (run over the built `out/`).

### 4.2 Structured data (`components/seo/JsonLd.tsx`, server-rendered)
- Home: `Organization` (name, url, logo) + `WebSite`.
- Game: `@type: ["VideoGame", "SoftwareApplication"]`, `name`, `description` (our summary), `image`, `url`, `applicationCategory: "GameApplication"`, `operatingSystem: "Web browser"`, `genre` (hub), `gamePlatform: "Web browser"`, `datePublished`, `offers: { price: 0, priceCurrency: "USD" }`, `publisher` = GamePix (only fact we know); plus `BreadcrumbList`; plus `FAQPage` only when the FAQ is rendered on the page.
- Category/collection: `CollectionPage` + `ItemList` (first 24 games, positions) + `BreadcrumbList`.
- **No `aggregateRating`, `review` or `interactionStatistic`** until Phase 7 provides real numbers.
- Validate every template with Google's Rich Results Test (paste the built HTML) and record results in the PR.

### 4.3 Sitemaps and robots
- `sitemap.xml` as an index → `sitemap-pages.xml`, `sitemap-categories.xml`, `sitemap-games.xml` (only games passing the index gate). `lastmod` = content file's `updated` date or the feed's `date_modified`, whichever is newer.
- `robots.txt`: allow all; disallow `/search/`, `/my-games/`, `/dev/`; link the sitemap index.
- Build check: every URL in the sitemaps exists in `out/` and is `index,follow`; no `noindex` page appears in a sitemap.

### 4.4 Index gate
`lib/indexing.ts` → `isIndexable(game)`: true only if `content/games/{slug}.mdx` exists with `status: published` and passes the content schema. Unit-tested. The build prints: indexable games / total game pages.

### 4.5 Content model (`content/`)
- `content/games/{slug}.mdx` frontmatter (validated with zod at build; build fails on invalid content):
  `title`, `summary` (140–160 chars), `status` (`draft` | `published`), `author`, `playedOn` (date the writer played it), `updated`, `controls` (`desktop: [{key, action}]`, `phone: [{gesture, action}]`), `faq` (`[{q, a}]`, 2–5 items), `tags` (optional extra).
  Body sections: About, How to play, Tips (3–5), Who it's for.
- `content/categories/{hub}.mdx`, `content/collections/{slug}.mdx`, `content/pages/{page}.mdx`.
- `scripts/new-game-content.ts {slug}` scaffolds a file with the feed facts filled in and empty sections, `status: draft`.
- Content dashboard at `app/dev/content/page.tsx` (`noindex`, unlinked): curated games sorted by quality with a column showing draft / published / missing — Pavan's weekly to-do list.

### 4.6 Writing guide (`docs/CONTENT-GUIDE.md`)
Write it for Pavan, short and practical:
- Play the game for at least 10 minutes before writing. Write what *you* saw: goal, controls, what gets hard, a tip that isn't obvious.
- 300–600 words. Plain English, short sentences, second person ("you").
- Don't paste or rephrase the GamePix description. Don't claim things you didn't see (levels count, developer, release year) unless the game shows them.
- AI tools may help draft, but you must play-test and edit every line. Google's spam policy calls mass-generated pages without added value "scaled content abuse" — 3 great pages a day beat 300 generated ones.
- Never name other brands in headings (no "Mario-like…").
- Order of work: top 50 games by quality first → category intros → collection intros → next 50.

### 4.7 Internal linking
- Breadcrumbs on every page (visible + `BreadcrumbList`).
- Game Details links to its hub and every collection it belongs to.
- "Similar games" = same hub, sorted by quality, excluding the current game, prefer indexable pages.
- Footer links to every hub.
- Build check: zero orphan indexable pages (each has ≥ 1 internal link from another indexable page).

### 4.8 Launch-day SEO tasks (document in README; Pavan does the account steps)
- Verify the domain in Google Search Console (DNS TXT at Hostinger), submit `sitemap.xml`.
- Inspect and request indexing for home + top 10 games with content.
- Bing Webmaster Tools import from Search Console.
- Set up the Search Console → Looker Studio report (impressions, clicks, CTR, indexed pages) — optional.

## Acceptance
- [ ] Rich Results Test passes for home, a game with FAQ, a category page (no errors; warnings explained).
- [ ] `out/` audit script: unique titles/descriptions, canonical on every page, every sitemap URL indexable, no orphans.
- [ ] Lighthouse SEO 100 on the three page types.
- [ ] `CONTENT-GUIDE.md` and the content dashboard exist; 3 example game pages exist as templates: Pavan plays each game and gives his notes, Cursor shapes them into the content format, Pavan edits and sets `status: published`. Cursor never publishes content nobody played.
