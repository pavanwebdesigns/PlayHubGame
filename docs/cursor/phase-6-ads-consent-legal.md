# Phase 6 — Ads, consent and legal

**Attach:** `@docs/cursor/01-MASTER-BRIEF.md` `@docs/cursor/phase-6-ads-consent-legal.md`
**Branch:** `feat/monetization` · **Start only when:** the new site is live, ≥ 50 game pages are published with original content, category intros exist, and trust pages have been reviewed. AdSense rejects portals made only of embedded third-party games ("low value content"), so applying early wastes the attempt.

## Pavan does first (accounts — Cursor can't)
1. Confirm in the GamePix partner dashboard (or by email to GamePix) that showing our own display ads on pages around their embeds is allowed, and whether they need any ads.txt changes.
2. Apply to AdSense with playhubplace.com once the conditions above are met; get the publisher id (`pub-…`).
3. In AdSense → Privacy & messaging: create the European regulations message (Google-certified CMP — required for personalized ads in the EEA/UK since 16 Jan 2024 and Switzerland since 31 Jul 2024) and, optionally, the US state regulations message.
4. Get a lawyer (or a reputable generator + lawyer review) to finalize Privacy, Cookies and Terms text.

## 6.1 ads.txt
- Keep every existing GamePix line **byte-for-byte** (header comments `#gpx-property-LC991` etc. included).
- Add our line at the top: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` from `config/site.ts` (`ADSENSE_PUB_ID`).
- Build check: served at `/ads.txt`, 200, `text/plain`, contains both our line and the GamePix block.

## 6.2 Consent first, then scripts
- Load order on every page: Google CMP (Privacy & messaging) → Consent Mode v2 defaults (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` = `denied` where required) → GA4 → AdSense. Use `next/script` with the right strategies; nothing ad-related blocks first paint.
- `lib/analytics.ts` (Phase 5) listens to consent updates.
- "Cookie settings" link in the footer reopens the CMP.

## 6.3 Ad placements (manual units; design decides, not "auto")
| Page | Placement | Rules |
|---|---|---|
| Game (desktop) | Sidebar rectangle (300×250 / 300×600) under the Play next rail | Nearest-edge distance between the ad's box and the game frame's box ≥ 150 px at every viewport size; if the rail is short enough to bring it closer, the ad moves below; not sticky |
| Game (desktop + phone) | Leaderboard/responsive below the action bar | ≥ 150 px below the game frame; reserved height from AdSlot (no CLS) |
| Game (phone, immersive) | **None** | Nothing over or near a running game |
| Home | One responsive in-feed unit after the 3rd row | Never inside Today's picks grid |
| Category / collection | One unit after the first 24 tiles | — |
| Originals | One unit below the result screen | Never near the test's click area |
- Auto ads: off, except optionally the **vignette** format (Google-managed, between page loads). Anchor ads **off** on game pages (they cover game controls on phones).
- Never place an ad near Play, Up next or tile links; never style ads like tiles; always the "Advertisement" label.
- CSP: move from report-only to enforced, adding the exact AdSense/CMP/GA4 domains reported during testing.

## 6.4 Children and privacy posture
- General-audience site: no "for kids" sections or marketing. If a page is clearly child-directed later, tag it for child-directed treatment (non-personalized ads only).
- India DPDP Rules (most obligations apply from 13 May 2027): no accounts, no user-level tracking, no personal data collection until a lawyer signs off on a children's-data plan (verifiable parental consent, no behavioural monitoring or targeted ads to children).
- Privacy page lists exactly what we store: favorites and recently played in the player's own browser; analytics and ads cookies only with consent; GamePix and Google as third parties with links to their policies.

## Acceptance
- [ ] With an EEA VPN: the CMP appears first; declining → no personalized ads, GA4 in consent-denied mode.
- [ ] No ad within 150 px of a game frame at 390, 768, 1024, 1440 px (Playwright measures bounding boxes; test fails if closer).
- [ ] CLS ≤ 0.05 with ads on; Lighthouse performance still ≥ 90 on the game page.
- [ ] `/ads.txt` check passes; AdSense reports no ads.txt issue after 48 h.
- [ ] Legal pages show the review date and no "Draft" markers.
