(function(){
  function n(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function findMember(firstName){
    const target=n(firstName);
    return (window.team||team||[]).find(x=>n(x.full_name).split(' ')[0]===target) || null;
  }
  function detectPerson(text){
    const t=n(text);
    if(/\bcristina\b/.test(t)) return findMember('cristina');
    if(/\bana\b/.test(t)) return findMember('ana');
    if(/\bleonardo\b/.test(t)) return findMember('leonardo');
    return null;
  }
  function preview(text){
    const box=document.getElementById('voiceAssignmentPreview');
    if(!box) return;
    const t=n(text);
    const mine=/\b(mio|personal)\b/.test(t);
    const p=detectPerson(text);
    if(mine){box.textContent='Se creará en MÍO · sin asignar';return;}
    if(p){box.textContent='Se creará en OFICINA · '+p.full_name;return;}
    if(/\boficina\b/.test(t)){box.textContent='Se creará en OFICINA · sin persona asignada';return;}
    box.textContent='Se creará en '+((typeof view!=='undefined'&&view==='office')?'OFICINA':'MÍO');
  }
  function ensurePreview(){
    const ins=document.getElementById('vpins');
    if(!ins || document.getElementById('voiceAssignmentPreview')) return;
    const box=document.createElement('div');
    box.id='voiceAssignmentPreview';
    box.style.cssText='margin-top:8px;padding:10px;border-radius:10px;background:#f3eff1;font-weight:800;font-size:12px';
    box.textContent='Se mostrará aquí la asignación';
    ins.insertAdjacentElement('afterend',box);
    ins.addEventListener('input',()=>preview(ins.value));
  }
  const oldOpen=window.openVoice;
  window.openVoice=function(){ if(oldOpen) oldOpen(); setTimeout(ensurePreview,0); };
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  window.listen=function(part){
    if(!SR){ if(window.toast) toast('Este navegador no permite el dictado directo. Usa Chrome actualizado.'); return; }
    const r=new SR(); r.lang='es-ES'; r.interimResults=false; r.continuous=false;
    r.onresult=e=>{
      const text=e.results[0][0].transcript.trim();
      const el=document.getElementById(part==='message'?'vpmsg':'vpins');
      if(el) el.value=text;
      if(part==='instructions') preview(text);
    };
    r.onerror=()=>{ if(window.toast) toast('No se ha podido usar el micrófono'); };
    r.start();
  };
  window.parseInstructions=function(s){
    const t=n(s), explicitMine=/\b(mio|personal)\b/.test(t), explicitOffice=/\boficina\b/.test(t);
    const p={channel:explicitMine?'mine':(explicitOffice?'office':((typeof view!=='undefined'&&view==='office')?'office':'mine')),assigned_email:'',assigned_name:'',community_id:'',date:'',time:''};
    const member=detectPerson(s);
    if(member && !explicitMine){p.channel='office';p.assigned_email=member.email;p.assigned_name=member.full_name;}
    if(explicitMine){p.assigned_email='';p.assigned_name='';}
    if(typeof communities!=='undefined'){
      const c=communities.find(x=>t.includes(n(x.name))); if(c) p.community_id=c.id;
    }
    let d=new Date();
    if(t.includes('pasado manana')) d.setDate(d.getDate()+2);
    else if(t.includes('manana')) d.setDate(d.getDate()+1);
    else if(!t.includes('hoy')){
      const days=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
      const di=days.findIndex(x=>t.includes(x));
      if(di>=0){let diff=(di-d.getDay()+7)%7;if(diff===0)diff=7;d.setDate(d.getDate()+diff);}
    }
    p.date=typeof iso==='function'?iso(d):'';
    p.time=typeof findTime==='function'?findTime(t):'';
    return p;
  };
  const oldCreate=window.createVoiceTask;
  window.createVoiceTask=async function(){
    const message=(document.getElementById('vpmsg')?.value||'').trim();
    const instructions=(document.getElementById('vpins')?.value||'').trim();
    if(!message){ if(window.toast) toast('Escribe o dicta el mensaje'); return; }
    const p=window.parseInstructions(instructions);
    const member=(typeof team!=='undefined'?team:[]).find(x=>x.email===p.assigned_email) || null;
    const data={title:message,details:'',channel:p.channel||'mine',task_date:p.date||(typeof iso==='function'?iso():null),task_time:p.time||null,reminder_minutes:null,community_id:p.community_id||null,assigned_email:p.channel==='office'?(p.assigned_email||null):null,assigned_name:p.channel==='office'?(p.assigned_name||null):null,assigned_to:p.channel==='office'?(member?.user_id||null):null,created_by:user.id};
    const {error}=await sb.from('tasks').insert(data);
    if(error){ if(window.toast) toast(error.message); return; }
    if(window.closeVoice) closeVoice();
    if(window.loadTasks) await loadTasks();
    if(window.toast) toast('Tarea creada'+(data.assigned_name?' · '+data.assigned_name:''));
  };
  document.addEventListener('DOMContentLoaded',ensurePreview);
})();
