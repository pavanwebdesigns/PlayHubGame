# QA checklist — Phase 0 (`hotfix/live-bugs`)

Filled for this PR. ✅ means it was actually checked. ➖ means it does not apply to this hotfix. ❌ means it was not checked, or it failed.

## Build & code
- [x] `npx tsc -b`, `npm run lint`, `npm test`, and `npm run build` pass locally. CI has not finished yet; it starts when this PR is opened.
- [x] No `any` in `src/`. No `console.log`. The only TODO is `TODO(Pavan)` on `CONTACT_EMAIL`.
- [➖] Raw hex colors are still in the existing pages. Design tokens are a later phase, and this hotfix does not restyle.
- [➖] No new dependencies. Tests use Node's built-in `node:test`.
- [x] No secrets, `.env`, `out/`, or `data/` are part of this branch.

## Layout
- [➖] Checked in the browser at 375×812 and 1440×900: mobile menu, tools list, a game page, About, Privacy, and Contact. 360, 390, 768, 1024, and phone landscape were not checked.
- [❌] Horizontal scroll was not measured on every page.
- [➖] The new menu button and the new footer buttons are at least 44 px. Existing game tiles and tool cards were not remeasured.
- [➖] Escape closes the mobile menu and returns focus to the menu button. A full keyboard pass of search, play, back, and favorites was not done.
- [❌] `prefers-reduced-motion` was not checked. This phase adds no new animation.

## Accessibility
- [❌] axe was not run.
- [❌] Alt text was not audited across every image. Cover images use the game title when the feed provides one.
- [❌] Heading order was not audited. The footer wordmark is an `h2`.
- [➖] Keyboard: Escape on the mobile menu only. See Layout.
- [❌] VoiceOver and TalkBack were not used.

## Performance
- [❌] Lighthouse was not run. The mobile score targets are a later phase.
- [➖] The first six home covers are eager, and the first has `fetchpriority="high"`, with width and height set. CLS was not measured.
- [➖] The 120 KB home-JS budget is a later phase. This build is `dist/assets/index-DKBe8Qr_.js`, 471.32 KB, gzip 126.72 KB.
- [➖] Covers stay on the GamePix CDN. They are not converted to AVIF or WebP here. Tile images now have width and height.

## SEO & content
- [➖] One canonical, title, and description live on `index.html` for the whole app. Unique URLs per game are a later phase.
- [➖] No JSON-LD in this phase.
- [x] `robots.txt`, `sitemap.xml` (home only), and `ads.txt` are in `public/` and are copied into `dist/`. `ads.txt` was not edited. They are not on the live site until this PR is merged.
- [x] No ratings, play counts, quotes, or developer names were invented.
- [➖] There is no write-up status field yet. The game page still shows the GamePix description.

## Play
- [➖] Click-to-play is a later phase. The iframe still loads when the game view opens.
- [x] Opening a game from the grid and pressing Back restored the grid scroll (checked once, at 2000 px).
- [➖] Favorites still use `playhub_favorites` and `playhub_tool_favorites`. Versioned `ph:*:v1` keys were intentionally not introduced. A reload of favorites was not retested in this pass.
- [❌] Phone landscape play was not checked.
- [➖] The sponsored sidebar is gone, so the game column has no ad. Distance from the frame to other controls was not measured.

## Privacy
- [➖] There is no consent banner in this phase. No new analytics or ad script was added. The GamePix feed and cover images still load when the page loads.
- [➖] There is nothing new to reject.
- [➖] The footer has no "Do not sell" link. That belongs with the consent work in a later phase.
