var CACHE="ph-a296feb0afe3";
var URLS=["/logo.png","/icon-192.png","/playlogo.svg","/offline/","/_next/static/media/70792942b0428d47-s.p.1bei-r7v80c20.woff2","/_next/static/media/anek_400-s.p.3xc522oi32ps0.woff2","/_next/static/media/anek_500-s.p.1bldaf2hkky3x.woff2","/_next/static/media/anek_600-s.p.2ipl-ik6-l5dm.woff2","/_next/static/chunks/21ku072_it-iz.css","/_next/static/chunks/3vk2fbt5lrvym.js","/_next/static/chunks/1-l63z5egxej3.js","/_next/static/chunks/1rj7ns8rte9vc.js","/_next/static/chunks/turbopack-26b1856ggrtrs.js","/_next/static/chunks/2j7rz7y1553l0.js","/_next/static/chunks/04kw_vpjsumu4.js","/_next/static/chunks/04h-n22a_0im1.js","/manifest.webmanifest","/_next/static/chunks/0cz1d0mv5g_q7.js","/originals/cps-test/","/_next/static/chunks/3-4sejml22sxg.js","/_next/static/chunks/086g6gsulerij.js","/originals/reaction-time-test/"];
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
    var timer=setTimeout(function(){resolve(null)},4000);
    fetch(event.request).then(function(response){clearTimeout(timer);resolve(response)}).catch(function(){clearTimeout(timer);resolve(null)});
  }).then(function(response){
    if(response)return response;
    return fromCache(event.request);
  }));
});
