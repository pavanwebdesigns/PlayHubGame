var CACHE="ph-v2-feace4f8133f";
var URLS=["/logo.png","/og-default.png","/icon-192.png","/icon-512.png","/icon-maskable-512.png","/apple-touch-icon.png","/favicon.svg","/favicon.ico","/offline/","/_next/static/media/70792942b0428d47-s.p.1bei-r7v80c20.woff2","/_next/static/media/anek_400-s.p.3xc522oi32ps0.woff2","/_next/static/media/anek_500-s.p.1bldaf2hkky3x.woff2","/_next/static/media/anek_600-s.p.2ipl-ik6-l5dm.woff2","/_next/static/chunks/1mq-uwrl3rwyr.css","/_next/static/chunks/3vk2fbt5lrvym.js","/_next/static/chunks/1-l63z5egxej3.js","/_next/static/chunks/1rj7ns8rte9vc.js","/_next/static/chunks/turbopack-26b1856ggrtrs.js","/_next/static/chunks/3-5x6v7x5enmk.js","/_next/static/chunks/3jmivdfn71biz.js","/_next/static/chunks/04h-n22a_0im1.js","/manifest.webmanifest","/_next/static/chunks/0cz1d0mv5g_q7.js","/originals/cps-test/","/_next/static/chunks/3-4sejml22sxg.js","/_next/static/chunks/086g6gsulerij.js","/originals/reaction-time-test/"];
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
