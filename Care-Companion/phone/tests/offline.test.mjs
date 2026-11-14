import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const directory=fileURLToPath(new URL('../',import.meta.url));
const source=fs.readFileSync(path.join(directory,'sw.js'),'utf8');
const base=new URL('https://example.test/Aloha-Robotics-HH2.0/Care-Companion/phone/');
const prefix='aloha-care-companion-phone-';

function worker({keys=[],cached=new Map(),network=async()=>{throw Error('offline')}}={}){
  const handlers=new Map(),opened=[],deleted=[],installed=[],writes=[];
  let claimed=false;
  const store={
    async addAll(urls){installed.push(...urls)},
    async match(request){return cached.get(typeof request==='string'?request:request.url)},
    async put(request,response){writes.push({request,response})},
  };
  vm.runInNewContext(source,{
    URL,Response,
    self:{location:{href:new URL('sw.js',base).href},addEventListener:(n,f)=>handlers.set(n,f),clients:{claim:async()=>{claimed=true}}},
    caches:{open:async key=>{opened.push(key);return store},keys:async()=>keys,delete:async key=>{deleted.push(key);return true}},
    fetch:network,
  });
  return {handlers,opened,deleted,installed,writes,get claimed(){return claimed}};
}

test('install precaches a complete phone-only shell at the new path',async()=>{
  const w=worker();let install;
  w.handlers.get('install')({waitUntil:p=>{install=p}});await install;
  assert.ok(w.opened[0].startsWith(prefix));
  assert.ok(w.installed.length>20);
  assert.equal(new Set(w.installed).size,w.installed.length);
  for(const url of w.installed){
    const u=new URL(url);
    assert.equal(u.origin,base.origin);
    assert.ok(u.pathname.startsWith(base.pathname),url);
    const relative=decodeURIComponent(u.pathname.slice(base.pathname.length))||'index.html';
    assert.ok(fs.statSync(path.join(directory,relative)).isFile(),relative);
    assert.ok(!relative.startsWith('arcade/'),relative);
  }
  for(const needed of ['index.html','app.mjs','state.mjs','manifest.webmanifest','assets/fonts/fonts.css']){
    assert.ok(w.installed.includes(new URL(needed,base).href),needed);
  }
});

test('activation removes only old caches from this new installation namespace',async()=>{
  const probe=worker();let install;probe.handlers.get('install')({waitUntil:p=>{install=p}});await install;
  const current=probe.opened[0],old=prefix+'older';
  const legacy='carmagotchi-phone-app-20261114-2-arcade';
  const w=worker({keys:[current,old,legacy,'another-site-cache']});let activation;
  w.handlers.get('activate')({waitUntil:p=>{activation=p}});await activation;
  assert.deepEqual(w.deleted,[old]);
  assert.equal(w.claimed,true);
});

test('worker leaves legacy phone, canonical arcade and third-party requests alone',()=>{
  const w=worker();
  for(const [url,method] of [
    [new URL('../../CARMAGOTCHI_APP/',base).href,'GET'],
    [new URL('../../C-Arcade/',base).href,'GET'],
    ['https://another.test/assets/icon.svg','GET'],
    [new URL('state.mjs',base).href,'POST'],
  ]){
    let intercepted=false;
    w.handlers.get('fetch')({request:{url,method},respondWith:()=>{intercepted=true}});
    assert.equal(intercepted,false,url);
  }
});

test('offline navigation falls back to this phone cache, never another cache namespace',async()=>{
  const cached=new Map([[new URL('index.html',base).href,new Response('phone shell')]]);
  const w=worker({cached});let response;
  w.handlers.get('fetch')({
    request:{url:new URL('unvisited-route',base).href,method:'GET',mode:'navigate'},
    respondWith:p=>{response=p},
  });
  assert.equal(await (await response).text(),'phone shell');
  assert.ok(w.opened.every(k=>k.startsWith(prefix)));
});

test('offline assets use exact cached responses and never receive HTML as a substitute',async()=>{
  const exact=new URL('app.css',base).href;
  const w=worker({cached:new Map([[exact,new Response('body { color: teal; }')]])});
  const request=async relative=>{
    let response;
    w.handlers.get('fetch')({request:{url:new URL(relative,base).href,method:'GET',mode:'cors'},respondWith:p=>{response=p}});
    return response;
  };
  assert.equal(await (await request('app.css')).text(),'body { color: teal; }');
  assert.equal((await request('not-cached.png')).type,'error');
});

test('online success refreshes only this cache and leaves the response usable',async()=>{
  const w=worker({network:async()=>new Response('fresh CSS')});let response,persist;
  w.handlers.get('fetch')({
    request:{url:new URL('app.css',base).href,method:'GET',mode:'cors'},
    respondWith:p=>{response=p},
    waitUntil:p=>{persist=p},
  });
  assert.equal(await (await response).text(),'fresh CSS');await persist;
  assert.equal(w.writes.length,1);
  assert.equal(await w.writes[0].response.text(),'fresh CSS');
  assert.ok(w.opened.every(k=>k.startsWith(prefix)));
});

test('installable manifest remains local to the canonical phone folder',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.webmanifest'),'utf8'));
  for(const key of ['id','start_url','scope'])assert.equal(new URL(manifest[key],base).href,base.href);
  assert.equal(manifest.display,'standalone');
  for(const icon of manifest.icons)assert.ok(fs.statSync(path.join(directory,icon.src)).isFile(),icon.src);
});
