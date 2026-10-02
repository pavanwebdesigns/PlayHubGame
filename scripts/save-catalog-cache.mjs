import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';

const meta = JSON.parse(readFileSync('data/meta.json', 'utf8'));
if (meta.stale) {
  console.log('Catalog is stale. Leaving the restored cache in place.');
  process.exit(0);
}
mkdirSync('.catalog-cache', { recursive: true });
copyFileSync('data/catalog.json', '.catalog-cache/catalog.json');
copyFileSync('data/meta.json', '.catalog-cache/meta.json');
console.log('Copied the fresh catalog into .catalog-cache.');
