const CACHE='mi-dia-v6';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.pathname.endsWith('/')||u.pathname.endsWith('/index.html')){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{
      let html=await r.text();
      if(!html.includes('mi-dia-fix.js')) html=html.replace('</body>','<script src="./mi-dia-fix.js?v=6"></script></body>');
      const h=new Headers(r.headers);h.delete('content-length');h.set('cache-control','no-store,max-age=0');
      return new Response(html,{status:r.status,statusText:r.statusText,headers:h});
    }));
  } else e.respondWith(fetch(e.request,{cache:'no-store'}));
});
