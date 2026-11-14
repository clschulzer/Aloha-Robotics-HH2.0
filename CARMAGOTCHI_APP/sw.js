/* Offline shell for this app folder only. Network first keeps published revisions fresh. */
const CACHE='carmagotchi-phone-app-20261114-2-arcade';
const BASE=new URL('./',self.location.href);
const SHELL=['./','index.html','app.css','app.mjs','state.mjs','manifest.webmanifest',
  'engine/planner.js','engine/golden.js','engine/day.js','assets/fonts/fonts.css',
  'assets/icon.svg','assets/icon-192.png','assets/icon-512.png','share/qr.png','share/qr-card.png',
  ...['lonely','manic','update','bliss','failure','rollback','ketty','ketty_wink'].map(n=>`assets/characters/${n}.webp`),
  'arcade/','arcade/index.html','arcade/arcade.css','arcade/arcade.mjs',
  'arcade/share/qr.png','arcade/share/qr-card.png',
  'arcade/c-chomp/','arcade/c-chomp/index.html','arcade/c-chomp/style.css',
  'arcade/c-chomp/game.mjs','arcade/c-chomp/engine.mjs',
  'arcade/plug-panic/','arcade/plug-panic/index.html','arcade/plug-panic/game.css',
  'arcade/plug-panic/game.mjs','arcade/plug-panic/engine.mjs'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(path=>new URL(path,BASE).href))));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('carmagotchi-phone-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}
    return response;
  }).catch(async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    if(event.request.mode==='navigate')return caches.match(new URL('index.html',BASE).href);
    return Response.error();
  }));
});
