# Phase 2 — Design system and components

**Attach:** `@docs/cursor/01-MASTER-BRIEF.md` `@docs/cursor/phase-2-design-system.md`
**Branch:** `feat/design-system` → into `rebuild/next` · **Size:** 3–4 days

## Goal
One coherent visual language (brief §7) built as reusable, accessible components, with a private gallery page that shows every component in every state. Pages in Phase 3 are assembled only from these parts.

## Before you start
Propose the component list with file paths and props, and screenshot the empty gallery route. Wait for my OK.

## Tasks

### 2.1 Tokens and base
- `app/globals.css`: all color tokens from brief §7 as CSS variables, mapped into Tailwind v4 `@theme` (`bg-night`, `text-ink`, `text-ink-muted`, `bg-play`, …). No raw hex values anywhere else in the codebase (lint rule or grep check in CI).
- Fonts via `next/font/google`: Anek Latin variable (weights 400–700, width axis on) as `--font-text`; Jersey 15 as `--font-display`. `display: 'swap'`, `adjustFontFallback` on. Only Latin subsets now.
- Type scale, spacing (4 px grid), radii (tile 14, input 12, sheet 20, pill 999), z-index scale, focus ring (`2px solid var(--play)`, 2 px offset, visible on every interactive element, never removed).
- Global: `color-scheme: dark`, `-webkit-tap-highlight-color: transparent` (we draw our own pressed state), `prefers-reduced-motion` turns off transitions/animations.

### 2.2 Primitives (`components/ui/`)
Each: typed props, `forwardRef` where it wraps a native element, all states (default, hover, focus-visible, pressed, disabled, loading), keyboard support, unit-free sizes from tokens.
- **Button** — variants `play` (filled `--play`, text `--night`), `secondary` (`--raised`), `ghost`; sizes md (44 px) / lg (52 px); optional leading icon; loading shows a spinner and keeps width.
- **IconButton** — 44×44 hit area, required `label` prop (becomes `aria-label` + tooltip on desktop).
- **Chip** — filter/category pill with selected state (`aria-pressed`).
- **SearchField** — `/` shortcut hint on desktop, clear button, `--edge` border, results announced via `aria-live="polite"`.
- **Sheet** (mobile bottom sheet) and **Dialog** (desktop) — focus trap, `Esc`, scroll lock, return focus, swipe-down to close on touch.
- **Toast** — one at a time, `role="status"`, 3 s, pauses on hover.
- **Skeleton** — takes exact final dimensions.
- **AdSlot** — reserves `minHeight`/`minWidth`, label "Advertisement", renders nothing until Phase 6 (but layout space is decided now so ads never shift content).
- **Prose** — styles for our MDX content (68ch, heading rhythm, tables for controls, lists).

### 2.3 Game components (`components/game/`)
- **GameTile** — sizes `xl` (2×2), `lg` (2×1), `md` (1×1), `row` (horizontal scroller item). Cover via `next/image` with the GamePix loader, real aspect ratio from `data/meta.json`, `alt` = game title. Title below the art (one line, ellipsis, full title in `title` attribute). On hover/focus (desktop): lift 2 px + play outline, hub name appears. No badges at rest except "New" (published ≤ 7 days, `--spark` dot + text) and the favorite heart if favorited. Image error → local placeholder with the title set in Jersey 15.
- **TileGrid** — CSS grid, `grid-auto-flow: dense`, columns: 2 (≤ 480), 3 (≤ 768), 4 (≤ 1024), 6 (≤ 1440), 8 (> 1440). Tile size pattern comes from props, not random.
- **Row** — horizontal scroller: CSS scroll-snap, keyboard arrows move by one tile, desktop prev/next buttons appear only when overflow exists, "See all" link to the collection page.
- **Spotlight** — the one signature element: large cover, title in Jersey 15, one-line pitch, Play button; `--marquee` gradient frame whose light sweeps once on load (≈1.2 s, `prefers-reduced-motion` → static frame).
- **CategoryCard** — lucide icon + hub name + game count.

### 2.4 Layout (`components/layout/`)
```
Mobile (≤ 767)                           Desktop (≥ 1024)
┌──────────────────────────┐            ┌────┬──────────────────────────────────────┐
│ logo        [search icon]│  top bar   │rail│ logo   [ search games…        / ]  ♥ │
├──────────────────────────┤            │ ⌂  ├──────────────────────────────────────┤
│                          │            │ ✦  │                                      │
│          content         │            │ ⧉  │               content                │
│                          │            │ ♥  │                                      │
├──────────────────────────┤            │ …  │                                      │
│ Home  Categories Search ♥│  bottom    │    ├──────────────────────────────────────┤
└──────────────────────────┘  nav       │    │ footer                               │
```
- **TopBar** sticky, 56 px mobile / 64 px desktop, hides on scroll down and returns on scroll up (mobile only).
- **BottomNav** (mobile/tablet < 1024): Home, Categories (opens Sheet with hubs + collections), Search, My games. Active state not color-only (icon fill + label weight). Respects iOS safe-area inset.
- **SideRail** (≥ 1024): icon + label for Home, New, collections, hubs; collapsible to icons only; state remembered in `localStorage` (try/catch), read after mount so server and client HTML match (no hydration warning, no jump — default expanded).
- **Footer**: About, Contact, Privacy, Cookies, Terms, Report a game; one honest line: "Most games on PlayHubPlace are provided by GamePix." (update it if we add other sources) Copyright year from build time.
- Skip-to-content link as the first focusable element.

### 2.5 Gallery
`app/dev/ui/page.tsx` shows every component in every state at mobile and desktop widths. Excluded from the sitemap, `noindex`, and not linked anywhere. Use it to screenshot-review this phase.

## Acceptance
- [ ] No hex color, font-family or px radius outside `globals.css`/tokens (CI grep).
- [ ] Every interactive element: visible focus, 44 px target, keyboard operable — verified on the gallery page with keyboard only.
- [ ] axe: 0 violations on the gallery page.
- [ ] Text contrast ≥ 4.5:1, UI borders ≥ 3:1 (values in brief §7).
- [ ] Reduced-motion on: Spotlight frame static, no transitions.
- [ ] Screenshots of the gallery at 390 px and 1440 px attached to the PR.

## Don't
Don't add shadows at rest, gradients anywhere except the Spotlight frame, all-caps labels, emoji as icons, a light theme, or a second icon set.
