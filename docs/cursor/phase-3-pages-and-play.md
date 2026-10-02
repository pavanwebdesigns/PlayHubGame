# Phase 3 — Pages and the play experience

**Attach:** `@docs/cursor/01-MASTER-BRIEF.md` `@docs/cursor/phase-3-pages-and-play.md`
**Branch:** `feat/pages` → into `rebuild/next` · **Size:** about 1 week

## Goal
Every page assembled from Phase 2 components, and a play experience that beats Poki/CrazyGames on phones: two taps to play, true immersive mode, orientation handled, back gesture respected.

## Before you start
Post the section order you'll build for each page below and any data you're missing. Wait for my OK.

## 3.1 Home (`/`)
Order, top to bottom:
1. **Continue playing** row — only if recently-played exists (client component; renders nothing on the server so there's no flash of an empty row; reserve no space when absent).
2. **Spotlight** — one game per day from `config/spotlight.ts` (a hand-picked list; rotates by date). Falls back to the top-quality game.
3. **Today's picks** — 24 tiles in the XL/LG/MD pattern. Chosen at build time with a date-seeded shuffle of the top 300 by quality, so the home page changes every nightly build (a fresh page every day for players and for crawlers) but is identical for everyone on a given day.
   - Phones get a **one-thumb version**: a second grid built from `orientation in {portrait, all}` games. Render both grids in the HTML and switch with CSS media queries (no client reorder → no layout shift).
4. **Collections** as Rows, in this order on phones: One-thumb games, Train your brain, 5-minute games, Two players one screen, Just relax, New this week. Desktop may start with New this week. Seasonal row (Christmas, Halloween) appears automatically in its date window.
5. **PlayHub Originals** row (CPS test, Reaction time test).
6. **Categories** — CategoryCard grid of the hubs with counts.
7. **About PlayHubPlace** — 120–180 words of honest copy + a 4-question FAQ (Are the games free? Do I need to download anything? Do they work on my phone? Why won't a game load?). Copy goes in `content/pages/home.mdx` for Pavan to edit.

## 3.2 Game page (`/game/{slug}/`)
```
Mobile                                   Desktop
┌───────────────────────────┐            ┌───────────────────────────────────────┬───────────┐
│ ‹ Puzzle            ♥  ⤴  │            │ Home › Puzzle › Drop Planets          │ Play next │
│ ┌───────────────────────┐ │            │ ┌───────────────────────────────────┐ │ ▢ ▢       │
│ │      cover art        │ │            │ │                                   │ │ ▢ ▢       │
│ │      [ ▶ Play ]       │ │            │ │      cover → game frame           │ │ ▢ ▢       │
│ └───────────────────────┘ │            │ │      (feed width:height)          │ │ …         │
│ Drop Planets              │            │ └───────────────────────────────────┘ │           │
│ Puzzle · One-thumb ✓      │            │ Drop Planets   ♥ Save  ⤴ Share  ⛶  ⚑  │ (ad slot  │
│ Up next ▢                 │            │ ── ≥150 px gap ──                     │  ≥150 px  │
│ About · How to play …     │            │ About · How to play · Controls …      │  from     │
│ Similar games ▢ ▢ ▢       │            │ Similar games                         │  frame)   │
└───────────────────────────┘            └───────────────────────────────────────┴───────────┘
```
**States of the player** (`components/game/Player.tsx`, a client component with an explicit state machine: `cover → loading → playing → error`, plus `immersive` on/off):
1. **Cover** (server-rendered): cover image as LCP element (`priority`, `fetchPriority="high"`), big Play button centred, title, "Plays in your browser — no download". `<link rel="preconnect" href="https://play.gamepix.com">` on this page only.
2. **Loading**: on Play, create the iframe (`allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"`, `title="{Game} game"`), keep the cover blurred under a loading indicator and one rotating tip. After `load`, focus the iframe.
3. **Error**: no `load` within 15 s → "This game didn't load. Turn off your ad blocker for this site, then reload." with Reload and Pick another game buttons.
4. **Immersive (phones ≤ 1024 px or touch)**: Play enters immersive immediately.
   - Use the Fullscreen API on the player container when available; on iPhone Safari (no element fullscreen) use a fixed overlay covering `100dvh` with safe-area insets.
   - Push a history entry on enter so the Back gesture exits immersive mode instead of leaving the page.
   - Exit button (44 px, top-left, 60 % opacity until touched).
   - Landscape game on a portrait phone: overlay "Turn your phone sideways to play" with an illustration; try `screen.orientation.lock('landscape')` after entering fullscreen, ignore failures; overlay disappears on rotate.
5. **Desktop**: frame sized from the feed's `width/height` ratio to fit the viewport below the top bar; **Theatre** toggle widens it and hides the rail. `F` toggles fullscreen, `Esc` exits. Prevent Space/arrow keys from scrolling the page while the game has focus.

**Action bar**: Save (favorite, `--spark` heart, toast "Saved to My games" / "Removed"), Share (Web Share API → fallback copy + toast "Link copied"), Fullscreen, Report a problem (opens a Dialog with reasons: won't load, broken controls, inappropriate, other → `mailto:` to `CONTACT_EMAIL` with the slug prefilled until a backend exists).

**Up next**: one LG tile chosen from the same hub (highest quality not yet played this session). On desktop the **Play next** rail shows 12 similar games.

**Content** (only when `content/games/{slug}.mdx` exists; otherwise show Details + Similar games + the publisher description as a short quoted block labelled "From the publisher"): About, How to play, Controls (table: desktop / phone), Tips, Details (category links, orientation, added date, updated date), FAQ, Similar games.

**Recently played**: record `{slug, at}` when the iframe loads (not on page view). Max 30, newest first, versioned key `ph:recent:v1`.

## 3.3 Category hub (`/category/{hub}/`)
H1 = hub name + " games". 150–300 words of intro from `content/categories/{hub}.mdx` (first 2 lines visible, "Read more" expands — content stays in the HTML). Sort chips: Popular (quality), New. Grid of 48, then paginated pages `/category/{hub}/page/2/` (static, linked with real `<a>` tags, `rel` canonical to itself). Sub-tag chips from raw categories.

## 3.4 Collection (`/collection/{slug}/`) and New (`/new/`)
Same layout as category; copy from `content/collections/{slug}.mdx`.

## 3.5 Search (`/search/?q=`)
Client-side over `search-index.json` (load the index only when the search field is focused or this page opens). Results as you type (debounce 120 ms), keyboard navigation through results, highlight matched text, recent searches (local, clearable). No results → suggest 3 hubs and Today's picks. `noindex`.

## 3.6 My games (`/my-games/`)
Tabs: Saved, Recently played. Clear history button with a confirm. Empty states per brief §7 voice. `noindex`.

## 3.7 Originals (`/originals/cps-test/`, `/originals/reaction-time-test/`)
Port the existing CPS Test and Reaction Game, rebuilt with our components: start screen, test, result screen with personal best (local), "Try again", share result. Each page gets real explanatory content (what's measured, average scores, tips) — these can rank on their own.

## 3.8 Trust pages and 404
About, Contact, Privacy, Cookies, Terms from `content/pages/*.mdx` (drafts from Phase 0, marked for legal review). 404: "This page doesn't exist." + search field + Today's picks row.

## Acceptance
- [ ] Phone (390 px): home → tile → Play → game running in immersive mode in 2 taps; Back exits immersive, second Back returns to home at the same scroll position.
- [ ] iPhone Safari and Android Chrome both tested (real device or BrowserStack); orientation overlay appears for a landscape game held upright.
- [ ] Game page LCP element is the cover image; no iframe in the initial HTML.
- [ ] No layout shift when Continue playing, fonts or images load (CLS ≤ 0.02 in Lighthouse).
- [ ] Every page passes axe with 0 violations; keyboard-only run through home → game → play → exit.
- [ ] Recently played and Saved survive reload and fail gracefully when storage is blocked.

## Don't
Don't create the iframe before Play; don't show fake counts, ratings or "players online"; don't add ads (Phase 6) — only the reserved AdSlot space.
