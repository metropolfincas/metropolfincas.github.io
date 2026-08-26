const CACHE='mi-dia-v7';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  const isHtml=u.origin===self.location.origin && (u.pathname==='/' || u.pathname.endsWith('/index.html'));
  if(isHtml){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{
      let text=await r.text();
      if(!text.includes('mi-dia-fix.js')) text=text.replace('</body>','<script src="mi-dia-fix.js?v=7"></script></body>');
      const h=new Headers(r.headers);h.delete('content-length');h.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
      return new Response(text,{status:r.status,statusText:r.statusText,headers:h});
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));
});
