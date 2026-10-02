/** Files that may change when only the home page changes, including a daily picks rotation. */
export const HOME_DEPLOY_PATHS = new Set([
  'index.html',
  'index.txt',
  '__next.__PAGE__.txt',
  '__next._full.txt',
  '__next._tree.txt',
]);

export type DeployScope = 'skip' | 'home' | 'full';

export function classifyDeployDiff(paths: readonly string[]): DeployScope {
  if (paths.length === 0) return 'skip';
  return paths.every((path) => HOME_DEPLOY_PATHS.has(path)) ? 'home' : 'full';
}
