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

## Config

Site name, canonical URL, GamePix partner id, catalog thresholds, and the contact address live in `config/site.ts`. `CONTACT_EMAIL` is `TODO(Pavan)` until a real address is published.

## Deploying

Hostinger's Git deployment tracks the branch `deploy`, never `main`. `main` is the source. The Publish workflow builds it and pushes only the built files onto `deploy`.

The workflow on `main` still publishes the Vite `dist/` from the last release. This branch builds Next.js into `out/`. Publish is switched to `out/` in task 1.7, before any merge to `main`. Do not run Publish from `rebuild/next`.

Merging into `main` runs Publish, and that updates the live site. Hostinger pulls `deploy` from its webhook. To roll back, open Actions → Publish → Run workflow and set `ref` to the last good commit on `main`. Do not point Hostinger at `main`, and do not force-push `deploy`.

`public/.htaccess` is copied into the build. It does not add an HTTPS redirect yet. `http://playhubplace.com` already 301s to the apex. `https://www.playhubplace.com/` still returns 200, so the www host gets a redirect in task 1.5.
