# PlayHubPlace

Free browser games at [playhubplace.com](https://playhubplace.com/). Games are embedded from GamePix. Favorites stay in this browser under `playhub_favorites`. There are no accounts.

This branch (`rebuild/next`) is the Next.js rebuild. It is not live. Merging it to `main` publishes the site, and that cut-over waits until the rebuild is ready.

The previous Vite app was removed at launch. Old game links still redirect, and favorites stay under `playhub_favorites`.

## Scripts

- `npm run dev` — local Next.js site
- `npm run build` — warn on `TODO(Pavan)` (fail only when `GITHUB_REF` is `refs/heads/main`), then static export into `out/`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run format` — Prettier

Search uses [MiniSearch](https://lucaong.github.io/minisearch/) 7.2.0, about 5.8 KB gzip. The search page loads it only after a query, so the home page does not include it.

## Catalog

`npm run catalog` fetches the GamePix feed, checks each game, and writes `data/catalog.json`, `data/curated.json`, `data/search-index.json`, `data/meta.json`, and `public/data/legacy-ids.json`. Those files are gitignored. `npm run build` runs the catalog first.

The build fails when valid games are below `MIN_VALID_GAMES` (10,000) or invalid games are above `MAX_INVALID_RATIO` (1%), both in `config/site.ts`. It then restores the last good catalog from `CATALOG_CACHE_DIR` (Actions cache) or `CATALOG_SNAPSHOT_DIR` (the `catalog-snapshot` branch) and marks `meta.stale`. The snapshot branch holds one commit, `catalog.json.gz`, `meta.json.gz`, and `cover-widths.json.gz`, and is force-pushed after a good build. Force-push is allowed only there. `main` and `deploy` are never force-pushed. A stale build does not replace the snapshot. If neither copy exists, the build stops. A new raw category that is not in `config/taxonomy.ts` also stops the build, so a person maps it.

## Config

Site name, canonical URL, GamePix partner id, catalog thresholds, and the contact address live in `config/site.ts`. `CONTACT_EMAIL` is `info@playhubplace.com`.

## Deploying

Hostinger's Git deployment tracks the branch `deploy`, never `main`. `main` is the source. The Publish workflow builds it and pushes only the built files onto `deploy`.

`publish.yml` runs on `main`, on a nightly schedule at 21:00 UTC, and when someone starts it by hand. GitHub only runs the schedule from the default branch, so the nightly build stays dormant until this file is on `main`. The job builds the catalog, then the Next export. The build id is a hash of the git commit and `data/curated.json`, so an unchanged catalog produces the same files. Publish compares `out/` with `deploy`: no difference means no commit, a home-page-only difference commits just those files, and anything else commits the full diff. The push to `deploy` is not a force-push. The job also replaces `catalog-snapshot` with one gzipped catalog commit. Do not run Publish from `rebuild/next`. That would update the live site.

Merging into `main` runs Publish, and that updates the live site. Hostinger pulls `deploy` from its webhook. Do not point Hostinger at `main`, and do not force-push `deploy`.

The commit on `deploy` from before this rebuild is the tag `pre-rebuild`. Create it once, from the deploy branch, and push the tag:

```bash
git fetch origin deploy
git tag pre-rebuild origin/deploy
git push origin pre-rebuild
```

To roll the live site back, make a new commit on `deploy` that restores that tree, then push it normally. Fetch the tag inside the clone. `--no-overlay` removes files that exist on `deploy` and not in `pre-rebuild`.

The restored Vite tree has no `sw.js`. The new site registers `/sw.js`, and a returning browser would keep that worker. The rollback commit also writes the kill-switch worker to `/sw.js`. That file is `scripts/sw-kill.js` on `main`. It unregisters itself and deletes its caches.

```bash
git clone --branch deploy --single-branch https://github.com/pavanwebdesigns/PlayHubGame.git /tmp/playhub-rollback
git -C /tmp/playhub-rollback fetch origin tag pre-rebuild
git -C /tmp/playhub-rollback restore --source=pre-rebuild --worktree --staged --no-overlay .
git -C /tmp/playhub-rollback fetch origin main
git -C /tmp/playhub-rollback show FETCH_HEAD:scripts/sw-kill.js > /tmp/playhub-rollback/sw.js
git -C /tmp/playhub-rollback add sw.js
git -C /tmp/playhub-rollback commit -m "Restore the site to the pre-rebuild tag"
git -C /tmp/playhub-rollback push origin HEAD:deploy
```

## Branch protection

In GitHub → Settings → Branches, add a rule for `main` and a rule for `deploy`:

- Block force pushes.
- Block deletion.
- On `main`, require a pull request and require the CI status check `Build` before merge.

`public/.htaccess` is copied into the build. It 301s `www.playhubplace.com` to `https://playhubplace.com` and upgrades HTTP only when Apache still sees a plain connection (`HTTPS` is off and `X-Forwarded-Proto` is not `https`). Hostinger already 301s `http://playhubplace.com` to the apex. `http://www` stays two hops until that edge rule changes, because Hostinger upgrades it to `https://www` before this file runs.

Playwright, axe, and Lighthouse CI are devDependencies. They are not part of the site bundle. MiniSearch (7.2.0, about 5.8 KB gzip) loads only on the search page.

## Remove a bad service worker

The site registers `/sw.js` after the page loads. One build uses one cache, named `ph-` plus the build id, and the next build deletes older caches.

To take the worker off every browser, build once with `PH_SW_KILL=1`. That writes `scripts/sw-kill.js` to `out/sw.js`. The replacement unregisters itself and deletes the caches. Deploy that `out/` the same way as any other build. The following build can omit `PH_SW_KILL` and a normal worker returns.

## Search Console, after launch

These steps are done in the accounts, not in the repo:

1. In Google Search Console, add `https://playhubplace.com/` and verify it with a DNS TXT record at Hostinger.
2. Submit `https://playhubplace.com/sitemap.xml`.
3. Inspect the home page and the first 10 game pages that have a published write-up, and request indexing.
4. In Bing Webmaster Tools, import the site from Search Console.
5. Optional: connect Search Console to Looker Studio for impressions, clicks, CTR, and indexed pages.
6. In Google's Rich Results Test, open Code mode and paste the built HTML of the home page, one published game page, and one category page. Breadcrumbs should be valid. A game page will not earn a SoftwareApplication rich result, because we do not publish ratings. That is accepted. Do not add ratings to make the test pass.

A main build refuses to publish while `content/pages/home.mdx` is still `draft`, because the home page is indexed. Other drafts are listed in the job summary and stay `noindex`. See `docs/CONTENT-GUIDE.md`.

## Dry run (2 Oct 2026)

Local `npm run build`, then one more `next build` after the favicon was added. Next did not print per-page timings, so the five slowest pages are not available.

- `out/`: 9,529 files, 108,035,071 bytes
- Home JS gzip for scripts a current browser downloads started at 134,029 bytes. The budget is 135 KB (138,240 bytes). A pull request that grows past 139,149 bytes needs a `home-js:` note. The catalog and MiniSearch are not in that graph. The HTML also references a `nomodule` polyfill of 39,627 bytes gzip, which current browsers skip.
- Largest JS chunks, gzip: 71,576 bytes, 43,884 bytes, 39,627 bytes (`nomodule`), 9,030 bytes, 3,849 bytes
- Lighthouse mobile, one run: home 100 / 100 / 100 / 100. `/game/prism-match-3d/` 98 / 100 / 100 / 69. `/search/` 99 / 100 / 100 / 66. `/category/puzzle/` 99 / 100 / 100 / 66. Order is performance, accessibility, best practices, SEO. CLS was 0 on each. The SEO scores under 100 are the noindex rule: a game, category, or collection page stays out of the index until its content file exists. Search is noindex on purpose.
