import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROBOTS_HEADER = '    Header set X-Robots-Tag "noindex, nofollow"\n';

/** Preview host files only. Production .htaccess and robots.txt stay unchanged. */
export function markPreview(root = 'out') {
  const htaccessPath = join(root, '.htaccess');
  let text = readFileSync(htaccessPath, 'utf8');
  if (!text.includes('X-Robots-Tag')) {
    const end = text.lastIndexOf('</IfModule>');
    if (end === -1) {
      throw new Error(`${htaccessPath} has no IfModule to hold the robots header.`);
    }
    text = `${text.slice(0, end)}${ROBOTS_HEADER}${text.slice(end)}`;
    writeFileSync(htaccessPath, text);
  }
  writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
}

const isDirectRun = process.argv[1] && process.argv[1].endsWith('mark-preview.mjs');
if (isDirectRun) markPreview();
