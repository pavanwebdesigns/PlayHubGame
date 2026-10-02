import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { WORKUTILITIES_HOME, legacyToolTarget } from '../src/lib/legacyTools.ts';

describe('legacy tool URLs', () => {
  it('keeps the two game-like tools on PlayHub', () => {
    assert.equal(legacyToolTarget('tool-reaction'), 'reaction-test');
    assert.equal(legacyToolTarget('tool-cps'), 'cps-test');
  });

  it('sends the tools list and every other tool to workutilities.com', () => {
    assert.equal(legacyToolTarget('tools'), WORKUTILITIES_HOME);
    assert.equal(legacyToolTarget('tool-sleep'), WORKUTILITIES_HOME);
    assert.equal(legacyToolTarget('tool-qr'), WORKUTILITIES_HOME);
  });

  it('leaves game and home routes alone', () => {
    assert.equal(legacyToolTarget('home'), null);
    assert.equal(legacyToolTarget('game'), null);
    assert.equal(legacyToolTarget('reaction-test'), null);
    assert.equal(legacyToolTarget(null), null);
  });
});
