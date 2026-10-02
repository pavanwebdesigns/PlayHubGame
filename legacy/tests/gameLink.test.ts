import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { embedUrl, gameFromSlug, titleFromSlug } from '../src/lib/gameLink.ts';

describe('game links', () => {
  it('builds one embed query and keeps the partner id', () => {
    const url = embedUrl('prism-match-3d');
    assert.equal(url, 'https://play.gamepix.com/prism-match-3d/embed?sid=LC991');
    assert.equal(url.split('?').length, 2);
  });

  it('turns a slug into a readable title', () => {
    assert.equal(titleFromSlug('defend-the-castle'), 'Defend The Castle');
    const game = gameFromSlug('123', 'defend-the-castle');
    assert.equal(game.url, embedUrl('defend-the-castle'));
    assert.equal(game.orientation, 'all');
  });
});
