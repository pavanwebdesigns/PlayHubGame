# Phase 3 copy — drafts for Pavan to review

Written by Claude (architect) on 3 Oct 2026. Every block below is a **draft**. Cursor places each one in its file with `status: draft`; a page only becomes indexable after Pavan reads it, edits anything that sounds wrong, and sets `status: published`.

Rules followed: plain English, sentence case, no game counts written into the text (counts change nightly — the page shows the live count), no "best/#1" claims, no promises we can't check, no third-party brand names.

---

## 1. Spotlight rotation — `config/spotlight.ts`

30 games, in rotation order (day N of the year → item N mod 30). Chosen from the curated catalog by quality score, spread across hubs, no seasonal or brand titles. **Pitches are intentionally empty**: Pavan writes each one-liner after playing the game (Spotlight shows no pitch line until then).

| # | slug | title | hub | orientation |
|---|---|---|---|---|
| 1 | prism-match-3d | Prism Match 3D | match-3 | all |
| 2 | drop-planets | Drop Planets | puzzle | portrait |
| 3 | defend-the-castle | Defend the Castle | strategy | portrait |
| 4 | garden-master | Garden Master | simulation-idle | portrait |
| 5 | quarantine-zombies | Quarantine Zombies | action | all |
| 6 | nova-hop | Nova Hop | skill-hyper-casual | portrait |
| 7 | boost-balloon | Boost Balloon | casual | portrait |
| 8 | billiards-on-ice | Billiards on Ice | sports | all |
| 9 | combat-landing | Combat Landing | racing-driving | all |
| 10 | vegan-quest | Vegan Quest | arcade | portrait |
| 11 | kobadoo-emojis | Kobadoo Emojis | math-word | portrait |
| 12 | flag-memory-match | Flag Memory Match | brain-memory | portrait |
| 13 | trap-the-convoy | Trap the Convoy | shooting | all |
| 14 | hoops-and-fruits | Hoops & Fruits | coloring-drawing | portrait |
| 15 | merge-mine-idle-clicker | Merge Mine - Idle Clicker | adventure | all |
| 16 | memory-cards | Memory Cards | brain-memory | all |
| 17 | math-fight-club | Math Fight Club | math-word | portrait |
| 18 | the-floor-is-lying | The Floor Is Lying | platformer | landscape |
| 19 | emberdeck | Emberdeck | board-card | landscape |
| 20 | racing-ball-3d | Racing Ball 3D | two-player | all |
| 21 | match-mystery | Match Mystery | match-3 | portrait |
| 22 | seat-the-guests | Seat the Guests | puzzle | all |
| 23 | perimeter | Perimeter - Legate Edition | strategy | landscape |
| 24 | stack-rocket | Stack Rocket | simulation-idle | portrait |
| 25 | ancient-armies-vs-modern-weapons | Ancient Armies vs Modern Weapons | action | all |
| 26 | lotl-spa | Lotl Spa | skill-hyper-casual | all |
| 27 | skater-kitty | Skater Kitty | casual | all |
| 28 | penalty-kick-wiz | Penalty Kick Wiz | sports | landscape |
| 29 | kobadoo-numbers | Kobadoo Numbers | brain-memory | all |
| 30 | merge-royal | Merge Royal | arcade | portrait |

If a slug drops out of the curated catalog later, skip it and use the next one (build warning, not a failure).

---

## 2. Home — `content/pages/home.mdx`

**Meta description (152 chars):** Free online games that play right in your browser — puzzles, racing, brain games and more. No download, no sign-up. Works on phone and computer.

**About PlayHubPlace**

PlayHubPlace is a free games site you can open on your phone or computer and start playing in seconds. There's nothing to install and no account to create — tap a game, press Play, and you're in.

We pick the games carefully instead of listing everything we can find. Each game here plays well in a browser, and on phones we put one-thumb games first, so you can play holding your phone upright with one hand on the bus or between tasks.

Save the games you like with the heart button and they'll be waiting in My games next time. Want something quick? Try the 5-minute games. Want a challenge? Head to Train your brain or the strategy games.

**FAQ**

- **Are the games free?** Yes. Every game on PlayHubPlace is free to play. Some games show short ads, which is how the games stay free.
- **Do I need to download anything?** No. Games run in your web browser. You don't need an app, a plugin or an account.
- **Do the games work on my phone?** Most do. Look for the One-thumb games collection — those are made to play upright on a phone. Some games are wide-screen and work best with your phone turned sideways; we'll tell you when that's the case.
- **Why won't a game load?** Usually an ad blocker or a slow connection is the cause. Turn off your ad blocker for this site and reload the page. If it still doesn't work, use Report a problem on the game page and we'll look into it.

---

## 3. Hub intros — `content/categories/{hub}.mdx`

Each: `title`, `summary` (meta description, 140–160 chars), body. Body first two lines show; the rest expands.

### action
**Summary:** Free action games you can play in your browser — fast fights, zombie waves and quick reflex challenges. No download needed, on phone or computer.
Action games are about quick decisions and quick hands. You dodge, aim, attack and survive, often with the screen getting busier every second.

Some are short arcade bursts you can finish in a few minutes; others have levels and upgrades that keep you coming back. If a game says it's best in landscape, turn your phone sideways for the full view. New to a game? The first level usually teaches the controls, so give it one round before you judge it.

### adventure
**Summary:** Free adventure games in your browser — explore worlds, solve small mysteries and level up. No download, works on phone and computer.
Adventure games give you a world to explore and a goal to reach. You collect items, unlock new areas, and slowly get stronger as you go.

They're slower than action games and reward curiosity. Many save your progress in the browser, so you can stop and pick up later on the same device. Look at the game's details to see if it plays upright or sideways on a phone.

### arcade
**Summary:** Free arcade games to play instantly — simple controls, high scores and one-more-try fun. No download, on phone and computer.
Arcade games are easy to start and hard to put down. One or two controls, a score that keeps climbing, and a reason to try just once more.

They're perfect for short breaks. Many play with one thumb on a phone, and most rounds last a minute or two. Chase your own best score, then try a different game from the Play next list.

### brain-memory
**Summary:** Free brain and memory games — match cards, remember patterns and sharpen your focus. Play in your browser on phone or computer, no download.
Brain and memory games ask you to notice, remember and think a step ahead. Match pairs, recall sequences, spot patterns or answer quick questions.

They're calm but still challenging, and short rounds make them easy to fit into a busy day. Playing a few minutes regularly is more fun than one long session — try a different game each day and see which ones you get better at.

### match-3
**Summary:** Free match-3 games in your browser — swap, match and clear the board. Relaxing puzzle play on phone or computer, no download.
Match-3 games are simple: line up three or more of the same piece to clear them. The challenge comes from planning moves, setting up combos and finishing each level's goal.

They're relaxing, easy to play with one hand, and great for short breaks. Most levels get a little harder each time, so you always have a next goal.

### casual
**Summary:** Free casual games for quick, easy fun — simple rules and short rounds. Play instantly in your browser on phone or computer.
Casual games are the easiest place to start. The rules make sense in seconds and a round never asks too much of you.

Pick one when you want something light: a quick round while waiting, a calm game before bed, or something to share with a family member. If you like one, save it with the heart so it's in My games next time.

### shooting
**Summary:** Free shooting games in your browser — aim, defend and clear each wave. Quick rounds on phone or computer, no download or sign-up.
Shooting games test your aim and timing. Defend a base, clear waves of enemies, or line up the perfect shot.

Many work well with a mouse on a computer; on phones, look for games that play upright with touch controls. Read the controls on each game page before you start — it saves a lot of early mistakes.

### racing-driving
**Summary:** Free racing and driving games — race, drift, park and perform stunts in your browser. No download, on phone or computer.
Racing and driving games put you behind the wheel. Some are about pure speed, others about careful driving, parking or stunts.

On a computer the arrow keys usually steer; on phones, most use tap or tilt controls. Many racing games are wide-screen, so turn your phone sideways for the best view.

### sports
**Summary:** Free sports games — football, basketball, pool and more, right in your browser. Quick matches on phone or computer, no download.
Sports games turn your favourite sports into quick matches you can play anywhere. Take penalties, shoot hoops, line up a pool shot or play a full mini-match.

Rounds are short, controls are simple, and it's easy to keep going "one more match". Check each game's controls before you start.

### strategy
**Summary:** Free strategy games — plan, build and defend in your browser. Think before you move, on phone or computer, no download needed.
Strategy games reward planning over speed. Build defences, manage resources, and choose your moves carefully.

They're great when you want something to think about. Many games save progress in your browser, so you can come back to the same device and continue.

### board-card
**Summary:** Free board and card games in your browser — classic tables and new twists. Play solo on phone or computer, no download or sign-up.
Board and card games bring familiar tables to your screen: card battles, solitaire-style puzzles, and games of pieces and squares.

They're calm, easy to pause, and good for a slower moment. Some have unfamiliar rules — the first round usually shows you how they work.

### two-player
**Summary:** Free two-player games for one screen — challenge a friend on the same phone or computer. No download, play instantly in your browser.
Two-player games are made for playing together on one device. Share a keyboard, or hold the phone between you, and take each other on.

They're perfect when a friend or family member is next to you. Check the controls on each game page so both players know their keys before you start.

### girls-dress-up
**Summary:** Free dress-up, makeover and styling games in your browser. Create outfits and looks on phone or computer, no download needed.
Dress-up and styling games let you create looks, decorate, and design. Mix outfits, try makeovers, and make each character your own.

There's no wrong answer — it's about having fun with colour and style. Most of these games play nicely on phones.

### coloring-drawing
**Summary:** Free colouring and drawing games — relax and create in your browser. Fill pictures, draw shapes and solve drawing puzzles on any device.
Colouring and drawing games are a calm, creative break. Fill pictures with colour, draw lines to solve puzzles, or just doodle.

They work well with a finger on a phone or tablet. There's no timer in most of them, so take it slow.

### simulation-idle
**Summary:** Free simulation and idle games — build, grow and manage in your browser. Progress even with short sessions, on phone or computer.
Simulation and idle games let you build something over time: a garden, a mine, a business or a little world.

You can play in short sessions and still feel progress. Many save in your browser, so return on the same device to keep growing.

### platformer
**Summary:** Free platformer games in your browser — run, jump and dodge your way through levels. No download, play on phone or computer.
Platformers are about timing your jumps and finding the way through each level. Some are fast and tricky, others are gentle and clever.

On a computer, the arrow keys or WASD usually move you. On phones, most platformers are wide-screen, so turn your phone sideways.

### skill-hyper-casual
**Summary:** Free skill games — one tap, perfect timing and quick rounds. Easy to learn, hard to master. Play in your browser on phone or computer.
Skill games use one simple action — tap, hold or swipe — and ask you to do it at exactly the right moment.

Rounds are seconds long, so they're ideal for a quick break. Most play upright with one thumb.

### math-word
**Summary:** Free math and word games — quick sums, spelling and number puzzles in your browser. Learn while you play, on phone or computer.
Math and word games make numbers and letters into quick challenges. Solve sums against the clock, build words, or crack number puzzles.

They suit students and adults alike, and short rounds make them easy to fit into a day.

### seasonal
**Summary:** Free seasonal games for Christmas, Halloween and other holidays. Festive fun in your browser on phone or computer, no download.
Seasonal games bring a bit of holiday spirit: snowy adventures at Christmas, spooky fun at Halloween.

We show these in their season and keep them here year-round for anyone who wants them.

### puzzle
**Summary:** Free puzzle games in your browser — logic, physics and brain teasers to solve at your own pace. No download, on phone or computer.
Puzzle games are about finding the answer. Drop, slide, merge or rearrange pieces until it all clicks.

Most have no time pressure, so you can think it through. They're one of the best fits for phones — many play upright with one thumb.

---

## 4. Collection intros — `content/collections/{slug}.mdx`

### one-thumb-games
**Summary:** Free games you can play with one thumb, holding your phone upright. Quick, easy and made for phones — no download, no sign-up.
These games are made for your phone held the normal way, upright, with one thumb. No need to turn the screen or use both hands.

They're perfect for the bus, a queue, or a quick break. Tap a game and press Play — it opens full screen on your phone.

### train-your-brain
**Summary:** Free brain games — memory, math, word and logic challenges in your browser. Short, fun rounds on phone or computer, no download.
A mix of memory, math, word and logic games to keep your mind busy. Short rounds, clear goals, and a reason to come back tomorrow.

Try a different one each day and notice which you enjoy most.

### 5-minute-games
**Summary:** Quick free games you can finish in about five minutes — perfect for short breaks. Play instantly on phone or computer, no download.
Got a few minutes? These games are quick to learn and quick to play. One tap, one round, done — or one more if you can't stop.

### two-players-one-screen
**Summary:** Free two-player games for one device — play against a friend on the same phone or keyboard. No download, play in your browser.
Grab a friend and share one screen. These games are made for two players on the same device. Check each game's controls so both players know their keys.

### just-relax
**Summary:** Calm, relaxing free games — colouring, gentle puzzles, matching and solitaire. No timers, no stress, on phone or computer.
No rush, no timers, no stress. Colour a picture, match some tiles, or solve a gentle puzzle at your own pace.

### new-this-week
**Summary:** The newest free games added to PlayHubPlace this week. Fresh puzzles, arcade and action games — play in your browser, no download.
Fresh games added in the last seven days. Check back often — this list changes every day.

---

## 5. Originals text

### cps-test (`/originals/cps-test/`)
**Summary:** Free CPS test — measure how many times you can click per second. Pick a time, click as fast as you can, and beat your best score.

**What's measured.** CPS means clicks per second. Press Start, click (or tap) as fast as you can until the timer ends, and we divide your total clicks by the seconds.

**What's a good score?** Most people land somewhere between 5 and 8 clicks per second on a mouse. Fast players often get above 10. Your score depends a lot on your mouse or screen, so compare with your own best rather than with others.

**Tips.** Keep your wrist relaxed and let your finger do the work. Rest your hand before each try. On a phone, try tapping with two fingers alternating.

*(Claude: the 5–8 typical range is common guidance on CPS-test sites, not a measured study — Pavan, keep or remove after checking your own results.)*

### reaction-time-test (`/originals/reaction-time-test/`)
**Summary:** Free reaction time test — wait for the colour change, tap as fast as you can, and see your time in milliseconds. Beat your personal best.

**What's measured.** The screen changes colour after a random wait. Your reaction time is how long it takes you to tap after the change, in milliseconds (ms). Tap too early and the round restarts.

**What's a good time?** Many people score around 200–300 ms. Your device and screen add a little delay, so the best comparison is your own personal best.

**Tips.** Rest your finger just above the button, look at the centre of the box, and don't guess the timing — the wait is random on purpose. Take a few tries; the first is usually slower.

*(Claude: the 200–300 ms range is a widely quoted typical range for visual reaction time; Pavan to keep or soften.)*

---

## 6. Loading tips (game loading overlay, rotate one per load)

1. Tap the heart to save a game to My games.
2. On a phone, press Play to open the game full screen.
3. Press F on a keyboard for full screen, Esc to exit.
4. Wide-screen game? Turn your phone sideways.
5. Not loading? Turn off your ad blocker for this site, then reload.
6. Games you play show up in Continue playing on the home page.
7. Looking for something quick? Try 5-minute games.
8. Playing with a friend? Try Two players, one screen.
9. Press / anywhere to search for a game.
10. Most games save progress in this browser on this device.

---

## 7. Seasonal windows (`config/seasonal.ts`, dates in IST)

| Row | Shows from | Until |
|---|---|---|
| Halloween games | 15 Oct | 1 Nov |
| Christmas games | 1 Dec | 2 Jan |

Outside those dates, seasonal games stay in the Seasonal category but the home row is hidden.

---

## 8. Still waiting on Pavan

- `CONTACT_EMAIL` — until set, Report a problem shows "Reporting isn't open yet" instead of a mailto link.
- 30 Spotlight one-liners (after playing).
- Review and publish everything above.
- Trust pages (Privacy, Terms, Cookies): keep the Phase 0 drafts; a professional review is needed before AdSense.
