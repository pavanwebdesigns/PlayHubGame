# Setup — Automatic deploy to Hostinger (do this before Phase 0's deploy step)

**Attach:** `@docs/cursor/01-MASTER-BRIEF.md` `@docs/cursor/setup-auto-deploy.md`
**Size:** half a day · **Rule:** set up deployment only. Don't change app code except the `.htaccess` move in task D3.

## Goal
Every push to `main` builds the site on GitHub and uploads it to Hostinger's `public_html` automatically. No more manual uploads. Live site always equals `main`.

## What we know (checked on 2 Oct 2026)
- Today Pavan builds locally and uploads `dist/` to Hostinger `public_html` by hand. GitHub is only a backup.
- Local git: current branch is **`Sub`** and it holds the real code (last commit `7b69917 added new 6 tools`). `origin/main` points to an old commit (`1a801c9 ads file`, 18 Nov 2025). Uncommitted changes exist (`package.json`, `package-lock.json`, `src/App.tsx`, untracked `PingCheckerPage.tsx`, `QRGeneratorPage.tsx`, `docs/`, `.cursor/`). These local refs may be stale — fetch first.
- Hosting: Hostinger (`platform: hostinger`, CDN `hcdn`). The live HTML may be cached by Hostinger's CDN.
- The repo file `. htaccess` has a space in its name, so it never reaches `dist/`.
- Local Node is v22.

## Tasks

### D1 — Make `main` the production branch (needs Pavan's OK before pushing)
1. `git fetch --all`, then show: commits on `origin/Sub` not on `origin/main`, commits on `origin/main` not on `origin/Sub`, and `git status`.
2. Plan to show Pavan (wait for "OK"):
   - Commit the uncommitted work on `Sub` in two commits: `chore: snapshot current work` (app files) and `docs: add Cursor spec pack` (`docs/`, `.cursor/`).
   - Merge `Sub` into `main` (fast-forward if `main` is an ancestor; otherwise a normal merge and list any conflicts — don't resolve conflicts without asking).
   - Push `main`. Keep `Sub` on GitHub untouched as a backup.
3. From now on: work on feature branches → PR → merge to `main` → auto deploy.

### D2 — CI on pull requests (`.github/workflows/ci.yml`)
- Triggers: `pull_request` to `main`, `workflow_dispatch`.
- Ubuntu latest, `actions/setup-node` with Node 22 and npm cache, `npm ci`, `npm run build`.
- `npm run lint` runs but doesn't fail the job yet (`continue-on-error: true`) — Phase 0 will make lint clean and then we switch it to blocking. Say in the PR how many lint errors exist today.
- If `npm ci` fails because the lockfile is out of sync, stop and tell Pavan; don't silently switch to `npm install`.

### D3 — Ship `.htaccess` with the build
- Move `. htaccess` (with the space) to `public/.htaccess`, **content unchanged** (Phase 0 task 0.8 improves it later). Vite copies `public/` into `dist/`.
- Confirm `dist/.htaccess`, `dist/ads.txt`, `dist/index.html` exist after `npm run build`.

### D4 — Deploy workflow (`.github/workflows/deploy.yml`)
- Triggers: `push` to `main`; `workflow_dispatch` with an optional input `ref` (commit SHA or tag; default `main`) for rollbacks.
- `concurrency: { group: deploy-production, cancel-in-progress: false }` so two deploys never overlap.
- `permissions: contents: read` only.
- Steps:
  1. Checkout `ref`.
  2. Node 22 + `npm ci` + `npm run build`.
  3. **Guard checks** (fail before uploading anything): `dist/index.html` exists; `dist/ads.txt` exists and contains the line `#gpx-property-LC991`; `dist/.htaccess` exists; `dist/` has no `.map` files, `.env`, or `.DS_Store`.
  4. Upload `dist/` with `SamKirkland/FTP-Deploy-Action` **pinned to the full commit SHA of release v4.4.0** (comment the version next to it):
     - `server`, `username`, `password` from secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
     - `server-dir` from secret `FTP_SERVER_DIR` (must end with `/`).
     - `protocol` from repo variable `FTP_PROTOCOL` (default `ftps`; Pavan sets it to `ftp` only if FTPS fails).
     - `local-dir: ./dist/`.
     - Keep the default sync state file (`.ftp-deploy-sync-state.json`). The action only deletes server files it uploaded before, so other files in `public_html` (e.g. `.well-known` for SSL) stay safe. **Never enable `dangerous-clean-slate`.**
     - Make sure `.htaccess` is uploaded (dotfiles are not in the action's default excludes — verify in the dry-run log).
     - `dry-run` controlled by a `workflow_dispatch` boolean input `dry_run` (default `false`). The **first ever run must be a dry run**.
  5. **Smoke test** (after upload): read the main JS file name from `dist/index.html`; request `https://playhubplace.com/` until its HTML references that same file (retry every 15 s for up to 3 min — Hostinger's CDN may cache); request `/ads.txt` (expect 200). If HTML is still old after 3 min, fail with a message telling Pavan to flush the CDN cache in hPanel.
  6. Write a job summary: commit SHA, ref, main JS file name, number of files uploaded/deleted, smoke test result.
- No secrets in logs (`log-level: standard`, never `verbose`).

### D5 — README section "Deploying"
Explain in plain words: merge to `main` = live in a few minutes; how to roll back (Actions → Deploy → Run workflow → `ref` = previous good commit); how to do a dry run; where secrets live; what to do if the smoke test fails (flush CDN cache in hPanel, then re-run).

## What Pavan does (Cursor cannot)
1. hPanel → Websites → playhubplace.com → Files → **FTP Accounts** → create a new FTP account just for GitHub, limited to the site folder (`public_html`). Note the FTP host/IP, username and password.
2. Check in File Manager what that account sees as its root. If the account opens directly in `public_html`, `FTP_SERVER_DIR` is `./`. If it opens one level up, it's `public_html/` (or `domains/playhubplace.com/public_html/`).
3. GitHub → repo → Settings → Secrets and variables → Actions:
   - Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR`.
   - Variables: `FTP_PROTOCOL` = `ftps`.
   Never paste these values into Cursor or any chat.
4. Download a backup of the current `public_html` from File Manager before the first real deploy.
5. Run the deploy once as a dry run (Actions → Deploy → Run workflow → `dry_run` = true) and send the log summary to Claude for review before the first real deploy.

## Acceptance
- [ ] `main` contains all current code; `Sub` untouched on GitHub.
- [ ] Dry-run log lists `index.html`, `.htaccess`, `ads.txt` and the `assets/` files, and deletes nothing.
- [ ] First real deploy: smoke test green; live site loads the new JS file name; `/ads.txt` 200.
- [ ] A test PR shows the CI check; merging it deploys automatically.
- [ ] Rollback tested once with `workflow_dispatch` on the previous commit.
- [ ] No credentials in the repo, workflow files or logs.
