# PlayHubPlace

Free browser games at [playhubplace.com](https://playhubplace.com/). The site is a Vite + React app. Games are embedded from GamePix. Favorites stay in this browser. There are no accounts.

Phase 0 is this Vite app. The Next.js rebuild is a later phase.

## Scripts

- `npm run dev` — local site
- `npm run build` — typecheck and production build into `dist/`
- `npm run lint` — ESLint
- `npm test` — unit tests (`node:test`, no extra test runner)
- `npm run preview` — serve the production build

## Config

Site name, canonical URL, default title, and the contact address live in `src/config/site.ts`. `CONTACT_EMAIL` is `TODO(Pavan)` until a real address is published. The contact page does not show a mailto link while that sentinel is in place.

## Deploying

Hostinger's Git deployment must track the branch `deploy`, never `main`. `main` is the source code. The Publish workflow builds it and pushes only the built files onto `deploy`.

Merging into `main` runs Publish, and that updates the live site. Hostinger pulls `deploy` from its webhook. The live site should update within a few minutes. Each publish adds a normal commit when the built files changed, and that commit removes old hashed files so the pull deletes them on the server. If the build matches `deploy` already, Publish skips the commit.

To roll back, open Actions → Publish → Run workflow and set `ref` to the last good commit on `main`. That rebuilds the commit and pushes it to `deploy`. Do not point Hostinger at `main`, and do not force-push `deploy`.

If the smoke test still sees the old page after 5 minutes, confirm hPanel is set to branch `deploy`, flush the CDN cache, then re-run Publish.

`public/.htaccess` is copied into the build. The next publish replaces the server `.htaccess`. It keeps the SPA fallback, caches `/assets/*`, and denies source files (`package.json`, `src/`, `docs/`, `.cursor/`, `*.ts`, `*.tsx`, `*.md`) if they ever appear in the web root. It does not add an HTTPS redirect.
