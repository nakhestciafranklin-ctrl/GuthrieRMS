const $=s=>document.querySelector(s); const app=$('#app');
const money=n=>'$'+(Number(n)||0).toFixed(2); const now=()=>new Date().toISOString();
const seed={users:[{id:1,name:'Demo Manager',pin:'9999',role:'manager',pos:'Manager',active:true,access:['clock','dining','quick','checkout','kms','inventory','catering','recipes','reports','invoices','development','schedule','closeout','setup'],inventoryScope:'all'},{id:2,name:'FOH Student',studentId:'1001',teacherId:6,pin:'1001',role:'student',pos:'Server',active:true,access:['clock','dining','quick','checkout','kms','inventory','development'],inventoryScope:'assigned'},{id:3,name:'BOH Student',studentId:'1002',teacherId:6,pin:'1002',role:'student',pos:'Line Cook',active:true,access:['clock','dining','quick','checkout','kms','inventory','development'],inventoryScope:'assigned'},{id:4,name:'Cashier Student',studentId:'1003',teacherId:6,pin:'1003',role:'student',pos:'Cashier',active:true,access:['clock','dining','quick','checkout','kms','inventory','development'],inventoryScope:'assigned'},{id:5,name:'Inventory Student',studentId:'1004',teacherId:6,pin:'1004',role:'student',pos:'Inventory Lead',active:true,access:['clock','dining','quick','checkout','kms','inventory','development'],inventoryScope:'assigned'},{id:6,name:'Teacher Demo',pin:'8888',role:'teacher',pos:'Instructor',active:true,access:['clock','inventory','reports'],inventoryScope:'culinary'}],positions:['Manager','Instructor','Server','Host','Cashier','Runner','Expo','Line Cook','Prep Cook','Dishwasher','Inventory Lead','Shift Leader'],tables:Array.from({length:20},(_,i)=>({id:i+1,seats:4,status:'open',orderId:null})),menu:[{id:1,name:'Bistro Burger',price:8.5,inv:'bistro',mods:['No Onion','No Tomato','No Lettuce','Add Cheese','Add Bacon','Medium','Well Done']},{id:2,name:'Southern Cobb Salad',price:9,inv:'bistro',mods:['No Tomato','No Corn','Extra Dressing','Dressing on Side']},{id:3,name:'Peach Tea',price:2.5,inv:'bistro',mods:['Light Ice','No Ice','Extra Peach']},{id:4,name:'Cookie',price:2,inv:'bistro',mods:['Warm Cookie']},{id:5,name:'Box Lunch',price:12,inv:'culinary',mods:['Turkey','Ham','Vegetarian','No Mayo']},{id:6,name:'Catering Dessert Tray',price:35,inv:'culinary',mods:['Assorted','Chocolate Only','No Nuts']}],inventory:[{id:1,division:'bistro',vendor:'HEB',name:'Burger Patties',onHand:24,par:40,unit:'each'},{id:2,division:'bistro',vendor:'HEB',name:'Peach Syrup',onHand:2,par:4,unit:'bottle'},{id:3,division:'culinary',vendor:'Ben E. Keith',name:'Flour',onHand:15,par:30,unit:'lb'},{id:4,division:'culinary',vendor:'Armstrong Chemicals',name:'Sanitizer',onHand:1,par:3,unit:'gal'},{id:5,division:'culinary',vendor:'Amazon',name:'To-Go Containers',onHand:50,par:100,unit:'each'}],orders:[],shifts:[],cashbox:[],deliveries:[],cateringMenus:[{id:1,name:'Executive Lunch Package',price:12,description:'Entree salad or sandwich, dessert, and beverage',items:['Box Lunch','Peach Tea','Cookie']},{id:2,name:'Bistro Box Lunch',price:10,description:'Box lunch package for staff or district events',items:['Box Lunch','Cookie']},{id:3,name:'Dessert Tray Package',price:35,description:'Assorted dessert tray priced per tray',items:['Catering Dessert Tray']},{id:4,name:'Custom Catering Menu',price:0,description:'Build a custom order using culinary menu items',items:[]}]} ;
let db=JSON.parse(localStorage.getItem('guthrieRMS7A')||localStorage.getItem('guthrieRMS5A')||localStorage.getItem('guthrieRMS4K')||localStorage.getItem('guthrieRMS4F')||'null')||seed; if(!db.cateringMenus)db.cateringMenus=seed.cateringMenus; if(!db.settings)db.settings={};
if(db.settings.demoMode===undefined)db.settings.demoMode=true;
if(!db.settings.businessName)db.settings.businessName='Guthrie RMS';
if(!db.settings.businessSubtitle)db.settings.businessSubtitle='Restaurant Management System';
if(!db.settings.vendors)db.settings.vendors=['Armstrong Chemicals','HEB','Ben E. Keith','Amazon'];
if(!db.settings.inventoryLocations)db.settings.inventoryLocations=['Bistro Dry Storage','Bistro Reach-In Cooler','Bistro Freezer','FOH Storage','Kitchen 1','Kitchen 2','Kitchen 3','Bakeshop','Catering Kitchen','Dry Storage','Fine Dining Storage'];
if(!db.settings.kmsStations)db.settings.kmsStations=['Expo','Grill','Salad','Beverage','Dessert','Catering']; if(!db.settings.operations)db.settings.operations=['Bistro Service','Counter + To-Go','Catering Event','Culinary Lab','Inventory / Receiving','Special Event','Training','Competition Prep'];
if(db.settings.lowStockThreshold===undefined)db.settings.lowStockThreshold=10;
if(!db.settings.theme)db.settings.theme={};
const themeDefaults={primary:'#003DA5',accent:'#F9A825',success:'#2E7D32',danger:'#C62828',pageBackground:'#F3F6FB',surface:'#FFFFFF',text:'#102033',font:'Arial, Helvetica, sans-serif',cardRadius:18,buttonRadius:12,headerBackground:'#003DA5',backgroundStyle:'solid'};
Object.entries(themeDefaults).forEach(([k,v])=>{if(db.settings.theme[k]===undefined)db.settings.theme[k]=v;}); if(!db.production)db.production={date:new Date().toISOString().slice(0,10),items:{},history:[]}; if(!db.cateringItems)db.cateringItems=[{id:1,name:'Box Lunch',price:12,unit:'per guest',inventorySource:'culinary'},{id:2,name:'Dessert Tray',price:35,unit:'per tray',inventorySource:'culinary'},{id:3,name:'Peach Tea Gallon',price:10,unit:'per gallon',inventorySource:'culinary'},{id:4,name:'Cookie Dozen',price:18,unit:'per dozen',inventorySource:'culinary'}]; if(!db.dailyCloseouts)db.dailyCloseouts=[]; if(!db.invoices)db.invoices=[]; if(!db.evaluations)db.evaluations=[]; if(!db.refunds)db.refunds=[]; if(!db.recipes)db.recipes=[]; if(!db.labUsage)db.labUsage=[]; if(!db.scheduledShifts)db.scheduledShifts=[]; if(!db.positions)db.positions=seed.positions; if(!db.users.some(u=>u.role==='teacher'))db.users.push({id:Date.now(),name:'Teacher Demo',pin:'8888',role:'teacher',pos:'Instructor',active:true,access:['clock','inventory','reports'],inventoryScope:'culinary'}); db.users.forEach(u=>{ if(!u.access){u.access=u.role==='manager'?['clock','dining','quick','checkout','kms','inventory','catering','recipes','reports','invoices','development','schedule','closeout','setup']:(u.role==='teacher'?['clock','inventory','catering','recipes','reports','invoices','development','schedule']:['clock','dining','quick','checkout','kms','inventory','development']);} if(!u.inventoryScope) u.inventoryScope=u.role==='teacher'?'culinary':(u.role==='manager'?'all':'assigned'); if(u.role==='student'){ if(!('studentId' in u)) u.studentId=''; if(!('teacherId' in u)) u.teacherId=''; } });
// Menu and daily production migration
(db.menu||[]).forEach(m=>{ if(!m.category) m.category=(m.name||'').toLowerCase().includes('tea')|| (m.name||'').toLowerCase().includes('beverage')?'Beverage':((m.name||'').toLowerCase().includes('cookie')||(m.name||'').toLowerCase().includes('dessert')?'Dessert':'Entree'); if(m.active===undefined)m.active=true; if(m.dailyPar===undefined)m.dailyPar=0; if(!Array.isArray(m.mods))m.mods=[]; if(!db.production.items[m.id]) db.production.items[m.id]={startingPar:Number(m.dailyPar)||0,remaining:Number(m.dailyPar)||0,manual86:false,reason:''}; });
// Repair older browser-saved users so Counter + To-Go remains available after upgrades.
db.users.forEach(u=>{
  if(u.role==='manager') u.access=[...new Set([...(u.access||[]),'clock','dining','quick','checkout','kms','inventory','catering','recipes','reports','invoices','development','closeout','setup'])];
  if(u.role==='student') u.access=[...new Set([...(u.access||[]),'clock','dining','quick','checkout','kms','inventory','development'])];
});
let state={user:null,view:'dashboard',pin:'',activeOrder:null,seat:1,checkoutType:'table',selectedOrder:null,invDivision:'bistro',kmsStation:'all',settingsTab:'business'};
// Repair older saved tickets so every checkout item has a unique removable line id.
let _changed=false; db.orders.forEach(o=>{(o.items||[]).forEach((it,idx)=>{ if(!it.lineId){ it.lineId=String((it.id||o.id||Date.now()))+'-'+idx+'-'+Math.random().toString(36).slice(2,7); _changed=true; } });}); if(_changed) save();
function save(){localStorage.setItem('guthrieRMS7A',JSON.stringify(db));}
function validItems(o){return Array.isArray(o?.items)?o.items.filter(i=>i&&i.name&&Number(i.price)>=0):[];}
function normalizeOrders(){
  let changed=false;
  db.orders=(db.orders||[]).map(o=>{
    o.items=validItems(o);
    o.items.forEach((it,idx)=>{
      if(!it.lineId){it.lineId=String(it.id||Date.now())+'-'+idx+'-'+Math.random().toString(36).slice(2,7); changed=true;}
      if(!Array.isArray(it.mods)) it.mods=[];
      if(it.note==null) it.note='';
      it.price=Number(it.price)||0;
    });
    return o;
  });
  db.tables.forEach(t=>{
    if(t.orderId){
      let linked=db.orders.find(o=>o.id===t.orderId);
      if(!linked || linked.paid || !validItems(linked).length){t.orderId=null;t.status='open';changed=true;}
    }
  });
  if(state.selectedOrder){
    let selected=db.orders.find(o=>o.id===state.selectedOrder);
    if(!selected || selected.paid || !validItems(selected).length){state.selectedOrder=null;changed=true;}
  }
  if(changed) save();
}
function toast(msg){let old=document.querySelector('.toast'); if(old)old.remove(); document.body.insertAdjacentHTML('beforeend',`<div class="toast">${msg}</div>`); setTimeout(()=>{let t=document.querySelector('.toast'); if(t)t.remove()},2200);}
function normalizeAccessForUser(u){
  const roleDefaults={
    manager:['clock','dining','quick','checkout','kms','inventory','catering','recipes','reports','invoices','development','schedule','closeout','setup'],
    teacher:['clock','inventory','catering','recipes','reports','invoices','development','schedule'],
    student:['clock','dining','quick','checkout','kms','inventory','development']
  };
  const defaults=roleDefaults[u.role]||roleDefaults.student;
  u.access=[...new Set([...(u.access||[]), ...defaults.filter(v=>u.role==='manager'||u.role==='student'||u.role==='teacher' ? true : false)])];
  if(u.role==='teacher' && !u.access.length) u.access=defaults;
  return u;
}
function applyTheme(){
 const t=db.settings?.theme||{};
 const root=document.documentElement;
 root.style.setProperty('--blue',t.primary||'#003DA5');
 root.style.setProperty('--gold',t.accent||'#F9A825');
 root.style.setProperty('--green',t.success||'#2E7D32');
 root.style.setProperty('--red',t.danger||'#C62828');
 root.style.setProperty('--gray',t.pageBackground||'#F3F6FB');
 root.style.setProperty('--white',t.surface||'#FFFFFF');
 root.style.setProperty('--ink',t.text||'#102033');
 root.style.setProperty('--font-family',t.font||'Arial, Helvetica, sans-serif');
 root.style.setProperty('--card-radius',(Number(t.cardRadius)||18)+'px');
 root.style.setProperty('--button-radius',(Number(t.buttonRadius)||12)+'px');
 root.style.setProperty('--header-bg',t.headerBackground||t.primary||'#003DA5');
 document.body.dataset.backgroundStyle=t.backgroundStyle||'solid';
}
function render(){
  applyTheme();
  if(!state.user) return login();
  normalizeAccessForUser(state.user);
  const allowed=allowedViews();
  if(!views[state.view] || (!canView(state.view) && !['dashboard','order'].includes(state.view))) state.view='dashboard';
  const dashboardShortcut = state.view==='dashboard' ? '' : `<div class="dashboard-shortcut"><button class="primary" data-view="dashboard">🏠 Dashboard</button><span>Dashboard &gt; ${state.viewLabel||state.view}</span></div>`;
  app.innerHTML=topbar()+`<main class="wrap">${dashboardShortcut}${views[state.view]()}</main>`;
  bindCommon();
}
function login(){applyTheme();app.innerHTML=`<div class="login"><div class="card login-card"><img class="logo" src="assets/guthrie-logo.png"><h1 class="title">${db.settings?.businessName||'Guthrie RMS'}</h1><p>${db.settings?.businessSubtitle||'Restaurant Management System'}</p><p>Enter Student or Manager PIN</p><div class="pin-display">${'*'.repeat(state.pin.length)}</div><div class="keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-key="${n}">${n}</button>`).join('')}<button class="clear" data-clear>Clear</button><button data-key="0">0</button><button class="login-btn" data-login>Login</button></div><p class="error" id="err"></p>${db.settings?.demoMode?'<p class="small">Demo: Manager 9999 | Teacher 8888 | Student IDs/PINs: FOH 1001 | BOH 1002 | Cashier 1003 | Inventory 1004</p>':''}</div></div>`; document.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{state.pin+=b.dataset.key;login()}); $('[data-clear]').onclick=()=>{state.pin='';login()}; $('[data-login]').onclick=()=>{let u=db.users.find(x=>x.pin===state.pin&&x.active); if(u){state.user=u;state.pin='';state.view='dashboard';render()} else $('#err').textContent='PIN not found or inactive.'};}
function allowedViews(){
  if(!state.user) return [];
  normalizeAccessForUser(state.user);
  const order=['clock','dining','quick','checkout','kms','inventory','catering','recipes','reports','invoices','development','schedule','closeout','setup'];
  return order.filter(v=>(state.user.access||[]).includes(v) || state.user.role==='manager');
}
function canView(v){return allowedViews().includes(v)||state.user.role==='manager';}
function topbar(){let labels={clock:'Clock In/Out',dining:'Dining Room',quick:'Counter + To-Go',checkout:'Checkout',kms:'KMS',inventory:'Inventory',catering:'Catering',recipes:'Recipes/Labs',recipes:'Recipes/Labs',reports:'Reports',invoices:'Invoices',development:'Student Development',schedule:'Scheduling',setup:'Settings',closeout:'End of Day'}; let nav=allowedViews().filter(v=>labels[v]).map(v=>v+':'+labels[v]); return `<header class="topbar"><img src="assets/guthrie-logo.png"><b>${db.settings?.businessName||'Guthrie RMS'}</b><span>${state.user.name} • ${state.user.pos}</span><span class="spacer"></span><nav class="nav"><button data-view="dashboard" class="${state.view==='dashboard'?'active':''}">🏠 Dashboard</button>${nav.map(x=>{let [v,l]=x.split(':');return `<button data-view="${v}" class="${state.view===v?'active':''}">${l}</button>`}).join('')}<button data-logout>Log Out</button></nav></header>`}
function bindCommon(){
  document.querySelectorAll('[data-view]').forEach(b=>{
    b.onclick=(e)=>{e.preventDefault();let v=b.dataset.view;if(v==='dashboard'||canView(v)){state.view=v;render()}else alert('Access not assigned for this area.')}
  });
  const lo=$('[data-logout]'); if(lo) lo.onclick=()=>{state.user=null;render()}
}

function dashboardScheduleWidget(){
 if(!state.user)return '';
 if(state.user.role==='student'){
  let sh=scheduledForStudent(state.user.id).filter(s=>shiftDateTime(s)>=new Date()&&s.status==='Published').slice(0,3);
  return `<div class="section panel"><div class="row"><h3>Upcoming Shifts</h3><span class="spacer"></span><button class="small-btn" onclick="state.view='schedule';render()">View Schedule</button></div>${sh.map(x=>`<p><b>${x.date}</b> • ${x.operation} • ${x.startTime}–${x.endTime}</p>`).join('')||'<p class="small">No upcoming shifts.</p>'}</div>`;
 }
 if(state.user.role==='teacher'){
  let sh=scheduledForTeacher(state.user.id).filter(s=>shiftDateTime(s)>=new Date()&&s.status==='Published').slice(0,3);
  return `<div class="section panel"><div class="row"><h3>Upcoming Student Shifts</h3><span class="spacer"></span><button class="small-btn" onclick="state.view='schedule';render()">View Schedule</button></div><p>${sh.length} upcoming scheduled operation(s)</p></div>`;
 }
 let sh=(db.scheduledShifts||[]).filter(s=>shiftDateTime(s)>=new Date()&&s.status==='Published').slice(0,3);
 return `<div class="section panel"><div class="row"><h3>Upcoming Shifts</h3><span class="spacer"></span><button class="small-btn" onclick="state.view='schedule';render()">Open Scheduler</button></div>${sh.map(x=>`<p><b>${x.date}</b> • ${x.operation} • ${(x.assignments||[]).length} student(s)</p>`).join('')||'<p class="small">No upcoming shifts.</p>'}</div>`;
}

const activeShift=()=>db.shifts.find(s=>s.userId===state.user.id&&!s.out);
function roleTiles(){let tiles=allowedViews(); return tiles.map(v=>`<button class="tile" data-view="${v}">${({clock:'Clock In / Out',dining:'Dining Room',quick:'Counter + To-Go',checkout:'Checkout',kms:'KMS',inventory:'Inventory',catering:'Catering',recipes:'Recipes/Labs',recipes:'Recipes/Labs',reports:'Reports',invoices:'Invoices',development:'Student Development',schedule:'Scheduling',setup:'Settings',closeout:'End of Day Closeout'})[v]}</button>`).join('')}
const views={dashboard:()=>`<section class="card"><h1>Welcome, ${state.user.name}</h1><p>${activeShift()?'Clocked in: '+new Date(activeShift().in).toLocaleTimeString():'Not clocked in'}</p>${dashboardScheduleWidget()}<div class="grid">${roleTiles()}</div></section>`,
clock:()=>`<section class="card"><h1>Clock In / Clock Out</h1><p>${activeShift()?`You clocked in at ${new Date(activeShift().in).toLocaleString()}`:'You are not clocked in.'}</p><button class="primary ${activeShift()?'danger':'success'}" onclick="toggleClock()">${activeShift()?'Clock Out':'Clock In'}</button></section>`,
dining:()=>dining(), quick:()=>quick(), order:()=>orderScreen(), checkout:()=>checkout(), kms:()=>kms(), inventory:()=>inventory(), catering:()=>catering(), recipes:()=>recipesLab(), reports:()=>reports(), invoices:()=>invoiceCenter(), development:()=>development(), schedule:()=>scheduleCenter(), closeout:()=>closeout(), setup:()=>setup()};
window.toggleClock=()=>{let s=activeShift(); if(s){s.out=now(); s.hours=shiftHours(s);}else db.shifts.push({id:Date.now(),userId:state.user.id,name:state.user.name,pos:state.user.pos,teacherId:state.user.teacherId||'',serviceType:'Shift',in:now(),out:null}); save();render()};
function dining(){return `<section class="card"><h1>Dining Room</h1><div class="table-grid">${db.tables.map(t=>`<div class="table-card status-${t.status==='open'?'open':t.status==='ready'?'ready':'active'}" onclick="openTable(${t.id})"><h3>Table ${t.id}</h3><p>${t.seats} seats</p><p>${t.status}</p></div>`).join('')}</div></section>`}
window.openTable=id=>{let t=db.tables.find(x=>x.id===id); if(!t.orderId){let o={id:Date.now(),type:'table',tableId:id,customer:'Table '+id,items:[],status:'open',created:now(),sent:null,paid:false}; db.orders.push(o); t.orderId=o.id;t.status='active';save()} state.activeOrder=t.orderId; state.seat=1; state.view='order'; render()};
function orderScreen(){let o=db.orders.find(x=>x.id===state.activeOrder); if(!o)return `<section class="card"><h1>Order Not Found</h1><button class="primary" onclick="state.view='dashboard';render()">Return</button></section>`; let t=o.type==='table'?db.tables.find(x=>x.id===o.tableId):null; let seats=t?Number(t.seats)||1:1; let checkoutType=o.type==='table'?'table':o.type; return `<section class="card"><h1>${o.customer}</h1>${t?`<div class="seat-tabs">${Array.from({length:seats},(_,i)=>`<button class="${state.seat===i+1?'active':''}" onclick="state.seat=${i+1};render()">Seat ${i+1}</button>`).join('')}</div>`:`<p class="notice">${o.type==='togo'?'To-Go':'Counter'} order entry</p>`}<h3>Add Item ${t?`to Seat ${state.seat}`:''}</h3><div class="menu-grid">${renderBistroMenuButtons()}</div><h3>Ticket</h3>${ticketItems(o)}<div class="row"><button class="primary" onclick="sendKitchen(${o.id})">Send to KMS</button><button class="primary" onclick="state.view='checkout';state.checkoutType='${checkoutType}';state.selectedOrder=${o.id};render()">Checkout</button><button class="primary" onclick="state.view='${t?'dining':'quick'}';render()">Back</button></div></section>`}
function quick(){let list=db.orders.filter(o=>!o.paid&&(o.type==='counter'||o.type==='togo'));return `<section class="card"><h1>Counter + To-Go Order Entry</h1><p class="notice">Create, edit, send, and checkout counter or to-go orders from this page.</p><div class="row"><button class="primary success" onclick="createQuickOrder('counter')">New Counter Order</button><button class="primary success" onclick="createQuickOrder('togo')">New To-Go Order</button></div><h2>Open Counter + To-Go Orders</h2><div class="grid">${list.map(o=>`<div class="order-card"><h3>${o.type==='togo'?'To-Go':'Counter'}: ${o.customer}</h3><p>${validItems(o).length} item(s) • ${money(total(o))} • ${o.status}</p><div class="row"><button class="small-btn" onclick="openQuickOrder(${o.id})">Edit Order</button><button class="small-btn" onclick="sendKitchen(${o.id})">Send to KMS</button><button class="small-btn" onclick="state.checkoutType='${o.type}';state.selectedOrder=${o.id};state.view='checkout';render()">Checkout</button></div></div>`).join('')||'<p>No open counter or to-go orders.</p>'}</div></section>`}
window.createQuickOrder=(type)=>{let label=type==='togo'?'To-Go':'Counter';let customer=prompt(`Enter customer/order name for ${label}:`, type==='togo'?'To-Go Customer':'Walk-In')||label+' Order';let o={id:Date.now(),type,customer,items:[],status:'open',created:now(),sent:null,paid:false};db.orders.push(o);state.activeOrder=o.id;state.seat=1;state.view='order';save();render();};
window.openQuickOrder=id=>{let o=db.orders.find(x=>x.id===id);if(!o)return;state.activeOrder=id;state.seat=1;state.view='order';render();};
function modifierModal(menuId,seat){let m=db.menu.find(x=>x.id===menuId); if(!m||isMenu86(m)){alert('This item is currently 86\'d or unavailable.');return;} app.insertAdjacentHTML('beforeend',`<div class="modal" id="mod"><div class="card"><h2>${m.name} Modifiers</h2><p class="small">Remaining today: ${productionRemaining(m.id)}</p><div class="modifier-list">${(m.mods||[]).map(md=>`<button onclick="this.classList.toggle('selected')">${md}</button>`).join('')||'<p class="small">No modifiers set up yet.</p>'}</div><h3>Custom Note</h3><input class="input" id="note" placeholder="Optional"><div class="row section"><button class="primary" onclick="addItem(${menuId},${seat})">Add Item</button><button class="primary danger" onclick="document.getElementById('mod').remove()">Cancel</button></div></div></div>`)}
window.modifierModal=modifierModal; window.addItem=(menuId,seat)=>{let o=db.orders.find(x=>x.id===state.activeOrder), m=db.menu.find(x=>x.id===menuId); if(!o||!m)return; if(!deductProduction(menuId,1)){alert('This item is 86\'d or no longer available.');return;} let mods=[...document.querySelectorAll('#mod .modifier-list .selected')].map(b=>b.textContent);let note=$('#note').value; o.items.push({id:Date.now(),lineId:String(Date.now())+'-'+Math.random().toString(36).slice(2,7),menuId,name:m.name,price:m.price,seat,mods,note}); document.getElementById('mod').remove(); save();render()};
function ticketItems(o){let items=validItems(o);return items.length?`<table class="report-table"><tr><th>Seat</th><th>Item</th><th>Mods</th><th>Price</th></tr>${items.map(i=>`<tr><td>${i.seat||'-'}</td><td>${i.name}</td><td>${[...(i.mods||[]),i.note].filter(Boolean).join(', ')}</td><td>${money(i.price)}</td></tr>`).join('')}<tr><td colspan="3"><b>Total</b></td><td><b>${money(total(o))}</b></td></tr></table>`:'<p>No items yet.</p>'}
function total(o){return validItems(o).reduce((a,i)=>a+(Number(i.price)||0),0)}

window.sendKitchen=(orderId)=>{
  const o=db.orders.find(x=>x.id===orderId);
  if(!o){ alert('Order not found.'); return; }
  const items=validItems(o);
  if(!items.length){ alert('Add at least one item before sending to KMS.'); return; }
  // Preserve the full ticket and send directly to BOH station screens.
  o.items=items;
  o.sent=now();
  o.status='sent';
  o.kmsStage='sent';
  o.kmsLog=o.kmsLog||[];
  o.kmsLog.push({stage:'Sent to Kitchen',time:o.sent,by:state.user?.name||'System'});
  if(o.type==='table'&&o.tableId){
    const t=db.tables.find(t=>t.id===o.tableId);
    if(t){t.status='sent';t.orderId=o.id;}
  }
  save();
  toast('Item has been sent to kitchen');
  render();
};

function checkout(){
  normalizeOrders();
  let types=['table','counter','togo','catering'];
  let type=state.checkoutType||'table';
  let list=(db.orders||[]).filter(o=>!o.paid&&o.type===type&&validItems(o).length>0);
  let selected=list.find(o=>o.id===state.selectedOrder);
  if(!selected) state.selectedOrder=null;
  return `<section class="card"><h1>Checkout Center</h1>
    <div class="row"><button class="small-btn danger" onclick="clearEmptyCheckoutOrders()">Clear Empty/Stuck Orders</button></div>
    <div class="tabs">${types.map(t=>`<button class="${type===t?'active':''}" onclick="state.checkoutType='${t}';state.selectedOrder=null;render()">${t.toUpperCase()}</button>`).join('')}</div>
    <div class="grid"><div>${list.map(o=>`<div class="order-card ${state.selectedOrder===o.id?'selected':''}" onclick="state.selectedOrder=${o.id};render()"><b>${o.customer}</b><p>${money(total(o))} • ${o.status}</p></div>`).join('')||'<p>No open orders with items.</p>'}</div><div>${state.selectedOrder&&selected?payPanel(selected): '<p>Select an order to checkout.</p>'}</div></div>
    ${refundCenter()}
    </section>`;
}
function checkoutTicketItems(o){
  let items=validItems(o);
  return items.length?`<table class="report-table"><tr><th>Seat</th><th>Item</th><th>Mods</th><th>Price</th><th>Remove</th></tr>${items.map((i,idx)=>`<tr><td>${i.seat||'-'}</td><td>${i.name}</td><td>${[...(i.mods||[]),i.note].filter(Boolean).join(', ')}</td><td>${money(i.price)}</td><td><button class="small-btn danger" onclick="removeCheckoutLine(${o.id},'${i.lineId||''}',${idx})">Remove</button></td></tr>`).join('')}<tr><td colspan="3"><b>Total</b></td><td colspan="2"><b>${money(total(o))}</b></td></tr></table><div class="row section"><button class="small-btn danger" onclick="clearCheckoutOrder(${o.id})">Clear All Items</button></div>`:'<p>No items left on this order.</p>'
}
function payPanel(o){if(!o||!validItems(o).length){return '<div class="card"><p>This order has no items and was removed from checkout.</p></div>';}return `<div class="card"><h2>${o.customer}</h2><p class="notice">Review the order before payment. Remove any incorrect items here, then mark paid when the ticket is correct.</p>${checkoutTicketItems(o)}<label>Payment Type</label><select class="input" id="paytype" onchange="renderPaymentFields()"><option>Cash</option><option>Card</option><option>Check</option><option>District Account</option><option>Donation</option></select><div id="paymentFields">${paymentFieldsHtml('Cash')}</div><button class="primary success" onclick="pay(${o.id})">Mark Paid</button></div>`}
function paymentFieldsHtml(type){
 if(type==='Check') return `<input class="input" id="checkNumber" placeholder="Check Number *"><input class="input" id="payor" placeholder="Payor / Organization"><input class="input" id="checkDate" type="date"><input class="input" id="paymentNotes" placeholder="Notes">`;
 if(type==='Cash') return `<input class="input" id="tender" type="number" placeholder="Amount Tendered">`;
 if(type==='Card') return `<input class="input" id="transactionRef" placeholder="Card Transaction Reference / Last 4 Optional">`;
 if(type==='District Account') return `<input class="input" id="payor" placeholder="Department / Account Name"><input class="input" id="paymentNotes" placeholder="Transfer / PO / Notes">`;
 if(type==='Donation') return `<input class="input" id="payor" placeholder="Donor Name / Organization"><input class="input" id="paymentNotes" placeholder="Donation Notes">`;
 return '';
}
window.renderPaymentFields=()=>{let type=$('#paytype')?.value||'Cash'; let box=$('#paymentFields'); if(box) box.innerHTML=paymentFieldsHtml(type);};

window.clearEmptyCheckoutOrders=()=>{
  normalizeOrders();
  let before=db.orders.length;
  db.orders=db.orders.filter(o=>o.paid || (Array.isArray(o.items)&&o.items.length>0));
  db.tables.forEach(t=>{ if(t.orderId && !db.orders.some(o=>o.id===t.orderId)){t.orderId=null;t.status='open';} });
  state.selectedOrder=null;
  save();
  render();
  toast(`Cleared ${before-db.orders.length} empty/stuck checkout order(s).`);
};

window.removeCheckoutLine=(orderId,lineId,idx)=>{let o=db.orders.find(x=>x.id===orderId); if(!o)return; o.items=validItems(o); let itemIndex=o.items.findIndex(i=>String(i.lineId)===String(lineId)); if(itemIndex<0 && Number.isInteger(idx)) itemIndex=idx; if(itemIndex<0 || !o.items[itemIndex]){alert('This item is already gone. Refreshing checkout.'); normalizeOrders(); render(); return;} let item=o.items[itemIndex]; if(!confirm(`Remove ${item.name} from this order?`))return; restoreProduction(item.menuId,1); o.items.splice(itemIndex,1); o.kmsLog=o.kmsLog||[]; o.kmsLog.push({stage:`Item removed at checkout: ${item.name}`,time:now(),by:state.user.name}); if(!o.items.length){ if(o.type==='table'&&o.tableId){let t=db.tables.find(t=>t.id===o.tableId); if(t&&t.orderId===o.id){t.orderId=null;t.status='open';}} db.orders=db.orders.filter(x=>x.id!==orderId); state.selectedOrder=null; save(); render(); toast('Last item removed; empty order cleared.'); return;} save(); render(); toast('Item removed from checkout.');};
window.clearCheckoutOrder=(orderId)=>{let o=db.orders.find(x=>x.id===orderId); if(!o)return; if(!o.items.length){db.orders=db.orders.filter(x=>x.id!==orderId);state.selectedOrder=null;save();render();toast('Empty order removed.'); return;} if(!confirm('Clear all items from this order and remove it from checkout?'))return; let count=o.items.length; o.items.forEach(it=>restoreProduction(it.menuId,1)); o.kmsLog=o.kmsLog||[]; o.kmsLog.push({stage:`All checkout items cleared and order removed (${count})`,time:now(),by:state.user.name}); if(o.type==='table'&&o.tableId){let t=db.tables.find(t=>t.id===o.tableId); if(t&&t.orderId===o.id){t.orderId=null;t.status='open';}} db.orders=db.orders.filter(x=>x.id!==orderId); state.selectedOrder=null; save(); render(); toast('Order cleared and removed from checkout.');};
window.pay=id=>{let o=db.orders.find(x=>x.id===id); if(!o)return; let paymentType=$('#paytype')?.value||'Cash'; let payment={type:paymentType,amount:total(o),processedBy:state.user.name,processedAt:now()};
 if(paymentType==='Check'){
   let checkNumber=String($('#checkNumber')?.value||'').trim();
   if(!checkNumber){alert('Check number required before completing payment.');return;}
   payment.checkNumber=checkNumber; payment.payor=$('#payor')?.value||''; payment.checkDate=$('#checkDate')?.value||''; payment.notes=$('#paymentNotes')?.value||'';
 } else if(paymentType==='Cash'){
   payment.tendered=Number($('#tender')?.value)||0; payment.change=Math.max(0,payment.tendered-payment.amount);
 } else if(paymentType==='Card'){
   payment.transactionRef=$('#transactionRef')?.value||'';
 } else if(paymentType==='District Account' || paymentType==='Donation'){
   payment.payor=$('#payor')?.value||''; payment.notes=$('#paymentNotes')?.value||'';
 }
 o.payment=payment; o.paid=true;o.status='paid';o.paidAt=now(); let t=db.tables.find(x=>x.orderId===id); if(t){t.status='open';t.orderId=null} save();toast(`${paymentType} payment recorded.`);render()};

function refundTotal(o){return (o.refunds||[]).reduce((a,r)=>a+(Number(r.amount)||0),0)}
function remainingRefundable(o){return Math.max(0,total(o)-refundTotal(o))}
function canProcessRefunds(){return state.user && (state.user.role==='manager' || /cashier/i.test(state.user.pos||''));}
function refundCenter(){
 if(!canProcessRefunds()) return '';
 let paid=(db.orders||[]).filter(o=>o.paid && total(o)>0 && remainingRefundable(o)>0);
 let selected=db.orders.find(o=>o.id===state.refundOrder);
 let form=selected?`<div class="panel"><h3>Process Refund: ${selected.customer}</h3><p>Order total: ${money(total(selected))} • Already refunded: ${money(refundTotal(selected))} • Remaining: ${money(remainingRefundable(selected))}</p><div class="form-grid"><label>Refund Amount<input id="refundAmount" class="input" type="number" step="0.01" value="${remainingRefundable(selected).toFixed(2)}"></label><label>Reason<select id="refundReason" class="input"><option>Customer request</option><option>Order entered incorrectly</option><option>Item unavailable</option><option>Quality concern</option><option>Duplicate charge</option><option>Event cancelled</option><option>Manager approval</option><option>Other</option></select></label></div><label>Refund Notes<textarea id="refundNotes" class="input" placeholder="Required details for the refund record"></textarea></label><div class="row"><button class="primary danger" onclick="submitRefund(${selected.id})">Complete Refund</button><button class="small-btn" onclick="state.refundOrder=null;render()">Cancel</button></div></div>`:'';
 return `<div class="section panel"><h2>Refund Center</h2><p class="small">Use this for paid orders that need a refund. A reason is required and the refund is saved to the refund log.</p>${form}<table class="report-table"><tr><th>Order</th><th>Type</th><th>Customer</th><th>Paid</th><th>Refunded</th><th>Remaining</th><th>Action</th></tr>${paid.map(o=>`<tr><td>${o.id}</td><td>${o.type}</td><td>${o.customer||''}</td><td>${money(total(o))}</td><td>${money(refundTotal(o))}</td><td>${money(remainingRefundable(o))}</td><td><button class="small-btn danger" onclick="state.refundOrder=${o.id};render()">Refund</button></td></tr>`).join('')||'<tr><td colspan="7">No refundable paid orders.</td></tr>'}</table></div>`;
}
window.submitRefund=(orderId)=>{
 let o=db.orders.find(x=>x.id===orderId); if(!o)return;
 let amount=Number($('#refundAmount')?.value)||0;
 let reason=String($('#refundReason')?.value||'').trim();
 let notes=String($('#refundNotes')?.value||'').trim();
 if(amount<=0){alert('Enter a refund amount greater than zero.');return;}
 if(amount>remainingRefundable(o)){alert('Refund amount cannot be greater than the remaining refundable amount.');return;}
 if(!reason){alert('Refund reason is required.');return;}
 if(!confirm(`Refund ${money(amount)} for ${o.customer}?`))return;
 let refund={id:Date.now(),orderId:o.id,orderType:o.type,customer:o.customer||'',amount,reason,notes,processedBy:state.user.name,processedAt:now(),originalPaymentType:o.payment?.type||''};
 o.refunds=o.refunds||[]; o.refunds.push(refund); db.refunds=db.refunds||[]; db.refunds.push(refund);
 o.status=remainingRefundable(o)<=0.001?'refunded':'partially refunded';
 state.refundOrder=null; save(); render(); toast('Refund recorded.');
};

function kms(){
 const stations=[
  ['all','All Tickets'],['expo','Expo'],['grill','Grill'],['salad','Salad'],['beverage','Beverage'],['dessert','Dessert'],['catering','Catering']
 ];
 let list=db.orders.filter(o=>o.sent&&!['paid','closed','completed'].includes(o.status));
 if(state.kmsStation!=='all') list=list.filter(o=>stationItems(o,state.kmsStation).length);
 let counts=Object.fromEntries(stations.map(([key])=>[key,key==='all'?db.orders.filter(o=>o.sent&&!['paid','closed','completed'].includes(o.status)).length:db.orders.filter(o=>o.sent&&!['paid','closed','completed'].includes(o.status)&&stationItems(o,key).length).length]));
 return `<section class="card kms-screen"><h1>KMS BOH Station Screens</h1><p class="notice">Kitchen students select their station, then move tickets through Start Prep → Plating → Ready → Complete. Station routing will be expanded in a later phase.</p><div class="station-grid">${stations.map(([key,label])=>`<button class="station-tile ${state.kmsStation===key?'active':''}" onclick="state.kmsStation='${key}';render()"><span>${label}</span><b>${counts[key]||0}</b></button>`).join('')}</div><div class="kms-header"><h2>${stations.find(x=>x[0]===state.kmsStation)?.[1]||'All Tickets'}</h2><span>${list.length} active ticket(s)</span></div>${list.map(kmsTicket).join('')||'<p>No tickets for this station.</p>'}</section>`
}
function itemStation(item,order){
 let name=(item?.name||'').toLowerCase();
 if(order?.type==='catering'||name.includes('catering')||name.includes('box lunch')) return 'catering';
 if(name.includes('tea')||name.includes('drink')||name.includes('beverage')||name.includes('lemonade')||name.includes('coffee')) return 'beverage';
 if(name.includes('cookie')||name.includes('dessert')||name.includes('tray')||name.includes('cake')) return 'dessert';
 if(name.includes('salad')||name.includes('cobb')) return 'salad';
 if(name.includes('burger')||name.includes('sandwich')||name.includes('grill')) return 'grill';
 return 'expo';
}
function stationItems(order,station){
 let items=validItems(order);
 if(station==='all') return items;
 return items.filter(i=>itemStation(i,order)===station);
}
function stationSummary(order){
 let labels={expo:'Expo',grill:'Grill',salad:'Salad',beverage:'Beverage',dessert:'Dessert',catering:'Catering'};
 let stations=[...new Set(validItems(order).map(i=>itemStation(i,order)))];
 return stations.map(s=>labels[s]||s).join(' • ');
}
function kmsTicket(o){
 o.kmsStage=o.kmsStage||'sent';
 let elapsed=Date.now()-new Date(o.sent).getTime(), mins=Math.floor(elapsed/60000), secs=String(Math.floor(elapsed/1000)%60).padStart(2,'0'), cls=mins>=15?'late':mins>=10?'warn':'';
 let items=stationItems(o,state.kmsStation);
 return `<div class="ticket ${cls}"><div class="row"><div><h2>${o.customer}</h2><p class="small">${o.type.toUpperCase()} • ${stationSummary(o)}</p></div><span class="spacer"></span><div class="timer">${mins}:${secs}</div></div>${kmsProgress(o)}${kmsItemsTable(o,items)}<div class="row section">${kmsButtons(o)}</div>${kmsLog(o)}</div>`;
}
function kmsProgress(o){
 let stages=['sent','prepping','plating','ready'];let labels={sent:'Sent',prepping:'Prep',plating:'Plating',ready:'Ready'};
 return `<div class="progress">${stages.map(st=>`<div class="step ${stages.indexOf(st)<=stages.indexOf(o.kmsStage)?'done':''}">${labels[st]}</div>`).join('')}</div>`;
}
function kmsItemsTable(o,items){
 items=items||validItems(o);
 return items.length?`<table class="report-table"><tr><th>Station</th><th>Seat</th><th>Item</th><th>Mods / Notes</th></tr>${items.map(i=>`<tr><td>${itemStation(i,o).toUpperCase()}</td><td>${i.seat||'-'}</td><td><b>${i.name}</b></td><td>${[...(i.mods||[]),i.note].filter(Boolean).join(', ')}</td></tr>`).join('')}</table>`:'<p>No station items.</p>';
}
function kmsLog(o){
 let logs=(o.kmsLog||[]).slice(-4).reverse();
 return logs.length?`<details class="small"><summary>Ticket action log</summary>${logs.map(l=>`<p>${new Date(l.time).toLocaleTimeString()} • ${l.stage} • ${l.by||''}</p>`).join('')}</details>`:'';
}
function kmsButtons(o){let st=o.kmsStage||'sent';let b=[]; if(st==='sent')b.push(`<button class="primary" onclick="kmsStage(${o.id},'prepping')">Start Prep</button>`); if(st==='prepping')b.push(`<button class="primary" onclick="kmsStage(${o.id},'plating')">Move to Plating</button>`); if(st==='plating')b.push(`<button class="primary success" onclick="kmsStage(${o.id},'ready')">Mark Ready</button>`); if(st==='ready')b.push(`<button class="primary success" onclick="kmsStage(${o.id},'completed')">Complete Ticket</button>`); return b.join('')}
setInterval(()=>{if(state.user&&state.view==='kms')render()},1000); window.ready=id=>kmsStage(id,'ready'); window.kmsStage=(id,stage)=>{let o=db.orders.find(x=>x.id===id); if(!o)return; o.kmsStage=stage; o.kmsLog=o.kmsLog||[]; let label={prepping:'Prep Started',plating:'Moved to Plating',ready:'Marked Ready',completed:'Completed'}[stage]||stage; o.kmsLog.push({stage:label,time:now(),by:state.user.name}); if(stage==='ready')o.status='ready'; if(stage==='completed')o.status='completed'; let t=db.tables.find(x=>x.orderId===id); if(t&&stage==='ready')t.status='ready'; if(t&&stage==='completed')t.status='ready'; save(); render(); toast(label);};
function inventory(){
 if(state.user.inventoryScope==='culinary') state.invDivision='culinary';
 const items=db.inventory.filter(i=>i.division===state.invDivision);
 const tabs=state.user.inventoryScope==='culinary'?`<div class="notice">Teacher access: Culinary Department Inventory only.</div>`:`<div class="tabs"><button class="${state.invDivision==='bistro'?'active':''}" onclick="state.invDivision='bistro';render()">Bistro Inventory</button><button class="${state.invDivision==='culinary'?'active':''}" onclick="state.invDivision='culinary';render()">Culinary Department Inventory</button></div>`;
 const low=items.filter(i=>Number(i.onHand)<Number(i.par));
 return `<section class="card"><h1>Inventory</h1>${tabs}
 <div class="stats"><div><b>${items.length}</b><span>Total Items</span></div><div><b>${low.length}</b><span>Below Par</span></div><div><b>${db.deliveries.filter(d=>d.division===state.invDivision).length}</b><span>Deliveries</span></div></div>
 <div class="inventory-actions">
  <button class="primary" onclick="checkDelivery()">Check In Delivery</button>
  <button class="primary" onclick="inventoryCount()">Inventory Count</button>
  <button class="primary" onclick="scanInventory()">Scan / Manual Entry</button>
  <button class="primary" onclick="wasteTracking()">Waste Tracking</button>
  <button class="primary" onclick="orderPage()">Generate Vendor Order</button>
  <button class="primary" onclick="exportInventoryData(state.invDivision)">Export This Inventory CSV</button>
  <button class="primary" onclick="exportAllInventoryData()">Export All Inventory CSV</button>
 </div>
 <h2>${state.invDivision==='bistro'?'Bistro':'Culinary Department'} Inventory List</h2>
 <table class="report-table"><tr><th>Item</th><th>Vendor</th><th>Location</th><th>On Hand</th><th>Par</th><th>Unit</th><th>Status</th></tr>${items.map(i=>`<tr><td>${i.name}</td><td>${i.vendor}</td><td contenteditable onblur="updInv(${i.id},'location',this.textContent)">${i.location||'Unassigned'}</td><td contenteditable onblur="updInv(${i.id},'onHand',this.textContent)">${i.onHand}</td><td contenteditable onblur="updInv(${i.id},'par',this.textContent)">${i.par}</td><td contenteditable onblur="updInv(${i.id},'unit',this.textContent)">${i.unit}</td><td>${Number(i.onHand)<Number(i.par)?'<span class="badge danger">Below Par</span>':'<span class="badge good">OK</span>'}</td></tr>`).join('')}</table><div id="invExtra"></div></section>`
}
window.updInv=(id,f,v)=>{let item=db.inventory.find(i=>i.id===id); item[f]=['onHand','par'].includes(f)?(Number(v)||0):v;save()};
window.orderPage=()=>{let below=db.inventory.filter(i=>i.division===state.invDivision&&Number(i.onHand)<Number(i.par)); let by={}; below.forEach(i=>(by[i.vendor]??=[]).push(i)); $('#invExtra').innerHTML=`<div class="section"><h2>Suggested Orders by Vendor</h2>${Object.entries(by).map(([v,arr])=>`<div class="ticket"><h3>${v}</h3><table class="report-table"><tr><th>Item</th><th>On Hand</th><th>Par</th><th>Suggested Order</th><th>Unit</th></tr>${arr.map(i=>`<tr><td>${i.name}</td><td>${i.onHand}</td><td>${i.par}</td><td>${Number(i.par)-Number(i.onHand)}</td><td>${i.unit}</td></tr>`).join('')}</table></div>`).join('')||'<p>All items are at or above par.</p>'}</div>`};
window.checkDelivery=()=>{$('#invExtra').innerHTML=`<div class="section"><h2>Check In Delivery</h2><div class="form-grid"><label>Vendor<select id="vendor" class="input">${(db.settings?.vendors||[]).map(v=>`<option>${v}</option>`).join('')}</select></label><label>Invoice #<input id="invoice" class="input" placeholder="Invoice number"></label><label>Product / Item<input id="item" class="input" placeholder="Scan barcode or type item name" autofocus></label><label>Quantity Received<input id="qty" class="input" type="number" value="1"></label><label>Unit<input id="unit" class="input" placeholder="each, lb, case, gal"></label><label>Storage Location<select id="location" class="input">${locations(state.invDivision).map(x=>`<option>${x}</option>`).join('')}</select></label><label>Temperature °F<input id="temp" class="input" placeholder="Optional"></label><label>Quality Check<select id="quality" class="input"><option>Pass</option><option>Packaging Damaged</option><option>Short Delivery</option><option>Wrong Product</option><option>Temperature Concern</option></select></label></div><label>Notes<textarea id="notes" class="input" placeholder="Delivery notes"></textarea></label><button class="primary" onclick="addDelivery()">Submit Delivery</button></div>`};
function locations(div){let all=db.settings?.inventoryLocations||[]; if(!all.length)return div==='bistro'?['Bistro Dry Storage','Bistro Beverage Station','Bistro Reach-In Cooler','Bistro Freezer','FOH Storage']:['Kitchen 1','Kitchen 2','Kitchen 3','Bakeshop','Catering Kitchen','Dry Storage','Fine Dining Storage']; return div==='bistro'?all.filter(x=>/bistro|foh/i.test(x)):all.filter(x=>!/bistro|foh/i.test(x))}
window.addDelivery=()=>{let name=$('#item').value.trim(), qty=Number($('#qty').value)||0, vendor=$('#vendor').value, unit=$('#unit').value||'each', location=$('#location').value, invoice=$('#invoice').value, temp=$('#temp').value, quality=$('#quality').value, notes=$('#notes').value; if(!name){alert('Enter or scan an item name.');return;} let it=db.inventory.find(i=>i.name.toLowerCase()===name.toLowerCase()&&i.division===state.invDivision); if(it){it.onHand=Number(it.onHand)+qty; it.vendor=vendor; it.unit=unit||it.unit; it.location=location;} else db.inventory.push({id:Date.now(),division:state.invDivision,vendor,name,onHand:qty,par:0,unit,location}); db.deliveries.push({date:now(),by:state.user.name,division:state.invDivision,vendor,invoice,name,qty,unit,location,temp,quality,notes});save();toast('Delivery checked in and inventory updated.');render()};
window.inventoryCount=()=>{let items=db.inventory.filter(i=>i.division===state.invDivision); $('#invExtra').innerHTML=`<div class="section"><h2>Inventory Count</h2><p>Update counted quantities. Changes save when you leave each field.</p><table class="report-table"><tr><th>Item</th><th>Location</th><th>System Count</th><th>Actual Count</th><th>Unit</th></tr>${items.map(i=>`<tr><td>${i.name}</td><td>${i.location||'Unassigned'}</td><td>${i.onHand}</td><td><input class="input small" value="${i.onHand}" onchange="updInv(${i.id},'onHand',this.value)"></td><td>${i.unit}</td></tr>`).join('')}</table></div>`};
window.scanInventory=()=>{$('#invExtra').innerHTML=`<div class="section"><h2>Scan / Manual Inventory Entry</h2><p>Bluetooth scanners usually type into the active field like a keyboard.</p><div class="form-grid"><label>Scan or Type Item<input id="scanItem" class="input" placeholder="Barcode or item name" autofocus></label><label>Quantity Change<input id="scanQty" class="input" type="number" value="1"></label><label>Action<select id="scanAction" class="input"><option value="add">Add to Inventory</option><option value="set">Set Exact Count</option><option value="subtract">Subtract from Inventory</option></select></label></div><button class="primary" onclick="applyScanEntry()">Apply Entry</button></div>`};
window.applyScanEntry=()=>{let name=$('#scanItem').value.trim(), qty=Number($('#scanQty').value)||0, action=$('#scanAction').value; let it=db.inventory.find(i=>i.name.toLowerCase()===name.toLowerCase()&&i.division===state.invDivision); if(!it){db.inventory.push({id:Date.now(),division:state.invDivision,vendor:'HEB',name,onHand:qty,par:0,unit:'each',location:'Unassigned'});} else {if(action==='add')it.onHand=Number(it.onHand)+qty; if(action==='subtract')it.onHand=Math.max(0,Number(it.onHand)-qty); if(action==='set')it.onHand=qty;} save();toast('Inventory entry saved.');render()};
window.wasteTracking=()=>{$('#invExtra').innerHTML=`<div class="section"><h2>Waste Tracking</h2><div class="form-grid"><label>Item<input id="wasteItem" class="input" placeholder="Item wasted"></label><label>Quantity<input id="wasteQty" class="input" type="number" value="1"></label><label>Reason<select id="wasteReason" class="input"><option>Spoilage</option><option>Overproduction</option><option>Damaged</option><option>Expired</option><option>Training/Lab Waste</option></select></label></div><button class="primary" onclick="addWaste()">Record Waste</button></div>`};
window.addWaste=()=>{let name=$('#wasteItem').value.trim(), qty=Number($('#wasteQty').value)||0, reason=$('#wasteReason').value; let it=db.inventory.find(i=>i.name.toLowerCase()===name.toLowerCase()&&i.division===state.invDivision); if(it)it.onHand=Math.max(0,Number(it.onHand)-qty); db.deliveries.push({date:now(),by:state.user.name,division:state.invDivision,vendor:'Waste Log',name,qty:-qty,unit:it?.unit||'each',quality:reason,notes:'Waste tracking entry'}); save();toast('Waste recorded.');render()};
function catering(){
  let open=db.orders.filter(o=>o.type==='catering'&&!o.paid);
  let selectedId=Number($('#catMenu')?.value)||db.cateringMenus[0]?.id;
  let selected=db.cateringMenus.find(m=>m.id===selectedId)||db.cateringMenus[0];
  let canEdit=state.user.role==='manager'||state.user.role==='teacher';
  return `<section class="card"><h1>Catering</h1><div class="notice">Catering orders use <b>Culinary Inventory</b>. Select a saved catering menu, enter event details, then generate the catering order.</div>
  <div class="grid"><div class="panel"><h2>Create Catering Order</h2>
  <label>Customer / Department</label><input id="catCustomer" class="input" placeholder="SBISD Leadership, Staff Lunch, Trustee Event">
  <label>Event Name</label><input id="catEvent" class="input" placeholder="Teacher Appreciation Lunch">
  <label>Event Date</label><input id="catDate" type="date" class="input">
  <label>Guest Count / Quantity</label><input id="catGuests" type="number" class="input" value="25" min="1" oninput="previewCatering()">
  <label>Select Catering Menu</label><select id="catMenu" class="input" onchange="previewCatering()">${db.cateringMenus.map(m=>`<option value="${m.id}">${m.name} - ${money(m.price)}${m.price?'/guest or unit':''}</option>`).join('')}</select>
  <div id="catPreview" class="ticket mini">${cateringPreview(selected,25)}</div>
  <button class="primary" onclick="createCateringOrder()">Generate Catering Order</button></div>
  <div><h2>Open Catering Orders</h2>${open.map(o=>`<div class="order-card" onclick="state.selectedOrder=${o.id};state.checkoutType='catering';state.view='checkout';render()"><b>${o.customer}</b><p>${o.eventName||''}</p><p>${money(total(o))} • ${o.status}</p><p class="small">Culinary Inventory</p><div class="row"><button class="small-btn" onclick="event.stopPropagation();state.selectedOrder=${o.id};state.checkoutType='catering';state.view='checkout';render()">Checkout</button><button class="small-btn success" onclick="event.stopPropagation();createInvoiceFromCateringOrder(${o.id})">Generate Invoice</button></div></div>`).join('')||'<p>No open catering orders.</p>'}</div></div>
  <h2>Saved Catering Menus</h2><div class="grid">${db.cateringMenus.map(m=>`<div class="ticket"><h3>${m.name}</h3><p>${m.description}</p><p><b>${money(m.price)}</b> ${m.price?'per guest/unit':''}</p><p><b>Included:</b> ${m.items.length?m.items.join(', '):'Custom items entered by manager/teacher later'}</p><p class="small">Inventory source: Culinary Department</p>${canEdit?`<button onclick="deleteCateringMenu(${m.id})">Remove Menu</button>`:''}</div>`).join('')}</div>
  ${canEdit?cateringSetupPanel():''}</section>`
}
function cateringSetupPanel(){
  return `<div class="section panel"><h2>Catering Menu Setup</h2><p class="small">Add catering menu items first, then build saved catering menus. This keeps catering separate from Bistro POS items and pulls from Culinary Inventory.</p>
  <h3>Catering Item Library</h3><div class="form-grid"><label>Item Name<input id="catItemName" class="input" placeholder="Chicken Alfredo Tray"></label><label>Price<input id="catItemPrice" type="number" step="0.01" class="input" placeholder="45.00"></label><label>Unit<select id="catItemUnit" class="input"><option>per guest</option><option>per tray</option><option>per dozen</option><option>per gallon</option><option>each</option></select></label></div><button class="primary" onclick="addCateringItem()">Add Catering Item</button>
  <table class="report-table section"><tr><th>Item</th><th>Price</th><th>Unit</th><th>Inventory</th><th></th></tr>${db.cateringItems.map(i=>`<tr><td>${i.name}</td><td>${money(i.price)}</td><td>${i.unit}</td><td>Culinary</td><td><button onclick="deleteCateringItem(${i.id})">Remove</button></td></tr>`).join('')}</table>
  <h3>Build Saved Catering Menu</h3><div class="form-grid"><label>Menu Name<input id="newCatMenuName" class="input" placeholder="Teacher Appreciation Lunch"></label><label>Base Price Per Guest/Unit<input id="newCatMenuPrice" type="number" step="0.01" class="input" placeholder="12.00"></label><label>Description<input id="newCatMenuDesc" class="input" placeholder="Entree, dessert, and beverage"></label></div>
  <div class="modifier-list section">${db.cateringItems.map(i=>`<label><input type="checkbox" class="catMenuItemPick" value="${i.name}"> ${i.name} (${money(i.price)} ${i.unit})</label>`).join('')}</div>
  <button class="primary" onclick="addCateringMenuFromBuilder()">Save Catering Menu</button></div>`
}
function cateringPreview(menu,guests){ if(!menu)return '<p>Select a catering menu.</p>'; let qty=Number($('#catGuests')?.value)||guests||1; return `<h3>${menu.name}</h3><p>${menu.description}</p><p><b>Included:</b> ${menu.items.length?menu.items.join(', '):'Custom catering items'}</p><p><b>Quantity:</b> ${qty}</p><p><b>Estimated Total:</b> ${money((Number(menu.price)||0)*qty)}</p><p class="small">This order will be routed to Catering Checkout and calculated separately from Bistro sales.</p>`}
window.previewCatering=()=>{let menu=db.cateringMenus.find(m=>m.id==$('#catMenu').value); $('#catPreview').innerHTML=cateringPreview(menu,Number($('#catGuests').value)||1)};
window.createCateringOrder=()=>{let menu=db.cateringMenus.find(m=>m.id==$('#catMenu').value); if(!menu){alert('Select a catering menu.');return;} let guests=Number($('#catGuests').value)||1; let customer=$('#catCustomer').value||'Catering Customer'; let eventName=$('#catEvent').value||menu.name; let price=Number(menu.price)||0; let o={id:Date.now(),type:'catering',customer,eventName,eventDate:$('#catDate').value,guests,inventorySource:'culinary',items:[{id:Date.now()+1,lineId:String(Date.now()+1)+'-'+Math.random().toString(36).slice(2,7),menuId:menu.id,name:menu.name,price:price*guests,seat:0,mods:[`${guests} guests/units`, `Menu: ${menu.name}`, `Items: ${menu.items.length?menu.items.join(', '):'Custom'}`],note:'Pull from Culinary Inventory'}],status:'open',created:now(),sent:null,paid:false,cateringMenuId:menu.id}; db.orders.push(o); save(); toast('Catering order generated.'); state.checkoutType='catering'; state.selectedOrder=o.id; state.view='checkout'; render();};
window.addCateringItem=()=>{let name=$('#catItemName')?.value.trim(); if(!name){alert('Enter a catering item name.');return;} let price=Number($('#catItemPrice')?.value)||0; let unit=$('#catItemUnit')?.value||'each'; db.cateringItems.push({id:Date.now(),name,price,unit,inventorySource:'culinary'}); save(); toast('Catering item added.'); render();};
window.deleteCateringItem=id=>{if(!confirm('Remove this catering item from the library?'))return; db.cateringItems=db.cateringItems.filter(i=>i.id!==id); save(); render();};
window.addCateringMenuFromBuilder=()=>{let name=$('#newCatMenuName')?.value.trim(); if(!name){alert('Enter a menu name.');return;} let price=Number($('#newCatMenuPrice')?.value)||0; let description=$('#newCatMenuDesc')?.value||'Saved catering menu'; let items=[...document.querySelectorAll('.catMenuItemPick:checked')].map(x=>x.value); db.cateringMenus.push({id:Date.now(),name,price,description,items}); save(); toast('Catering menu saved.'); render();};
window.deleteCateringMenu=id=>{if(!confirm('Remove this saved catering menu?'))return; db.cateringMenus=db.cateringMenus.filter(m=>m.id!==id); save(); render();};


function recipesLab(){
  let canEdit=state.user.role==='manager'||state.user.role==='teacher';
  let source=state.user.inventoryScope==='culinary'?'culinary':'culinary';
  let inv=db.inventory.filter(i=>i.division==='culinary');
  return `<section class="card"><h1>Recipes & Culinary Lab Inventory</h1><p class="notice">Build culinary lab recipes with individual ingredient lines. When a lab is completed, the system deducts the ingredients from Culinary Department Inventory and stores a lab usage record.</p>
  ${canEdit?recipeBuilder(inv):''}
  <div class="grid"><div class="panel"><h2>Saved Recipes</h2>${(db.recipes||[]).map(r=>`<div class="ticket"><h3>${r.name}</h3><p><b>Yield:</b> ${r.yieldQty||''} ${r.yieldUnit||''}</p><p><b>Source:</b> ${r.source||'Culinary'}</p><table class="report-table"><tr><th>Ingredient</th><th>Qty</th><th>Unit</th><th>Notes</th></tr>${(r.ingredients||[]).map(l=>`<tr><td>${l.itemName}</td><td>${l.qty}</td><td>${l.unit}</td><td>${l.note||''}</td></tr>`).join('')}</table><div class="row"><button class="small-btn success" onclick="showLabDeduct(${r.id})">Use for Lab / Deduct Inventory</button>${canEdit?`<button class="small-btn danger" onclick="deleteRecipe(${r.id})">Delete Recipe</button>`:''}</div></div>`).join('')||'<p>No recipes entered yet.</p>'}</div><div class="panel"><h2>Culinary Lab Usage Log</h2><table class="report-table"><tr><th>Date</th><th>Recipe</th><th>Class/Teacher</th><th>Multiplier</th><th>By</th></tr>${(db.labUsage||[]).slice().reverse().map(l=>`<tr><td>${new Date(l.date).toLocaleString()}</td><td>${l.recipeName}</td><td>${l.className||''}</td><td>${l.multiplier}</td><td>${l.by}</td></tr>`).join('')||'<tr><td colspan="5">No lab usage recorded.</td></tr>'}</table></div></div><div id="labAction"></div></section>`;
}
function recipeBuilder(inv){
  return `<div class="panel"><h2>Add Recipe</h2><div class="form-grid"><label>Recipe Name<input id="recName" class="input" placeholder="Yeast Rolls, Alfredo Sauce, Knife Skills Salsa"></label><label>Yield Qty<input id="recYieldQty" class="input" type="number" step="0.01" placeholder="24"></label><label>Yield Unit<input id="recYieldUnit" class="input" placeholder="servings, portions, trays"></label><label>Inventory Source<select id="recSource" class="input"><option value="culinary">Culinary Department Inventory</option><option value="bistro">Bistro Inventory</option></select></label></div><h3>Ingredient Lines</h3><table class="report-table" id="recipeLineTable"><tr><th>Inventory Item</th><th>Qty</th><th>Unit</th><th>Prep/Notes</th><th></th></tr><tr>${recipeLineHtml(inv)}</tr></table><div class="row"><button class="primary" onclick="addRecipeLineRow()">Add Ingredient Line</button><button class="primary success" onclick="saveRecipeFromBuilder()">Save Recipe</button></div><label>Method / Lab Notes<textarea id="recMethod" class="input" placeholder="Production steps, lab notes, or TEKS connection"></textarea></label></div>`;
}
function recipeLineHtml(inv){return `<td><select class="input recItem">${inv.map(i=>`<option value="${i.id}">${i.name} (${i.unit})</option>`).join('')}</select></td><td><input class="input recQty" type="number" step="0.01" value="1"></td><td><input class="input recUnit" placeholder="lb, each, cup"></td><td><input class="input recNote" placeholder="chopped, melted, garnish"></td><td><button class="small-btn danger" onclick="this.closest('tr').remove()">Remove</button></td>`}
window.addRecipeLineRow=()=>{let inv=db.inventory.filter(i=>i.division==='culinary'); let tr=document.createElement('tr'); tr.innerHTML=recipeLineHtml(inv); document.getElementById('recipeLineTable').appendChild(tr);};
window.saveRecipeFromBuilder=()=>{let name=$('#recName')?.value.trim(); if(!name){alert('Recipe name is required.');return;} let ingredients=[...document.querySelectorAll('#recipeLineTable tr')].slice(1).map(row=>{let itemId=Number(row.querySelector('.recItem')?.value); let item=db.inventory.find(i=>i.id===itemId); return {itemId,itemName:item?.name||'Unknown',qty:Number(row.querySelector('.recQty')?.value)||0,unit:row.querySelector('.recUnit')?.value||item?.unit||'',note:row.querySelector('.recNote')?.value||''};}).filter(l=>l.qty>0); if(!ingredients.length){alert('Add at least one ingredient quantity.');return;} db.recipes.push({id:Date.now(),name,source:$('#recSource')?.value||'culinary',yieldQty:Number($('#recYieldQty')?.value)||'',yieldUnit:$('#recYieldUnit')?.value||'',method:$('#recMethod')?.value||'',ingredients,created:now(),createdBy:state.user.name}); save(); toast('Recipe saved.'); render();};
window.deleteRecipe=id=>{if(!confirm('Delete this recipe?'))return; db.recipes=db.recipes.filter(r=>r.id!==id); save(); render();};
window.showLabDeduct=id=>{let r=db.recipes.find(x=>x.id===id); if(!r)return; let rows=(r.ingredients||[]).map(l=>`<tr><td>${l.itemName}</td><td>${l.qty}</td><td>${l.unit}</td><td>${l.note||''}</td></tr>`).join(''); $('#labAction').innerHTML=`<div class="section panel"><h2>Use Recipe for Lab: ${r.name}</h2><p class="small">Enter a multiplier if making more or less than the saved recipe yield. Example: 2 = double recipe, .5 = half recipe.</p><div class="form-grid"><label>Class / Section<input id="labClass" class="input" placeholder="Culinary 1 - 2nd Period"></label><label>Multiplier<input id="labMultiplier" class="input" type="number" step="0.01" value="1"></label><label>Notes<input id="labNotes" class="input" placeholder="Optional"></label></div><table class="report-table"><tr><th>Ingredient</th><th>Recipe Qty</th><th>Unit</th><th>Notes</th></tr>${rows}</table><button class="primary danger" onclick="deductRecipeForLab(${id})">Deduct Ingredients from Culinary Inventory</button></div>`;};
window.deductRecipeForLab=id=>{let r=db.recipes.find(x=>x.id===id); if(!r)return; let mult=Number($('#labMultiplier')?.value)||1; let usage=[]; for(const l of (r.ingredients||[])){let inv=db.inventory.find(i=>i.id===l.itemId); let qty=Number(l.qty||0)*mult; if(inv){inv.onHand=Math.max(0,Number(inv.onHand||0)-qty); usage.push({itemId:inv.id,itemName:inv.name,qty,unit:l.unit||inv.unit});}} db.labUsage.push({id:Date.now(),recipeId:r.id,recipeName:r.name,date:now(),className:$('#labClass')?.value||'',multiplier:mult,notes:$('#labNotes')?.value||'',usage,by:state.user.name}); save(); toast('Culinary lab inventory deducted.'); render();};

function reports(){
 let teacher=state.user.role==='teacher'&&state.user.inventoryScope==='culinary';
 let paid=db.orders.filter(o=>o.paid);
 let sumByType=(type)=>paid.filter(o=>(o.payment?.type||'')===type).reduce((a,o)=>a+total(o),0);
 let paymentReport=teacher?'':`<h2>Payment Summary</h2><table class="report-table"><tr><th>Payment Type</th><th>Total</th></tr>${['Cash','Card','Check','District Account','Donation'].map(t=>`<tr><td>${t}</td><td>${money(sumByType(t))}</td></tr>`).join('')}</table>`;
 let checkRows=paid.filter(o=>o.payment?.type==='Check').map(o=>`<tr><td>${new Date(o.paidAt).toLocaleString()}</td><td>${o.payment.checkNumber}</td><td>${o.payment.payor||''}</td><td>${money(o.payment.amount)}</td><td>${o.payment.processedBy}</td></tr>`).join('');
 let checkLog=teacher?'':`<h2>Check Log</h2><table class="report-table"><tr><th>Date</th><th>Check #</th><th>Payor</th><th>Amount</th><th>Processed By</th></tr>${checkRows||'<tr><td colspan="5">No check payments recorded.</td></tr>'}</table>`;
 let refundRows=(db.refunds||[]).map(r=>`<tr><td>${new Date(r.processedAt).toLocaleString()}</td><td>${r.orderId}</td><td>${r.customer||''}</td><td>${money(r.amount)}</td><td>${r.reason}</td><td>${r.processedBy}</td></tr>`).join('');
 let refundLog=teacher?'':`<h2>Refund Log</h2><table class="report-table"><tr><th>Date</th><th>Order</th><th>Customer</th><th>Amount</th><th>Reason</th><th>Processed By</th></tr>${refundRows||'<tr><td colspan="6">No refunds recorded.</td></tr>'}</table>`;
 let labor=teacher?'':`<h2>Daily Labor</h2><table class="report-table"><tr><th>Student</th><th>Position</th><th>Clock In</th><th>Clock Out</th></tr>${db.shifts.map(s=>`<tr><td>${s.name}</td><td>${s.pos}</td><td>${new Date(s.in).toLocaleString()}</td><td>${s.out?new Date(s.out).toLocaleString():'Still In'}</td></tr>`).join('')}</table>`;
 let bistro=teacher?'':`<p>Bistro sales: ${money(db.orders.filter(o=>o.paid&&o.type!=='catering').reduce((a,o)=>a+total(o),0))}</p>`;
 let exportCenter=`<div class="section panel"><h2>Export Center</h2><p class="small">Download reports and inventory data as CSV files for Excel or Google Sheets.</p><div class="row"><button class="primary" onclick="exportSalesReport()">Export Sales Report</button>${teacher?'':`<button class="primary" onclick="exportLaborReport()">Export Labor Report</button><button class="primary" onclick="exportPaymentReport()">Export Payment Report</button><button class="primary" onclick="exportCheckLog()">Export Check Log</button><button class="primary" onclick="exportRefundLog()">Export Refund Log</button>`}<button class="primary" onclick="exportCateringReport()">Export Catering Report</button><button class="primary" onclick="exportInventoryData('culinary')">Export Culinary Inventory</button>${teacher?'':`<button class="primary" onclick="exportInventoryData('bistro')">Export Bistro Inventory</button><button class="primary" onclick="exportAllInventoryData()">Export All Inventory</button>`}</div></div>`;
 return `<section class="card"><h1>${teacher?'Culinary Department Reports':'Reports'}</h1>${teacher?'<div class="notice">Teacher access is limited to Culinary Department information unless a manager grants more access.</div>':''}${exportCenter}${labor}<h2>Sales</h2>${bistro}<p>Catering sales: ${money(db.orders.filter(o=>o.paid&&o.type==='catering').reduce((a,o)=>a+total(o),0))}</p>${paymentReport}${checkLog}${refundLog}<h2>Culinary Inventory Value</h2><p>${money(db.inventory.filter(i=>i.division==='culinary').reduce((a,i)=>a+i.onHand*2,0))}</p></section>`}

function todaysOrders(){let today=new Date().toLocaleDateString();return db.orders.filter(o=>new Date(o.created).toLocaleDateString()===today);}
function closeout(){if(state.user.role!=='manager')return `<section class="card"><h1>End of Day Locked</h1><p>Only managers can complete the daily closeout.</p></section>`;let orders=todaysOrders(), paid=orders.filter(o=>o.paid), open=orders.filter(o=>!o.paid), sales=paid.reduce((a,o)=>a+total(o),0), stillIn=db.shifts.filter(s=>!s.out);let byType=['Cash','Card','Check','District Account','Donation'].map(t=>({type:t,total:paid.filter(o=>o.payment?.type===t).reduce((a,o)=>a+(o.payment?.amount||0),0)}));return `<section class="card"><h1>End of Day Closeout</h1><p class="notice">Manager review before closing the service day.</p><div class="grid"><div class="card"><h2>Sales Today</h2><p class="big">${money(sales)}</p><p>Paid orders: ${paid.length}</p><p>Open/unpaid orders: ${open.length}</p></div><div class="card"><h2>Labor Check</h2><p>Students still clocked in: ${stillIn.length}</p>${stillIn.map(s=>`<p>${s.name} • ${s.pos}</p>`).join('')||'<p>All students clocked out.</p>'}</div></div><h2>Payment Breakdown</h2><table class="report-table"><tr><th>Type</th><th>Total</th></tr>${byType.map(x=>`<tr><td>${x.type}</td><td>${money(x.total)}</td></tr>`).join('')}</table><h2>Cash Reconciliation</h2><div class="row"><input class="input" id="cashCounted" type="number" placeholder="Cash counted in box"><input class="input" id="closeNotes" placeholder="Closeout notes"><button class="primary success" onclick="completeCloseout()">Complete Closeout</button></div><h2>System Backup</h2><p class="small">Use this before major edits so the system can always be restored or modified later.</p><div class="row"><button class="primary" onclick="exportBackup()">Export Backup JSON</button><label class="primary filebtn">Import Backup JSON<input type="file" accept="application/json" onchange="importBackup(this.files[0])"></label></div><h2>Closeout History</h2><table class="report-table"><tr><th>Date</th><th>Manager</th><th>Sales</th><th>Open Orders</th><th>Cash Counted</th></tr>${db.dailyCloseouts.slice().reverse().map(c=>`<tr><td>${new Date(c.created).toLocaleString()}</td><td>${c.manager}</td><td>${money(c.sales)}</td><td>${c.openOrders}</td><td>${money(c.cashCounted)}</td></tr>`).join('')||'<tr><td colspan="5">No closeouts yet.</td></tr>'}</table></section>`}
window.completeCloseout=()=>{let orders=todaysOrders(), paid=orders.filter(o=>o.paid), open=orders.filter(o=>!o.paid);db.dailyCloseouts.push({id:Date.now(),created:now(),manager:state.user.name,sales:paid.reduce((a,o)=>a+total(o),0),paidOrders:paid.length,openOrders:open.length,cashCounted:Number($('#cashCounted')?.value||0),notes:$('#closeNotes')?.value||''});save();toast('End of day closeout saved.');render()};
window.exportBackup=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='guthrie-rms-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href)};
window.importBackup=file=>{if(!file)return;let r=new FileReader();r.onload=()=>{try{let data=JSON.parse(r.result);if(!data.users||!data.orders){alert('This does not look like a Guthrie RMS backup.');return;}db=data;save();toast('Backup imported.');render()}catch(e){alert('Could not import backup JSON.')}};r.readAsText(file)};

function csvEscape(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function downloadCSV(filename, rows){
 if(!rows.length){toast('No data to export.');return;}
 const headers=Object.keys(rows[0]);
 const csv=[headers.join(','),...rows.map(r=>headers.map(h=>csvEscape(r[h])).join(','))].join('\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);
 toast('Export downloaded.');
}
const dateStamp=()=>new Date().toISOString().slice(0,10);
window.exportInventoryData=(division)=>{
 let items=db.inventory.filter(i=>division==='all'||i.division===division);
 downloadCSV(`guthrie-${division}-inventory-${dateStamp()}.csv`,items.map(i=>({Division:i.division,Item:i.name,Vendor:i.vendor,Location:i.location||'Unassigned','On Hand':i.onHand,Par:i.par,Unit:i.unit,Status:Number(i.onHand)<Number(i.par)?'Below Par':'OK'})));
};
window.exportAllInventoryData=()=>exportInventoryData('all');
window.exportSalesReport=()=>{
 let rows=db.orders.filter(o=>o.paid).map(o=>({Date:o.paidAt||o.created,'Order Type':o.type,Customer:o.customer||'',Event:o.eventName||'',Items:o.items.map(i=>i.name).join('; '),Total:total(o),'Payment Type':o.payment?.type||'',ProcessedBy:o.payment?.processedBy||''}));
 downloadCSV(`guthrie-sales-report-${dateStamp()}.csv`,rows);
};
window.exportLaborReport=()=>{
 let rows=db.shifts.map(s=>({Student:s.name,Position:s.pos,'Clock In':new Date(s.in).toLocaleString(),'Clock Out':s.out?new Date(s.out).toLocaleString():'Still In','User ID':s.userId}));
 downloadCSV(`guthrie-labor-report-${dateStamp()}.csv`,rows);
};
window.exportPaymentReport=()=>{
 let rows=db.orders.filter(o=>o.paid).map(o=>({Date:o.paidAt||o.created,'Order Type':o.type,Customer:o.customer||'',Amount:o.payment?.amount||total(o),'Payment Type':o.payment?.type||'',Tendered:o.payment?.tendered||'',Change:o.payment?.change||'',CheckNumber:o.payment?.checkNumber||'',Payor:o.payment?.payor||'',ProcessedBy:o.payment?.processedBy||''}));
 downloadCSV(`guthrie-payment-report-${dateStamp()}.csv`,rows);
};
window.exportCheckLog=()=>{
 let rows=db.orders.filter(o=>o.paid&&o.payment?.type==='Check').map(o=>({Date:o.paidAt||o.created,'Check Number':o.payment.checkNumber,Payor:o.payment.payor||'',Amount:o.payment.amount||total(o),'Order Type':o.type,Customer:o.customer||'',ProcessedBy:o.payment.processedBy||''}));
 downloadCSV(`guthrie-check-log-${dateStamp()}.csv`,rows);
};
window.exportRefundLog=()=>{
 let rows=(db.refunds||[]).map(r=>({Date:r.processedAt,Order:r.orderId,OrderType:r.orderType,Customer:r.customer,Amount:r.amount,Reason:r.reason,Notes:r.notes,OriginalPaymentType:r.originalPaymentType,ProcessedBy:r.processedBy}));
 downloadCSV(`guthrie-refund-log-${dateStamp()}.csv`,rows);
};
window.exportCateringReport=()=>{
 let rows=db.orders.filter(o=>o.type==='catering').map(o=>({Created:o.created,Event:o.eventName||'',Customer:o.customer||'',EventDate:o.eventDate||'',Guests:o.guests||'',Menu:o.items?.[0]?.name||'',Total:total(o),Paid:o.paid?'Yes':'No','Payment Type':o.payment?.type||'',InventorySource:o.inventorySource||'culinary'}));
 downloadCSV(`guthrie-catering-report-${dateStamp()}.csv`,rows);
};



function shiftHours(s){let end=s.out?new Date(s.out):new Date(); return Math.max(0,(end-new Date(s.in))/3600000);}
function studentUsersForCurrent(){
  let students=db.users.filter(u=>u.role==='student');
  if(state.user.role==='teacher') students=students.filter(u=>String(u.teacherId)===String(state.user.id));
  return students;
}
function studentTotals(studentId){
  let shifts=db.shifts.filter(s=>s.userId===studentId);
  let total=shifts.reduce((a,s)=>a+shiftHours(s),0);
  let byPos={}; shifts.forEach(s=>{byPos[s.pos]=(byPos[s.pos]||0)+shiftHours(s)});
  let evals=(db.evaluations||[]).filter(e=>e.studentId===studentId);
  let skills=['Guest Service','POS Operations','Dining Room Service','Food Preparation','Inventory Management','Leadership'];
  let avg={}; skills.forEach(skill=>{let vals=evals.map(e=>Number(e.scores?.[skill]||0)).filter(Boolean); avg[skill]=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;});
  return {total,byPos,evals,avg,shifts};
}
function development(){
  const skills=['Guest Service','POS Operations','Dining Room Service','Food Preparation','Inventory Management','Leadership'];
  if(state.user.role==='student'){
    let t=studentTotals(state.user.id);
    return `<section class="card"><h1>My Student Development</h1><div class="grid"><div class="panel"><h2>Total Workforce Hours</h2><p class="big">${t.total.toFixed(2)}</p></div><div class="panel"><h2>Current Position</h2><p class="big">${state.user.pos}</p></div></div><h2>Position History</h2><table class="report-table"><tr><th>Date</th><th>Position</th><th>In</th><th>Out</th><th>Hours</th></tr>${t.shifts.slice().reverse().map(s=>`<tr><td>${new Date(s.in).toLocaleDateString()}</td><td>${s.pos}</td><td>${new Date(s.in).toLocaleTimeString()}</td><td>${s.out?new Date(s.out).toLocaleTimeString():'Clocked In'}</td><td>${shiftHours(s).toFixed(2)}</td></tr>`).join('')||'<tr><td colspan="5">No shifts yet.</td></tr>'}</table><h2>Skill Growth</h2><table class="report-table"><tr><th>Skill</th><th>Current Average</th><th>Level</th></tr>${skills.map(sk=>`<tr><td>${sk}</td><td>${t.avg[sk]?t.avg[sk].toFixed(1):'Not evaluated'}</td><td>${skillLabel(t.avg[sk])}</td></tr>`).join('')}</table></section>`;
  }
  let students=studentUsersForCurrent();
  return `<section class="card"><h1>Teacher Student Tracker</h1><p class="notice">Track assigned students, position history, workforce hours, and skill growth throughout the year.</p><div class="grid">${students.map(st=>{let t=studentTotals(st.id);return `<div class="ticket"><h3>${st.name}</h3><p>ID/PIN: ${st.studentId||st.pin}</p><p>Position: ${st.pos}</p><p><b>${t.total.toFixed(2)}</b> workforce hours</p><button class="primary" onclick="openStudentProfile(${st.id})">View Profile</button><button class="primary success" onclick="openEvaluation(${st.id})">Evaluate</button></div>`}).join('')||'<p>No students assigned.</p>'}</div><div id="studentDevDetail"></div></section>`;
}
function skillLabel(v){ if(!v) return 'Not Started'; if(v<1.5)return 'Beginning'; if(v<2.5)return 'Developing'; if(v<3.5)return 'Proficient'; return 'Advanced'; }
window.openStudentProfile=(id)=>{let st=db.users.find(u=>u.id===id), t=studentTotals(id); let skills=['Guest Service','POS Operations','Dining Room Service','Food Preparation','Inventory Management','Leadership']; $('#studentDevDetail').innerHTML=`<div class="section"><h2>${st.name} Workforce Profile</h2><div class="grid"><div class="panel"><h3>Total Hours</h3><p class="big">${t.total.toFixed(2)}</p></div><div class="panel"><h3>Evaluations</h3><p class="big">${t.evals.length}</p></div></div><h3>Hours by Position</h3><table class="report-table"><tr><th>Position</th><th>Hours</th></tr>${Object.entries(t.byPos).map(([p,h])=>`<tr><td>${p}</td><td>${h.toFixed(2)}</td></tr>`).join('')||'<tr><td colspan="2">No position history yet.</td></tr>'}</table><h3>Skill Averages</h3><table class="report-table"><tr><th>Skill</th><th>Average</th><th>Level</th></tr>${skills.map(sk=>`<tr><td>${sk}</td><td>${t.avg[sk]?t.avg[sk].toFixed(1):'N/A'}</td><td>${skillLabel(t.avg[sk])}</td></tr>`).join('')}</table><h3>Recent Shifts</h3><table class="report-table"><tr><th>Date</th><th>Position</th><th>Hours</th></tr>${t.shifts.slice(-10).reverse().map(s=>`<tr><td>${new Date(s.in).toLocaleString()}</td><td>${s.pos}</td><td>${shiftHours(s).toFixed(2)}</td></tr>`).join('')||'<tr><td colspan="3">No shifts yet.</td></tr>'}</table></div>`;};
window.openEvaluation=(id)=>{let st=db.users.find(u=>u.id===id); let skills=['Guest Service','POS Operations','Dining Room Service','Food Preparation','Inventory Management','Leadership']; $('#studentDevDetail').innerHTML=`<div class="section"><h2>Evaluate ${st.name}</h2><p class="small">1 = Beginning, 2 = Developing, 3 = Proficient, 4 = Advanced</p><div class="form-grid">${skills.map(sk=>`<label>${sk}<select class="input evalScore" data-skill="${sk}"><option value="1">1 - Beginning</option><option value="2">2 - Developing</option><option value="3" selected>3 - Proficient</option><option value="4">4 - Advanced</option></select></label>`).join('')}</div><label>Instructor Notes<textarea id="evalNotes" class="input" placeholder="Strengths, growth areas, leadership notes..."></textarea></label><button class="primary success" onclick="saveEvaluation(${id})">Save Evaluation</button></div>`;};
window.saveEvaluation=(id)=>{let scores={}; document.querySelectorAll('.evalScore').forEach(el=>scores[el.dataset.skill]=Number(el.value)); db.evaluations.push({id:Date.now(),studentId:id,studentName:db.users.find(u=>u.id===id)?.name||'',teacherId:state.user.id,teacherName:state.user.name,date:now(),scores,notes:$('#evalNotes')?.value||''}); save(); toast('Student evaluation saved.'); render(); state.view='development'; setTimeout(()=>{render();},0);};


function todayStr(){return new Date().toISOString().slice(0,10)}
function todayPaidOrders(){return (db.orders||[]).filter(o=>o.paid && (o.paidAt||o.created||'').slice(0,10)===todayStr())}
function dashboardCommand(){
  const paid=todayPaidOrders();
  const open=(db.orders||[]).filter(o=>!o.paid && validItems(o).length);
  const activeKms=(db.orders||[]).filter(o=>o.sent&&!['paid','closed','completed'].includes(o.status));
  const sales=paid.reduce((a,o)=>a+total(o),0);
  const cateringOpen=open.filter(o=>o.type==='catering').length;
  const counterOpen=open.filter(o=>o.type==='counter').length;
  const togoOpen=open.filter(o=>o.type==='togo').length;
  const tableOpen=open.filter(o=>o.type==='table').length;
  const clocked=(db.shifts||[]).filter(s=>!s.out);
  const lowBistro=(db.inventory||[]).filter(i=>i.division==='bistro' && Number(i.onHand)<Number(i.par)).length;
  const lowCulinary=(db.inventory||[]).filter(i=>i.division==='culinary' && Number(i.onHand)<Number(i.par)).length;
  const unpaidInvoices=(db.invoices||[]).filter(i=>!['Paid','Cancelled'].includes(i.status||'Draft')).length;
  if(state.user.role==='student'){
    let myShifts=(db.shifts||[]).filter(s=>s.userId===state.user.id); let hrs=myShifts.reduce((a,s)=>a+shiftHours(s),0);
    return `<section class="card"><h1>Student Dashboard</h1><p class="notice">Welcome, ${state.user.name}. Choose your task from the buttons below.</p><div class="stats"><div><b>${activeShift()?'IN':'OUT'}</b><span>Clock Status</span></div><div><b>${state.user.pos}</b><span>Position</span></div><div><b>${hrs.toFixed(1)}</b><span>Total Hours</span></div></div><div class="grid">${roleTiles()}</div></section>`
  }
  if(state.user.role==='teacher'){
    let myStudents=(db.users||[]).filter(u=>u.role==='student'&&u.teacherId===state.user.id);
    let present=myStudents.filter(st=>clocked.some(s=>s.userId===st.id)).length;
    return `<section class="card"><h1>Teacher Dashboard</h1><div class="stats"><div><b>${present}</b><span>My Students Clocked In</span></div><div><b>${myStudents.length}</b><span>My Students</span></div><div><b>${lowCulinary}</b><span>Culinary Low-Par Items</span></div><div><b>${cateringOpen}</b><span>Open Catering Orders</span></div></div><div class="grid">${roleTiles()}</div></section>`
  }
  return `<section class="card"><h1>Manager Command Center</h1><p class="notice">Today’s live operational snapshot.</p><div class="stats"><div><b>${money(sales)}</b><span>Sales Today</span></div><div><b>${open.length}</b><span>Open Orders</span></div><div><b>${activeKms.length}</b><span>KMS Tickets</span></div><div><b>${clocked.length}</b><span>Clocked In</span></div></div><div class="grid"><div class="panel"><h2>Operations</h2><p>Tables: ${tableOpen}</p><p>Counter: ${counterOpen}</p><p>To-Go: ${togoOpen}</p><p>Catering: ${cateringOpen}</p></div><div class="panel"><h2>Inventory Alerts</h2><p>Bistro below par: ${lowBistro}</p><p>Culinary below par: ${lowCulinary}</p></div><div class="panel"><h2>Financial</h2><p>Unpaid invoices: ${unpaidInvoices}</p><p>Donations today: ${money(paid.filter(o=>o.payment?.type==='Donation').reduce((a,o)=>a+(o.payment?.amount||0),0))}</p></div></div><h2>Quick Access</h2><div class="grid">${roleTiles()}</div></section>`
}
views.dashboard=()=>dashboardCommand();

function nextInvoiceNumber(){let n=(db.invoices||[]).length+1; return 'INV-'+new Date().getFullYear()+'-'+String(n).padStart(4,'0')}
function invoiceTotal(inv){
  if(inv.lineItems&&inv.lineItems.length){
    let sub=inv.lineItems.reduce((a,l)=>a+(Number(l.qty||0)*Number(l.rate||0)),0);
    let discount=Number(inv.discount||0);
    let tax=Number(inv.tax||0);
    return Math.max(0,sub-discount+tax);
  }
  return Number(inv.amount||0)||0;
}
function invoiceSubtotal(inv){return (inv.lineItems||[]).reduce((a,l)=>a+(Number(l.qty||0)*Number(l.rate||0)),0)}
function cateringInvoiceSourcePanel(){
  const cats=(db.orders||[]).filter(o=>o.type==='catering'&&!o.paid&&validItems(o).length);
  if(!cats.length) return `<div class="section panel"><h2>Catering Orders Ready for Invoice</h2><p class="small">No open catering orders with menu items are ready to invoice.</p></div>`;
  return `<div class="section panel"><h2>Catering Orders Ready for Invoice</h2><p class="small">Pull an invoice directly from a catering order. The line items, customer, event date, guest count, and Culinary Inventory source will copy into the invoice.</p><table class="report-table"><tr><th>Order</th><th>Customer/Event</th><th>Date</th><th>Guests</th><th>Menu/Items</th><th>Total</th><th>Action</th></tr>${cats.map(o=>`<tr><td>CAT-${o.id}</td><td>${o.customer||o.eventName||'Catering Order'}<br><span class="small">${o.serviceType||'Pickup'}</span></td><td>${o.eventDate||''}</td><td>${o.guests||''}</td><td>${validItems(o).map(i=>i.name||i.item||'Item').join(', ')}</td><td>${money(total(o))}</td><td><button class="small-btn success" onclick="createInvoiceFromCateringOrder(${o.id})">Create Invoice</button></td></tr>`).join('')}</table></div>`;
}
function invoiceCenter(){
  let invoices=db.invoices||[];
  invoices.forEach(i=>{i.lineItems=i.lineItems||[]; i.payments=i.payments||[]; i.status=i.status||'Draft'});
  let open=invoices.filter(i=>!['Paid','Cancelled'].includes(i.status));
  let paid=invoices.filter(i=>i.status==='Paid');
  return `<section class="card"><h1>Invoice Center</h1><p class="notice">Detailed invoices for catering, department orders, district events, checks, donations, and internal billing.</p>
  <div class="row"><button class="primary success" onclick="createDetailedInvoice()">Create Detailed Invoice</button><button class="primary" onclick="exportInvoicesCSV()">Export Invoice CSV</button></div>
  ${cateringInvoiceSourcePanel()}
  <div class="grid"><div class="panel"><h2>Open Invoices</h2><p class="big">${open.length}</p></div><div class="panel"><h2>Total Outstanding</h2><p class="big">${money(open.reduce((a,i)=>a+invoiceTotal(i),0))}</p></div><div class="panel"><h2>Paid</h2><p class="big">${paid.length}</p></div></div>
  <h2>Invoice List</h2>
  <table class="report-table"><tr><th>Invoice #</th><th>Customer/Dept.</th><th>Event</th><th>Service Date</th><th>Due</th><th>Total</th><th>Status</th><th>Actions</th></tr>${invoices.slice().reverse().map(i=>`<tr><td>${i.number}</td><td>${i.customer||''}</td><td>${i.event||''}</td><td>${i.serviceDate||i.date||''}</td><td>${i.dueDate||''}</td><td>${money(invoiceTotal(i))}</td><td><select class="input" onchange="updateInvoice(${i.id},'status',this.value)">${['Draft','Sent','Pending','Paid','Overdue','Cancelled'].map(st=>`<option ${i.status===st?'selected':''}>${st}</option>`).join('')}</select></td><td><button class="small-btn" onclick="invoiceEditor(${i.id})">Edit/View</button><button class="small-btn" onclick="duplicateInvoice(${i.id})">Duplicate</button><button class="small-btn danger" onclick="deleteInvoice(${i.id})">Delete</button></td></tr>`).join('')||'<tr><td colspan="8">No invoices yet.</td></tr>'}</table><div id="invoiceDetail"></div></section>`
}
window.createDetailedInvoice=()=>{
  db.invoices=db.invoices||[];
  let inv={id:Date.now(),number:nextInvoiceNumber(),customer:'',contactName:'',email:'',phone:'',event:'',serviceDate:todayStr(),dueDate:'',billingType:'Catering',serviceType:'Pickup',status:'Draft',poNumber:'',districtAccount:'',tax:0,discount:0,notes:'',terms:'Payment due upon receipt unless otherwise approved.',lineItems:[],payments:[],created:now(),createdBy:state.user.name};
  db.invoices.push(inv); save(); render(); setTimeout(()=>invoiceEditor(inv.id),50); toast('Detailed invoice created.');
};
window.createInvoiceFromCateringOrder=(orderId)=>{
  const o=(db.orders||[]).find(x=>x.id===orderId);
  if(!o||o.type!=='catering'){alert('Catering order not found.');return;}
  const items=validItems(o);
  if(!items.length){alert('This catering order does not have invoiceable items yet.');return;}
  db.invoices=db.invoices||[];
  const menuName=(db.cateringMenus||[]).find(m=>m.id===o.cateringMenuId)?.name || items[0]?.name || 'Catering Order';
  let inv={id:Date.now(),number:nextInvoiceNumber(),customer:o.customer||o.eventName||'',contactName:o.contactName||'',email:o.email||'',phone:o.phone||'',event:o.eventName||menuName||('Catering Order '+o.id),serviceDate:o.eventDate||todayStr(),dueDate:'',billingType:'Catering',serviceType:o.serviceType||'Pickup',status:'Draft',poNumber:o.poNumber||'',districtAccount:o.districtAccount||'',tax:0,discount:0,notes:`Generated directly from catering order CAT-${o.id}. Inventory Source: Culinary Inventory. Guest Count: ${o.guests||''}.`,terms:'Payment due upon receipt unless otherwise approved.',orderId:o.id,created:now(),createdBy:state.user.name,payments:[],lineItems:items.map((it,idx)=>({id:Date.now()+idx+Math.random(),description:it.name||it.item||menuName||'Catering Item',qty:Number(it.qty||o.guests||1),unit:it.unit||'guest/unit',rate:Number(it.rate ?? it.unitPrice ?? it.price ?? 0),notes:[...(it.mods||[]), it.note||it.notes||''].filter(Boolean).join(' | ')}))};
  // Older catering orders stored the full order total as a single item price. Preserve that total if line rates are zero.
  if(inv.lineItems.every(l=>!Number(l.rate)) && total(o)>0){ inv.lineItems=[{id:Date.now()+1,description:menuName||'Catering Order',qty:1,unit:'event',rate:total(o),notes:`${o.guests||''} guests/units • Culinary Inventory`}]; }
  db.invoices.push(inv); save(); state.view='invoices'; render(); setTimeout(()=>invoiceEditor(inv.id),50); toast('Invoice generated from selected catering order.');
};
window.generateInvoiceFromCatering=()=>{
  let cats=(db.orders||[]).filter(o=>o.type==='catering'&&!o.paid&&validItems(o).length);
  if(!cats.length){alert('No open catering orders with items found.');return;}
  let msg=cats.map((o,i)=>`${i+1}. ${o.customer||o.eventName||'Catering Order'} - ${money(total(o))}`).join('\n');
  let pick=Number(prompt('Select catering order number:\n'+msg,'1'))-1; let o=cats[pick]; if(!o)return;
  createInvoiceFromCateringOrder(o.id);
};
window.deleteInvoice=(id)=>{
  const inv=(db.invoices||[]).find(i=>i.id===id);
  if(!inv)return;
  const paid=(inv.payments||[]).reduce((a,p)=>a+Number(p.amount||0),0);
  const warning=paid>0?`\n\nThis invoice has recorded payments totaling ${money(paid)}. Deleting it will remove the invoice record from this local prototype.`:'';
  if(!confirm(`Delete invoice ${inv.number}?${warning}\n\nThis cannot be undone.`))return;
  db.invoiceDeleteLog=db.invoiceDeleteLog||[];
  db.invoiceDeleteLog.push({date:now(),by:state.user?.name||'',invoiceNumber:inv.number,customer:inv.customer,total:invoiceTotal(inv),status:inv.status});
  db.invoices=(db.invoices||[]).filter(i=>i.id!==id);
  save(); render(); toast('Invoice deleted.');
};
window.updateInvoice=(id,field,value)=>{let inv=(db.invoices||[]).find(i=>i.id===id); if(!inv)return; inv[field]=['tax','discount'].includes(field)?Number(value)||0:value; inv.updated=now(); save();};
window.invoiceEditor=(id)=>{let inv=(db.invoices||[]).find(x=>x.id===id); if(!inv)return; inv.lineItems=inv.lineItems||[]; inv.payments=inv.payments||[]; let el=document.getElementById('invoiceDetail'); if(!el)return;
  el.innerHTML=`<div class="card section"><h2>${inv.number} Detailed Invoice</h2>
  <div class="form-grid"><label>Customer / Department<input class="input" value="${inv.customer||''}" oninput="updateInvoice(${id},'customer',this.value)"></label><label>Contact Name<input class="input" value="${inv.contactName||''}" oninput="updateInvoice(${id},'contactName',this.value)"></label><label>Email<input class="input" value="${inv.email||''}" oninput="updateInvoice(${id},'email',this.value)"></label><label>Phone<input class="input" value="${inv.phone||''}" oninput="updateInvoice(${id},'phone',this.value)"></label><label>Event / Purpose<input class="input" value="${inv.event||''}" oninput="updateInvoice(${id},'event',this.value)"></label><label>Service Date<input class="input" type="date" value="${inv.serviceDate||inv.date||todayStr()}" oninput="updateInvoice(${id},'serviceDate',this.value)"></label><label>Due Date<input class="input" type="date" value="${inv.dueDate||''}" oninput="updateInvoice(${id},'dueDate',this.value)"></label><label>Billing Type<select class="input" onchange="updateInvoice(${id},'billingType',this.value)">${['Catering','Department Order','District Transfer','Donation','Other'].map(x=>`<option ${inv.billingType===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Service Type<select class="input" onchange="updateInvoice(${id},'serviceType',this.value)">${['Pickup','Delivery','Full Service','Internal Transfer','Invoice Only'].map(x=>`<option ${inv.serviceType===x?'selected':''}>${x}</option>`).join('')}</select></label><label>PO / Requisition #<input class="input" value="${inv.poNumber||''}" oninput="updateInvoice(${id},'poNumber',this.value)"></label><label>District Account / Budget Code<input class="input" value="${inv.districtAccount||''}" oninput="updateInvoice(${id},'districtAccount',this.value)"></label><label>Status<select class="input" onchange="updateInvoice(${id},'status',this.value);invoiceEditor(${id})">${['Draft','Sent','Pending','Paid','Overdue','Cancelled'].map(st=>`<option ${inv.status===st?'selected':''}>${st}</option>`).join('')}</select></label></div>
  <h3>Invoice Line Items</h3><table class="report-table"><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Line Total</th><th>Notes</th><th></th></tr>${inv.lineItems.map((l,idx)=>`<tr><td><input class="input" value="${l.description||''}" oninput="updateInvoiceLine(${id},${idx},'description',this.value)"></td><td><input class="input" type="number" value="${l.qty||0}" oninput="updateInvoiceLine(${id},${idx},'qty',this.value)"></td><td><input class="input" value="${l.unit||''}" oninput="updateInvoiceLine(${id},${idx},'unit',this.value)"></td><td><input class="input" type="number" step="0.01" value="${l.rate||0}" oninput="updateInvoiceLine(${id},${idx},'rate',this.value)"></td><td>${money((Number(l.qty||0)*Number(l.rate||0)))}</td><td><input class="input" value="${l.notes||''}" oninput="updateInvoiceLine(${id},${idx},'notes',this.value)"></td><td><button class="small-btn danger" onclick="removeInvoiceLine(${id},${idx})">Remove</button></td></tr>`).join('')||'<tr><td colspan="7">No line items yet.</td></tr>'}</table><button class="primary" onclick="addInvoiceLine(${id})">Add Line Item</button>
  <div class="grid"><div class="panel"><h3>Subtotal</h3><p class="big">${money(invoiceSubtotal(inv))}</p></div><div class="panel"><label>Discount<input class="input" type="number" step="0.01" value="${inv.discount||0}" onchange="updateInvoice(${id},'discount',this.value);invoiceEditor(${id})"></label></div><div class="panel"><label>Tax / Fee<input class="input" type="number" step="0.01" value="${inv.tax||0}" onchange="updateInvoice(${id},'tax',this.value);invoiceEditor(${id})"></label></div><div class="panel"><h3>Total Due</h3><p class="big">${money(invoiceTotal(inv))}</p></div></div>
  <h3>Payment Record</h3><div class="row"><select id="payType${id}" class="input"><option>Cash</option><option>Credit Card</option><option>Check</option><option>District Transfer</option><option>Donation</option></select><input id="payAmount${id}" class="input" type="number" step="0.01" placeholder="Amount"><input id="payRef${id}" class="input" placeholder="Check # / reference"><button class="primary success" onclick="addInvoicePayment(${id})">Add Payment</button></div>
  <table class="report-table"><tr><th>Date</th><th>Type</th><th>Amount</th><th>Reference</th><th>By</th></tr>${inv.payments.map(p=>`<tr><td>${p.date}</td><td>${p.type}</td><td>${money(p.amount)}</td><td>${p.ref||''}</td><td>${p.by||''}</td></tr>`).join('')||'<tr><td colspan="5">No payments recorded.</td></tr>'}</table>
  <label>Notes<textarea class="input" oninput="updateInvoice(${id},'notes',this.value)">${inv.notes||''}</textarea></label><label>Terms<textarea class="input" oninput="updateInvoice(${id},'terms',this.value)">${inv.terms||''}</textarea></label>
  <div class="row"><button class="primary" onclick="printInvoice(${id})">Print Invoice</button><button class="primary" onclick="exportSingleInvoiceCSV(${id})">Export This Invoice</button><button class="primary danger" onclick="deleteInvoice(${id})">Delete Invoice</button></div></div>`;
};
window.addInvoiceLine=(id)=>{let inv=db.invoices.find(i=>i.id===id); inv.lineItems=inv.lineItems||[]; inv.lineItems.push({id:Date.now(),description:'',qty:1,unit:'each',rate:0,notes:''}); save(); invoiceEditor(id);};
window.updateInvoiceLine=(id,idx,field,value)=>{let inv=db.invoices.find(i=>i.id===id); if(!inv||!inv.lineItems[idx])return; inv.lineItems[idx][field]=['qty','rate'].includes(field)?Number(value)||0:value; inv.amount=invoiceTotal(inv); inv.updated=now(); save();};
window.removeInvoiceLine=(id,idx)=>{let inv=db.invoices.find(i=>i.id===id); if(!inv)return; inv.lineItems.splice(idx,1); inv.amount=invoiceTotal(inv); save(); invoiceEditor(id);};
window.addInvoicePayment=(id)=>{let inv=db.invoices.find(i=>i.id===id); if(!inv)return; let type=$('#payType'+id).value; let amount=Number($('#payAmount'+id).value)||0; let ref=$('#payRef'+id).value.trim(); if(amount<=0){alert('Enter a payment amount.');return;} if(type==='Check'&&!ref){alert('Check number is required for check payments.');return;} inv.payments=inv.payments||[]; inv.payments.push({date:todayStr(),type,amount,ref,by:state.user.name}); let paid=inv.payments.reduce((a,p)=>a+Number(p.amount||0),0); if(paid>=invoiceTotal(inv))inv.status='Paid'; save(); invoiceEditor(id); toast('Payment added.');};
window.duplicateInvoice=(id)=>{let inv=db.invoices.find(i=>i.id===id); if(!inv)return; let copy=JSON.parse(JSON.stringify(inv)); copy.id=Date.now(); copy.number=nextInvoiceNumber(); copy.status='Draft'; copy.created=now(); copy.createdBy=state.user.name; copy.payments=[]; db.invoices.push(copy); save(); render(); toast('Invoice duplicated.');};
window.deleteInvoice=(id)=>{if(!confirm('Delete this invoice?'))return; db.invoices=(db.invoices||[]).filter(i=>i.id!==id); save(); render();};
function invoiceCSVRows(invoices){let rows=[['Invoice #','Customer','Contact','Email','Phone','Event','Service Date','Due Date','Billing Type','Service Type','PO/Requisition','Budget Code','Status','Subtotal','Discount','Tax/Fee','Total','Payments','Balance','Notes']]; invoices.forEach(i=>{let paid=(i.payments||[]).reduce((a,p)=>a+Number(p.amount||0),0); rows.push([i.number,i.customer,i.contactName,i.email,i.phone,i.event,i.serviceDate||i.date,i.dueDate,i.billingType,i.serviceType,i.poNumber,i.districtAccount,i.status,invoiceSubtotal(i),i.discount||0,i.tax||0,invoiceTotal(i),paid,invoiceTotal(i)-paid,(i.notes||'').replace(/\n/g,' ')]); (i.lineItems||[]).forEach(l=>rows.push(['','LINE ITEM','','','','', '', '', '', '', '', '', '', '', '', '', '', '', '', `${l.description} | ${l.qty} ${l.unit} x ${l.rate} | ${l.notes||''}`]));}); return rows;}
function downloadCSV(filename, rows){
 if(!rows||!rows.length){toast('No data to export.');return;}
 let csv='';
 const esc=(v)=>'"'+String(v??'').replace(/"/g,'""')+'"';
 if(Array.isArray(rows[0])){csv=rows.map(r=>r.map(esc).join(',')).join('\n');}
 else{const headers=Object.keys(rows[0]); csv=[headers.join(','),...rows.map(r=>headers.map(h=>esc(r[h])).join(','))].join('\n');}
 let blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); let a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); URL.revokeObjectURL(a.href);
}
window.exportInvoicesCSV=()=>downloadCSV('guthrie_invoices.csv',invoiceCSVRows(db.invoices||[]));
window.exportSingleInvoiceCSV=id=>{let inv=(db.invoices||[]).filter(i=>i.id===id); downloadCSV((inv[0]?.number||'invoice')+'.csv',invoiceCSVRows(inv));};
window.printInvoice=id=>{let inv=(db.invoices||[]).find(i=>i.id===id); if(!inv)return; let paid=(inv.payments||[]).reduce((a,p)=>a+Number(p.amount||0),0); let html=`<html><head><title>${inv.number}</title><style>body{font-family:Arial;padding:30px} h1{color:#003DA5} table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px;text-align:left}.right{text-align:right}</style></head><body><h1>Guthrie Bistro Invoice</h1><h2>${inv.number}</h2><p><b>Customer:</b> ${inv.customer||''}<br><b>Contact:</b> ${inv.contactName||''}<br><b>Email:</b> ${inv.email||''}<br><b>Phone:</b> ${inv.phone||''}</p><p><b>Event:</b> ${inv.event||''}<br><b>Service Date:</b> ${inv.serviceDate||inv.date||''}<br><b>Due Date:</b> ${inv.dueDate||''}<br><b>Status:</b> ${inv.status||''}</p><table><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Total</th></tr>${(inv.lineItems||[]).map(l=>`<tr><td>${l.description||''}<br><small>${l.notes||''}</small></td><td>${l.qty||0}</td><td>${l.unit||''}</td><td>${money(l.rate||0)}</td><td>${money((Number(l.qty||0)*Number(l.rate||0)))}</td></tr>`).join('')}</table><p class="right"><b>Subtotal:</b> ${money(invoiceSubtotal(inv))}<br><b>Discount:</b> ${money(inv.discount||0)}<br><b>Tax/Fee:</b> ${money(inv.tax||0)}<br><b>Total:</b> ${money(invoiceTotal(inv))}<br><b>Paid:</b> ${money(paid)}<br><b>Balance:</b> ${money(invoiceTotal(inv)-paid)}</p><p><b>Notes:</b><br>${inv.notes||''}</p><p><b>Terms:</b><br>${inv.terms||''}</p></body></html>`; let w=window.open('','_blank'); w.document.write(html); w.document.close(); w.print();};
window.invoicePreview=window.invoiceEditor;


function productionRemaining(menuId){let p=db.production?.items?.[menuId]; return p?Number(p.remaining)||0:0}
function isMenu86(m){let p=db.production?.items?.[m.id]; return !m.active || p?.manual86 || (p && Number(p.remaining)<=0)}
function ensureProd(menuId){let m=db.menu.find(x=>x.id===menuId); db.production=db.production||{date:new Date().toISOString().slice(0,10),items:{},history:[]}; if(!db.production.items[menuId])db.production.items[menuId]={startingPar:Number(m?.dailyPar)||0,remaining:Number(m?.dailyPar)||0,manual86:false,reason:''}; return db.production.items[menuId]}
function deductProduction(menuId,qty=1){let p=ensureProd(menuId); if(p.manual86||Number(p.remaining)<qty)return false; p.remaining=Number(p.remaining)-qty; if(p.remaining<=0){p.remaining=0;p.auto86=true;} return true;}
function restoreProduction(menuId,qty=1){if(!menuId)return; let p=ensureProd(menuId); p.remaining=Number(p.remaining)+qty; if(Number(p.remaining)>0)p.auto86=false;}
function menuCategoryLabel(cat){return cat||'Entree'}
function renderBistroMenuButtons(){
 const cats=['Entree','Beverage','Dessert'];
 return cats.map(cat=>{let items=(db.menu||[]).filter(m=>m.inv==='bistro'&&menuCategoryLabel(m.category)===cat&&m.active); if(!items.length)return ''; return `<div class="wide"><h3>${cat}</h3><div class="menu-grid">${items.map(m=>{let disabled=isMenu86(m); let rem=productionRemaining(m.id); return `<button class="menu-item ${disabled?'disabled86':''}" ${disabled?'disabled':''} onclick="modifierModal(${m.id},${state.seat||1})"><strong>${m.name}</strong><br>${money(m.price)}<br><span class="small">${disabled?'86\'D':`Remaining: ${rem}`}</span></button>`}).join('')}</div></div>`}).join('')
}
function bistroMenuSetupPanel(){
 const cats=['Entree','Beverage','Dessert'];
 return `<div class="section panel"><h2>Bistro Menu + Daily Production Pars</h2><p class="small">Add new Bistro menu items by category. Set beginning shift par/production counts. Items deduct when added to an order and return if removed at checkout. Items automatically 86 at zero.</p>
 <div class="form-grid"><label>Item Name<input id="newMenuName" class="input" placeholder="New Bistro Item"></label><label>Category<select id="newMenuCategory" class="input"><option>Entree</option><option>Beverage</option><option>Dessert</option></select></label><label>Price<input id="newMenuPrice" type="number" step="0.01" class="input" placeholder="0.00"></label><label>Daily Production Par<input id="newMenuPar" type="number" class="input" placeholder="0"></label><label>Modifiers<input id="newMenuMods" class="input" placeholder="No onion, Add cheese, Light ice"></label></div><button class="primary" onclick="addBistroMenuItem()">Add Bistro Menu Item</button>
 <h3>Current Bistro Menu</h3><table class="report-table"><tr><th>Item</th><th>Category</th><th>Price</th><th>Starting Par</th><th>Remaining</th><th>Status</th><th>Actions</th></tr>${(db.menu||[]).filter(m=>m.inv==='bistro').map(m=>{let p=ensureProd(m.id);return `<tr><td contenteditable onblur="updateMenuItem(${m.id},'name',this.textContent)">${m.name}</td><td><select class="input" onchange="updateMenuItem(${m.id},'category',this.value)">${cats.map(c=>`<option ${m.category===c?'selected':''}>${c}</option>`).join('')}</select></td><td><input class="input" type="number" step="0.01" value="${m.price}" onchange="updateMenuItem(${m.id},'price',this.value)"></td><td><input class="input" type="number" value="${p.startingPar}" onchange="setProductionPar(${m.id},this.value)"></td><td>${p.remaining}</td><td>${isMenu86(m)?'<span class="badge danger">86\'D</span>':(p.remaining<=10?'<span class="badge warn">LOW</span>':'<span class="badge good">AVAILABLE</span>')}</td><td><button class="small-btn" onclick="toggle86(${m.id})">${p.manual86?'Restore':'86 Item'}</button><button class="small-btn danger" onclick="deactivateMenuItem(${m.id})">Deactivate</button></td></tr>`}).join('')}</table></div>`
}
window.addBistroMenuItem=()=>{let name=$('#newMenuName')?.value.trim(); if(!name){alert('Enter a menu item name.');return;} let category=$('#newMenuCategory')?.value||'Entree'; let price=Number($('#newMenuPrice')?.value)||0; let par=Number($('#newMenuPar')?.value)||0; let mods=($('#newMenuMods')?.value||'').split(',').map(x=>x.trim()).filter(Boolean); let id=Date.now(); db.menu.push({id,name,category,price,inv:'bistro',mods,active:true,dailyPar:par}); db.production.items[id]={startingPar:par,remaining:par,manual86:false,reason:''}; save(); toast('Bistro menu item added.'); render();};
window.updateMenuItem=(id,field,value)=>{let m=db.menu.find(x=>x.id===id); if(!m)return; m[field]=field==='price'?Number(value)||0:value; save();};
window.setProductionPar=(id,value)=>{let p=ensureProd(id); p.startingPar=Number(value)||0; p.remaining=Number(value)||0; p.manual86=false; p.reason=''; let m=db.menu.find(x=>x.id===id); if(m)m.dailyPar=p.startingPar; save(); render();};
window.toggle86=(id)=>{let p=ensureProd(id); if(p.manual86){p.manual86=false;p.reason=''; if(p.remaining<=0)p.remaining=Number(p.startingPar)||1;}else{p.manual86=true;p.reason=prompt('Reason for 86?', 'Out of stock')||'86 by manager';} save(); render();};
window.deactivateMenuItem=id=>{if(!confirm('Deactivate this Bistro menu item? It will no longer show on order screens.'))return; let m=db.menu.find(x=>x.id===id); if(m)m.active=false; save(); render();};
window.toggleDemoMode=()=>{db.settings.demoMode=!db.settings.demoMode; save(); render(); toast(db.settings.demoMode?'Demo mode enabled.':'Demo mode disabled. Demo PINs hidden from login page.');};

function setup(){
 if(state.user.role!=='manager')return `<section class="card"><h1>Settings Locked</h1><p>Only managers can change system settings or grant additional access.</p></section>`;
 const tabs=[
  ['business','Business & Mode','Business name, demo mode and operating preferences'],
  ['appearance','Theme & Appearance','Colors, fonts, backgrounds and interface styling'],
  ['staff','Team & Permissions','Students, teachers, managers and positions'],
  ['menu','Bistro Menu','Menu items, categories, modifiers and production pars'],
  ['dining','Dining Room','Tables and default seat counts'],
  ['inventory','Inventory & Vendors','Vendors, locations and inventory defaults'],
  ['catering','Catering','Catering item library and menu setup'],
  ['recipes','Recipes & Labs','Recipe and culinary lab configuration'],
  ['kms','KMS','Kitchen station names and workflow settings'],
  ['data','Reports & Data','Exports and browser data tools']
 ];
 let active=state.settingsTab||'business';
 return `<section class="settings-shell"><div class="settings-sidebar"><div class="settings-sidebar-head"><h2>Settings</h2><p>Manager Control Center</p></div>${tabs.map(([id,label,desc])=>`<button class="settings-nav ${active===id?'active':''}" onclick="state.settingsTab='${id}';render()"><strong>${label}</strong><span>${desc}</span></button>`).join('')}</div><div class="settings-content">${settingsPanel(active)}</div></section>`;
}

function shiftDateTime(sh){return new Date(`${sh.date}T${sh.startTime||'00:00'}`)}
function shiftDuration(sh){
 if(!sh.startTime||!sh.endTime)return 0;
 let a=new Date(`${sh.date}T${sh.startTime}`), b=new Date(`${sh.date}T${sh.endTime}`);
 return Math.max(0,(b-a)/3600000);
}
function scheduledForStudent(studentId){return (db.scheduledShifts||[]).filter(sh=>(sh.assignments||[]).some(a=>String(a.studentId)===String(studentId))).sort((a,b)=>shiftDateTime(a)-shiftDateTime(b));}
function scheduledForTeacher(teacherId){
 let studentIds=db.users.filter(u=>u.role==='student'&&String(u.teacherId)===String(teacherId)).map(u=>String(u.id));
 return (db.scheduledShifts||[]).filter(sh=>(sh.assignments||[]).some(a=>studentIds.includes(String(a.studentId)))).sort((a,b)=>shiftDateTime(a)-shiftDateTime(b));
}
function scheduleCenter(){
 if(state.user.role==='student') return studentScheduleView();
 if(state.user.role==='teacher') return teacherScheduleView();
 let shifts=(db.scheduledShifts||[]).slice().sort((a,b)=>shiftDateTime(a)-shiftDateTime(b));
 return `<section class="card"><h1>Shift Scheduler</h1><p class="notice">Build a shift around the operation being staffed, then assign students and positions.</p><div class="row"><button class="primary success" onclick="newScheduledShift()">Create Shift</button><button class="primary" onclick="exportScheduleCSV()">Export Schedule CSV</button></div>${shiftBuilderHtml()}<h2>Scheduled Shifts</h2>${shifts.map(shiftCard).join('')||'<p>No shifts scheduled yet.</p>'}</section>`;
}
function shiftBuilderHtml(){
 if(!state.editShiftId)return '';
 let sh=(db.scheduledShifts||[]).find(x=>x.id===state.editShiftId);
 if(!sh)return '';
 let students=db.users.filter(u=>u.role==='student'&&u.active);
 return `<div class="section settings-card"><div class="row"><h2>${sh.isNew?'Create':'Edit'} Shift</h2><span class="spacer"></span><button class="small-btn" onclick="state.editShiftId=null;render()">Close</button></div><div class="form-grid"><label>Operation<select id="schedOperation" class="input" onchange="editShiftField(${sh.id},'operation',this.value)">${db.settings.operations.map(op=>`<option ${sh.operation===op?'selected':''}>${op}</option>`).join('')}</select></label><label>Date<input id="schedDate" type="date" class="input" value="${sh.date||''}" onchange="editShiftField(${sh.id},'date',this.value)"></label><label>Start Time<input id="schedStart" type="time" class="input" value="${sh.startTime||''}" onchange="editShiftField(${sh.id},'startTime',this.value)"></label><label>End Time<input id="schedEnd" type="time" class="input" value="${sh.endTime||''}" onchange="editShiftField(${sh.id},'endTime',this.value)"></label><label>Location<input class="input" value="${sh.location||''}" placeholder="Bistro, Catering Kitchen, etc." onchange="editShiftField(${sh.id},'location',this.value)"></label><label>Status<select class="input" onchange="editShiftField(${sh.id},'status',this.value)">${['Draft','Published','Completed','Cancelled'].map(st=>`<option ${sh.status===st?'selected':''}>${st}</option>`).join('')}</select></label></div><label>Shift Notes<textarea class="input" onchange="editShiftField(${sh.id},'notes',this.value)">${sh.notes||''}</textarea></label><h3>Student Assignments</h3><div class="schedule-assign-grid">${students.map(st=>assignmentRow(sh,st)).join('')}</div><div class="row section"><button class="primary success" onclick="publishScheduledShift(${sh.id})">Save / Publish Shift</button><button class="small-btn danger" onclick="deleteScheduledShift(${sh.id})">Delete Shift</button></div></div>`;
}
function assignmentRow(sh,st){
 let a=(sh.assignments||[]).find(x=>String(x.studentId)===String(st.id));
 return `<div class="schedule-assignment ${a?'assigned':''}"><label><input type="checkbox" ${a?'checked':''} onchange="toggleShiftStudent(${sh.id},${st.id},this.checked)"> <b>${st.name}</b></label><span class="small">${st.studentId||st.pin} • ${db.users.find(t=>t.id===st.teacherId)?.name||'No teacher'}</span>${a?`<select class="input" onchange="setShiftStudentPosition(${sh.id},${st.id},this.value)">${db.positions.map(p=>`<option ${a.position===p?'selected':''}>${p}</option>`).join('')}</select>`:''}</div>`;
}
function shiftCard(sh){
 let count=(sh.assignments||[]).length;
 return `<div class="ticket"><div class="row"><div><h3>${sh.operation||'Shift'}</h3><p>${sh.date||''} • ${sh.startTime||''}–${sh.endTime||''} • ${shiftDuration(sh).toFixed(1)} hrs</p><p>${sh.location||''} <span class="pill">${sh.status||'Draft'}</span></p></div><span class="spacer"></span><div><b>${count}</b> student(s)</div></div><p>${(sh.assignments||[]).map(a=>`${db.users.find(u=>u.id===a.studentId)?.name||'Student'} — ${a.position}`).join(' • ')||'No students assigned'}</p><div class="row"><button class="small-btn" onclick="editScheduledShift(${sh.id})">Edit</button><button class="small-btn" onclick="duplicateScheduledShift(${sh.id})">Duplicate</button></div></div>`;
}
window.newScheduledShift=()=>{let sh={id:Date.now(),operation:db.settings.operations[0]||'Bistro Service',date:new Date().toISOString().slice(0,10),startTime:'09:00',endTime:'12:00',location:'',status:'Draft',notes:'',assignments:[],createdBy:state.user.name,createdAt:now(),isNew:true};db.scheduledShifts.push(sh);state.editShiftId=sh.id;save();render();};
window.editScheduledShift=id=>{state.editShiftId=id;render();};
window.editShiftField=(id,field,value)=>{let sh=db.scheduledShifts.find(x=>x.id===id);if(!sh)return;sh[field]=value;save();};
window.toggleShiftStudent=(shiftId,studentId,on)=>{let sh=db.scheduledShifts.find(x=>x.id===shiftId);let st=db.users.find(u=>u.id===studentId);if(!sh||!st)return;sh.assignments=sh.assignments||[];if(on&&!sh.assignments.some(a=>a.studentId===studentId))sh.assignments.push({studentId,position:st.pos||'Server'});if(!on)sh.assignments=sh.assignments.filter(a=>a.studentId!==studentId);save();render();};
window.setShiftStudentPosition=(shiftId,studentId,position)=>{let sh=db.scheduledShifts.find(x=>x.id===shiftId);let a=sh?.assignments?.find(a=>a.studentId===studentId);if(a)a.position=position;save();};
window.publishScheduledShift=id=>{let sh=db.scheduledShifts.find(x=>x.id===id);if(!sh)return;if(!sh.date||!sh.startTime||!sh.endTime){alert('Date, start time, and end time are required.');return;}if(!(sh.assignments||[]).length){if(!confirm('Publish this shift with no students assigned?'))return;}sh.status='Published';sh.isNew=false;sh.updatedAt=now();state.editShiftId=null;save();render();toast('Shift published.');};
window.deleteScheduledShift=id=>{if(!confirm('Delete this scheduled shift?'))return;db.scheduledShifts=db.scheduledShifts.filter(x=>x.id!==id);if(state.editShiftId===id)state.editShiftId=null;save();render();};
window.duplicateScheduledShift=id=>{let src=db.scheduledShifts.find(x=>x.id===id);if(!src)return;let copy=JSON.parse(JSON.stringify(src));copy.id=Date.now();copy.status='Draft';copy.isNew=true;copy.createdAt=now();db.scheduledShifts.push(copy);state.editShiftId=copy.id;save();render();};
function studentScheduleView(){let shifts=scheduledForStudent(state.user.id);let upcoming=shifts.filter(s=>shiftDateTime(s)>=new Date()&&s.status!=='Cancelled');return `<section class="card"><h1>My Schedule</h1><p class="notice">Your scheduled Guthrie Enterprise shifts.</p>${upcoming.map(sh=>{let a=sh.assignments.find(a=>a.studentId===state.user.id);return `<div class="ticket"><h3>${sh.operation}</h3><p>${sh.date} • ${sh.startTime}–${sh.endTime}</p><p><b>Position:</b> ${a?.position||state.user.pos}</p><p><b>Location:</b> ${sh.location||'TBD'}</p><p>${sh.notes||''}</p></div>`}).join('')||'<p>No upcoming shifts scheduled.</p>'}</section>`;}
function teacherScheduleView(){let shifts=scheduledForTeacher(state.user.id);return `<section class="card"><h1>My Student Schedule</h1><p class="notice">View scheduled shifts for students assigned to you.</p>${shifts.map(sh=>`<div class="ticket"><h3>${sh.operation}</h3><p>${sh.date} • ${sh.startTime}–${sh.endTime}</p><p>${(sh.assignments||[]).filter(a=>db.users.find(u=>u.id===a.studentId)?.teacherId===state.user.id).map(a=>`${db.users.find(u=>u.id===a.studentId)?.name} — ${a.position}`).join(' • ')}</p></div>`).join('')||'<p>No assigned student shifts.</p>'}</section>`;}
window.exportScheduleCSV=()=>{let rows=(db.scheduledShifts||[]).flatMap(sh=>(sh.assignments||[]).map(a=>({Date:sh.date,Operation:sh.operation,Start:sh.startTime,End:sh.endTime,Location:sh.location,Status:sh.status,Student:db.users.find(u=>u.id===a.studentId)?.name||'',StudentID:db.users.find(u=>u.id===a.studentId)?.studentId||'',Position:a.position,Notes:sh.notes||''})));downloadCSV(`guthrie-schedule-${new Date().toISOString().slice(0,10)}.csv`,rows);};
function schedulingSettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>Scheduling</h1><p>Maintain the operations that can be staffed in the Shift Scheduler.</p></div></div><div class="settings-card"><h3>Operations</h3><div class="row"><input id="newOperation" class="input" placeholder="New operation"><button class="primary" onclick="addOperationSetting()">Add Operation</button></div><div class="settings-list">${db.settings.operations.map((op,i)=>`<div class="settings-list-row"><span>${op}</span><div class="row"><button class="small-btn" onclick="renameOperationSetting(${i})">Rename</button><button class="small-btn danger" onclick="removeOperationSetting(${i})">Remove</button></div></div>`).join('')}</div></div><div class="settings-card"><h3>Open Scheduler</h3><button class="primary" onclick="state.view='schedule';render()">Open Shift Scheduler</button></div></div>`;}
window.addOperationSetting=()=>{let v=$('#newOperation')?.value.trim();if(!v)return;if(!db.settings.operations.includes(v))db.settings.operations.push(v);save();render();};
window.renameOperationSetting=i=>{let old=db.settings.operations[i];let v=prompt('Rename operation:',old);if(!v)return;db.settings.operations[i]=v;(db.scheduledShifts||[]).forEach(sh=>{if(sh.operation===old)sh.operation=v});save();render();};
window.removeOperationSetting=i=>{let op=db.settings.operations[i];if((db.scheduledShifts||[]).some(sh=>sh.operation===op&&!['Completed','Cancelled'].includes(sh.status))){alert('This operation is being used by an active scheduled shift. Rename it instead.');return;}db.settings.operations.splice(i,1);save();render();};

function settingsPanel(tab){
 if(tab==='business') return businessSettingsPanel();
 if(tab==='appearance') return appearanceSettingsPanel();
 if(tab==='staff') return staffSettingsPanel();
 if(tab==='menu') return menuSettingsPanel();
 if(tab==='dining') return diningSettingsPanel();
 if(tab==='inventory') return inventorySettingsPanel();
 if(tab==='catering') return cateringSettingsPanel();
 if(tab==='recipes') return recipesSettingsPanel();
 if(tab==='kms') return kmsSettingsPanel(); if(tab==='scheduling') return schedulingSettingsPanel();
 if(tab==='data') return dataSettingsPanel();
 return businessSettingsPanel();
}
function businessSettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>Business & Mode</h1><p>Control the identity and operating mode of the RMS.</p></div></div><div class="settings-card"><h3>Business Profile</h3><div class="form-grid"><label>System Name<input id="settingBusinessName" class="input" value="${db.settings.businessName||'Guthrie RMS'}"></label><label>Login Subtitle<input id="settingSubtitle" class="input" value="${db.settings.businessSubtitle||'Restaurant Management System'}"></label><label>Low Production Warning<input id="settingLowStock" type="number" class="input" value="${db.settings.lowStockThreshold??10}"></label></div><button class="primary" onclick="saveBusinessSettings()">Save Business Settings</button></div><div class="settings-card"><h3>System Mode</h3><div class="setting-row"><div><strong>Demo Mode</strong><p>When disabled, demo PINs disappear from the login screen. Your real users remain available.</p></div><button class="toggle-button ${db.settings.demoMode?'on':''}" onclick="toggleDemoMode()"><span></span>${db.settings.demoMode?'ON':'OFF'}</button></div><div class="mode-banner ${db.settings.demoMode?'demo':'live'}">${db.settings.demoMode?'DEMO MODE':'PRODUCTION MODE'}</div></div></div>`}
window.saveBusinessSettings=()=>{db.settings.businessName=$('#settingBusinessName')?.value.trim()||'Guthrie RMS';db.settings.businessSubtitle=$('#settingSubtitle')?.value.trim()||'Restaurant Management System';db.settings.lowStockThreshold=Number($('#settingLowStock')?.value)||10;save();toast('Business settings saved.');render();};
function appearanceSettingsPanel(){
 const t=db.settings.theme;
 const fonts=[
  ['Arial, Helvetica, sans-serif','Arial / Helvetica'],
  ['Inter, Arial, sans-serif','Inter / Modern Sans'],
  ['Verdana, Geneva, sans-serif','Verdana'],
  ['Trebuchet MS, Arial, sans-serif','Trebuchet MS'],
  ['Georgia, Times New Roman, serif','Georgia / Serif']
 ];
 return `<div class="settings-page"><div class="settings-page-head"><div><h1>Theme & Appearance</h1><p>Customize the RMS visually without editing code. Changes save in this browser and apply immediately.</p></div></div>
 <div class="settings-card"><h3>Brand Colors</h3><div class="theme-control-grid">
 <label>Primary / Buttons<input type="color" class="theme-color" value="${t.primary}" oninput="updateTheme('primary',this.value)"><input class="input" value="${t.primary}" onchange="updateTheme('primary',this.value)"></label>
 <label>Accent<input type="color" class="theme-color" value="${t.accent}" oninput="updateTheme('accent',this.value)"><input class="input" value="${t.accent}" onchange="updateTheme('accent',this.value)"></label>
 <label>Header<input type="color" class="theme-color" value="${t.headerBackground}" oninput="updateTheme('headerBackground',this.value)"><input class="input" value="${t.headerBackground}" onchange="updateTheme('headerBackground',this.value)"></label>
 <label>Page Background<input type="color" class="theme-color" value="${t.pageBackground}" oninput="updateTheme('pageBackground',this.value)"><input class="input" value="${t.pageBackground}" onchange="updateTheme('pageBackground',this.value)"></label>
 <label>Card / Surface<input type="color" class="theme-color" value="${t.surface}" oninput="updateTheme('surface',this.value)"><input class="input" value="${t.surface}" onchange="updateTheme('surface',this.value)"></label>
 <label>Text<input type="color" class="theme-color" value="${t.text}" oninput="updateTheme('text',this.value)"><input class="input" value="${t.text}" onchange="updateTheme('text',this.value)"></label>
 </div></div>
 <div class="settings-card"><h3>Typography & Shape</h3><div class="form-grid"><label>Font<select class="input" onchange="updateTheme('font',this.value)">${fonts.map(([v,l])=>`<option value="${v}" ${t.font===v?'selected':''}>${l}</option>`).join('')}</select></label><label>Card Corner Radius<input class="input" type="range" min="0" max="28" value="${t.cardRadius}" oninput="updateTheme('cardRadius',Number(this.value));this.nextElementSibling.textContent=this.value+'px'"><span class="small">${t.cardRadius}px</span></label><label>Button Corner Radius<input class="input" type="range" min="0" max="28" value="${t.buttonRadius}" oninput="updateTheme('buttonRadius',Number(this.value));this.nextElementSibling.textContent=this.value+'px'"><span class="small">${t.buttonRadius}px</span></label><label>Background Style<select class="input" onchange="updateTheme('backgroundStyle',this.value)"><option value="solid" ${t.backgroundStyle==='solid'?'selected':''}>Solid</option><option value="soft" ${t.backgroundStyle==='soft'?'selected':''}>Soft Gradient</option><option value="subtle" ${t.backgroundStyle==='subtle'?'selected':''}>Subtle Pattern</option></select></label></div></div>
 <div class="settings-card"><h3>Live Preview</h3><div class="theme-preview"><div class="theme-preview-header">${db.settings.businessName||'Guthrie RMS'}</div><div class="theme-preview-body"><div class="theme-preview-card"><h4>Sample Card</h4><p>This preview uses your current colors, font and shape settings.</p><button class="primary">Primary Button</button> <button class="secondary">Secondary</button></div></div></div></div>
 <div class="settings-card"><div class="row"><button class="primary" onclick="saveThemePreset()">Save Current Theme</button><button class="small-btn" onclick="resetTheme()">Reset to Guthrie Default</button></div><p class="small">Theme settings are part of your RMS configuration and are included when browser data is backed up.</p></div></div>`;
}
window.updateTheme=(field,value)=>{db.settings.theme[field]=value;save();applyTheme();render();};
window.resetTheme=()=>{if(!confirm('Reset theme to the Guthrie default colors and styling?'))return;db.settings.theme={primary:'#003DA5',accent:'#F9A825',success:'#2E7D32',danger:'#C62828',pageBackground:'#F3F6FB',surface:'#FFFFFF',text:'#102033',font:'Arial, Helvetica, sans-serif',cardRadius:18,buttonRadius:12,headerBackground:'#003DA5',backgroundStyle:'solid'};save();applyTheme();render();toast('Theme reset to Guthrie default.');};
window.saveThemePreset=()=>{db.settings.theme.savedAt=now();save();toast('Theme settings saved.');};

function staffSettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>Team & Permissions</h1><p>Manage students, teachers, positions and access without changing code.</p></div></div><div class="settings-card"><h3>Positions</h3><div class="row"><input id="newPos" class="input" placeholder="New position name"><button class="primary" onclick="addPosition()">Add Position</button></div><div class="settings-chip-wrap">${db.positions.map((p,i)=>`<button class="settings-chip" onclick="renamePosition(${i})">${p}</button>`).join('')}</div></div><div class="settings-card"><h3>Students</h3><p class="small">Student ID is also the student login PIN.</p><button class="primary" onclick="addStudentUser()">Add Student</button>${userTable('student')}</div><div class="settings-card"><h3>Teachers</h3><div class="row"><input id="teacherName" class="input" placeholder="Teacher name"><input id="teacherPin" class="input" placeholder="Unique PIN"><button class="primary" onclick="addTeacherFromForm()">Add Teacher</button></div>${userTable('teacher')}</div><div class="settings-card"><h3>Managers</h3>${userTable('manager')}<button class="primary" onclick="addUser('manager')">Add Manager</button></div></div>`}
function menuSettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>Bistro Menu</h1><p>Add and maintain Entrees, Beverages and Desserts. Daily production pars control live availability and 86 status.</p></div></div>${bistroMenuSetupPanel()}</div>`}
function diningSettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>Dining Room</h1><p>Adjust the live dining room layout without editing the website.</p></div></div><div class="settings-card"><h3>Table Layout</h3><div class="form-grid"><label>Number of Tables<input id="tableCount" class="input" type="number" min="1" value="${db.tables.length}"></label><label>Default Seats Per Table<input id="seatCount" class="input" type="number" min="1" value="${db.tables[0]?.seats||4}"></label></div><button class="primary" onclick="resetTables()">Apply Dining Room Setup</button></div><div class="settings-card"><h3>Current Tables</h3><div class="table-grid">${db.tables.map(t=>`<div class="table-card"><strong>Table ${t.id}</strong><p>${t.seats} seats</p></div>`).join('')}</div></div></div>`}
function inventorySettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>Inventory & Vendors</h1><p>Maintain approved vendors and storage locations used throughout the inventory system.</p></div></div><div class="settings-card"><h3>Approved Vendors</h3><div class="row"><input id="newVendor" class="input" placeholder="Vendor name"><button class="primary" onclick="addVendorSetting()">Add Vendor</button></div><div class="settings-list">${db.settings.vendors.map((v,i)=>`<div class="settings-list-row"><span>${v}</span><button class="small-btn danger" onclick="removeVendorSetting(${i})">Remove</button></div>`).join('')}</div></div><div class="settings-card"><h3>Storage Locations</h3><div class="row"><input id="newLocation" class="input" placeholder="New storage location"><button class="primary" onclick="addLocationSetting()">Add Location</button></div><div class="settings-chip-wrap">${db.settings.inventoryLocations.map((v,i)=>`<button class="settings-chip" onclick="renameLocationSetting(${i})">${v}</button>`).join('')}</div></div><div class="settings-card"><h3>Inventory Tools</h3><div class="row"><button class="primary" onclick="state.view='inventory';state.invDivision='bistro';render()">Open Bistro Inventory</button><button class="primary" onclick="state.view='inventory';state.invDivision='culinary';render()">Open Culinary Inventory</button></div></div></div>`}
window.addVendorSetting=()=>{let v=$('#newVendor')?.value.trim();if(!v)return;if(!db.settings.vendors.includes(v))db.settings.vendors.push(v);save();render();};
window.removeVendorSetting=i=>{let v=db.settings.vendors[i];if(!confirm(`Remove ${v} from approved vendors?`))return;db.settings.vendors.splice(i,1);save();render();};
window.addLocationSetting=()=>{let v=$('#newLocation')?.value.trim();if(!v)return;if(!db.settings.inventoryLocations.includes(v))db.settings.inventoryLocations.push(v);save();render();};
window.renameLocationSetting=i=>{let old=db.settings.inventoryLocations[i];let v=prompt('Rename storage location:',old);if(!v)return;db.settings.inventoryLocations[i]=v;save();render();};
function cateringSettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>Catering</h1><p>Maintain catering items and saved catering menus used to build orders and invoices.</p></div></div>${cateringSetupPanel()}</div>`}
function recipesSettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>Recipes & Culinary Labs</h1><p>Recipe setup remains a dedicated workspace because ingredient lines connect directly to Culinary Inventory.</p></div></div><div class="settings-card"><h3>Recipe Management</h3><p>Build recipes, ingredient quantities, yields and lab usage from the Recipes/Labs module.</p><button class="primary" onclick="state.view='recipes';render()">Open Recipes/Labs</button></div><div class="settings-card"><h3>Current Recipes</h3><p class="big">${(db.recipes||[]).length}</p><span class="small">saved recipes/labs</span></div></div>`}
function kmsSettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>KMS</h1><p>Configure station labels used by the BOH kitchen screens.</p></div></div><div class="settings-card"><h3>Kitchen Stations</h3><div class="row"><input id="newKmsStation" class="input" placeholder="New station name"><button class="primary" onclick="addKmsStation()">Add Station</button></div><div class="settings-list">${db.settings.kmsStations.map((v,i)=>`<div class="settings-list-row"><span>${v}</span><div class="row"><button class="small-btn" onclick="renameKmsStation(${i})">Rename</button><button class="small-btn danger" onclick="removeKmsStation(${i})">Remove</button></div></div>`).join('')}</div><p class="small">Advanced menu-to-station routing can be added later. Current KMS routing still uses the existing automatic logic.</p></div></div>`}
window.addKmsStation=()=>{let v=$('#newKmsStation')?.value.trim();if(!v)return;if(!db.settings.kmsStations.includes(v))db.settings.kmsStations.push(v);save();render();};
window.renameKmsStation=i=>{let old=db.settings.kmsStations[i];let v=prompt('Rename KMS station:',old);if(!v)return;db.settings.kmsStations[i]=v;save();render();};
window.removeKmsStation=i=>{if(!confirm('Remove this KMS station label?'))return;db.settings.kmsStations.splice(i,1);save();render();};
function dataSettingsPanel(){return `<div class="settings-page"><div class="settings-page-head"><div><h1>Reports & Data</h1><p>Export operational data and keep a browser backup of the current configuration.</p></div></div><div class="settings-card"><h3>Quick Exports</h3><div class="row"><button class="primary" onclick="exportSalesReport()">Sales CSV</button><button class="primary" onclick="exportLaborReport()">Labor CSV</button><button class="primary" onclick="exportPaymentReport()">Payments CSV</button><button class="primary" onclick="exportRefundLog()">Refunds CSV</button><button class="primary" onclick="exportCateringReport()">Catering CSV</button><button class="primary" onclick="exportAllInventoryData()">All Inventory CSV</button><button class="primary" onclick="exportInvoicesCSV()">Invoices CSV</button></div></div><div class="settings-card"><h3>Open Full Reports</h3><button class="primary" onclick="state.view='reports';render()">Open Reports Center</button></div></div>`}

function teacherOptions(selected){let teachers=db.users.filter(u=>u.role==='teacher');return `<select class="input" onchange="updUser(${selected.userId},'teacherId',Number(this.value)||'')"><option value="">Unassigned</option>${teachers.map(t=>`<option value="${t.id}" ${selected.teacherId==t.id?'selected':''}>${t.name}</option>`).join('')}</select>`}
function userTable(role){let users=db.users.filter(u=>u.role===role);let header=role==='student'?`<tr><th>Student Name</th><th>Teacher</th><th>Position</th><th>PIN</th><th>Student ID</th><th>Access</th><th>Active</th></tr>`:`<tr><th>Name</th><th>PIN</th><th>Role</th><th>Position</th><th>Access</th><th>Active</th></tr>`;return `<table class="report-table section">${header}${users.map(u=>role==='student'?`<tr><td contenteditable onblur="updUser(${u.id},'name',this.textContent)">${u.name}</td><td>${teacherOptions({userId:u.id,teacherId:u.teacherId})}</td><td><select class="input" onchange="updUser(${u.id},'pos',this.value)">${db.positions.map(p=>`<option ${u.pos===p?'selected':''}>${p}</option>`).join('')}</select></td><td>${u.pin}<br><span class="small">same as ID</span></td><td contenteditable onblur="updStudentId(${u.id},this.textContent)">${u.studentId||''}</td><td>${accessEditor(u)}</td><td><select class="input" onchange="updUser(${u.id},'active',this.value==='true')"><option value="true" ${u.active?'selected':''}>Active</option><option value="false" ${!u.active?'selected':''}>Inactive</option></select></td></tr>`:`<tr><td contenteditable onblur="updUser(${u.id},'name',this.textContent)">${u.name}</td><td contenteditable onblur="updPin(${u.id},this.textContent)">${u.pin}</td><td>${u.role}</td><td><select class="input" onchange="updUser(${u.id},'pos',this.value)">${db.positions.map(p=>`<option ${u.pos===p?'selected':''}>${p}</option>`).join('')}</select></td><td>${accessEditor(u)}</td><td><select class="input" onchange="updUser(${u.id},'active',this.value==='true')"><option value="true" ${u.active?'selected':''}>Active</option><option value="false" ${!u.active?'selected':''}>Inactive</option></select></td></tr>`).join('')}</table>`}
function accessEditor(u){let opts=['clock','dining','quick','checkout','kms','inventory','catering','recipes','reports','invoices','development','schedule','closeout','setup']; return `<div class="access-grid">${opts.map(v=>`<label><input type="checkbox" ${u.access?.includes(v)?'checked':''} onchange="toggleAccess(${u.id},'${v}',this.checked)"> ${v}</label>`).join('')}</div><select class="input" onchange="updUser(${u.id},'inventoryScope',this.value)"><option value="culinary" ${u.inventoryScope==='culinary'?'selected':''}>Culinary only</option><option value="all" ${u.inventoryScope==='all'?'selected':''}>All inventory</option><option value="assigned" ${u.inventoryScope==='assigned'?'selected':''}>Assigned/standard</option></select>`}
window.toggleAccess=(id,v,on)=>{let u=db.users.find(x=>x.id===id); u.access=u.access||[]; if(on&&!u.access.includes(v))u.access.push(v); if(!on)u.access=u.access.filter(x=>x!==v); save();};
window.updPin=(id,pin)=>{pin=String(pin).trim(); if(!pin){alert('PIN cannot be blank.');render();return;} if(db.users.some(u=>u.id!==id&&u.pin===pin)){alert('That PIN is already assigned. Please choose a unique PIN.');render();return;} db.users.find(u=>u.id===id).pin=pin; save();};
window.updStudentId=(id,studentId)=>{studentId=String(studentId).trim(); if(!studentId){alert('Student ID cannot be blank because it is also the PIN.');render();return;} if(db.users.some(u=>u.id!==id&&u.studentId===studentId)){alert('That student ID is already assigned.');render();return;} if(db.users.some(u=>u.id!==id&&u.pin===studentId)){alert('That student ID/PIN is already assigned as a login PIN.');render();return;} let u=db.users.find(u=>u.id===id); u.studentId=studentId; u.pin=studentId; save();};
window.addStudentUser=()=>{let name=prompt('Enter student name:'); if(!name)return; let studentId=prompt('Enter student ID. This will also be the student login PIN:'); if(!studentId)return; studentId=String(studentId).trim(); if(db.users.some(u=>u.studentId===studentId)){alert('That student ID is already assigned.');return;} if(db.users.some(u=>u.pin===studentId)){alert('That student ID/PIN is already assigned as a login PIN.');return;} let teachers=db.users.filter(u=>u.role==='teacher'); let teacherId=teachers[0]?.id||''; let pos=prompt('Enter position:', 'Server')||'Server'; if(!db.positions.includes(pos))db.positions.push(pos); db.users.push({id:Date.now(),name,studentId,teacherId,pin:studentId,role:'student',pos,active:true,access:['clock','dining','quick','checkout','kms','inventory','development'],inventoryScope:'assigned'});save();render()};


window.addTeacherFromForm=()=>{let name=($('#teacherName')?.value||'').trim(); let pin=($('#teacherPin')?.value||'').trim(); if(!name){alert('Teacher name is required.');return;} if(!pin){alert('Teacher PIN is required.');return;} if(db.users.some(u=>u.pin===pin)){alert('That PIN is already assigned. Please choose a unique PIN.');return;} db.users.push({id:Date.now(),name,pin,role:'teacher',pos:'Instructor',active:true,access:['clock','inventory','catering','recipes','reports','invoices','development','schedule'],inventoryScope:'culinary'}); save(); toast('Teacher added with Culinary Department access.'); render();};

window.addUser=role=>{let nextPin=prompt(`Enter unique ${role} PIN:`); if(!nextPin)return; if(db.users.some(u=>u.pin===nextPin)){alert('That PIN is already assigned. Please choose a unique PIN.');return;} let name=prompt(`Enter ${role} name:`)||`New ${role}`; let pos=role==='teacher'?'Instructor':role==='manager'?'Manager':'Server'; let access=role==='teacher'?['clock','inventory','catering','recipes','reports','invoices','development','schedule']:(role==='manager'?['clock','dining','quick','checkout','kms','inventory','catering','reports','closeout','setup']:['clock','dining','quick','checkout','kms','inventory','development']); let inventoryScope=role==='teacher'?'culinary':(role==='manager'?'all':'assigned'); db.users.push({id:Date.now(),name,pin:nextPin,role,pos,active:true,access,inventoryScope});save();render()};
window.addPosition=()=>{let p=$('#newPos').value.trim(); if(!p)return; if(!db.positions.includes(p))db.positions.push(p); save();render()};
window.renamePosition=i=>{let old=db.positions[i]; let p=prompt('Rename position:',old); if(!p)return; db.positions[i]=p; db.users.forEach(u=>{if(u.pos===old)u.pos=p}); save();render()};

window.resetTables=()=>{let n=Number($('#tableCount').value)||20, seats=Number($('#seatCount').value)||4; db.tables=Array.from({length:n},(_,i)=>db.tables[i]||{id:i+1,seats,status:'open',orderId:null}); db.tables.forEach(t=>t.seats=seats);save();render()}; window.updUser=(id,f,v)=>{db.users.find(u=>u.id===id)[f]=v;save()};
render();
