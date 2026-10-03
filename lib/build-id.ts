import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

/** 12 hex characters. Same commit and curated catalog always produce the same id. */
export function buildIdFrom(sha: string, catalog: Buffer): string {
  const catalogHash = createHash('sha256').update(catalog).digest('hex');
  return createHash('sha256')
    .update(`${sha}\n${catalogHash}`)
    .digest('hex')
    .slice(0, 12);
}

function gitSha(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

export function shortBuildId(): string {
  const catalog = existsSync('data/curated.json')
    ? readFileSync('data/curated.json')
    : Buffer.alloc(0);
  return buildIdFrom(gitSha(), catalog);
}
