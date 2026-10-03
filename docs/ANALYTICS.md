# Analytics

Events go to GA4 only after the player allows analytics. Until then `track()` does nothing and the Google script is not loaded.

Consent is `localStorage` key `ph:consent:v1` with `{"analytics":true}`. The consent banner that writes this key arrives in Phase 6. The measurement id is `GA4_MEASUREMENT_ID` in `config/site.ts` and is still `TODO(Pavan)`.

On a preview or local build, `?ph_debug_analytics=1` turns events on without consent so they can be checked. That query does nothing when the site is built with `PH_MAIN_BUILD=1`.

No event carries an account, an email, or an IP we add ourselves. The only free text is the search term.

| Event | Parameters |
|---|---|
| `tile_click` | `slug`, `source`, `position` |
| `game_play_start` | `slug`, `hub`, `orientation`, `device` |
| `game_load_time` | `slug`, `ms` |
| `game_load_failed` | `slug` |
| `immersive_enter` | `slug` |
| `immersive_exit` | `slug`, `seconds_in_game` |
| `rotate_prompt_shown` | `slug` |
| `favorite_add` / `favorite_remove` | `slug` |
| `share` | `slug`, `method` (`native` or `copy`) |
| `search` / `search_no_results` | `term`, `results` |
| `report_problem` | `slug`, `reason` |
| `original_result` | `slug`, `score` |
| `web_vital` | `metric_name` (`LCP`, `INP`, `CLS`), `value`, `page_type` |

`web-vitals` (3.3 KB gzip for `web-vitals.js`) is imported only after consent or the preview debug query, so it is not part of the home page script budget.

`source` is `spotlight`, `todays_picks`, `row:{collection}`, `play_next`, `up_next`, `search`, or `category`. `device` is `touch` or `desktop`.

## Explorations to save in GA4

1. Top games by plays. Event `game_play_start`, dimension `slug`, metric event count.
2. Load failures by game. Event `game_load_failed`, dimension `slug`, metric event count.
3. Searches with no results. Event `search_no_results`, dimension `term`, metric event count.
