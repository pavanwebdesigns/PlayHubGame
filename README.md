# PlayHubPlace

Free browser games at [playhubplace.com](https://playhubplace.com/). Games are embedded from GamePix. Favorites stay in this browser under `playhub_favorites`. There are no accounts.

This branch (`rebuild/next`) is the Next.js rebuild. It is not live. Merging it to `main` publishes the site, and that cut-over waits until the rebuild is ready.

The previous Vite app is in `legacy/`. It is not part of the Next build. Delete it at launch.

## Scripts

- `npm run dev` — local Next.js site
- `npm run build` — warn on `TODO(Pavan)` (fail only when `GITHUB_REF` is `refs/heads/main`), then static export into `out/`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run format` — Prettier

Search uses [MiniSearch](https://lucaong.github.io/minisearch/) 7.2.0, about 5.8 KB gzip. The search page loads it only after a query, so the home page does not include it.

## Catalog

`npm run catalog` fetches the GamePix feed, checks each game, and writes `data/catalog.json`, `data/curated.json`, `data/search-index.json`, `data/meta.json`, and `public/data/legacy-ids.json`. Those files are gitignored. `npm run build` runs the catalog first.

The build fails when valid games are below `MIN_VALID_GAMES` (10,000) or invalid games are above `MAX_INVALID_RATIO` (1%), both in `config/site.ts`. It then restores the last good catalog from `CATALOG_CACHE_DIR` (Actions cache) or `CATALOG_SNAPSHOT_DIR` (the `catalog-snapshot` branch) and marks `meta.stale`. The snapshot branch holds one commit, `catalog.json.gz` and `meta.json.gz`, and is force-pushed after a good build. Force-push is allowed only there. `main` and `deploy` are never force-pushed. A stale build does not replace the snapshot. If neither copy exists, the build stops. A new raw category that is not in `config/taxonomy.ts` also stops the build, so a person maps it.

## Config

Site name, canonical URL, GamePix partner id, catalog thresholds, and the contact address live in `config/site.ts`. `CONTACT_EMAIL` is `TODO(Pavan)` until a real address is published.

## Deploying

Hostinger's Git deployment tracks the branch `deploy`, never `main`. `main` is the source. The Publish workflow builds it and pushes only the built files onto `deploy`.

`publish.yml` runs on `main`, on a nightly schedule at 21:00 UTC, and when someone starts it by hand. GitHub only runs the schedule from the default branch, so the nightly build stays dormant until this file is on `main`. The job builds the catalog, then the Next export, commits `out/` onto `deploy` with a normal push, and replaces `catalog-snapshot` with one gzipped catalog commit. Do not run Publish from `rebuild/next`. That would update the live site.

Merging into `main` runs Publish, and that updates the live site. Hostinger pulls `deploy` from its webhook. To roll back, open Actions → Publish → Run workflow and set `ref` to the last good commit on `main`. Do not point Hostinger at `main`, and do not force-push `deploy`.

`public/.htaccess` is copied into the build. It 301s `www.playhubplace.com` to `https://playhubplace.com` and upgrades HTTP only when Apache still sees a plain connection (`HTTPS` is off and `X-Forwarded-Proto` is not `https`). Hostinger already 301s `http://playhubplace.com` to the apex. `http://www` stays two hops until that edge rule changes, because Hostinger upgrades it to `https://www` before this file runs.

Playwright, axe, and Lighthouse CI are devDependencies. They are not part of the site bundle. MiniSearch (7.2.0, about 5.8 KB gzip) loads only on the search page.

## Dry run (2 Oct 2026)

Local `npm run build`, then one more `next build` after the favicon was added. Next did not print per-page timings, so the five slowest pages are not available.

- `out/`: 9,529 files, 108,035,071 bytes
- Home JS gzip for scripts a current browser downloads: 134,029 bytes. The budget is 120 KB (122,880 bytes). The extra weight is React DOM and the Next.js app-router runtime. The catalog and MiniSearch are not in that graph. The HTML also references a `nomodule` polyfill of 39,627 bytes gzip, which current browsers skip.
- Largest JS chunks, gzip: 71,576 bytes, 43,884 bytes, 39,627 bytes (`nomodule`), 9,030 bytes, 3,849 bytes
- Lighthouse mobile, one run: home 100 / 100 / 100 / 100. `/game/prism-match-3d/` 98 / 100 / 100 / 69. `/search/` 99 / 100 / 100 / 66. `/category/puzzle/` 99 / 100 / 100 / 66. Order is performance, accessibility, best practices, SEO. CLS was 0 on each. The SEO scores under 100 are the noindex rule: a game, category, or collection page stays out of the index until its content file exists. Search is noindex on purpose.
