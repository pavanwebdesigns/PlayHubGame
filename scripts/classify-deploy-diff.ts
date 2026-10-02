import { readFileSync } from 'node:fs';
import { classifyDeployDiff } from '@/lib/deploy-diff';

const file = process.argv[2];
if (!file) {
  console.error('Pass the path of a name-only diff.');
  process.exit(1);
}
const paths = readFileSync(file, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0);
process.stdout.write(classifyDeployDiff(paths));
