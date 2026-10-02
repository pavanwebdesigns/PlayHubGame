import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { markPreview } from '../scripts/mark-preview.mjs';

describe('preview host files', () => {
  it('adds a noindex header and a disallow-all robots file', () => {
    const root = mkdtempSync(join(tmpdir(), 'preview-'));
    const source = readFileSync('public/.htaccess', 'utf8');
    writeFileSync(join(root, '.htaccess'), source);
    writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nAllow: /\n');
    markPreview(root);
    const htaccess = readFileSync(join(root, '.htaccess'), 'utf8');
    expect(htaccess).toContain('Header set X-Robots-Tag "noindex, nofollow"');
    expect(htaccess.indexOf('X-Robots-Tag')).toBeLessThan(htaccess.lastIndexOf('</IfModule>'));
    expect(readFileSync(join(root, 'robots.txt'), 'utf8')).toBe(
      'User-agent: *\nDisallow: /\n',
    );
    expect(source).not.toContain('X-Robots-Tag');
  });
});
