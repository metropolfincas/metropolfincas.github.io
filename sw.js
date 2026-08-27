const CACHE='mi-dia-v8';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('push',e=>{
  let d={title:'Mi Día · Metropol',body:'Tienes un aviso pendiente',url:'./'};
  try{d={...d,...JSON.parse(e.data?.text()||'{}')}}catch(_){if(e.data)d.body=e.data.text()}
  e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'icon-192.png',badge:'icon-192.png',tag:'mi-dia-task',renotify:true,data:{url:d.url||'./'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
    for(const w of ws){if('focus'in w){w.navigate(e.notification.data?.url||'./');return w.focus()}}
    return clients.openWindow(e.notification.data?.url||'./');
  }));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const isHtml=u.origin===self.location.origin&&(u.pathname==='/'||u.pathname.endsWith('/index.html'));
  if(isHtml){e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{
    let text=await r.text();
    if(!text.includes('mi-dia-fix.js'))text=text.replace('</body>','<script src="mi-dia-fix.js?v=8"></script></body>');
    if(!text.includes('mi-dia-push.js'))text=text.replace('</body>','<script src="mi-dia-push.js?v=8"></script></body>');
    const h=new Headers(r.headers);h.delete('content-length');h.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');
    return new Response(text,{status:r.status,statusText:r.statusText,headers:h});
  }).catch(()=>caches.match(e.request)));return;}
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));
});
