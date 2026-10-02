import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { HOME_JS_BUDGET, homeJsGzip } from './check-home-js.mjs';

const root = 'out';
let files = 0;
let bytes = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else {
      files += 1;
      bytes += stat.size;
    }
  }
}

walk(root);

const modern = homeJsGzip(root);
const budget = HOME_JS_BUDGET;

console.log(`files=${files}`);
console.log(`bytes=${bytes}`);
console.log(`homeJsGzipModern=${modern}`);
console.log(`homeJsBudget=${budget}`);
console.log(modern <= budget ? 'homeJs=within budget' : 'homeJs=over budget');
