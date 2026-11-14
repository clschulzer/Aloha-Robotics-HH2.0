/* Independent offline shell for Care-Companion/phone.
   Never share or delete the frozen CARMAGOTCHI_APP cache namespace. */
const CACHE_PREFIX='aloha-care-companion-phone-';
const CACHE=`${CACHE_PREFIX}20261114-1`;
const BASE=new URL('./',self.location.href);
const SHELL=['./','index.html','app.css','app.mjs','state.mjs','manifest.webmanifest',
  'engine/planner.js','engine/golden.js','engine/day.js','assets/fonts/fonts.css',
  'assets/icon.svg','assets/icon-192.png','assets/icon-512.png','share/qr.png','share/qr-card.png',
  ...['lonely','manic','update','bliss','failure','rollback','ketty','ketty_wink'].map(n=>`assets/characters/${n}.webp`)];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(path=>new URL(path,BASE).href))));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}
    return response;
  }).catch(async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request);
    if(cached)return cached;
    if(event.request.mode==='navigate')return cache.match(new URL('index.html',BASE).href);
    return Response.error();
  }));
});
