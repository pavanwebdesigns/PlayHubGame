# Start here — how to run this with Cursor

This folder is the full spec for taking playhubplace.com to the next level. Claude wrote it as the architect; Cursor builds it; you (Pavan) approve each step.

## What's in the pack
| File | What it's for |
|---|---|
| `.cursor/rules/playhub.mdc` | Always-on rules Cursor reads in every chat (standards, tokens, never-do list) |
| `01-MASTER-BRIEF.md` | The why: audit findings, competitor research, data facts, architecture, design system, UX rules, SEO, ads/legal |
| `setup-auto-deploy.md` | Half a day — `main` becomes the production branch; every merge to `main` builds and uploads to Hostinger automatically |
| `phase-0-hotfix.md` | 1 day — fix the live site's worst bugs on the current Vite app |
| `phase-1-foundation.md` | Next.js static site, GamePix data pipeline, real URLs, CI/CD to Hostinger |
| `phase-2-design-system.md` | Colors, fonts, components, layout, private component gallery |
| `phase-3-pages-and-play.md` | Home, game page, immersive play on phones, categories, search, My games, Originals |
| `phase-4-seo-content.md` | Metadata, structured data, sitemaps, index gate, content system + writing guide |
| `phase-5-performance-a11y-analytics.md` | Speed budgets, accessibility, GA4 events, PWA/offline |
| `phase-6-ads-consent-legal.md` | AdSense (after content), consent banner, ads.txt, privacy posture |
| `phase-7-retention-originals.md` | Real likes/plays, trending, daily challenge, streaks, more Originals |
| `QA-CHECKLIST.md` | Paste into every PR and tick honestly |

## Order
Auto-deploy setup → Phase 0 → 1 → 2 → 3 → 4 → 5 → **launch** (switch Hostinger to the new `out/` build) → write content weekly → 6 → 7.
Don't start a phase until the previous one passes its acceptance list.

## How to run each phase in Cursor
1. New Agent chat. Attach `@docs/cursor/01-MASTER-BRIEF.md` and the phase file.
2. Paste the kickoff prompt below (change the phase name).
3. Read Cursor's plan. Approve or correct it. Only then let it code.
4. Let it work task by task; it commits each one.
5. At the end, Cursor fills `QA-CHECKLIST.md` in the PR. Check the screenshots yourself on your phone.
6. Paste Cursor's final report back to Claude for an architect review before merging.

### Kickoff prompt (copy, paste, change the phase)
```
You are the senior developer on PlayHubPlace. Read @docs/cursor/01-MASTER-BRIEF.md and @docs/cursor/phase-0-hotfix.md completely, then read every source file the phase touches.

Before writing any code, reply with:
1. Your plan per task: files to change/create, approach, risks.
2. Anything in the spec that conflicts with the code or seems wrong.
3. Questions you need answered.

Then stop and wait for my approval. After approval, do one task at a time, commit each with a conventional commit message, and at the end give me the report the phase file asks for plus a filled QA-CHECKLIST. Quality bar: production-grade, no shortcuts, no invented content or numbers. If something can't meet the spec, tell me instead of working around it.
```

## Decisions Claude made for you (say if you want any changed)
1. **Next.js static export on your existing Hostinger** — no new hosting cost.
2. **~1,600 curated game pages instead of all 13,904**, and only pages with your own written content get indexed by Google. This is what keeps the site safe from Google's "scaled content abuse" policy and makes AdSense approval realistic.
3. **General tools move to workutilities.com**; PlayHub keeps only game-like tools (CPS test, Reaction time test) as "PlayHub Originals".
4. **Dark "arcade at night" design** built from your logo colors, with a readable text font (Anek, which also has Telugu and Hindi versions for later) and Jersey 15 kept for big headings.
5. **No accounts and no fake numbers** — likes/trending only from real data in Phase 7.

## What only you can do (Cursor will leave `TODO(Pavan)`)
Deploys from `main` are blocked by CI while any `TODO(Pavan)` is unfilled — on purpose, so the live site never shows a placeholder.

- [ ] Contact email for the site (`CONTACT_EMAIL`).
- [ ] A dedicated Hostinger FTP account for GitHub → add as GitHub Secrets yourself (steps in `setup-auto-deploy.md`). Never paste them into Cursor chat.
- [ ] Workutilities.com URLs for each moved tool (`config/legacy-tools.ts`).
- [ ] Daily Spotlight picks list (`config/spotlight.ts`) — 30 games you like.
- [ ] Play games and give notes for the content pages (Phase 4) — this is the most important growth work.
- [ ] Confirm with GamePix that your own ads around their games are allowed (before Phase 6).
- [ ] Google Search Console, AdSense, Supabase accounts when the phases need them.
- [ ] Legal review of Privacy/Terms before AdSense.
