import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gamepixImage } from '../src/lib/image.ts';

test('gamepixImage replaces an existing w param and keeps a single query string', () => {
  const result = gamepixImage('https://img.example/covers/game.png?w=320', 640);
  const parsed = new URL(result);
  assert.equal(parsed.searchParams.get('w'), '640');
  assert.equal(result.split('?').length, 2);
  assert.equal([...parsed.searchParams.keys()].filter((key) => key === 'w').length, 1);
});
