# QA checklist — Phase 0 (`hotfix/live-bugs`)

Filled for this PR. ✅ means it was actually checked. ➖ means it does not apply to this hotfix. ❌ means it was not checked, or it failed.

## Build & code
- [x] `npx tsc -b`, `npm run lint`, `npm test`, and `npm run build` pass locally. CI has not finished yet; it starts when this PR is opened.
- [x] No `any` in `src/`. No `console.log`. The only TODO is `TODO(Pavan)` on `CONTACT_EMAIL`.
- [➖] Raw hex colors are still in the existing pages. Design tokens are a later phase, and this hotfix does not restyle.
- [➖] No new dependencies. Tests use Node's built-in `node:test`.
- [x] No secrets, `.env`, `out/`, or `data/` are part of this branch.

## Layout
- [x] Checked in the browser at 360×800, 390×844, 768×1024, 1024×768, and phone landscape 844×390. No horizontal scroll (`scrollWidth` matched the viewport). The mobile menu opens at 360 and 390, including on a game page. At 768 and above, Quick games opens in the header. 1440 was checked in the earlier Phase 0 pass.
- [x] No horizontal scroll on home, the CPS page, or a game page at those widths.
- [➖] New menu, footer, and quick-game buttons are at least 44 px. Existing game-tile hearts are still 32 px.
- [➖] Escape closes the mobile menu and the Quick games menu and returns focus to the button that opened them. A full keyboard pass of search, play, and favorites was not done.
- [❌] `prefers-reduced-motion` was not checked.

## Accessibility
- [x] axe-core 4.13.0: 0 violations on home, one game page (Prism Match 3D), and About. One home violation (`page-has-heading-one`) was fixed by making the games heading an `h1`, then axe was run again.
- [❌] Alt text was not audited across every image. Cover images use the game title when the feed provides one.
- [x] Home has one `h1` (Featured Games, or the search/category title). Game, About, Reaction Time Test, and CPS Test each have one `h1`. The footer wordmark stays an `h2`.
- [➖] Keyboard: Escape on the menus only. See Layout.
- [❌] VoiceOver and TalkBack were not used.

## Performance
- [x] Lighthouse mobile, local production preview. Home: Performance 85, Accessibility 100, Best Practices 100, SEO 100. Game page (Prism Match 3D): Performance 83, Accessibility 100, Best Practices 77, SEO 100. The game Best Practices score is third-party cookies and DevTools issues from the GamePix frame. The Performance 90 target is a later phase.
- [➖] The first six home covers are eager, and the first has `fetchpriority="high"`, with width and height set. On the latest home run, LCP was 4.2 s and CLS was 0. The game page LCP was 4.4 s and CLS was 0.
- [➖] The 120 KB home-JS budget is a later phase. This build is `dist/assets/index-Crdd2-cy.js`, 231.30 KB, gzip 70.43 KB. Before removing tools it was gzip 126.72 KB.
- [➖] Covers stay on the GamePix CDN. They are not converted to AVIF or WebP here. Tile images have width and height.

## SEO & content
- [➖] One canonical, title, and description live on `index.html` for the whole app. Unique URLs per game are a later phase.
- [➖] No JSON-LD in this phase.
- [x] `robots.txt`, `sitemap.xml` (home only), and `ads.txt` are in `public/` and are copied into `dist/`. `ads.txt` was not edited. They are not on the live site until this PR is merged.
- [x] No ratings, play counts, quotes, or developer names were invented.
- [➖] There is no write-up status field yet. The game page still shows the GamePix description.

## Play
- [➖] Click-to-play is a later phase. The iframe still loads when the game view opens.
- [x] Opening a game from the grid and pressing Back restored the grid scroll (checked once, at 2000 px, in the earlier pass).
- [x] A favorited game (Prism Match 3D) was still in `playhub_favorites` and in the Favorites list after a reload. Tool favorites are no longer read or written. Versioned `ph:*:v1` keys were intentionally not introduced.
- [➖] Phone landscape (844×390) showed the game page with no horizontal scroll. Fullscreen play in that orientation was not exercised.
- [➖] The sponsored sidebar and the floating wrench are gone. Distance from the frame to other controls was not measured.

## Privacy
- [➖] There is no consent banner in this phase. No new analytics or ad script was added. The GamePix feed and cover images still load when the page loads.
- [➖] There is nothing new to reject.
- [➖] The footer has no "Do not sell" link. That belongs with the consent work in a later phase.
