(function(){
function norm(s){return (s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function addTabs(){const tabs=document.querySelector('.tabs');if(!tabs)return;
 if(!tabs.querySelector('[data-v="office-mine"]')){const b=document.createElement('button');b.className='tab';b.dataset.v='office-mine';b.textContent='OFICINA · MÍAS';tabs.insertBefore(b,tabs.querySelector('[data-v="all"]'));}
 if(!tabs.querySelector('[data-v="search"]')){const b=document.createElement('button');b.className='tab';b.dataset.v='search';b.textContent='BUSCAR';tabs.appendChild(b);}
 tabs.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{view=b.dataset.v;tabs.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));render();});
}
function ensureSearch(){let main=document.querySelector('#app main');if(!main||document.getElementById('searchPanel'))return;const p=document.createElement('div');p.id='searchPanel';p.hidden=true;p.innerHTML='<div class="card"><div class="title">Buscar tareas</div><div class="details" style="margin-bottom:8px">Busca por asunto, información, comunidad, persona asignada, fecha o canal.</div><div style="display:flex;gap:8px;align-items:center"><input id="taskSearch" type="search" placeholder="Ej.: Terrazas, Cristina, ascensor..." style="flex:1"><button id="clearTaskSearch" class="btn secondary">Limpiar</button></div><div id="searchCount" class="details" style="margin-top:8px"></div></div>';const list=document.getElementById('list');main.insertBefore(p,list);document.getElementById('taskSearch').addEventListener('input',()=>render());document.getElementById('clearTaskSearch').onclick=()=>{document.getElementById('taskSearch').value='';render()};}
function mineOffice(t){if(t.channel!=='office')return false;const uid=user?.id||'';const email=norm(user?.email||'');return (t.assigned_to&&t.assigned_to===uid)||(t.assigned_email&&norm(t.assigned_email)===email)}
function searchable(t){return norm([t.title,t.details,t.assigned_name,t.assigned_email,t.communities?.name,t.task_date,t.task_time,t.channel==='mine'?'mio':'oficina'].filter(Boolean).join(' '))}
const oldRender=window.render;
window.render=function(){addTabs();ensureSearch();const sp=document.getElementById('searchPanel'),cc=document.getElementById('calendarControls'),list=document.getElementById('list');if(sp)sp.hidden=view!=='search';if(cc)cc.hidden=view!=='calendar';if(list)list.hidden=view==='calendar';if(view==='calendar')return renderCalendar();let a=tasks||[];
 if(view==='mine')a=a.filter(t=>t.channel==='mine');
 else if(view==='office')a=a.filter(t=>t.channel==='office');
 else if(view==='office-mine')a=a.filter(mineOffice);
 else if(view==='search'){const q=norm(document.getElementById('taskSearch')?.value||'');a=q?a.filter(t=>searchable(t).includes(q)):a;const c=document.getElementById('searchCount');if(c)c.textContent=q?`${a.length} tarea${a.length===1?'':'s'} encontrada${a.length===1?'':'s'}`:`${a.length} tareas disponibles`}
 if(list)list.innerHTML=a.length?a.map(card).join(''):'<div class="empty">No hay tareas.</div>';
};
function init(){addTabs();ensureSearch();if(typeof render==='function')render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();setTimeout(init,700);
})();