# Writing a game page

Play the game for at least 10 minutes before you write. Write what you saw: the goal, the controls, what gets hard, and a tip that isn't obvious.

300–600 words. Plain English, short sentences, second person ("you").

Don't paste or rephrase the GamePix description. Don't claim things you didn't see (a level count, the developer, a release year) unless the game shows them.

AI tools may help you draft, but you must play-test and edit every line. Google's spam policy calls mass-generated pages without added value "scaled content abuse". Three great pages a day beat 300 generated ones.

Never name other brands in headings (no "Mario-like").

Leave `status: draft` until you have played the game and edited the page. The build will not index a draft. Set `status: published` only after that edit. Cursor does not publish a page nobody played.

## Order of work

1. Top 50 games by quality (the content list at `/dev/content/` on a preview build).
2. Category intros.
3. Collection intros.
4. The next 50 games.

## Start a file

```bash
npx tsx scripts/new-game-content.ts the-game-slug
```

That writes `content/games/the-game-slug.mdx` with the title filled in and empty sections. The summary is only the title, the category, and how you hold the screen. Replace it with what you saw. It must be 140–160 characters.

## The file

```mdx
---
title: Game name
summary: One or two sentences, 140 to 160 characters, in your own words.
status: draft
author: Your name
playedOn: 2026-10-03
updated: 2026-10-03
tags: []
controls: {"desktop":[{"key":"Arrows","action":"Move"}],"phone":[{"gesture":"Swipe","action":"Move"}]}
faq: [{"q":"Is it free?","a":"Yes. You play it in the browser."}]
---

## About

What the game is, in your words.

## How to play

The goal, and what you do first.

## Tips

Three to five tips. A bullet is fine.

## Who it's for

Who will enjoy it, and who should skip it.

## FAQ

### Is it free?

Yes. You play it in the browser.
```

A published page needs your name, the date you played it, two to five FAQ items, and all four sections. `controls` and `faq` in the header are JSON on one line each. The FAQ in the body is what readers see, and it is the only FAQ search engines are given.
