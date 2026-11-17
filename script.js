/* ===== EDIT: task categories, quotes, moods and event types are the lists at the top ===== */
const CATS=[["personal","🌸","Personal"],["work","💼","Work / Study"],["home","🏠","Home"],["health","💪","Health"],["friends","💌","Friends"]];
const QUOTES=["Small steps still move you forward.","Progress, not perfection.","You're doing better than you think.","One little thing at a time.","Be proud of how far you've come."];
const MOODS=["😊","😌","😐","😔","😤"];
let S={tasks:[],goals:[],journal:[],events:[],profile:{name:"",college:"",course:""},pin:"",streak:{last:"",count:0}};
const ETYPES=[["task","✅","Task"],["exam","📝","Exam"],["deadline","⏰","Deadline"],["event","🎉","Event"],["holiday","🌴","Holiday"]];
const _n=new Date();let ui={cat:"all",newCat:"personal",mood:"😊",cal:{y:_n.getFullYear(),m:_n.getMonth(),sel:""}};
try{const raw=localStorage.getItem("mlp-v1");if(raw)S=Object.assign(S,JSON.parse(raw))}catch(e){}
const save=()=>{try{localStorage.setItem("mlp-v1",JSON.stringify(S))}catch(e){}};
const uid=()=>Math.random().toString(36).slice(2,9);
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const ymd=(y,m,d)=>y+"-"+pad(m+1)+"-"+pad(d);
const fmtDate=d=>new Date(d+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"});
const hash=v=>{let x=5381;const t="mlp|"+v;for(const c of t)x=(x*33^c.charCodeAt(0))>>>0;return x.toString(36)};
function toast(m){const d=document.createElement("div");d.className="toast";d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}
const catOf=id=>CATS.find(c=>c[0]===id)||CATS[0];
const $=s=>document.querySelector(s);

function markActive(){ // streak: counts days you finished at least one task
  const t=today(),y=new Date(Date.now()-864e5),ys=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");
  if(S.streak.last===t)return;
  S.streak.count=S.streak.last===ys?S.streak.count+1:1;S.streak.last=t;
}
function ring(p){const r=46,c=2*Math.PI*r;return `<div class="ring"><svg width="110" height="110"><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--dot)" stroke-width="10"/><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-p/100)}"/></svg><b>${Math.round(p)}%</b></div>`}

function evRow(e,del){const ty=ETYPES.find(x=>x[0]===e.type)||ETYPES[3];return `<div class="task"><span style="font-size:20px">${ty[1]}</span><span class="t">${esc(e.text)}</span><span class="tag">${fmtDate(e.date)}</span>${del?`<button class="ghost" data-act="del-event" data-id="${e.id}" aria-label="Delete">✕</button>`:""}</div>`}
function upcoming(){const t=today(),l=S.events.filter(e=>e.date>=t).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);return l.length?`<section class="card"><h2>Coming up</h2>${l.map(e=>evRow(e)).join("")}</section>`:""}
function collegeLine(){const p=S.profile;const x=[p.college,p.course].filter(Boolean).map(esc).join(" · ");return x?`<p style="margin:4px 0 0;font-weight:600;color:var(--accent-d)">🎓 ${x}</p>`:""}
function greet(){const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening"}
function taskRow(t){const c=catOf(t.cat);return `<div class="task ${t.done?"done":""}"><button class="check" data-act="toggle" data-id="${t.id}" aria-label="Mark done">${t.done?"✓":""}</button><span class="t">${esc(t.text)}</span>${t.date&&t.date!==today()?`<span class="muted small">${fmtDate(t.date)}</span>`:""}<span class="tag">${c[1]} ${c[2]}</span><button class="ghost" data-act="del-task" data-id="${t.id}" aria-label="Delete">✕</button></div>`}

const pages={
home(){
  const open=S.tasks.filter(t=>!t.done),done=S.tasks.filter(t=>t.done);
  const p=S.tasks.length?done.length/S.tasks.length*100:0;
  const q=QUOTES[new Date().getDate()%QUOTES.length];
  const goals=S.goals.slice(0,3).map(g=>goalCard(g,true)).join("");
  return `<section class="card hero">${ring(p)}<div><h1>${greet()}${S.profile.name?", "+esc(S.profile.name):""}!</h1>${collegeLine()}<p>${S.tasks.length?`${done.length} of ${S.tasks.length} tasks done.`:"Add your first task to get started."}</p></div></section>
  <div class="stats"><div class="stat"><b>${open.length}</b><small>To do</small></div><div class="stat"><b>${done.length}</b><small>Done</small></div><div class="stat"><b>🔥 ${S.streak.count}</b><small>Day streak</small></div></div>
  <div class="quote">“${q}”</div><div style="height:16px"></div>
  ${upcoming()}<section class="card"><h2>Up next</h2>${open.length?open.slice(0,4).map(taskRow).join(""):`<div class="empty">Nothing waiting. Enjoy the calm 🍃</div>`}</section>
  ${goals?`<section class="card"><h2>Your goals</h2>${goals}</section>`:""}`;
},
tasks(){
  const list=S.tasks.filter(t=>ui.cat==="all"||t.cat===ui.cat);
  const sorted=[...list.filter(t=>!t.done),...list.filter(t=>t.done)];
  return `<section class="card"><h2>Add a task</h2>
  <div class="row"><input class="grow" id="taskIn" placeholder="What would you like to get done?" maxlength="120"><input type="date" id="taskDate" value="${ui.newDate||today()}"><button class="btn" data-act="add-task">Add</button></div>
  <div class="chips">${CATS.map(c=>`<button class="chip ${ui.newCat===c[0]?"on":""}" data-act="newcat" data-id="${c[0]}">${c[1]} ${c[2]}</button>`).join("")}</div></section>
  <section class="card"><div class="chips" style="margin-top:0"><button class="chip ${ui.cat==="all"?"on":""}" data-act="filter" data-id="all">All</button>${CATS.map(c=>`<button class="chip ${ui.cat===c[0]?"on":""}" data-act="filter" data-id="${c[0]}">${c[1]}</button>`).join("")}</div>
  ${sorted.length?sorted.map(taskRow).join(""):`<div class="empty">No tasks here yet 🌿</div>`}
  ${S.tasks.some(t=>t.done)?`<div style="text-align:right;margin-top:8px"><button class="chip" data-act="clear-done">Clear completed</button></div>`:""}</section>`;
},
goals(){
  return `<section class="card"><h2>New goal</h2><div class="row"><input class="grow" id="goalIn" placeholder="e.g. Read 12 books" maxlength="80"><input id="goalTarget" type="number" min="1" placeholder="Target" style="width:100px"><button class="btn" data-act="add-goal">Add</button></div></section>
  ${S.goals.length?S.goals.map(g=>`<section class="card">${goalCard(g)}</section>`).join(""):`<div class="empty">Set a goal and track it step by step 🌱</div>`}`;
},
calendar(){
  const {y,m}=ui.cal;if(!ui.cal.sel)ui.cal.sel=today();const sel=ui.cal.sel,t=today();
  const first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
  let cells=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>`<div class="dow">${d}</div>`).join("")+"<div></div>".repeat(first);
  for(let d=1;d<=n;d++){const ds=ymd(y,m,d),tk=S.tasks.some(x=>x.date===ds),ev=S.events.some(x=>x.date===ds);
    cells+=`<button class="day ${ds===t?"today":""} ${ds===sel?"sel":""}" data-act="cal-sel" data-id="${ds}">${d}<span class="dots">${tk?"<i></i>":""}${ev?'<i class="e"></i>':""}</span></button>`}
  const tasks=S.tasks.filter(x=>x.date===sel),evs=S.events.filter(x=>x.date===sel);
  return `<section class="card"><div class="cal-head"><button class="chip" data-act="cal-prev" aria-label="Previous month">‹</button><h2>${new Date(y,m,1).toLocaleDateString(undefined,{month:"long",year:"numeric"})}</h2><button class="chip" data-act="cal-next" aria-label="Next month">›</button></div><div class="grid">${cells}</div>
  <div class="muted small" style="margin-top:10px">🟢 tasks &nbsp; 🌸 events &nbsp; <button class="chip" data-act="cal-today" style="padding:2px 10px;font-size:12px">Go to today</button></div></section>
  <section class="card"><h2>${new Date(sel+"T00:00:00").toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}</h2>
  ${evs.map(e=>evRow(e,true)).join("")}${tasks.map(taskRow).join("")}${!evs.length&&!tasks.length?`<div class="empty">Nothing planned for this day.</div>`:""}
  <div class="row" style="margin-top:14px"><input class="grow" id="evIn" placeholder="Add something to this day…" maxlength="100"><select id="evType">${ETYPES.map(x=>`<option value="${x[0]}">${x[1]} ${x[2]}</option>`).join("")}</select><button class="btn" data-act="add-item">Add</button></div></section>${upcoming()}`;
},
me(){
  const p=S.profile,pin=`<input id="pinNew" type="password" inputmode="numeric" maxlength="6" placeholder="4–6 digits" autocomplete="off" style="width:140px">`;
  return `<section class="card"><h2>About you</h2><div style="display:grid;gap:12px">
  <label>Your name<input id="pName" value="${esc(p.name)}" maxlength="40" placeholder="e.g. Sara"></label>
  <label>College / school<input id="pCollege" value="${esc(p.college)}" maxlength="70" placeholder="e.g. Tribhuvan University"></label>
  <label>Course &amp; year (optional)<input id="pCourse" value="${esc(p.course)}" maxlength="50" placeholder="e.g. BSc CSIT, 2nd year"></label></div>
  <div style="margin-top:14px"><button class="btn" data-act="save-profile">Save</button></div></section>
  <section class="card"><h2>🔒 App lock</h2>${S.pin?`<p class="muted" style="margin-top:0">PIN lock is <b>on</b>. You'll be asked for it each time you open the app.</p><div class="row">${pin}<button class="btn" data-act="set-pin">Change PIN</button></div><div class="row" style="margin-top:10px"><button class="chip" data-act="lock-now">Lock now</button><button class="chip" data-act="remove-pin">Turn off lock</button></div>`:`<p class="muted" style="margin-top:0">Keep your tasks and journal private with a PIN.</p><div class="row">${pin}<button class="btn" data-act="set-pin">Turn on lock</button></div>`}
  <p class="muted small" style="margin-bottom:0">This keeps casual snoopers out. It isn't military-grade encryption.</p></section>`;
},
journal(){
  const e=[...S.journal].reverse();
  return `<section class="card"><h2>How was your day?</h2><div class="moods">${MOODS.map(m=>`<button class="${ui.mood===m?"on":""}" data-act="mood" data-id="${m}">${m}</button>`).join("")}</div>
  <textarea id="jIn" placeholder="Write a few lines about today, something you're grateful for, or a small win…"></textarea>
  <div style="margin-top:10px"><button class="btn" data-act="add-entry">Save entry</button></div></section>
  <section class="card"><h2>Past entries</h2>${e.length?e.map(x=>`<div class="entry"><div class="goal-top"><b>${x.mood} ${esc(x.date)}</b><button class="ghost" data-act="del-entry" data-id="${x.id}" aria-label="Delete">✕</button></div><p>${esc(x.text)}</p></div>`).join(""):`<div class="empty">Your entries will show up here 📖</div>`}</section>`;
}};
function goalCard(g,compact){
  const p=Math.min(100,g.current/g.target*100);
  return `<div class="goal" ${compact?'style="margin-bottom:14px"':""}><div class="goal-top"><h3>${esc(g.title)}</h3>${compact?"":`<button class="ghost" data-act="del-goal" data-id="${g.id}" aria-label="Delete">✕</button>`}</div>
  <div class="bar"><i style="width:${p}%"></i></div>
  <div class="goal-top"><span class="muted">${g.current} of ${g.target}${p>=100?" 🎉":""}</span>${compact?"":`<span><button class="chip" data-act="goal-" data-id="${g.id}">−</button> <button class="chip" data-act="goal+" data-id="${g.id}">+ 1</button></span>`}</div></div>`;
}

function render(){
  const p=(location.hash||"#home").slice(1);const page=pages[p]?p:"home";
  $("#view").innerHTML=pages[page]();
  $("#brand").textContent="✨ "+(S.profile.college||"My Little Progress");$("#lockBtn").hidden=!S.pin;
  document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("on",a.dataset.p===page));
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;
  const a=b.dataset.act,id=b.dataset.id;
  if(a==="toggle"){const t=S.tasks.find(x=>x.id===id);t.done=!t.done;if(t.done)markActive()}
  else if(a==="del-task")S.tasks=S.tasks.filter(x=>x.id!==id);
  else if(a==="newcat"){ui.newCat=id;ui.newDate=$("#taskDate").value;const v=$("#taskIn").value;render();$("#taskIn").value=v;return}
  else if(a==="filter")ui.cat=id;
  else if(a==="clear-done")S.tasks=S.tasks.filter(x=>!x.done);
  else if(a==="add-task"){const el=$("#taskIn"),v=el.value.trim();if(!v){el.focus();return}S.tasks.push({id:uid(),text:v,cat:ui.newCat,done:false,date:$("#taskDate").value||today()});ui.newDate=""}
  else if(a==="add-goal"){const v=$("#goalIn").value.trim(),n=parseInt($("#goalTarget").value,10);if(!v||!(n>0)){$("#goalIn").focus();return}S.goals.push({id:uid(),title:v,target:n,current:0})}
  else if(a==="goal+"){const g=S.goals.find(x=>x.id===id);g.current=Math.min(g.target,g.current+1)}
  else if(a==="goal-"){const g=S.goals.find(x=>x.id===id);g.current=Math.max(0,g.current-1)}
  else if(a==="del-goal")S.goals=S.goals.filter(x=>x.id!==id);
  else if(a==="mood"){ui.mood=id;const v=$("#jIn").value;render();$("#jIn").value=v;return}
  else if(a==="add-entry"){const v=$("#jIn").value.trim();if(!v){$("#jIn").focus();return}S.journal.push({id:uid(),text:v,mood:ui.mood,date:new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})})}
  else if(a==="del-entry")S.journal=S.journal.filter(x=>x.id!==id);
  else if(a==="cal-prev"){ui.cal.m--;if(ui.cal.m<0){ui.cal.m=11;ui.cal.y--}}
  else if(a==="cal-next"){ui.cal.m++;if(ui.cal.m>11){ui.cal.m=0;ui.cal.y++}}
  else if(a==="cal-today"){const d=new Date();ui.cal={y:d.getFullYear(),m:d.getMonth(),sel:today()}}
  else if(a==="cal-sel")ui.cal.sel=id;
  else if(a==="add-item"){const v=$("#evIn").value.trim(),ty=$("#evType").value;if(!v){$("#evIn").focus();return}
    if(ty==="task")S.tasks.push({id:uid(),text:v,cat:"personal",done:false,date:ui.cal.sel});else S.events.push({id:uid(),text:v,type:ty,date:ui.cal.sel})}
  else if(a==="del-event")S.events=S.events.filter(x=>x.id!==id);
  else if(a==="save-profile"){S.profile={name:$("#pName").value.trim(),college:$("#pCollege").value.trim(),course:$("#pCourse").value.trim()};toast("Saved ✨")}
  else if(a==="set-pin"){const v=$("#pinNew").value;if(!/^\d{4,6}$/.test(v)){toast("PIN must be 4–6 digits");return}S.pin=hash(v);toast("Lock is on 🔒")}
  else if(a==="remove-pin"){S.pin="";toast("Lock turned off")}
  else if(a==="lock-now"){save();showLock();return}
  save();render();
});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="taskIn")document.querySelector('[data-act="add-task"]').click();if(e.key==="Enter"&&(e.target.id==="goalIn"||e.target.id==="goalTarget"))document.querySelector('[data-act="add-goal"]').click()});
window.addEventListener("hashchange",render);
function showLock(){const n=S.profile.name;$("#lockTitle").textContent=n?"Welcome back, "+n:"Welcome back";$("#lock").hidden=false;$("#pinIn").value="";$("#pinMsg").textContent="";setTimeout(()=>$("#pinIn").focus(),50)}
function tryUnlock(){if(hash($("#pinIn").value)===S.pin){$("#lock").hidden=true}else{$("#pinMsg").textContent="Wrong PIN, try again 🌸";$("#pinIn").value=""}}
$("#unlockBtn").onclick=tryUnlock;
$("#pinIn").addEventListener("keydown",e=>{if(e.key==="Enter")tryUnlock()});
$("#lockBtn").onclick=showLock;
$("#forgotBtn").onclick=()=>{if(confirm("Forgot PIN? The only way in is to erase all saved data on this device. Erase everything?")){try{localStorage.removeItem("mlp-v1")}catch(e){}S={tasks:[],goals:[],journal:[],events:[],profile:{name:"",college:"",course:""},pin:"",streak:{last:"",count:0}};$("#lock").hidden=true;render()}};
$("#themeBtn").onclick=()=>{
  const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;
  r.dataset.theme=dark?"light":"dark";$("#themeBtn").textContent=dark?"🌙":"☀️";
  try{localStorage.setItem("mlp-theme",r.dataset.theme)}catch(e){}
};
try{const th=localStorage.getItem("mlp-theme");if(th){document.documentElement.dataset.theme=th;$("#themeBtn").textContent=th==="dark"?"☀️":"🌙"}}catch(e){}
render();
if(S.pin)showLock();
