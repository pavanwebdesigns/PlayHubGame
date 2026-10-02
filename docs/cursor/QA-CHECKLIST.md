# QA checklist — copy into every PR description and tick honestly

Mark each line ✅ done, ➖ not applicable (say why), or ❌ failing (say what's next). Never tick what you didn't check.

## Build & code
- [ ] `typecheck`, `lint`, unit tests, build all pass locally and in CI
- [ ] No `any`, no `@ts-ignore`, no `eslint-disable` without a one-line reason
- [ ] No raw hex colors / font names outside the token files
- [ ] No `console.log`, no commented-out code, no leftover `TODO` except `TODO(Pavan)` items listed in the PR
- [ ] New dependencies listed with a reason and their gzip size
- [ ] No secrets, `.env`, `out/`, `data/`, `.DS_Store` committed

## Layout & visual (check each width)
- [ ] 360 px · 390 px · 768 px · 1024 px · 1440 px · phone landscape (844×390)
- [ ] Nothing overflows horizontally; no text clipped; long game titles ellipsize with full title available
- [ ] Images have dimensions; no layout shift when images, fonts, Continue playing or ad slots load
- [ ] Spacing follows the 4 px grid; radii follow the hierarchy (tile 14 / input 12 / sheet 20 / pill)
- [ ] Copy: sentence case, plain words, no all-caps labels, buttons say what they do, errors say what to do next

## Interaction
- [ ] Tap targets ≥ 44 px; nothing important hidden behind hover on touch devices
- [ ] Keyboard-only: every control reachable, focus visible, order logical, `Esc` closes overlays, `/` focuses search
- [ ] Back/forward behave as expected (immersive exit, scroll position restored)
- [ ] Loading, empty, error and offline states designed for every new view
- [ ] `prefers-reduced-motion` respected

## Play experience (when the PR touches games)
- [ ] Home → tile → Play → game running: ≤ 2 taps on a phone
- [ ] iPhone Safari: immersive overlay works, exit button reachable, Back exits
- [ ] Android Chrome: real fullscreen, orientation overlay for landscape games held upright
- [ ] Desktop: theatre mode, `F` fullscreen, page doesn't scroll on Space/arrows while playing
- [ ] Ad blocker on: help message appears after 15 s, page still usable
- [ ] Recently played recorded on iframe load (not on page view)

## Accessibility
- [ ] axe: 0 violations on changed pages
- [ ] One `h1`, logical headings, landmarks present
- [ ] Icon-only buttons have labels; images have meaningful `alt` (game title) or `alt=""` if decorative
- [ ] Contrast: text ≥ 4.5:1, UI borders/icons ≥ 3:1

## Performance
- [ ] Lighthouse mobile on changed page types: Performance ≥ 90, Accessibility 100, Best Practices 100 (≥ 95 once ads run), SEO 100 (attach scores)
- [ ] LCP element is the intended one (cover on game page); no iframe in initial HTML
- [ ] JS added this PR (gzip) stated; home stays ≤ 120 KB

## SEO
- [ ] Unique title (≤ 60) and description (140–160) on new/changed pages
- [ ] Canonical correct (absolute, trailing slash); robots meta matches the index gate
- [ ] JSON-LD validated (Rich Results Test); no ratings/counts that aren't real
- [ ] Sitemap includes only indexable URLs; no orphan pages
- [ ] No third-party brand names in our headings/nav

## Privacy & ads (when relevant)
- [ ] No analytics/ads/Supabase requests before consent where consent is required
- [ ] No ad within 150 px of a game frame; "Advertisement" label shown
- [ ] `/ads.txt` still contains the full GamePix block

## Release
- [ ] Deployed build matches the merged commit (hash noted)
- [ ] Post-deploy checks green: `/`, a game page, `/robots.txt`, `/sitemap.xml`, `/ads.txt` return 200
- [ ] Screenshots (390 px + 1440 px) of every changed page attached
