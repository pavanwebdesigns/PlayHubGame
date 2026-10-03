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
