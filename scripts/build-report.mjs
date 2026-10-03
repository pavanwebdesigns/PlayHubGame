import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  HOME_HTML_GZIP_MAX,
  HOME_HTML_RAW_MAX,
  HOME_JS_BUDGET,
  homeHtmlSize,
  homeJsGzip,
  homeRscBytes,
} from './check-home-js.mjs';

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
const html = homeHtmlSize(root);
console.log(`homeJsGzipModern=${modern}`);
console.log(`homeJsBudget=${budget}`);
console.log(modern <= budget ? 'homeJs=within budget' : 'homeJs=over budget');
console.log(`homeHtmlDecoded=${html.decoded}`);
console.log(`homeHtmlGzip=${html.gzip}`);
console.log(`homeRsc=${homeRscBytes(root)}`);
console.log(`homeHtmlGzipMax=${HOME_HTML_GZIP_MAX}`);
console.log(`homeHtmlRawMax=${HOME_HTML_RAW_MAX}`);
