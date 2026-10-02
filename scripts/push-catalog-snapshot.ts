import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import {
  assertSnapshotBranch,
  SNAPSHOT_BRANCH,
} from '@/lib/catalog/snapshot-branch';

const REMOTE = 'https://github.com/pavanwebdesigns/PlayHubGame.git';

function git(cwd: string, args: string[]): void {
  const result = spawnSync('git', args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`git ${args[0] ?? 'command'} failed`);
  }
}

function pushArgs(refspec: string): string[] {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    const auth = Buffer.from(`x-access-token:${token}`).toString('base64');
    return [
      '-c',
      `http.https://github.com/.extraheader=AUTHORIZATION: basic ${auth}`,
      'push',
      '--force',
      REMOTE,
      refspec,
    ];
  }
  return [
    '-c',
    'credential.helper=',
    '-c',
    'credential.helper=!gh auth git-credential',
    'push',
    '--force',
    REMOTE,
    refspec,
  ];
}

function main(): void {
  assertSnapshotBranch(SNAPSHOT_BRANCH);
  const refspec = `HEAD:${SNAPSHOT_BRANCH}`;
  if (refspec !== 'HEAD:catalog-snapshot') {
    throw new Error(`Refusing refspec ${refspec}`);
  }

  const meta = JSON.parse(readFileSync('data/meta.json', 'utf8')) as {
    stale?: boolean;
  };
  if (meta.stale) {
    console.log('Catalog is stale. Leaving catalog-snapshot unchanged.');
    return;
  }

  const dir = mkdtempSync(join(tmpdir(), 'catalog-snapshot-'));
  try {
    writeFileSync(
      join(dir, 'catalog.json.gz'),
      gzipSync(readFileSync('data/catalog.json')),
    );
    writeFileSync(
      join(dir, 'meta.json.gz'),
      gzipSync(readFileSync('data/meta.json')),
    );
    git(dir, ['init', '-b', SNAPSHOT_BRANCH]);
    git(dir, ['add', 'catalog.json.gz', 'meta.json.gz']);
    git(dir, [
      '-c',
      'user.name=github-actions[bot]',
      '-c',
      'user.email=41898282+github-actions[bot]@users.noreply.github.com',
      'commit',
      '-m',
      'chore: store the latest catalog snapshot',
    ]);
    git(dir, pushArgs(refspec));
    console.log(`Force-pushed one commit to ${SNAPSHOT_BRANCH}.`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main();
