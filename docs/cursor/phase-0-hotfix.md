# Phase 0 — Hotfix the live site (current Vite app)

**Attach:** `@docs/cursor/01-MASTER-BRIEF.md` `@docs/cursor/phase-0-hotfix.md`
**Branch:** `hotfix/live-bugs` · **Size:** about 1 day · **Rule:** fix only what is listed. The full rebuild happens in Phase 1; do not refactor beyond these tasks.

## Goal
Stop the live site from losing visitors while the rebuild happens: working mobile navigation, fast thumbnails, links that open, no dead tools, honest footer, crawlable basics.

## Before you start
1. `setup-auto-deploy.md` must be done first (it makes `main` the production branch and commits the pending work). Show me `git status`, confirm you're on an up-to-date `main`, then create the branch.
2. Read `src/App.tsx`, `src/components/Header.tsx`, `GamePlay.tsx`, `Footer.tsx`, `ToolsPage.tsx`, `src/types.ts` fully before editing.
3. Reply with a short plan (files you will touch per task) and wait for my OK.

## Tasks

### 0.1 One correct game type
- Delete the duplicate `GamePixGame` interfaces in `App.tsx` and `GamePlay.tsx`; keep one in `src/types.ts`, matching the **v2 feed exactly**: `id: string`, `title`, `namespace`, `description`, `category`, `orientation: 'landscape' | 'portrait' | 'all'`, `quality_score: number`, `width`, `height`, `date_published`, `date_modified`, `banner_image`, `image`, `url`.
- Remove references to fields the feed doesn't send (`thumbnailUrl`, `thumbnailUrl100`, `bannerUrl`, `color`). Remove the `as unknown as any` casts in `App.tsx`.

### 0.2 Thumbnails: correct size, cacheable
- Delete `getFreshUrl()` and every `?t=` timestamp (GameCard, FavoritesSidebar, GamePlay related games).
- Add `src/lib/image.ts` → `gamepixImage(url: string, width: number): string` that parses with `new URL()`, sets `w`, returns the string. Unit-test it with a URL that already has `?w=320`.
- Tiles: `src` = width 320, `srcSet` = 320w/480w/640w, `sizes` matching the grid columns, explicit `width`/`height` (or `aspect-ratio`), `loading="lazy"` except the first 6 tiles (`loading="eager"`, first tile `fetchPriority="high"`), `decoding="async"`.
- Fallback image: a local `/placeholder-cover.svg` in our colors, not `placehold.co`.
- **Accept:** on the home page the first 96 covers transfer < 4 MB total (estimated ~20 MB before, from one measured cover at 218 KB); measure before and after in DevTools → Network → Img; no URL contains two `?`.

### 0.3 Mobile navigation that works
- Replace the Bootstrap collapse (`data-bs-target="#mobileMenu"`, element doesn't exist) with a React-state menu panel: Games, Tools, Blog, Favorites.
- Button has `aria-expanded`, `aria-controls`, accessible name "Open menu"/"Close menu". `Esc` closes; focus returns to the button; tapping a link closes it; body scroll locks while open.
- Remove `bootstrap.bundle.min.js` from `index.html` if nothing else needs it (check modals/collapses first and list what you checked).
- **Accept:** at 375 px, every page reachable from the menu with touch only.

### 0.4 No dead tools
- Create a single registry `src/tools/registry.ts`: `{ id, title, icon, category, description, component }`. `isReady` is **derived** (has a component), never hand-set — so the list can't drift again.
- The 17 tools without a page (sleep, mood, affirm, todo, timezone, unit, stopwatch, gst, percent, palette, json, regex, text-speech, speech-text, goal, water, pass-strength) disappear from the grid. Do not build them.
- `?page=tool-<unknown>` shows the Tools list with a short notice, not "under construction".

### 0.5 Game links always open
- New share URL format: `/?page=game&game=<id>&slug=<namespace>`.
- If the game isn't in memory: build the embed URL from the slug (`https://play.gamepix.com/<slug>/embed?sid=LC991`) and show the page with the title derived from the slug until data arrives; if only an old `id` exists, fetch further feed pages (max 20, show a loading state) and stop with a "Game not found — search instead" state.
- Browser Back from a game returns to the scroll position on the grid.

### 0.6 Honest game page
- Remove the dashed "Ad Space" box and the "Sponsored" sidebar. The game column becomes full width (max 1200 px).
- Show the "trouble playing / ad blocker" help only if the iframe hasn't fired `load` within 15 s.
- Remove the floating wrench button on screens < 768 px (it covers tiles and game controls) and add its contents (Reaction test, CPS test) to the mobile menu as "Quick tests" so nothing becomes unreachable. On desktop, remove it from game pages (it sits too close to the game frame) and keep it elsewhere.

### 0.7 Footer, trust pages, brand
- Add views for About, Privacy Policy, Terms of Use, Contact (simple, plain-language, honest about GamePix embeds, local storage for favorites, no accounts). Contact uses `CONTACT_EMAIL` from `src/config/site.ts` — leave it as `TODO(Pavan)`; never invent an address. Mark both legal texts "Draft — pending review" in a code comment.
- Footer links go to these views. Replace every "PlayHubGame" with "PlayHubPlace" (meta description in `index.html`, Footer, `document.title` in `GamePlay.tsx`).

### 0.8 Crawl basics and the broken `.htaccess`
- `public/.htaccess` (moved there during the auto-deploy setup) — keep the SPA fallback; add HTTPS redirect, `ErrorDocument 404`, long cache for `/assets/*` (`max-age=31536000, immutable`), no-cache for `index.html`.
- Add `public/robots.txt` (allow all, sitemap line) and a minimal `public/sitemap.xml` (home only for now).
- Add `<link rel="canonical" href="https://playhubplace.com/">` and basic Open Graph tags to `index.html`.
- **Accept:** after deploy, `/robots.txt`, `/sitemap.xml`, `/ads.txt` each return 200 with the right content type.

### 0.9 Fonts readable
- Keep Jersey 15 for the logo area and H1/H2 only. Body, buttons, inputs, card titles: a system font stack for now (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`). Phase 2 brings the real typeface.

### 0.10 Ship it properly
- Update `README.md`: what the project is, scripts, how to deploy, where config lives.
- `npm run build` clean, `npm run lint` clean — then switch the CI lint step to blocking (remove `continue-on-error`).
- Deploy = merge the PR into `main`; the deploy workflow uploads and runs the smoke test. No manual uploads.
- Put the main JS file name from the build in the PR description so we can confirm live == repo.

## Report back
For each task: done / skipped (why), files changed, and before→after evidence (screenshot at 375 px for 0.3, network total for 0.2, curl status lines for 0.8). Then fill `docs/cursor/QA-CHECKLIST.md` (the "Phase 0" subset).

## Don't
Don't migrate frameworks, restyle, add features, add dependencies (except a test runner if missing — say so first), or touch GamePix `ads.txt` lines.
