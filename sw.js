/* Cache application shell. Network-first for versioned code; offline fallback. */
const CACHE='aptis-hub-v42-20261026';
const ASSETS=['./','./index.html','./styles.css','./app.js','./teacher-features.js','./study-support.js','./submission.js','./data/builtin.js','./data/teacher-homework.js','./data/teacher-translations.js','./data/extra-packs.js','./manifest.json','./assets/icon-192.png','./assets/icon-512.png','./data/example-pack.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('aptis-hub-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{}))}
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached|| (event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
