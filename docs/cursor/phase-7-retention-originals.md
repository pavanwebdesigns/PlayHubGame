# Phase 7 — Bring players back: live stats, likes, trending, originals

**Attach:** `@docs/cursor/01-MASTER-BRIEF.md` `@docs/cursor/phase-7-retention-originals.md`
**Branch:** `feat/retention` · **Start only when:** the site is live and GA4 shows real traffic (so trending isn't built on zero data).

## Goal
Give players reasons to return — what's hot today, their own streaks and bests — using **real** numbers only, and grow content we own.

## 7.1 Anonymous stats backend (Supabase)
- Pavan creates the Supabase project (free tier) and adds the URL + anon key to GitHub Secrets / env. Cursor never sees or commits the service-role key.
- Tables: `game_stats(slug pk, plays int, likes int, dislikes int, updated_at)`, `votes(device_id uuid, slug, vote smallint, created_at, primary key(device_id, slug))`, `plays_daily(slug, day, country char(2), plays)`.
- Writes only through Postgres functions (`record_play(slug, device_id)`, `cast_vote(slug, device_id, vote)`) with row-level security on, per-device rate limits (e.g. 1 play per slug per 10 min, votes changeable), and slug validation against an allowlist table refreshed by the build.
- `device_id` = random UUID in `localStorage` (no fingerprinting, no IP storage). Document it on the Privacy page.
- Client calls are fire-and-forget, never block play, and are skipped if analytics consent is denied.

## 7.2 What players see
- Like / dislike on the game page action bar (toggle, optimistic UI, toast).
- Show counts only once a game has ≥ 50 votes ("92 % liked it · 1.2K votes"); below that show nothing — no "0 likes".
- **Trending today** row on home — computed at the nightly build from `plays_daily`, refreshed client-side every 15 min.
- **Top games in your country today** (like CrazyGames' "Top games in India today"): `record_play` runs through a Supabase Edge Function that reads the visitor's country at request time and stores only the 2-letter country code in `plays_daily` — never the IP. Show the row only for countries with enough plays that day (≥ 200).
- `aggregateRating` JSON-LD only if we add real 1–5 star ratings and a game has ≥ 50 of them. Likes/dislikes are never converted into stars.

## 7.3 Habits
- **Daily challenge**: one game per day (from `config/daily.ts`), a banner on home, a check mark in My games when played. Share card: "I played today's PlayHubPlace challenge" + link (no score claims we can't verify).
- **Streaks** (local): days in a row with at least one game; shown in My games; gentle, no guilt copy.
- **Originals personal bests**: CPS and reaction results history + best, shareable result image (canvas → PNG, our colors).

## 7.4 More originals (each is our own content and can rank)
Same quality bar as Phase 3.7, one per PR: Typing speed test, Aim trainer, Memory sequence, Number trail. Later, the brain-training games from the separate R&D catalog can live in a `/brain-games/` section — scope it in its own brief.

## Acceptance
- [ ] Hammering `record_play` from one device is rate-limited; votes can't be cast for unknown slugs; RLS blocks direct table writes (tests in `supabase/tests`).
- [ ] With consent denied, no Supabase request is made.
- [ ] No count, rating or trending list ever shows invented or placeholder numbers.
- [ ] Trending row updates within 15 min of plays in a staging test.
