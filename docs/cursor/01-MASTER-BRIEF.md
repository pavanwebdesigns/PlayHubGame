# PlayHubPlace — Master Brief

Attach this file to every Cursor session for this project. Each phase file says *what* to build; this brief says *why*, *to what standard*, and *what never to do*. When a phase file and this brief disagree, stop and ask.

Facts below were measured on the live site, the repo and the GamePix feed on 2 Oct 2026. Re-check any number before you rely on it in code.

---

## 1. Product

**What:** playhubplace.com — a free browser-games site. No download, no sign-up.
**Who:** casual players on phones first (India + global): students, commuters, office-break players. Desktop second.
**Primary job:** get a person from landing to playing a game in **2 taps or fewer**, then into their next game without friction.
**Brand name:** `PlayHubPlace` everywhere. "PlayHubGame" is retired. Phase 0 removed it from titles, the meta description, and the footer.

### Success targets (measure, don't guess)

| Area | Target |
|---|---|
| Core Web Vitals, 75th percentile, mobile | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 |
| Lighthouse mobile (home, game page, category page) | Performance ≥ 90, Accessibility 100, Best Practices 100 (≥ 95 once third-party ads run), SEO 100 |
| Initial JS on home (gzip) | ≤ 140 KB |
| Taps from home to a running game | ≤ 2 |
| Indexed pages with original content | grows every week (tracked in Search Console) |

The 140 KB home budget is the React and Next.js runtime. The measured baseline on 2 Oct 2026 is 134,029 bytes gzip. CI fails a pull request that grows past that by more than 5 KB unless the pull request body contains a `home-js:` note.

---

## 2. State after Phase 0

Phase 0 is merged and live (`9e6ae0a` on `main`). The public site is still the Vite + React 19 app. Views use `?page=` query strings, and the browser still fetches the GamePix feed. The Next.js rebuild on `rebuild/next` replaces that app. Nothing on `rebuild/next` is live until it merges to `main`.

**What Phase 0 fixed**
- One `GamePixGame` type. `id` is a string, matching the feed (`"737HCH"`). Cover URLs set a single `w` parameter. The old double-`?` cache-bust is gone.
- The mobile menu opens. It lists Games, Quick games (Reaction Time Test, CPS Test), Blog, and Favorites.
- The tools section is gone, including the mobile wrench and tool favorites. `?page=tools` and `?page=tool-<id>` redirect to `https://workutilities.com/`. `?page=tool-reaction` opens Reaction Time Test and `?page=tool-cps` opens CPS Test.
- Footer links go to About, Privacy, Terms, and Contact. Those pages exist. `CONTACT_EMAIL` is still `TODO(Pavan)`, and Contact does not show an address while that sentinel is in place.
- `robots.txt`, a home-only `sitemap.xml`, a canonical URL, and a meta description are served. The name PlayHubGame is gone from titles and the footer.
- `public/.htaccess` is the real filename. It denies source paths (`package.json`, `src/`, `docs/`, `.cursor/`, `*.ts`, `*.tsx`, `*.md`), caches `/assets/*`, and falls back to the SPA. It does not force HTTPS.
- Body text uses a system font. Jersey 15 is limited to display headings.
- Game favorites stay in `localStorage` under `playhub_favorites`.
- Publish (`.github/workflows/publish.yml`) builds on a push to `main` and commits `dist/` to the `deploy` branch. Hostinger Git tracks `deploy` and does not build.

**Still true, and in scope for the rebuild**
- Routes are query strings, not `/game/{slug}/`.
- The game iframe is created when the game view opens. The rebuild must wait for Play.
- The catalog is the full feed in the browser, not a curated static set.
- `https://www.playhubplace.com/` returns 200. `http://playhubplace.com` already 301s to `https://playhubplace.com/`, and `http://www.playhubplace.com` 301s to `https://www.playhubplace.com/`. The www host still needs one canonical redirect to the apex.

---

## 3. What the market leaders do (research)

| Pattern | Poki | CrazyGames | Our decision |
|---|---|---|---|
| Game URL | `/en/g/{slug}` | `/game/{slug}` | `/game/{slug}/` |
| Game title tag | "Subway Surfers - Play Online for Free! \| Poki" | "Moto X3M 🏍️ Play on CrazyGames" | "{Game} – Play Free Online \| PlayHubPlace" (≤ 60 chars, no emoji) |
| Breadcrumbs | Home › Games › Skill Games › Game | Games › Driving › Bike › Dirt Bike › Game | Home › {Category} › {Game} |
| Content under the game | About, gameplay, controls (desktop + mobile), developer, FAQ, "Games like X", "More by this developer" | How to Play, Tips & Tricks, Controls, Developer, Release Date, Platforms, Last Updated, FAQ, Gameplay Video | About, How to play, Controls, Tips, Details, FAQ, Similar games — only when written by us |
| Engagement | Like/dislike, star rating, "Report a bug" | Like/dislike, share, play count | Favorite + share now; like/dislike once a backend exists (Phase 7) |
| Next game | "Popular this week" row | "Play next" rail | "Play next" rail + "Up next" tile |
| Home layout | Mixed tile sizes (≈314 / 204 / 94 px) | Mood rows: "Train your brain", "Adrenaline rush", "With friends", "5-minute fun"; geo row "Top games in India today" | Mixed tiles + mood collections driven by feed data |
| Tile hover | Animated preview | 364×208 MP4 preview on hover | GamePix sends no video; use a crisp hover state, no fake previews |
| Structured data | — | `VideoObject`, `FAQPage`, `ItemPage` | `VideoGame`+`SoftwareApplication`, `BreadcrumbList`, `ItemList`, `FAQPage` where an FAQ is visible |
| Catalog size | "1500 free games" | — | ~1,600 curated games (see §5) |
| Footer | About, FAQ, Contact, Privacy, Cookies, Terms, Developers, Blog | About, Developers, Parents info, Terms, Privacy | About, Contact, Privacy, Cookies, Terms, Report a game |

**Where we differ on purpose**
1. **One-thumb games.** The feed tells us each game's orientation (4,440 portrait games). On phones we lead with games that work held upright with one hand — no other portal makes this its headline.
2. **Honest, curated catalog.** We publish fewer pages, each with real content, instead of 13,904 thin feed copies.
3. **Indian-language readiness.** Typeface and layout support Telugu and Devanagari from day one (Telugu/Hindi pages come later).
4. **PlayHub Originals.** Our own small games (CPS test, reaction time test, later brain games) — content no other GamePix site has.

---

## 4. GamePix feed (our data source)

- Endpoint: `https://feeds.gamepix.com/v2/json?sid=LC991&pagination=96&page={n}` (JSON Feed 1.1). Our partner id is `sid=LC991` — never remove it from embed URLs.
- Supported params seen working: `order=quality` (default), `order=pubdate`, `category={raw-category}`.
- Size on 2 Oct 2026: **145 pages × 96 = 13,904 games**, 147 raw categories.
- Item fields: `id` (string), `title`, `namespace` (use as slug), `description`, `category`, `orientation` (`landscape` 7,122 / `portrait` 4,440 / `all` 2,342), `quality_score` (0–1), `width`, `height`, `date_published`, `date_modified`, `banner_image` (cover, `?w=320`), `image` (icon, `?w=105`), `url` (embed, includes `sid`).
- Quality: 1,568 games have `quality_score ≥ 0.70`; only 41 have ≥ 0.90.
- Descriptions are short (median 46 words) and identical on every GamePix partner site → **duplicate content**. Never present them as our only text.
- Image CDN resizes with `?w=` (`w=320` → ~25 KB, `w=640` → ~65 KB). Build `srcset` by setting the `w` param with the `URL` API. Never append a second `?`.
- Largest raw categories: arcade 1,340 · puzzle 1,155 · casual 801 · adventure 712 · action 582 · hyper-casual 513 · animal 417 · shooter 354 · platformer 343 · sports 339 · match-3 306 · ball 280 · brain 241 · memory 228 · board 226 · two-player 211 · coloring 199 · racing 193 · dress-up 191 · clicker 185 · strategy 172 · math 153 · trivia 113 · word 67.
- Some raw categories name third-party brands (`mario`, `minecraft`, `skibidi-toilet`, `ninja-turtle`, `granny`). Never build category pages, nav items or headings around them.
- GamePix does not publish its partner terms on its public pages. Pavan must confirm in the GamePix partner dashboard whether our own ads may sit around their games, and keep their `ads.txt` lines intact.

---

## 5. Architecture decisions

| # | Decision | Why |
|---|---|---|
| A1 | **Next.js (latest stable, App Router, TypeScript strict) with `output: 'export'`** | Every page becomes real HTML that Google can read; hosting stays static. |
| A2 | **Keep Hostinger** (it serves the site today: `platform: hostinger`, `server: hcdn`, Brotli on). Use `trailingSlash: true` so `/game/slug/` maps to `game/slug/index.html` with no rewrite rules. | Static export runs on any web server. Static export does **not** support ISR, server actions, redirects/headers in `next.config`, or the default image loader — do those in `.htaccess` and a custom loader. |
| A3 | **Build-time data pipeline.** A script fetches the full feed, validates it with `zod`, normalizes it and writes JSON the build reads. Nightly rebuild picks up new games. | No feed calls from the browser for page content; fast, indexable, resilient. |
| A4 | **Curated catalog (~1,600 game pages).** Build a page only for games with `quality_score ≥ 0.70`, plus the 200 newest, plus a manual allowlist, minus a denylist. | Google's spam policy names "scraping feeds … to generate many pages … where little value is provided" as scaled content abuse. Poki itself lists ~1,500 games. |
| A5 | **Index gate.** A page is `index,follow` and listed in the sitemap only when its content file exists: `content/games/{slug}.mdx`, `content/hubs/{hub}.mdx`, or `content/collections/{slug}.mdx`. Others render normally but are `noindex,follow`. No manual index flags. | Each indexed page earns its place; the site grows in quality, not just count. |
| A6 | **Tailwind CSS v4** with design tokens as CSS variables. Remove Bootstrap (CSS and JS). | One styling system, small CSS, tokens enforce the design system. |
| A7 | **Icons: `lucide-react` only.** Remove `react-icons` and inline icon SVGs. | Consistent stroke and size. |
| A8 | **Client state:** favorites and recently played in `localStorage`, wrapped in try/catch, and must work when storage throws. Game favorites keep the existing key `playhub_favorites` so saved games survive the rebuild. That key is the one exception. Every new key uses `ph:<name>:v1`. No accounts until Phase 7 + legal review. | Zero personal data collected. |
| A9 | **Search:** client-side over a compact index of curated games (title, slug, category, tags) with a small library such as MiniSearch (≤ 10 KB gzip). | Instant, offline-capable, no backend. |
| A10 | **Backend later (Phase 7): Supabase** for anonymous play counts and likes, behind row-level security and rate limits. | Real numbers for "Trending" and ratings — never invented ones. |
| A11 | **Tools leave PlayHub.** The live Vite app has no tools section. `?page=tools` and `?page=tool-<id>` redirect to `https://workutilities.com/`. Reaction Time Test and CPS Test stay, at `?page=reaction-test` and `?page=cps-test`. Phase 1 serves those two at `/originals/reaction-time-test/` and `/originals/cps-test/`. | One topic per site; no duplicate maintenance. |
| A12 | **CI/CD: GitHub Actions** — PR checks (typecheck, lint, unit, build, Lighthouse CI). On a push to `main`, `publish.yml` builds the site and commits the static files onto the `deploy` branch. Hostinger Git tracks `deploy` and does not build. Nightly rebuild at 21:00 UTC runs from `main` only. No FTP. | Repeatable, and the live site matches the last publish of `main`. |

---

## 6. Information architecture

| Route | Purpose | Indexed |
|---|---|---|
| `/` | Home | yes |
| `/game/{slug}/` | Game page | only if content exists (A5) |
| `/category/{hub}/` | ~20 hub categories | only if `content/hubs/{hub}.mdx` exists |
| `/collection/{slug}/` | Mood collections (one-thumb, two-player, brain, relax, 5-minute, new) | only if `content/collections/{slug}.mdx` exists |
| `/new/` | Newest games | yes |
| `/search/` | Search results (client-side) | no |
| `/my-games/` | Favorites + recently played | no |
| `/originals/{slug}/` | Our own games. Phase 1 routes: `/originals/reaction-time-test/` and `/originals/cps-test/`. Until that rebuild, the Vite app uses `?page=reaction-test` and `?page=cps-test`. | yes |
| `/about/`, `/contact/`, `/privacy/`, `/cookies/`, `/terms/` | Trust pages | yes |
| `/404.html` | Not found, real 404 status | no |

**Hub categories** (map the 147 raw categories into these; keep the raw value as a tag): Action, Adventure, Arcade, Puzzle, Brain & Memory, Match-3, Casual, Shooting, Racing & Driving, Sports, Strategy, Board & Card, Two-Player, Girls & Dress-up, Coloring & Drawing, Simulation & Idle, Platformer, Skill & Hyper-casual, Math & Word, Seasonal (Christmas, Halloween).

**Collections** are predicates over catalog data, e.g. *One-thumb games* = `orientation in {portrait, all}`; *Two players, one screen* = raw `two-player`; *Train your brain* = raw in {brain, memory, math, trivia, word, jigsaw-puzzles}; *Just relax* = raw in {coloring, drawing, jigsaw-puzzles, mahjong, solitaire, match-3}; *5-minute games* = raw in {hyper-casual, tap, clicker, runner}; *New this week* = `date_published` within 7 days.

---

## 7. Design system

**Direction:** "arcade marquee at night." The logo's own gradient (cyan → indigo → magenta) is the signature, used in exactly one place — the frame of the daily Spotlight game. Everything else is calm, deep indigo, so game art is the color on the page.

### Color tokens (dark theme only — deliberate for a games site)

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--night` | `#140B33` | page background | — |
| `--deck` | `#1D1347` | panels, header, rows | — |
| `--raised` | `#2A1E5E` | hover/pressed surfaces, sheets | — |
| `--edge` | `#7E78E0` | input borders, control outlines | ≥ 3.9:1 on all surfaces |
| `--line` | `#3A2D78` | decorative dividers only | decorative |
| `--ink` | `#F3F0FF` | primary text | 16.6:1 on night |
| `--ink-muted` | `#B4AADB` | secondary text | 8.6:1 on night, 6.7:1 on raised |
| `--play` | `#1FB8FF` | primary action (Play), links, focus ring | 8.3:1; text on it = `--night` |
| `--spark` | `#FF2E93` | favorites, "New" marks — sparingly | 5.4:1 on night; text on a spark fill = `--night`, never white (3.5:1 fails) |
| `--ok` / `--danger` | `#3DDC97` / `#FF6B6B` | success / errors | 10.6:1 / 6.7:1 |
| `--marquee` | `linear-gradient(90deg,#00B7FF,#6D68CC,#FF0089)` | Spotlight frame only | decorative |

### Typography
- **Display:** Jersey 15 (the current brand font) — logo-adjacent headings and the Spotlight title only, never below 24 px, never for body or UI labels.
- **Text & UI:** Anek Latin (variable, weight + width axes) via `next/font`. Later Telugu/Hindi pages use Anek Telugu / Anek Devanagari from the same family so the voice stays consistent.
- Scale (rem): 0.875 · 1 · 1.125 · 1.375 · 1.75 · 2.25 · 3. Body 1 rem / 1.6. Prose max width 68ch.
- Sentence case everywhere. No all-caps labels, no letter-spaced eyebrows above headings.

### Shape, space, motion
- Spacing on a 4 px grid. Radius by hierarchy, not one value: tiles 14 px, buttons 999 px (pill), sheets 20 px, inputs 12 px.
- Tiles show game art edge to edge; no drop shadow at rest. Hover/focus: lift 2 px + 2 px `--play` outline. Pressed: scale 0.98.
- Exactly one ambient animation: the marquee light sweeps once around the Spotlight frame on load. All other motion answers a user action (sheet opening, toast, like). `prefers-reduced-motion` disables all of it.
- Tile sizes on the home grid: XL (2×2), L (2×1), M (1×1). CSS grid with `grid-auto-flow: dense`. Measure the real cover aspect ratio on 50 catalog covers in the data script and use it — never crop game titles out of cover art.

### Voice
Plain, warm, specific. "Play", not "Launch". "No download, plays in your browser." Errors say what happened and what to do: "This game didn't load. Turn off your ad blocker for this site, then reload." Empty states invite action: "Games you play show up here. Start with today's picks."

---

## 8. UX rules (every small point matters)

1. **Two taps to play.** Tile → game page → Play. On mobile, Play enters immersive mode immediately.
2. **Click-to-play.** The iframe is not created until the player taps Play. Before that, the cover image is the page's largest element (preloaded).
3. **No layout shift.** Every image has width/height or aspect-ratio. Every ad slot and skeleton reserves its final size. Fonts use `next/font` with fallback metrics.
4. **Game frame sizing** uses the feed's `width`/`height` ratio, fitted to the viewport. Theatre mode on desktop.
5. **Mobile immersive mode:** element fullscreen where supported; on iPhone Safari (no element fullscreen) use a fixed full-viewport overlay. A 44 px exit button stays top-left. The phone's Back gesture exits immersive mode (push a history entry when entering).
6. **Orientation:** if a landscape game opens on a portrait phone, show a "Turn your phone sideways" overlay; try `screen.orientation.lock('landscape')` after fullscreen (Android) and fail silently.
7. **Keyboard:** `/` focuses search; `F` toggles fullscreen; `Esc` exits. While a game runs, Space and arrow keys must not scroll the page. Focus moves into the iframe after it loads.
8. **Tap targets** ≥ 44×44 px. Primary actions in the bottom half of the screen on phones (bottom navigation bar: Home, Categories, Search, My games).
9. **Loading:** skeletons with the final shape, never spinners for content. Game loading overlay shows the cover + a short tip; after 15 s without a load event, show the ad-blocker / reload help.
10. **Empty, error, offline states** are designed, not defaults.
11. **Share:** Web Share API on phones; copy link + toast "Link copied" on desktop.
12. **Never** autoplay audio, open pop-ups, or put anything clickable within 150 px of the game frame except our own game controls.

---

## 9. SEO & content strategy

- Every indexable page: unique `<title>` and meta description, canonical (`https://playhubplace.com/...` with trailing slash), Open Graph + Twitter card using the game cover, `lang="en"`.
- JSON-LD: home → `Organization` + `WebSite`; category/collection → `CollectionPage` + `ItemList` + `BreadcrumbList`; game → `["VideoGame","SoftwareApplication"]` co-typed (Google shows no rich result for `VideoGame` alone), `offers.price = 0`, `BreadcrumbList`, and `FAQPage` only when the FAQ is visible on the page.
- **Never add `aggregateRating` or `review` until they come from real player votes** (Phase 7). No invented ratings, play counts or testimonials anywhere.
- Original content per indexed game (300–600 words): what the game is, how to play, controls (desktop + phone), 3–5 tips, who it suits, FAQ. Written by someone who played it. AI may draft; a human must play, correct and own it. Never paste GamePix's description as body copy (it may appear as a short "Publisher's description" quote).
- Internal links: breadcrumbs, category links in Details, "Similar games", collections. No orphan pages.
- Sitemap index split into `pages`, `categories`, `games`; `lastmod` from our content date or `date_modified`.
- No trademarked names in our own headings/nav (see §4).

---

## 10. Ads, consent & legal

- AdSense review happens **after** content exists (≥ 50 written game pages + category copy + trust pages). A "low value content" rejection is the usual result for portals made only of embedded third-party games.
- Google's guidance for game pages: ad units at least **150 px away from the game**, or none on game-play pages; no ads near Play buttons; play buttons obvious.
- `ads.txt`: keep every GamePix line exactly as is; add our AdSense line at the top; serve at `/ads.txt` with status 200, `text/plain`.
- Consent: personalized ads to EEA/UK (since 16 Jan 2024) and Switzerland (since 31 Jul 2024) need a Google-certified CMP — use AdSense **Privacy & messaging**, wired to Consent Mode v2.
- Children: the site is general-audience. Don't market sections as "for kids". India's DPDP Rules (notified 13 Nov 2025; most duties apply from 13 May 2027) require verifiable parental consent for children's data and bar behavioural monitoring/targeted ads for children — so no accounts and no user-level tracking until a lawyer reviews it.
- Claude is not a lawyer; legal pages get a professional review before AdSense.

---

## 11. Engineering standards

- TypeScript `strict`, `noUncheckedIndexedAccess`. Zero `any` (use `unknown` + zod at boundaries). ESLint (next + typescript-eslint strict) + Prettier; CI fails on warnings.
- Structure: `app/` routes · `components/ui/` primitives · `components/game/`, `components/home/`… features · `lib/` pure logic · `data/` generated JSON (git-ignored) · `content/` our written MDX · `config/` taxonomy, curation, site constants · `scripts/` build-time scripts · `tests/`.
- Components ≤ 200 lines, one job each. Server Components by default; `'use client'` only where interaction needs it. Browser APIs only inside effects/handlers.
- Tests: Vitest for `lib/` and `scripts/` (normalization, taxonomy mapping, curation, slug, image URL builder); Playwright smoke for home → game → Play → fullscreen → back, at 390×844 and 1440×900; axe checks in Playwright.
- No new dependency without a one-line reason in the PR. Prefer the platform.
- Conventional commits, one task per commit, PR per phase with the QA checklist filled.
- Never commit secrets, `.env`, `node_modules`, `out/`, `data/` or `.DS_Store`.
- Never invent facts: contact email, company address, ratings, play counts, game descriptions. Use a clearly named constant and leave a `TODO(Pavan)` in `config/site.ts`.

---

## 12. Out of scope until asked

Accounts/login, multiplayer, comments, user uploads, languages other than English (structure only), paid plans, native apps, the brain-training app.

---

## 13. Definition of done (every task)

Builds clean · typecheck/lint/tests pass · works at 360, 390, 768, 1024, 1440 px and phone landscape · keyboard-only usable · no console errors · no layout shift from images, fonts or ads · copy follows §7 voice · `docs/cursor/QA-CHECKLIST.md` filled in the PR.

---

## Sources

- Poki home and game page structure: https://poki.com/ , https://poki.com/en/g/subway-surfers
- CrazyGames home and game page structure: https://www.crazygames.com/ , https://www.crazygames.com/game/moto-x3m
- GamePix feed: https://feeds.gamepix.com/v2/json?sid=LC991&pagination=96&page=1
- Next.js static exports (supported/unsupported features): https://nextjs.org/docs/app/guides/static-exports
- Core Web Vitals thresholds: https://web.dev/articles/vitals
- Software app / VideoGame structured data: https://developers.google.com/search/docs/appearance/structured-data/software-app
- Google spam policies (scaled content abuse): https://developers.google.com/search/docs/essentials/spam-policies
- AdSense ad placement policies: https://support.google.com/adsense/answer/1346295
- AdSense guidance for game pages (150 px): https://support.google.com/adsense/answer/2768340
- Certified CMP requirement: https://support.google.com/adsense/answer/13554116
- DPDP Rules 2025 timeline and children's data: https://tsaaro.com/blogs/dpdp-rules-2025-explained-full-overview-and-practical-summary
- Cursor project rules: https://cursor.com/docs/context/rules
