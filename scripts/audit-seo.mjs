import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'out';
const origin = 'https://playhubplace.com';

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (name === 'index.html') files.push(path);
  }
  return files;
}

function pagePath(file) {
  const relative = file.slice(root.length).replace(/index\.html$/, '');
  return relative.startsWith('/') ? relative : `/${relative}`;
}

function attr(html, name) {
  const match = html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`));
  return match?.[1] ?? '';
}

function canonical(html) {
  const match = html.match(/<link rel="canonical" href="([^"]+)"/);
  return match?.[1] ?? '';
}

function title(html) {
  const match = html.match(/<title>([^<]*)<\/title>/);
  return match?.[1] ?? '';
}

function decode(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"');
}

const pages = walk(root).map((file) => {
  const html = readFileSync(file, 'utf8');
  const path = pagePath(file);
  const canon = canonical(html);
  const robots = attr(html, 'robots') || 'index, follow';
  return {
    path,
    html,
    title: decode(title(html)),
    description: decode(attr(html, 'description')),
    canonical: canon,
    indexable: !robots.includes('noindex'),
    selfCanonical: canon === `${origin}${path}`,
  };
});

const errors = [];
const warnings = [];

const notFoundDocs = new Set(['/404/', '/_not-found/']);
for (const page of pages) {
  if (notFoundDocs.has(page.path)) continue;
  if (!page.canonical) errors.push(`${page.path} has no canonical`);
}

const audited = pages.filter((page) => page.indexable && page.selfCanonical);
const titles = new Map();
const descriptions = new Map();
for (const page of audited) {
  const titleHit = titles.get(page.title);
  if (titleHit) errors.push(`duplicate title "${page.title}" on ${titleHit} and ${page.path}`);
  else titles.set(page.title, page.path);
  const descriptionHit = descriptions.get(page.description);
  if (descriptionHit) {
    errors.push(`duplicate description on ${descriptionHit} and ${page.path}`);
  } else descriptions.set(page.description, page.path);
  const length = page.description.length;
  const listing = /^\/(category|collection|new)\//.test(page.path) || page.path === '/new/';
  if (listing && (length < 140 || length > 160)) {
    warnings.push(`${page.path} description is ${length} characters`);
  }
  if (page.path.startsWith('/game/') && (length < 140 || length > 160)) {
    errors.push(`${page.path} description is ${length} characters`);
  }
}

function sitemapLocs(file) {
  const xml = readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '');
}

const index = sitemapLocs(join(root, 'sitemap.xml'));
if (!index.some((loc) => loc.endsWith('/sitemap-pages.xml'))) {
  errors.push('sitemap.xml is not an index of sitemap-pages.xml');
}
const listed = [
  ...sitemapLocs(join(root, 'sitemap-pages.xml')),
  ...sitemapLocs(join(root, 'sitemap-categories.xml')),
  ...sitemapLocs(join(root, 'sitemap-games.xml')),
];
const byPath = new Map(pages.map((page) => [page.path, page]));

for (const loc of listed) {
  const path = loc.startsWith(origin) ? loc.slice(origin.length) : loc;
  const page = byPath.get(path);
  if (!page) {
    errors.push(`sitemap URL missing from out/: ${path}`);
    continue;
  }
  if (!page.indexable) errors.push(`sitemap URL is noindex: ${path}`);
  if (path.includes('/page/')) errors.push(`paginated URL is in the sitemap: ${path}`);
}

for (const page of audited) {
  if (page.path === '/') continue;
  const linked = audited.some(
    (other) => other.path !== page.path && other.html.includes(`href="${page.path}"`),
  );
  if (!linked) errors.push(`orphan indexable page: ${page.path}`);
}

console.log(
  `audited=${audited.length} pages=${pages.length} sitemap=${listed.length} warnings=${warnings.length} errors=${errors.length}`,
);
for (const warning of warnings) console.warn(`warn ${warning}`);
for (const error of errors) console.error(`error ${error}`);
if (errors.length > 0) process.exit(1);
