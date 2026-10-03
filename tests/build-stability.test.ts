import { describe, expect, it } from 'vitest';
import { buildIdFrom } from '@/lib/build-id';
import { classifyDeployDiff } from '@/lib/deploy-diff';

describe('build id', () => {
  it('is a short hash of the commit and the curated catalog', () => {
    const catalog = Buffer.from('{"games":1}');
    const id = buildIdFrom('abc123', catalog);
    expect(id).toMatch(/^[a-f0-9]{12}$/);
    expect(buildIdFrom('abc123', catalog)).toBe(id);
    expect(buildIdFrom('abc123', Buffer.from('{"games":2}'))).not.toBe(id);
    expect(buildIdFrom('def456', catalog)).not.toBe(id);
  });
});

describe('deploy diff', () => {
  it('skips an identical out directory and commits only the home page', () => {
    expect(classifyDeployDiff([])).toBe('skip');
    expect(classifyDeployDiff(['index.html'])).toBe('home');
    expect(classifyDeployDiff(['index.html', 'index.txt'])).toBe('home');
    expect(
      classifyDeployDiff(['index.html', 'game/prism-match-3d/index.html']),
    ).toBe('full');
  });
});
