(function(){
const VAPID='BE3iyFwCFl7eYQ1EWc6bPJzS6ep1Jyj57rNAMx9-E7v_3wy-JIRzRDE8ibu0S8ch3mLlT4ThT2kQjMnB8yPNoJY';
function b64(s){const p='='.repeat((4-s.length%4)%4),x=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...x].map(c=>c.charCodeAt(0)))}
async function saveSub(sub){if(typeof user==='undefined'||!user||!sub)return;const j=sub.toJSON();const row={user_id:user.id,endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,user_agent:navigator.userAgent,active:true,updated_at:new Date().toISOString()};const {error}=await sb.from('push_subscriptions').upsert(row,{onConflict:'endpoint'});if(error)throw error}
async function enable(){try{
 if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window))return toast('Este dispositivo no admite avisos push.');
 let perm=Notification.permission;if(perm!=='granted')perm=await Notification.requestPermission();if(perm!=='granted')return toast('Debes permitir las notificaciones para recibir avisos.');
 const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(VAPID)});await saveSub(sub);updateButton();toast('Avisos activados en este dispositivo.');
 }catch(e){toast('No se pudieron activar los avisos: '+(e.message||e));}}
async function testNotification(){try{
 if(Notification.permission!=='granted')return toast('Primero debes activar los avisos.');
 const reg=await navigator.serviceWorker.ready;
 await reg.showNotification('Mi Día · Prueba de aviso',{body:'Si ves este mensaje, Android y Chrome muestran correctamente las notificaciones.',tag:'mi-dia-test-'+Date.now(),renotify:true,data:{url:'./'}});
 toast('Prueba enviada al teléfono.');
 }catch(e){toast('No se pudo mostrar la prueba: '+(e.message||e));}}
async function updateButton(){const b=document.getElementById('pushBtn');if(!b)return;let on=false;try{const reg=await navigator.serviceWorker.ready;on=Notification.permission==='granted'&&!!(await reg.pushManager.getSubscription())}catch(_){}b.textContent=on?'🔔 Avisos activos':'🔔 Activar avisos';const t=document.getElementById('pushTestBtn');if(t)t.hidden=!on;}
function addButton(){if(document.getElementById('pushBtn'))return;const app=document.getElementById('app'),bar=document.querySelector('.bar');if(!bar||!app||app.hidden)return;const b=document.createElement('button');b.id='pushBtn';b.className='btn secondary';b.textContent='🔔 Activar avisos';b.onclick=enable;const t=document.createElement('button');t.id='pushTestBtn';t.className='btn secondary';t.textContent='Probar aviso';t.onclick=testNotification;t.hidden=true;bar.insertBefore(b,bar.lastElementChild);bar.insertBefore(t,bar.lastElementChild);setTimeout(updateButton,300)}
function watch(){addButton();setTimeout(watch,700)}
window.addEventListener('load',()=>setTimeout(addButton,200));
watch();
})();
