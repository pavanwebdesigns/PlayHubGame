import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { shortBuildId } from '@/lib/build-id';

const PAGES = ['/offline/', '/originals/cps-test/', '/originals/reaction-time-test/'] as const;
const STATIC = [
  '/logo.png',
  '/og-default.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon.svg',
  '/favicon.ico',
] as const;

function referenced(html: string): string[] {
  const found: string[] = [];
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="(\/[^"]+)"/g)) {
    const url = match[1]?.split('?')[0];
    if (!url || url.includes('gamepix')) continue;
    found.push(url);
  }
  return found;
}

function fontsIn(cssUrl: string): string[] {
  try {
    const css = readFileSync(`out${cssUrl}`, 'utf8');
    return [...css.matchAll(/url\(\s*['"]?(\/_next\/static\/media\/[^)'"]+)['"]?\s*\)/g)].flatMap(
      (match) => (match[1] ? [match[1]] : []),
    );
  } catch {
    return [];
  }
}

function precacheUrls(): string[] {
  const urls = new Set<string>(STATIC);
  for (const page of PAGES) {
    urls.add(page);
    const html = readFileSync(`out${page}index.html`, 'utf8');
    for (const url of referenced(html)) {
      urls.add(url);
      if (url.endsWith('.css')) {
        for (const font of fontsIn(url)) urls.add(font);
      }
    }
  }
  return [...urls].filter((url) => !url.includes('/game/'));
}

function worker(cacheName: string, urls: readonly string[]): string {
  // Navigations revalidate. fetch(event.request) would reuse the HTTP cache,
  // including a cached copy of the old site. redirect manual lets the browser
  // follow Apache redirects. After 4s, an exact cached copy of this URL is
  // shown. With no copy, the worker keeps waiting. /offline/ is only for a
  // failed fetch.
  return `var CACHE=${JSON.stringify(cacheName)};
var URLS=${JSON.stringify(urls)};
self.addEventListener("install",function(event){
  event.waitUntil(caches.open(CACHE).then(function(cache){return cache.addAll(URLS)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(event){
  event.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(key){return key!==CACHE}).map(function(key){return caches.delete(key)}));
  }).then(function(){return self.clients.claim()}));
});
function fromCache(request){
  return caches.match(request).then(function(cached){return cached||caches.match("/offline/")});
}
self.addEventListener("fetch",function(event){
  var url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(url.hostname.indexOf("gamepix")!==-1)return;
  if(event.request.mode!=="navigate"){
    event.respondWith(caches.match(event.request).then(function(cached){return cached||fetch(event.request)}));
    return;
  }
  event.respondWith(new Promise(function(resolve){
    var settled=false;
    var timer=setTimeout(function(){
      caches.match(event.request).then(function(cached){
        if(!settled&&cached){settled=true;resolve(cached)}
      });
    },4000);
    fetch(event.request.url,{cache:"no-cache",credentials:"same-origin",redirect:"manual"}).then(function(response){
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      resolve(response);
    }).catch(function(){
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      resolve(fromCache(event.request));
    });
  }));
});
`;
}

const kill = process.env.PH_SW_KILL === '1';
if (kill) {
  copyFileSync('scripts/sw-kill.js', 'out/sw.js');
  console.log('sw=kill');
} else {
  const id = shortBuildId();
  const urls = precacheUrls();
  writeFileSync('out/sw.js', worker(`ph-v2-${id}`, urls));
  console.log(`sw=${id} urls=${urls.length}`);
}
