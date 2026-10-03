# QA checklist — Phase 4 (`feat/seo-content` → `rebuild/next`)

Filled after the local `out/` build and the preview deploy of `0808b4b`. ✅ means it was actually checked. ➖ means it does not apply. ❌ means it was not checked, or it failed.

## Build & code
- [x] `npm test` (57 tests), `npm run lint`, and `npm run build` pass locally. The Next build's TypeScript step passed. Preview workflow `37105268720` succeeded.
- [x] Home JS gzip is 137,047 bytes. The ceiling is 138,240. The growth limit was not applied, because this went to `rebuild/next` directly.
- [x] No new runtime dependency. Cover measurement uses the image header already parsed in the repo.
- [x] No secrets, `.env`, `out/`, or `data/` are committed. Generated `public/sitemap*.xml` files are gitignored.
- [x] `sid=LC991` is still on embed URLs. `ads.txt` was not edited.

## SEO
- [x] `node scripts/audit-seo.mjs`: `audited=45 pages=2360 sitemap=7 warnings=39 errors=0`. Every real page has a canonical. Indexable self-canonical titles and descriptions are unique. Every sitemap URL is in `out/`, indexable, and not paginated. No orphan indexable pages. Next's not-found document is skipped because it is already `noindex`.
- [x] The 39 warnings are `/new/` and its page URLs. Those descriptions are shorter than 140 characters. Listing files are warnings. Game files outside 140–160 would fail the build.
- [x] Sitemap index points at `sitemap-pages.xml`, `sitemap-categories.xml`, and `sitemap-games.xml` with no trailing slash. Paginated, sort, and tag URLs are absent. Draft games are absent. `robots.txt` disallows `/search/`, `/my-games/`, and `/dev/`.
- [x] Local Lighthouse mobile SEO: home 100. `/game/prism-match-3d/` 69 and `/category/puzzle/` 69, both only on `is-crawlable`, because those pages are still draft and send `noindex`. Preview SEO will be lower on every URL because the preview host is `noindex` on purpose.
- [x] Home JSON-LD is Organization (logo `https://playhubplace.com/logo.png`, file is 512×512 in `public/logo.png`) plus WebSite, and a separate FAQPage from the visible home FAQ. WebSite has no SearchAction.
- [x] Game JSON-LD is VideoGame + SoftwareApplication and BreadcrumbList. Description is included only when the MDX summary exists. The three scaffolds have a facts-only summary, so that sentence is present. Publisher text is not used. FAQPage is omitted because those scaffolds have an empty FAQ.
- [x] Category JSON-LD is CollectionPage, ItemList (first 24), and BreadcrumbList.
- [➖] Google's Rich Results Test was not run on the preview host. Preview `robots.txt` is `Disallow: /`, so Google cannot fetch it. The graphs above were read from the local `out/` HTML.

## Content
- [x] `content/games/prism-match-3d.mdx`, `drop-planets.mdx`, and `memory-cards.mdx` are `status: draft` scaffolds. Body sections are empty. The publisher description is not in the body.
- [x] `docs/CONTENT-GUIDE.md` and `/dev/content` exist. `/dev/ui` and `/dev/content` are built only when `PH_MAIN_BUILD` is unset. Preview keeps them `noindex` and unlinked. A main build omits them.
- [x] Indexable games: 0 of 1,862. Home is still draft, so a main build fails until that copy is reviewed. Other drafts are listed as a warning only on main builds.
- [x] No ratings, play counts, quotes, or developer names were invented.

## Layout
- [x] Side-rail labels do not wrap. At 1024 px the rail is 64 px and labels are clipped to the icon. At 1280 px and 1440 px the rail is 240 px, labels are `nowrap`, and each label has one line box. Playwright screenshots: `tests/e2e/screenshots/rail-1024.png`, `rail-1280.png`, `rail-1440.png`. The same widths were checked in the browser on the local `out/` build.
- [x] A loaded cover hides the tile title (`visibility: hidden` on `.cover-fallback`). Firing the cover error hides the image and shows the title. Checked on the home spotlight in the browser.
- [➖] A full pass at 360, 390, 768, and phone landscape was not repeated in this phase. Those widths were checked in Phase 3.

## Performance
- [x] Preview Lighthouse mobile, 3 runs, median. Transferred JS is every script response, not only the home bundle.

| Page | Score | LCP | LCP element | CLS | TBT | Transferred JS |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| `/` | 89 | 3.71 s | Knife Smash cover (`w=480`) | 0 | 11 ms | 139,223 |
| `/game/prism-match-3d/` | 97 | 2.52 s | Prism Match 3D cover (`w=640`) | 0.00016 | 10 ms | 145,061 |
| `/category/puzzle/` | 94 | 2.96 s | a puzzle cover | 0 | 19 ms | 138,588 |

- [x] Home's median score is 89. One of the three runs was 90. The LCP element is the spotlight cover from the GamePix CDN.
- [x] Cover widths were read from the original file, with no `w` parameter. GamePix upscales when `w` is larger than the file. Curated covers: 1,862 measured, 0 failed, 0 under 480 px. Minimum 766, median 1,360, maximum 2,720. Knife Smash's original file is 1,400×861. A request with `w=480` returns 480×295. A request with `w=4096` is upscaled to 4,096 and is not used.

## Play & privacy
- [➖] Click-to-play, favorites, and the 150 px ad gap were not changed in this phase.
- [➖] No new analytics or ad script. Consent behavior is unchanged.

# QA checklist — Phase 5 (`feat/quality` → `rebuild/next`)

Filled from the local `out/` build on 3 Oct 2026. ✅ means it was actually checked.

## Build & code
- [x] `npm run build` passes, including the service worker step (19 precache URLs, no `/game/` page). Vitest covers the pick merge, the legacy favorites key, analytics consent, and the install prompt. Playwright covers cover sizes (5 layouts), tile save, prefetch, smoke, and the offline CPS test.
- [x] Home JS gzip is 137,192 bytes. The checker ceiling is that same number. React DOM is 71,628, the Next runtime chunks are 48,513 and 5,864, and Turbopack is 3,836. The analytics boot is not a home script tag. It loads with a dynamic import only after consent.
- [x] New runtime dependency: `web-vitals` 6.2.2, loaded only after analytics consent. No secrets, `out/`, or `data/` committed. `sid=LC991` was not edited.

## Performance
- [x] Default mobile Lighthouse (Moto G Power, simulated throttling), 3 runs, median, on preview after the HTML shrink. Home 88 / LCP 3.61 s / CLS 0. Game prism-match-3d 93 / 3.23 s / CLS 0. Category puzzle 89 / 3.72 s / CLS 0. Accessibility 100. "Properly size images" waste is 0 bytes.
- [x] After self-hosting today's Spotlight cover, the same home run is 88 / LCP 3.60 s / CLS 0. The LCP element is `/spotlight/nova-hop-800.avif` (about 30 KB, `image/avif`). Render delay is still about 71% of LCP. The 2.5 s budget is not met.
- [x] Today's picks: phone still shows the same 23 one-thumb games, desktop the same 21, in the same order. CLS 0 at 390 and 1440. Screenshots in `tests/e2e/screenshots/picks-before-*.png` and `picks-after-*.png`.
- [x] Tile hearts are real buttons. Saving and removing uses `playhub_favorites`. A blocked `localStorage` shows "Saving is not available in this browser."
- [x] Offline: after the worker activates, airplane mode still opens the CPS test and shows Start. Precache is 19 URLs and includes no `/game/` page.

## Not checked here
- [x] axe in Playwright on every public page type: 16 pages, mobile and desktop, 0 violations.
- [ ] VoiceOver or TalkBack. Those stay on the phone checklist.
- [x] `@next/bundle-analyzer` does not apply. `next build` is Turbopack, and that package is the Webpack plugin. The home script table is the gzip of the script tags the checker counts.

# QA checklist — Launch (`rebuild/next` → `main`)

Filled on 3 Oct 2026 before the pull request. Live checks wait until this merges and Publish runs.

## Build & code
- [x] `npm run lint`, `npm run typecheck`, and `npm test` (72 tests) pass after `legacy/` was removed. `npm run build` completed: 2,362 pages, home JS gzip 137,157 (ceiling 137,192).
- [x] `GITHUB_REF=refs/heads/main` `check-todos` exits 0. `PH_MAIN_BUILD=1` `report-index` exits 0. Home is published. Other drafts stay noindex. Indexable games: 0 of 1,862.
- [x] No new dependency. The Next `package.json` had no package that only the Vite app used.
- [x] `sid=LC991` was not edited. `out/ads.txt` still contains `#gpx-property-LC991`. HTML cache stays `no-cache`.

## Content
- [x] `content/pages/home.mdx` is the approved About and FAQ, `status: published`. The meta description is unchanged. The built home page has the same four questions in the visible headings and in the FAQPage JSON-LD.
- [x] `CONTACT_EMAIL` is `info@playhubplace.com` on Contact, Privacy, and Report a problem.

## Not checked here
- [ ] Playwright and Lighthouse on this commit. CI runs both on the pull request.
- [ ] The live smoke test, response headers, service worker, and favorites migration. Those run after Publish.
