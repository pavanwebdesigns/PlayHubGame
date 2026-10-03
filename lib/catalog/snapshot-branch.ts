/** The only branch this repo force-pushes. Hostinger never deploys it. */
export const SNAPSHOT_BRANCH = 'catalog-snapshot';

const PROTECTED_BRANCHES = new Set(['main', 'master', 'deploy']);

export function assertSnapshotBranch(branch: string): void {
  if (PROTECTED_BRANCHES.has(branch) || branch !== SNAPSHOT_BRANCH) {
    throw new Error(
      `Refusing to force-push the catalog snapshot to ${branch}.`,
    );
  }
}
