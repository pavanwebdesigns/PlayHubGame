import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { readSnapshot } from '@/lib/catalog/snapshot';
import { assertSnapshotBranch } from '@/lib/catalog/snapshot-branch';
import type { GameRecord } from '@/lib/catalog/types';

const sample = {
  id: '1',
  slug: 'sample',
  title: 'Sample',
  publisherDescription: '',
  rawCategory: 'puzzle',
  hub: 'puzzle',
  tags: ['puzzle'],
  orientation: 'landscape',
  quality: 0.8,
  publishedAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
  aspect: 1.5,
  cover: 'https://img.gamepix.com/cover.png',
  icon: 'https://img.gamepix.com/icon.png',
  embedUrl: 'https://play.gamepix.com/sample/embed?sid=LC991',
} satisfies GameRecord;

describe('catalog snapshot', () => {
  it('reads gzipped catalog.json and meta.json', () => {
    const dir = mkdtempSync(join(tmpdir(), 'catalog-snapshot-'));
    try {
      writeFileSync(
        join(dir, 'catalog.json.gz'),
        gzipSync(JSON.stringify([sample])),
      );
      writeFileSync(
        join(dir, 'meta.json.gz'),
        gzipSync(JSON.stringify({ stale: false })),
      );
      const snapshot = readSnapshot(dir);
      expect(snapshot?.catalog[0]?.slug).toBe('sample');
      expect(snapshot?.meta).toMatchObject({ stale: false });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('force-pushes only the catalog-snapshot branch', () => {
    expect(() => assertSnapshotBranch('catalog-snapshot')).not.toThrow();
    expect(() => assertSnapshotBranch('main')).toThrow(/Refusing/);
    expect(() => assertSnapshotBranch('master')).toThrow(/Refusing/);
    expect(() => assertSnapshotBranch('deploy')).toThrow(/Refusing/);
    expect(() => assertSnapshotBranch('rebuild/next')).toThrow(/Refusing/);
  });
});
