// Salon Booking System -- starter app built with the same pattern as Guthrie RMS:
// one global `db` object, saved to localStorage, rendered with template strings.
// Bump with every release (with the ?v= tag in index.html).
window.SALON_APP_VERSION=1;

/* =========================================================================
   STEP 1 -- Small helpers
   ========================================================================= */
const $=s=>document.querySelector(s);
const app=$('#app');
const money=n=>'$'+(Number(n)||0).toFixed(2);
const uid=()=>Date.now()+Math.floor(Math.random()*1000);
// Escape anything a user typed before putting it into HTML.
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Times are stored as "HH:MM" strings and converted to minutes-since-midnight for math.
const toMin=t=>{const [h,m]=String(t).split(':').map(Number);return h*60+(m||0);};
const toTime=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const fmtTime=t=>{const m=toMin(t),h=Math.floor(m/60);return `${(h%12)||12}:${String(m%60).padStart(2,'0')} ${h<12?'AM':'PM'}`;};
// Dates are stored as local "YYYY-MM-DD" strings.
const todayStr=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);};
const addDays=(date,n)=>{const d=new Date(date+'T12:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10);};
const weekday=date=>new Date(date+'T12:00').getDay(); // 0 = Sunday
const fmtDate=date=>new Date(date+'T12:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* =========================================================================
   STEP 2 -- The data model (seed data used the first time the app loads)
   ========================================================================= */
const seed={
  settings:{businessName:'Bella Salon',subtitle:'Hair • Nails • Spa',openTime:'09:00',closeTime:'19:00',slotMinutes:15,taxRate:8.25,
    openDays:[1,2,3,4,5,6],theme:{primary:'#7B2D6B',accent:'#E7A6C4',page:'#FAF6F9'}},
  users:[
    {id:1,name:'Olivia Owner',pin:'9999',role:'owner',active:true},
    {id:2,name:'Fran FrontDesk',pin:'1111',role:'frontdesk',active:true},
    {id:3,name:'Sam Stylist',pin:'2001',role:'stylist',active:true,workDays:[2,3,4,5,6],serviceIds:[1,2,3,4,5]},
    {id:4,name:'Nia Nails',pin:'2002',role:'stylist',active:true,workDays:[1,2,3,4,5],serviceIds:[6,7]},
    {id:5,name:'Leo Color',pin:'2003',role:'stylist',active:true,workDays:[1,3,4,5,6],serviceIds:[1,2,3,4]}
  ],
  services:[
    {id:1,name:"Women's Haircut",category:'Hair',duration:45,price:55,active:true},
    {id:2,name:"Men's Haircut",category:'Hair',duration:30,price:30,active:true},
    {id:3,name:'Blowout',category:'Hair',duration:30,price:40,active:true},
    {id:4,name:'Single Process Color',category:'Color',duration:90,price:95,active:true},
    {id:5,name:'Highlights',category:'Color',duration:120,price:150,active:true},
    {id:6,name:'Manicure',category:'Nails',duration:30,price:30,active:true},
    {id:7,name:'Pedicure',category:'Nails',duration:45,price:45,active:true}
  ],
  clients:[
    {id:1,name:'Jordan Lee',phone:'555-0101',email:'jordan@example.com',notes:'Prefers quiet appointments.',created:'2026-01-05'},
    {id:2,name:'Casey Rivera',phone:'555-0102',email:'',notes:'Color formula: 6N + 20 vol.',created:'2026-02-11'}
  ],
  products:[
    {id:1,name:'Hydrating Shampoo',price:24,onHand:12,par:6},
    {id:2,name:'Repair Conditioner',price:26,onHand:4,par:6},
    {id:3,name:'Heat Protect Spray',price:19,onHand:9,par:4}
  ],
  appointments:[]
};

function loadSaved(){
  try{
    const raw=localStorage.getItem('salonBooking1');
    if(raw){const parsed=JSON.parse(raw); if(parsed&&typeof parsed==='object') return parsed;}
  }catch(err){console.warn('Saved salon data was unreadable, starting from seed.',err);}
  return JSON.parse(JSON.stringify(seed));
}
// `var` (not let/const) so firebase-sync.js can replace it through window.db.
var db=loadSaved();
function save(){localStorage.setItem('salonBooking1',JSON.stringify(db));}

// Short-lived screen state (who is logged in, which screen, wizard progress). Never saved.
let state={user:null,view:'dashboard',pin:'',modal:null,calDate:todayStr(),clientSearch:'',
  booking:null,online:false,checkoutId:null,reportFrom:todayStr(),reportTo:todayStr()};

/* =========================================================================
   STEP 3 -- Roles and which screens each role can open
   ========================================================================= */
const VIEWS={
  dashboard:'Dashboard',book:'Book',calendar:'Calendar',clients:'Clients',checkout:'Checkout',
  products:'Products',services:'Services',staff:'Staff',reports:'Reports',settings:'Settings'
};
const ROLE_ACCESS={
  owner:Object.keys(VIEWS),
  frontdesk:['dashboard','book','calendar','clients','checkout','products'],
  stylist:['dashboard','calendar','clients']
};
const canView=v=>v==='dashboard'||(ROLE_ACCESS[state.user?.role]||[]).includes(v);
const stylists=()=>db.users.filter(u=>u.role==='stylist'&&u.active);
const serviceById=id=>db.services.find(s=>s.id===id);
const clientById=id=>db.clients.find(c=>c.id===id);
const userById=id=>db.users.find(u=>u.id===id);

/* =========================================================================
   STEP 4 -- Render loop: every change calls save() then render()
   ========================================================================= */
function applyTheme(){
  const t=db.settings.theme||{};
  const r=document.documentElement.style;
  r.setProperty('--primary',t.primary||'#7B2D6B');
  r.setProperty('--accent',t.accent||'#E7A6C4');
  r.setProperty('--page',t.page||'#FAF6F9');
}
function render(){
  applyTheme();
  if(state.online) return renderOnlineBooking();
  if(!state.user) return renderLogin();
  if(!canView(state.view)) state.view='dashboard';
  app.innerHTML=topbar()+`<main class="wrap">${screens[state.view]()}</main>`+renderModal();
}
window.render=render;
function go(view){state.view=view;state.modal=null;render();}
window.go=go;
function toast(msg){document.querySelector('.toast')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="toast">${esc(msg)}</div>`);setTimeout(()=>document.querySelector('.toast')?.remove(),2200);}

function topbar(){
  const links=Object.keys(VIEWS).filter(canView).map(v=>`<button class="${state.view===v?'active':''}" onclick="go('${v}')">${VIEWS[v]}</button>`).join('');
  return `<header class="topbar"><b>${esc(db.settings.businessName)}</b><nav>${links}</nav><span class="spacer"></span>
    <span>${esc(state.user.name)} • ${state.user.role}</span><button class="btn small ghost" style="color:#fff;border-color:#fff" onclick="logout()">Log out</button></header>`;
}

/* =========================================================================
   STEP 5 -- PIN login
   ========================================================================= */
function renderLogin(){
  app.innerHTML=`<div class="login"><div class="card">
    <h1 style="color:var(--primary);margin-bottom:2px">${esc(db.settings.businessName)}</h1><p class="small">${esc(db.settings.subtitle)}</p>
    <p>Staff PIN</p><div class="pin-display">${'•'.repeat(state.pin.length)}</div>
    <div class="keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="btn" onclick="pinKey('${n}')">${n}</button>`).join('')}
      <button class="btn ghost" onclick="pinClear()">Clear</button><button class="btn" onclick="pinKey('0')">0</button><button class="btn green" onclick="pinLogin()">Go</button></div>
    <p class="error" id="loginError"></p>
    <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
    <button class="btn ghost" style="width:100%" onclick="startOnlineBooking()">📅 Book an appointment online</button>
    ${cloudStatusLine()}
  </div></div>`;
}
window.pinKey=n=>{if(state.pin.length<6){state.pin+=n;render();}};
window.pinClear=()=>{state.pin='';render();};
window.pinLogin=()=>{
  const u=db.users.find(x=>x.pin===state.pin&&x.active);
  state.pin='';
  if(!u){render();$('#loginError').textContent='PIN not recognized.';return;}
  state.user=u;state.view='dashboard';render();
};
window.logout=()=>{state.user=null;state.modal=null;render();};
function cloudStatusLine(){
  const s=window.__salonCloudStatus;
  return s?`<p class="small" style="color:${s.ok?'var(--green)':'var(--red)'}">${s.ok?'☁':'⚠'} ${esc(s.message)}</p>`:'';
}

/* =========================================================================
   STEP 6 -- Availability: the heart of a booking system
   ========================================================================= */
// Appointments that still occupy a chair (cancelled / no-show free the time back up).
const blocking=a=>!['cancelled','no-show'].includes(a.status);
const overlaps=(aStart,aEnd,bStart,bEnd)=>aStart<bEnd&&bStart<aEnd;

function stylistWorks(stylist,date){
  return db.settings.openDays.includes(weekday(date))&&(stylist.workDays||[]).includes(weekday(date));
}
// Returns every start time ("HH:MM") where `stylist` is free for `duration` minutes on `date`.
function availableSlots(stylist,date,duration,ignoreApptId){
  if(!stylistWorks(stylist,date)) return [];
  const open=toMin(db.settings.openTime),close=toMin(db.settings.closeTime),step=Number(db.settings.slotMinutes)||15;
  const busy=db.appointments.filter(a=>a.stylistId===stylist.id&&a.date===date&&blocking(a)&&a.id!==ignoreApptId)
    .map(a=>[toMin(a.start),toMin(a.start)+a.duration]);
  // Don't offer times that have already passed today.
  const nowMin=date===todayStr()?new Date().getHours()*60+new Date().getMinutes():-1;
  const slots=[];
  for(let start=open;start+duration<=close;start+=step){
    if(start<=nowMin) continue;
    if(busy.some(([s,e])=>overlaps(start,start+duration,s,e))) continue;
    slots.push(toTime(start));
  }
  return slots;
}
const stylistsFor=serviceIds=>stylists().filter(s=>serviceIds.every(id=>(s.serviceIds||[]).includes(id)));
const totalDuration=ids=>ids.reduce((a,id)=>a+(serviceById(id)?.duration||0),0);
const totalPrice=ids=>ids.reduce((a,id)=>a+(serviceById(id)?.price||0),0);

// For "Any stylist": union of every qualified stylist's open slots.
function slotsForBooking(b){
  const dur=totalDuration(b.serviceIds);
  const pool=b.stylistId==='any'?stylistsFor(b.serviceIds):[userById(b.stylistId)].filter(Boolean);
  return [...new Set(pool.flatMap(s=>availableSlots(s,b.date,dur)))].sort();
}
function pickStylist(b){
  if(b.stylistId!=='any') return b.stylistId;
  const dur=totalDuration(b.serviceIds);
  // Give the slot to whichever qualified stylist has the fewest bookings that day.
  const free=stylistsFor(b.serviceIds).filter(s=>availableSlots(s,b.date,dur).includes(b.time));
  free.sort((x,y)=>db.appointments.filter(a=>a.stylistId===x.id&&a.date===b.date&&blocking(a)).length-db.appointments.filter(a=>a.stylistId===y.id&&a.date===b.date&&blocking(a)).length);
  return free[0]?.id||null;
}

/* =========================================================================
   STEP 7 -- Booking wizard (shared by the front desk and online clients)
   ========================================================================= */
function newBooking(){return {step:1,serviceIds:[],stylistId:null,date:todayStr(),time:null,clientId:null,client:{name:'',phone:'',email:''},notes:''};}
window.startOnlineBooking=()=>{state.online=true;state.booking=newBooking();render();};
window.exitOnlineBooking=()=>{state.online=false;state.booking=null;render();};

function bookingWizard(){
  const b=state.booking||(state.booking=newBooking());
  const labels=['Services','Stylist','Date & Time','Your Info','Confirm'];
  const steps=`<div class="steps">${labels.map((l,i)=>`<span class="${b.step>i?'done':''}">${i+1}. ${l}</span>`).join('')}</div>`;
  let body='';
  if(b.step===1){
    const cats=[...new Set(db.services.filter(s=>s.active).map(s=>s.category))];
    body=`<h2>Choose services</h2>${cats.map(c=>`<h3>${esc(c)}</h3><div class="choice-grid">${db.services.filter(s=>s.active&&s.category===c).map(s=>
      `<button class="choice ${b.serviceIds.includes(s.id)?'selected':''}" onclick="toggleBookingService(${s.id})"><b>${esc(s.name)}</b><span class="small">${s.duration} min • ${money(s.price)}</span></button>`).join('')}</div>`).join('')}
      <p><b>Total:</b> ${totalDuration(b.serviceIds)} min • ${money(totalPrice(b.serviceIds))}</p>
      <button class="btn" ${b.serviceIds.length?'':'disabled'} onclick="bookingStep(2)">Next</button>`;
  }else if(b.step===2){
    const list=stylistsFor(b.serviceIds);
    body=`<h2>Choose a stylist</h2>${list.length?'':'<p class="error">No single stylist offers all of those services. Go back and book them separately.</p>'}
      <div class="choice-grid">${list.length?`<button class="choice ${b.stylistId==='any'?'selected':''}" onclick="setBooking('stylistId','any')"><b>Any available stylist</b><span class="small">Most open times</span></button>`:''}
      ${list.map(s=>`<button class="choice ${b.stylistId===s.id?'selected':''}" onclick="setBooking('stylistId',${s.id})"><b>${esc(s.name)}</b><span class="small">Works ${(s.workDays||[]).map(d=>DAYS[d]).join(', ')}</span></button>`).join('')}</div>
      <p class="row"><button class="btn ghost" onclick="bookingStep(1)">Back</button><button class="btn" ${b.stylistId?'':'disabled'} onclick="bookingStep(3)">Next</button></p>`;
  }else if(b.step===3){
    const slots=slotsForBooking(b);
    body=`<h2>Pick a date &amp; time</h2>
      <div class="row"><button class="btn ghost small" onclick="setBooking('date','${addDays(b.date,-1)}')" ${b.date<=todayStr()?'disabled':''}>◀</button>
      <input class="input" style="max-width:180px" type="date" min="${todayStr()}" value="${b.date}" onchange="setBooking('date',this.value)">
      <button class="btn ghost small" onclick="setBooking('date','${addDays(b.date,1)}')">▶</button><b>${fmtDate(b.date)}</b></div>
      <p class="small">${totalDuration(b.serviceIds)} minute appointment</p>
      <div class="slots">${slots.map(t=>`<button class="${b.time===t?'selected':''}" onclick="setBooking('time','${t}')">${fmtTime(t)}</button>`).join('')||'<p>No openings this day. Try another date.</p>'}</div>
      <p class="row"><button class="btn ghost" onclick="bookingStep(2)">Back</button><button class="btn" ${b.time&&slots.includes(b.time)?'':'disabled'} onclick="bookingStep(4)">Next</button></p>`;
  }else if(b.step===4){
    // Staff can pick an existing client; online clients just type their details.
    const pickExisting=!state.online?`<label>Existing client<select class="input" onchange="setBooking('clientId',Number(this.value)||null)"><option value="">— New client —</option>
      ${db.clients.map(c=>`<option value="${c.id}" ${b.clientId===c.id?'selected':''}>${esc(c.name)} (${esc(c.phone)})</option>`).join('')}</select></label>`:'';
    body=`<h2>${state.online?'Your information':'Client'}</h2>${pickExisting}
      ${b.clientId?'':`<div class="form-grid">
        <label>Name<input class="input" id="bkName" value="${esc(b.client.name)}"></label>
        <label>Phone<input class="input" id="bkPhone" value="${esc(b.client.phone)}"></label>
        <label>Email<input class="input" id="bkEmail" value="${esc(b.client.email)}"></label></div>`}
      <label>Notes for your stylist<textarea class="input" id="bkNotes">${esc(b.notes)}</textarea></label>
      <p class="row"><button class="btn ghost" onclick="bookingStep(3)">Back</button><button class="btn" onclick="saveClientStep()">Next</button></p>`;
  }else{
    const client=b.clientId?clientById(b.clientId):b.client;
    body=`<h2>Confirm</h2><table class="table">
      <tr><th>Client</th><td>${esc(client.name)} • ${esc(client.phone)}</td></tr>
      <tr><th>Services</th><td>${b.serviceIds.map(id=>esc(serviceById(id).name)).join(', ')}</td></tr>
      <tr><th>Stylist</th><td>${b.stylistId==='any'?'First available':esc(userById(b.stylistId).name)}</td></tr>
      <tr><th>When</th><td>${fmtDate(b.date)} at ${fmtTime(b.time)} (${totalDuration(b.serviceIds)} min)</td></tr>
      <tr><th>Estimated price</th><td>${money(totalPrice(b.serviceIds))}</td></tr></table>
      <p class="row"><button class="btn ghost" onclick="bookingStep(4)">Back</button><button class="btn green" onclick="confirmBooking()">Book it</button></p>`;
  }
  return steps+body;
}
window.toggleBookingService=id=>{const b=state.booking;b.serviceIds=b.serviceIds.includes(id)?b.serviceIds.filter(x=>x!==id):[...b.serviceIds,id];b.stylistId=null;b.time=null;render();};
window.setBooking=(field,value)=>{const b=state.booking;b[field]=value;if(field==='stylistId'||field==='date')b.time=null;render();};
window.bookingStep=n=>{state.booking.step=n;render();};
window.saveClientStep=()=>{
  const b=state.booking;
  b.notes=$('#bkNotes').value.trim();
  if(!b.clientId){
    b.client={name:$('#bkName').value.trim(),phone:$('#bkPhone').value.trim(),email:$('#bkEmail').value.trim()};
    if(!b.client.name||!b.client.phone){alert('Name and phone are required.');return;}
  }
  b.step=5;render();
};
window.confirmBooking=()=>{
  const b=state.booking;
  // Re-check right before saving: someone else may have taken the slot while we were typing.
  if(!slotsForBooking(b).includes(b.time)){alert('Sorry, that time was just taken. Please pick another.');b.step=3;b.time=null;render();return;}
  let clientId=b.clientId;
  if(!clientId){
    // Re-use a client record when the phone number already exists.
    const existing=db.clients.find(c=>c.phone.replace(/\D/g,'')===b.client.phone.replace(/\D/g,''));
    if(existing) clientId=existing.id;
    else{clientId=uid();db.clients.push({id:clientId,...b.client,notes:'',created:todayStr()});}
  }
  const appt={id:uid(),clientId,stylistId:pickStylist(b),serviceIds:[...b.serviceIds],date:b.date,start:b.time,
    duration:totalDuration(b.serviceIds),price:totalPrice(b.serviceIds),status:'booked',notes:b.notes,
    source:state.online?'online':'staff',createdBy:state.user?.name||'Online',created:new Date().toISOString(),log:[]};
  db.appointments.push(appt);
  save();
  if(state.online){
    app.innerHTML=`<div class="login"><div class="card"><h1 style="color:var(--green)">You're booked!</h1>
      <p>${fmtDate(appt.date)} at ${fmtTime(appt.start)} with ${esc(userById(appt.stylistId).name)}.</p>
      <button class="btn" onclick="exitOnlineBooking()">Done</button></div></div>`;
    return;
  }
  state.booking=null;state.calDate=appt.date;toast('Appointment booked');go('calendar');
};
function renderOnlineBooking(){
  app.innerHTML=`<main class="wrap" style="max-width:820px"><div class="card"><div class="row"><h1 style="color:var(--primary)">${esc(db.settings.businessName)} — Online Booking</h1><span class="spacer"></span><button class="btn ghost small" onclick="exitOnlineBooking()">Cancel</button></div>${bookingWizard()}</div></main>`;
}

/* =========================================================================
   STEP 8 -- Day calendar (one column per stylist)
   ========================================================================= */
function calendarScreen(){
  const date=state.calDate,step=Number(db.settings.slotMinutes)||15;
  const open=toMin(db.settings.openTime),close=toMin(db.settings.closeTime),rows=(close-open)/step;
  // Stylists only see their own column.
  const cols=state.user.role==='stylist'?[state.user]:stylists();
  const rowOf=t=>(toMin(t)-open)/step+2; // +2: row 1 is the header, CSS grid rows start at 1
  let cells='';
  for(let r=0;r<rows;r++){
    const t=toTime(open+r*step);
    cells+=`<div class="cal-time" style="grid-row:${r+2};grid-column:1">${t.endsWith(':00')?fmtTime(t):''}</div>`;
    cols.forEach((s,i)=>cells+=`<div class="cal-cell ${stylistWorks(s,date)?'':'off'}" style="grid-row:${r+2};grid-column:${i+2}"></div>`);
  }
  const appts=db.appointments.filter(a=>a.date===date&&blocking(a)&&cols.some(s=>s.id===a.stylistId));
  const blocks=appts.map(a=>{
    const col=cols.findIndex(s=>s.id===a.stylistId)+2;
    return `<div class="appt ${a.status} ${a.paid?'paid':''}" style="grid-column:${col};grid-row:${rowOf(a.start)}/span ${Math.ceil(a.duration/step)}" onclick="openAppt(${a.id})">
      <b>${fmtTime(a.start)}</b> ${esc(clientById(a.clientId)?.name||'Client')}<br>${a.serviceIds.map(id=>esc(serviceById(id)?.name||'')).join(', ')}</div>`;
  }).join('');
  return `<section class="card"><div class="row"><h1>Calendar</h1><span class="spacer"></span>
      <button class="btn ghost small" onclick="state.calDate='${addDays(date,-1)}';render()">◀</button>
      <input class="input" style="max-width:170px" type="date" value="${date}" onchange="state.calDate=this.value;render()">
      <button class="btn ghost small" onclick="state.calDate='${addDays(date,1)}';render()">▶</button>
      <button class="btn small" onclick="state.calDate=todayStr();render()">Today</button>
      ${canView('book')?`<button class="btn green small" onclick="state.booking=newBooking();state.booking.date='${date}';go('book')">+ New</button>`:''}</div>
    <h2>${fmtDate(date)}</h2>
    <div class="calendar" style="grid-template-columns:70px repeat(${cols.length},minmax(150px,1fr));grid-template-rows:auto">
      <div class="cal-head" style="grid-column:1;grid-row:1"></div>
      ${cols.map((s,i)=>`<div class="cal-head" style="grid-column:${i+2};grid-row:1">${esc(s.name)}</div>`).join('')}
      ${cells}${blocks}
    </div></section>`;
}

/* =========================================================================
   STEP 9 -- Appointment details + status workflow (in a modal)
   ========================================================================= */
// booked -> checked-in -> in-service -> completed -> (paid at checkout)
const NEXT_STATUS={booked:'checked-in','checked-in':'in-service','in-service':'completed'};
const STATUS_LABEL={'checked-in':'Check In','in-service':'Start Service',completed:'Finish Service'};
window.openAppt=id=>{state.modal={type:'appt',id};render();};
window.closeModal=()=>{state.modal=null;render();};
function renderModal(){
  if(!state.modal) return '';
  const a=db.appointments.find(x=>x.id===state.modal.id);
  if(!a){state.modal=null;return '';}
  const c=clientById(a.clientId)||{};
  const next=NEXT_STATUS[a.status];
  const staff=state.user.role!=='stylist'||a.stylistId===state.user.id;
  return `<div class="modal" onclick="if(event.target===this)closeModal()"><div class="card">
    <div class="row"><h2>${esc(c.name)}</h2><span class="badge ${a.status}">${a.status}</span>${a.paid?'<span class="badge completed">paid</span>':''}<span class="spacer"></span><button class="btn ghost small" onclick="closeModal()">✕</button></div>
    <p>${fmtDate(a.date)} • ${fmtTime(a.start)}–${fmtTime(toTime(toMin(a.start)+a.duration))} with <b>${esc(userById(a.stylistId)?.name)}</b></p>
    <p>${a.serviceIds.map(id=>esc(serviceById(id)?.name)).join(', ')} • ${money(a.price)}</p>
    <p class="small">📞 ${esc(c.phone)} ${c.email?'• ✉ '+esc(c.email):''} • booked ${a.source==='online'?'online':'by '+esc(a.createdBy)}</p>
    ${a.notes?`<p><b>Appointment notes:</b> ${esc(a.notes)}</p>`:''}${c.notes?`<p><b>Client notes:</b> ${esc(c.notes)}</p>`:''}
    ${staff&&!a.paid?`<div class="row">
      ${next?`<button class="btn green" onclick="advanceAppt(${a.id})">${STATUS_LABEL[next]}</button>`:''}
      ${a.status==='completed'&&canView('checkout')?`<button class="btn gold" onclick="state.checkoutId=${a.id};go('checkout')">Checkout</button>`:''}
      ${a.status==='booked'&&state.user.role!=='stylist'?`<button class="btn ghost" onclick="rescheduleAppt(${a.id})">Reschedule</button>
        <button class="btn red" onclick="setApptStatus(${a.id},'cancelled')">Cancel</button><button class="btn red" onclick="setApptStatus(${a.id},'no-show')">No-show</button>`:''}
    </div>`:''}
    ${(a.log||[]).length?`<p class="small">${a.log.map(l=>`${new Date(l.time).toLocaleTimeString()} — ${esc(l.status)} by ${esc(l.by)}`).join('<br>')}</p>`:''}
  </div></div>`;
}
function setStatus(a,status){a.status=status;(a.log=a.log||[]).push({status,time:new Date().toISOString(),by:state.user.name});save();}
window.advanceAppt=id=>{const a=db.appointments.find(x=>x.id===id);setStatus(a,NEXT_STATUS[a.status]);render();};
window.setApptStatus=(id,status)=>{if(!confirm(`Mark this appointment as ${status}?`))return;setStatus(db.appointments.find(x=>x.id===id),status);state.modal=null;render();toast('Appointment '+status);};
window.rescheduleAppt=id=>{
  const a=db.appointments.find(x=>x.id===id);
  const date=prompt('New date (YYYY-MM-DD):',a.date);if(!date)return;
  const time=prompt('New start time (HH:MM, 24-hour):',a.start);if(!time)return;
  const s=userById(a.stylistId);
  if(!availableSlots(s,date,a.duration,a.id).includes(time)){alert(`${s.name} is not free then. Open times: `+(availableSlots(s,date,a.duration,a.id).map(fmtTime).join(', ')||'none'));return;}
  a.date=date;a.start=time;(a.log=a.log||[]).push({status:'rescheduled',time:new Date().toISOString(),by:state.user.name});
  save();state.calDate=date;render();toast('Rescheduled');
};

/* =========================================================================
   STEP 10 -- Dashboard
   ========================================================================= */
function dashboardScreen(){
  const today=todayStr();
  const mine=a=>state.user.role!=='stylist'||a.stylistId===state.user.id;
  const list=db.appointments.filter(a=>a.date===today&&blocking(a)&&mine(a)).sort((x,y)=>toMin(x.start)-toMin(y.start));
  const waiting=list.filter(a=>a.status==='checked-in').length;
  const toPay=list.filter(a=>a.status==='completed'&&!a.paid).length;
  return `<section class="card"><h1>Welcome, ${esc(state.user.name)}</h1>
    <div class="stats"><div><b>${list.length}</b>appointments today</div><div><b>${waiting}</b>waiting</div><div><b>${toPay}</b>ready to pay</div>
      <div><b>${db.products.filter(p=>p.onHand<p.par).length}</b>products low</div></div>
    <div class="grid">${Object.keys(VIEWS).filter(v=>v!=='dashboard'&&canView(v)).map(v=>`<button class="tile" onclick="go('${v}')">${VIEWS[v]}</button>`).join('')}</div></section>
    <section class="card"><h2>Today's appointments</h2>${apptTable(list)}</section>`;
}
function apptTable(list){
  return list.length?`<table class="table"><tr><th>Time</th><th>Client</th><th>Services</th><th>Stylist</th><th>Status</th></tr>
    ${list.map(a=>`<tr onclick="openAppt(${a.id})" style="cursor:pointer"><td>${fmtTime(a.start)}</td><td>${esc(clientById(a.clientId)?.name)}</td>
    <td>${a.serviceIds.map(id=>esc(serviceById(id)?.name)).join(', ')}</td><td>${esc(userById(a.stylistId)?.name)}</td>
    <td><span class="badge ${a.status}">${a.status}</span>${a.paid?' <span class="badge completed">paid</span>':''}</td></tr>`).join('')}</table>`:'<p class="small">Nothing scheduled.</p>';
}

/* =========================================================================
   STEP 11 -- Clients
   ========================================================================= */
function clientsScreen(){
  const q=state.clientSearch.toLowerCase();
  const list=db.clients.filter(c=>!q||(c.name+' '+c.phone+' '+c.email).toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name));
  const editable=state.user.role!=='stylist';
  return `<section class="card"><div class="row"><h1>Clients</h1><span class="spacer"></span>${editable?'<button class="btn green" onclick="editClient()">+ Add Client</button>':''}</div>
    <input class="input" placeholder="Search name, phone, or email" value="${esc(state.clientSearch)}" oninput="state.clientSearch=this.value;render();const i=document.querySelector('.wrap input');i.focus();i.setSelectionRange(i.value.length,i.value.length)">
    <table class="table"><tr><th>Name</th><th>Phone</th><th>Visits</th><th>Last visit</th><th>Notes</th><th></th></tr>
    ${list.map(c=>{const visits=db.appointments.filter(a=>a.clientId===c.id&&a.paid).sort((a,b)=>b.date.localeCompare(a.date));
      return `<tr><td><b>${esc(c.name)}</b><br><span class="small">${esc(c.email)}</span></td><td>${esc(c.phone)}</td><td>${visits.length}</td><td>${visits[0]?fmtDate(visits[0].date):'—'}</td>
      <td class="small">${esc(c.notes)}</td><td>${editable?`<button class="btn small ghost" onclick="editClient(${c.id})">Edit</button>`:''}</td></tr>`;}).join('')}</table></section>`;
}
window.editClient=id=>{
  const c=id?clientById(id):{name:'',phone:'',email:'',notes:''};
  const name=prompt('Client name:',c.name);if(name===null||!name.trim())return;
  const phone=prompt('Phone:',c.phone);if(phone===null)return;
  const email=prompt('Email:',c.email);if(email===null)return;
  const notes=prompt('Notes (formulas, preferences, allergies):',c.notes);if(notes===null)return;
  Object.assign(c,{name:name.trim(),phone:phone.trim(),email:email.trim(),notes:notes.trim()});
  if(!id){c.id=uid();c.created=todayStr();db.clients.push(c);}
  save();render();toast('Client saved');
};

/* =========================================================================
   STEP 12 -- Checkout (services + retail products + tip + tax)
   ========================================================================= */
function checkoutScreen(){
  const ready=db.appointments.filter(a=>a.status==='completed'&&!a.paid).sort((x,y)=>(x.date+x.start).localeCompare(y.date+y.start));
  const a=ready.find(x=>x.id===state.checkoutId);
  if(!a) state.checkoutId=null;
  let ticket='<p class="small">Select a completed appointment.</p>';
  if(a){
    a.cart=a.cart||{products:[],tip:0,discount:0,method:'Card'};
    const t=ticketTotals(a);
    ticket=`<h2>${esc(clientById(a.clientId)?.name)}</h2>
      <table class="table">${a.serviceIds.map(id=>`<tr><td>${esc(serviceById(id).name)}</td><td>${money(serviceById(id).price)}</td></tr>`).join('')}
      ${a.cart.products.map((pid,i)=>{const p=db.products.find(x=>x.id===pid);return `<tr><td>🛍 ${esc(p?.name)} <button class="btn small red" onclick="removeCartProduct(${a.id},${i})">✕</button></td><td>${money(p?.price)}</td></tr>`;}).join('')}
      <tr><td>Discount</td><td>-${money(t.discount)}</td></tr><tr><td>Tax (${db.settings.taxRate}% on products)</td><td>${money(t.tax)}</td></tr>
      <tr><td>Tip</td><td>${money(t.tip)}</td></tr><tr><th>Total</th><th>${money(t.total)}</th></tr></table>
      <div class="form-grid">
        <label>Add retail product<select class="input" onchange="addCartProduct(${a.id},Number(this.value))"><option value="">Choose…</option>
          ${db.products.filter(p=>p.onHand>0).map(p=>`<option value="${p.id}">${esc(p.name)} — ${money(p.price)} (${p.onHand} left)</option>`).join('')}</select></label>
        <label>Tip<span class="row">${[15,18,20].map(pct=>`<button class="btn small ghost" onclick="setCart(${a.id},'tip',${(t.services*pct/100).toFixed(2)})">${pct}%</button>`).join('')}
          <input class="input" style="max-width:100px" type="number" min="0" step="0.01" value="${a.cart.tip}" onchange="setCart(${a.id},'tip',Number(this.value)||0)"></span></label>
        <label>Discount ($)<input class="input" type="number" min="0" step="0.01" value="${a.cart.discount}" onchange="setCart(${a.id},'discount',Number(this.value)||0)"></label>
        <label>Payment method<select class="input" onchange="setCart(${a.id},'method',this.value)">${['Card','Cash','Gift Card'].map(m=>`<option ${a.cart.method===m?'selected':''}>${m}</option>`).join('')}</select></label>
      </div><button class="btn green" onclick="payAppt(${a.id})">Take payment ${money(t.total)}</button>`;
  }
  return `<section class="card"><h1>Checkout</h1><div style="display:grid;grid-template-columns:minmax(220px,1fr) 2fr;gap:16px" class="checkout-grid">
    <div>${ready.map(x=>`<button class="choice ${x.id===state.checkoutId?'selected':''}" style="width:100%;margin-bottom:8px" onclick="state.checkoutId=${x.id};render()">
      <b>${esc(clientById(x.clientId)?.name)}</b><span class="small">${fmtDate(x.date)} ${fmtTime(x.start)} • ${esc(userById(x.stylistId)?.name)}</span></button>`).join('')||'<p class="small">No completed appointments waiting for payment.</p>'}</div>
    <div>${ticket}</div></div></section>`;
}
function ticketTotals(a){
  const cart=a.cart||{products:[],tip:0,discount:0};
  const services=a.serviceIds.reduce((s,id)=>s+(serviceById(id)?.price||0),0);
  const products=cart.products.reduce((s,pid)=>s+(db.products.find(p=>p.id===pid)?.price||0),0);
  const discount=Math.min(Number(cart.discount)||0,services+products);
  const tax=Math.round(products*(Number(db.settings.taxRate)||0))/100;
  const tip=Number(cart.tip)||0;
  return {services,products,discount,tax,tip,total:Math.round((services+products-discount+tax+tip)*100)/100};
}
window.addCartProduct=(id,pid)=>{if(!pid)return;db.appointments.find(a=>a.id===id).cart.products.push(pid);save();render();};
window.removeCartProduct=(id,i)=>{db.appointments.find(a=>a.id===id).cart.products.splice(i,1);save();render();};
window.setCart=(id,field,value)=>{db.appointments.find(a=>a.id===id).cart[field]=value;save();render();};
window.payAppt=id=>{
  const a=db.appointments.find(x=>x.id===id);
  const t=ticketTotals(a);
  if(!confirm(`Charge ${money(t.total)} by ${a.cart.method}?`))return;
  // Retail products leave inventory only when the sale is actually paid.
  a.cart.products.forEach(pid=>{const p=db.products.find(x=>x.id===pid);if(p)p.onHand=Math.max(0,p.onHand-1);});
  a.paid=true;a.paidAt=new Date().toISOString();a.payment={...t,method:a.cart.method,by:state.user.name};
  save();state.checkoutId=null;render();toast('Payment complete');
};

/* =========================================================================
   STEP 13 -- Products (retail inventory)
   ========================================================================= */
function productsScreen(){
  return `<section class="card"><div class="row"><h1>Retail Products</h1><span class="spacer"></span><button class="btn green" onclick="editProduct()">+ Add Product</button></div>
    <table class="table"><tr><th>Product</th><th>Price</th><th>On hand</th><th>Par</th><th></th></tr>
    ${db.products.map(p=>`<tr><td>${esc(p.name)} ${p.onHand<p.par?'<span class="badge no-show">low</span>':''}</td><td>${money(p.price)}</td>
      <td><button class="btn small ghost" onclick="adjustProduct(${p.id},-1)">−</button> <b>${p.onHand}</b> <button class="btn small ghost" onclick="adjustProduct(${p.id},1)">+</button></td>
      <td>${p.par}</td><td><button class="btn small ghost" onclick="editProduct(${p.id})">Edit</button> <button class="btn small red" onclick="deleteItem('products',${p.id})">Delete</button></td></tr>`).join('')}</table></section>`;
}
window.adjustProduct=(id,n)=>{const p=db.products.find(x=>x.id===id);p.onHand=Math.max(0,p.onHand+n);save();render();};
window.editProduct=id=>{
  const p=id?db.products.find(x=>x.id===id):{name:'',price:0,onHand:0,par:0};
  const name=prompt('Product name:',p.name);if(!name)return;
  const price=Number(prompt('Price:',p.price));const onHand=Number(prompt('On hand:',p.onHand));const par=Number(prompt('Par (reorder level):',p.par));
  Object.assign(p,{name,price:price||0,onHand:onHand||0,par:par||0});
  if(!id){p.id=uid();db.products.push(p);}
  save();render();
};
window.deleteItem=(collection,id)=>{if(!confirm('Delete this item?'))return;db[collection]=db[collection].filter(x=>x.id!==id);save();render();};

/* =========================================================================
   STEP 14 -- Services menu (owner)
   ========================================================================= */
function servicesScreen(){
  return `<section class="card"><div class="row"><h1>Services</h1><span class="spacer"></span><button class="btn green" onclick="editService()">+ Add Service</button></div>
    <table class="table"><tr><th>Service</th><th>Category</th><th>Minutes</th><th>Price</th><th>Online</th><th></th></tr>
    ${db.services.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.category)}</td><td>${s.duration}</td><td>${money(s.price)}</td>
      <td><button class="btn small ${s.active?'green':'ghost'}" onclick="toggleService(${s.id})">${s.active?'Bookable':'Hidden'}</button></td>
      <td><button class="btn small ghost" onclick="editService(${s.id})">Edit</button> <button class="btn small red" onclick="deleteItem('services',${s.id})">Delete</button></td></tr>`).join('')}</table>
    <p class="small">Durations should be multiples of the ${db.settings.slotMinutes}-minute booking slot.</p></section>`;
}
window.toggleService=id=>{const s=serviceById(id);s.active=!s.active;save();render();};
window.editService=id=>{
  const s=id?serviceById(id):{name:'',category:'Hair',duration:30,price:0,active:true};
  const name=prompt('Service name:',s.name);if(!name)return;
  const category=prompt('Category (Hair, Color, Nails, Spa…):',s.category)||'Other';
  const duration=Number(prompt('Duration in minutes:',s.duration));const price=Number(prompt('Price:',s.price));
  if(!(duration>0)){alert('Duration must be a positive number.');return;}
  Object.assign(s,{name,category,duration,price:price||0});
  if(!id){s.id=uid();db.services.push(s);}
  save();render();
};

/* =========================================================================
   STEP 15 -- Staff: logins, roles, schedules, and services offered (owner)
   ========================================================================= */
function staffScreen(){
  return `<section class="card"><div class="row"><h1>Staff</h1><span class="spacer"></span><button class="btn green" onclick="addStaff()">+ Add Staff</button></div>
    <table class="table"><tr><th>Name</th><th>Role</th><th>PIN</th><th>Work days</th><th>Services</th><th></th></tr>
    ${db.users.map(u=>`<tr><td><b>${esc(u.name)}</b>${u.active?'':' <span class="badge cancelled">inactive</span>'}</td><td>${u.role}</td><td>${esc(u.pin)}</td>
      <td>${u.role==='stylist'?DAYS.map((d,i)=>`<label style="display:inline-flex;flex-direction:row;gap:2px"><input type="checkbox" ${(u.workDays||[]).includes(i)?'checked':''} onchange="toggleList(${u.id},'workDays',${i})">${d}</label>`).join(' '):'—'}</td>
      <td>${u.role==='stylist'?db.services.map(s=>`<label style="display:inline-flex;flex-direction:row;gap:2px"><input type="checkbox" ${(u.serviceIds||[]).includes(s.id)?'checked':''} onchange="toggleList(${u.id},'serviceIds',${s.id})">${esc(s.name)}</label>`).join('<br>'):'—'}</td>
      <td><button class="btn small ghost" onclick="toggleActive(${u.id})">${u.active?'Deactivate':'Activate'}</button></td></tr>`).join('')}</table></section>`;
}
window.toggleList=(id,field,value)=>{const u=userById(id);u[field]=u[field]||[];u[field]=u[field].includes(value)?u[field].filter(x=>x!==value):[...u[field],value];save();render();};
window.toggleActive=id=>{const u=userById(id);if(u.id===state.user.id){alert('You cannot deactivate yourself.');return;}u.active=!u.active;save();render();};
window.addStaff=()=>{
  const name=prompt('Name:');if(!name)return;
  const role=(prompt('Role (owner, frontdesk, stylist):','stylist')||'').toLowerCase();
  if(!ROLE_ACCESS[role]){alert('Unknown role.');return;}
  const pin=prompt('4–6 digit PIN:');
  if(!/^\d{4,6}$/.test(pin||'')||db.users.some(u=>u.pin===pin)){alert('PIN must be 4–6 digits and not already used.');return;}
  db.users.push({id:uid(),name,role,pin,active:true,workDays:role==='stylist'?[2,3,4,5,6]:undefined,serviceIds:role==='stylist'?[]:undefined});
  save();render();toast('Staff added');
};

/* =========================================================================
   STEP 16 -- Reports + CSV export (owner)
   ========================================================================= */
function reportsScreen(){
  const inRange=a=>a.date>=state.reportFrom&&a.date<=state.reportTo;
  const appts=db.appointments.filter(inRange);
  const paid=appts.filter(a=>a.paid);
  const sum=k=>paid.reduce((s,a)=>s+(a.payment?.[k]||0),0);
  const byStylist=stylists().map(s=>{const p=paid.filter(a=>a.stylistId===s.id);
    return {name:s.name,count:p.length,services:p.reduce((x,a)=>x+a.payment.services,0),tips:p.reduce((x,a)=>x+a.payment.tip,0)};});
  return `<section class="card"><div class="row"><h1>Reports</h1><span class="spacer"></span>
      <label>From<input class="input" type="date" value="${state.reportFrom}" onchange="state.reportFrom=this.value;render()"></label>
      <label>To<input class="input" type="date" value="${state.reportTo}" onchange="state.reportTo=this.value;render()"></label>
      <button class="btn" onclick="exportCSV()">Export CSV</button></div>
    <div class="stats"><div><b>${money(sum('total'))}</b>collected</div><div><b>${money(sum('services'))}</b>services</div>
      <div><b>${money(sum('products'))}</b>retail</div><div><b>${money(sum('tip'))}</b>tips</div>
      <div><b>${appts.filter(blocking).length}</b>appointments</div><div><b>${appts.filter(a=>a.status==='no-show').length}</b>no-shows</div>
      <div><b>${appts.filter(a=>a.source==='online').length}</b>booked online</div></div>
    <h2>By stylist</h2><table class="table"><tr><th>Stylist</th><th>Paid visits</th><th>Service sales</th><th>Tips</th></tr>
    ${byStylist.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.count}</td><td>${money(r.services)}</td><td>${money(r.tips)}</td></tr>`).join('')}</table></section>`;
}
window.exportCSV=()=>{
  const rows=[['Date','Start','Client','Stylist','Services','Status','Source','Services $','Retail $','Discount','Tax','Tip','Total','Method']];
  db.appointments.filter(a=>a.date>=state.reportFrom&&a.date<=state.reportTo).forEach(a=>{const p=a.payment||{};
    rows.push([a.date,a.start,clientById(a.clientId)?.name,userById(a.stylistId)?.name,a.serviceIds.map(id=>serviceById(id)?.name).join(' + '),a.paid?'paid':a.status,a.source,p.services,p.products,p.discount,p.tax,p.tip,p.total,p.method]);});
  const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const link=document.createElement('a');
  link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  link.download=`salon-report-${state.reportFrom}-to-${state.reportTo}.csv`;
  link.click();
};

/* =========================================================================
   STEP 17 -- Settings (owner)
   ========================================================================= */
function settingsScreen(){
  const s=db.settings,t=s.theme;
  return `<section class="card"><h1>Settings</h1><div class="form-grid">
    <label>Business name<input class="input" id="setName" value="${esc(s.businessName)}"></label>
    <label>Subtitle<input class="input" id="setSub" value="${esc(s.subtitle)}"></label>
    <label>Opens<input class="input" type="time" id="setOpen" value="${s.openTime}"></label>
    <label>Closes<input class="input" type="time" id="setClose" value="${s.closeTime}"></label>
    <label>Booking slot (minutes)<select class="input" id="setSlot">${[10,15,20,30].map(n=>`<option ${n==s.slotMinutes?'selected':''}>${n}</option>`).join('')}</select></label>
    <label>Retail tax rate (%)<input class="input" type="number" step="0.01" id="setTax" value="${s.taxRate}"></label>
    <label>Primary color<input class="input" type="color" id="setPrimary" value="${t.primary}"></label>
    <label>Accent color<input class="input" type="color" id="setAccent" value="${t.accent}"></label>
    <label>Page background<input class="input" type="color" id="setPage" value="${t.page}"></label></div>
    <p><b>Open days:</b> ${DAYS.map((d,i)=>`<label style="display:inline-flex;flex-direction:row;gap:4px;margin-right:8px"><input type="checkbox" class="openDay" value="${i}" ${s.openDays.includes(i)?'checked':''}>${d}</label>`).join('')}</p>
    <button class="btn green" onclick="saveSettings()">Save settings</button></section>
    <section class="card"><h2>Data</h2><p class="small">${window.__salonCloudStatus?esc(window.__salonCloudStatus.message):'Local only'}</p>
    <button class="btn red" onclick="if(confirm('Erase ALL salon data and restore the demo data?')){localStorage.removeItem('salonBooking1');location.reload();}">Reset demo data</button></section>`;
}
window.saveSettings=()=>{
  const s=db.settings;
  const open=$('#setOpen').value,close=$('#setClose').value;
  if(toMin(close)<=toMin(open)){alert('Closing time must be after opening time.');return;}
  Object.assign(s,{businessName:$('#setName').value.trim()||'Salon',subtitle:$('#setSub').value.trim(),openTime:open,closeTime:close,
    slotMinutes:Number($('#setSlot').value),taxRate:Number($('#setTax').value)||0,
    openDays:[...document.querySelectorAll('.openDay:checked')].map(x=>Number(x.value))});
  s.theme={primary:$('#setPrimary').value,accent:$('#setAccent').value,page:$('#setPage').value};
  save();render();toast('Settings saved');
};

/* =========================================================================
   STEP 18 -- Wire the screens together and start the app
   ========================================================================= */
const screens={dashboard:dashboardScreen,book:()=>`<section class="card"><h1>New Appointment</h1>${bookingWizard()}</section>`,
  calendar:calendarScreen,clients:clientsScreen,checkout:checkoutScreen,products:productsScreen,
  services:servicesScreen,staff:staffScreen,reports:reportsScreen,settings:settingsScreen};

// Seed a few demo appointments for today the very first time so the calendar isn't empty.
if(!db.appointments.length&&!localStorage.getItem('salonBooking1')){
  const d=todayStr();
  [[3,1,[1],'10:00'],[5,2,[4],'11:00'],[4,1,[6,7],'13:00']].forEach(([stylistId,clientId,serviceIds,start])=>{
    const s=userById(stylistId);
    if(stylistWorks(s,d)) db.appointments.push({id:uid(),clientId,stylistId,serviceIds,date:d,start,duration:totalDuration(serviceIds),price:totalPrice(serviceIds),status:'booked',notes:'',source:'staff',createdBy:'Demo',created:new Date().toISOString(),log:[]});
  });
}

let started=false;
window.startSalonApp=function(){if(started)return;started=true;render();};
// firebase-sync.js calls startSalonApp(); this is the safety net if that script never loads.
setTimeout(()=>window.startSalonApp(),7000);
