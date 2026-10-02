# Phase 5 — Performance, accessibility, analytics, PWA

**Attach:** `@docs/cursor/01-MASTER-BRIEF.md` `@docs/cursor/phase-5-performance-a11y-analytics.md`
**Branch:** `feat/quality` → into `rebuild/next` · **Size:** 3 days

## Goal
Hit the brief §1 targets on real phones, make the site usable for everyone, and measure what players actually do — so every later decision uses data.

## 5.1 Performance budget (enforced in Lighthouse CI)
| Metric | Budget |
|---|---|
| LCP (mobile, Moto G Power profile) | ≤ 2.5 s on home, game, category |
| CLS | ≤ 0.05 (stricter than Google's 0.1 on purpose) |
| TBT (lab proxy for INP) | ≤ 200 ms |
| JS on home (gzip) | ≤ 120 KB |
| Images above the fold | ≤ 6 requests, total ≤ 300 KB |

Techniques (check each, report which applied):
- Server Components by default; client components only for Player, search, favorites, menus. Check the bundle with `@next/bundle-analyzer`; nothing over 30 KB without a reason.
- `next/image` with the GamePix loader: `sizes` per tile size, `w` steps 240/320/480/640/960; `priority` only for the LCP image.
- Rows below the fold: `content-visibility: auto` with `contain-intrinsic-size`.
- Prefetch the game page HTML on tile hover (desktop) and `touchstart` (phones) — Next `<Link>` prefetch is fine; don't prefetch whole rows on viewport.
- Search index loads only on demand.
- Fonts: two families max, variable, Latin subset, no FOIT.
- No third-party scripts before consent (Phase 6) except what the CMP itself needs.

## 5.2 Accessibility — WCAG 2.2 AA
- Landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, logical heading order.
- Every icon-only control has a label; tiles are single links with the title as accessible name.
- Focus visible everywhere, focus order follows visual order, focus moves into Sheets/Dialogs and returns on close, focus is never trapped inside the game iframe (Esc exits immersive mode first).
- Contrast per brief §7; nothing conveyed by color alone.
- Respect `prefers-reduced-motion`; no flashing content.
- Target size ≥ 24 px (2.2 minimum), our standard 44 px.
- Toasts and search results announced (`aria-live`).
- Test: axe in Playwright on every page type (0 violations) + a manual VoiceOver (iPhone) and TalkBack (Android) pass on home → game → play → exit; note findings in the PR.

## 5.3 Analytics (GA4, consent-aware — wired to the CMP in Phase 6)
Track as GA4 events with parameters (no personal data, no free-text except search terms):
| Event | Params |
|---|---|
| `tile_click` | `slug`, `source` (spotlight, todays_picks, row:{collection}, play_next, up_next, search, category), `position` |
| `game_play_start` | `slug`, `hub`, `orientation`, `device` |
| `game_load_time` | `slug`, `ms` (Play tap → iframe `load`) |
| `game_load_failed` | `slug` (15 s timeout) |
| `immersive_enter` / `immersive_exit` | `slug`, `seconds_in_game` on exit |
| `rotate_prompt_shown` | `slug` |
| `favorite_add` / `favorite_remove` | `slug` |
| `share` | `slug`, `method` (native, copy) |
| `search` / `search_no_results` | `term`, `results` |
| `report_problem` | `slug`, `reason` |
| `original_result` | `slug` (cps-test, reaction-time-test), `score` |
- Web Vitals: send LCP, INP, CLS from real users with the `web-vitals` library as GA4 events (`metric_name`, `value`, `page_type`).
- A typed `track()` helper in `lib/analytics.ts`; calls are no-ops until consent allows analytics; unit-test that nothing fires without consent.
- Document the events in `docs/ANALYTICS.md` with the GA4 explorations Pavan should save (top games by plays, load failures by game, search terms with no results).

## 5.4 PWA
- `manifest.webmanifest`: name PlayHubPlace, short name PlayHub, `display: standalone`, `theme_color`/`background_color` = `--night`, icons 192/512 + maskable.
- Service worker (small, hand-written or Workbox) caching only the app shell, fonts, our own static assets and the offline page. **Never cache game iframes or GamePix responses.**
- Offline page: "You're offline. These games are saved on this device:" + PlayHub Originals (they work offline) + Recently played list (links disabled until online).
- Custom install prompt: only after the player has started 3 games on 2 different days; dismissable; never on first visit.

## Acceptance
- [ ] Lighthouse CI budgets green on all three page types (attach reports).
- [ ] Real-device check: game page on a mid-range Android over throttled 4G — Play to running game time recorded.
- [ ] axe 0 violations; screen-reader pass notes in the PR.
- [ ] GA4 DebugView shows every event in the table with correct params; nothing fires before consent.
- [ ] Site installs as a PWA on Android; offline page works in airplane mode.
