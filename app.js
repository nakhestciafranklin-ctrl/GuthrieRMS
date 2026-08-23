const $=s=>document.querySelector(s); const app=$('#app');
const money=n=>'$'+(Number(n)||0).toFixed(2); const now=()=>new Date().toISOString();
const seed={users:[{id:1,name:'Demo Manager',pin:'9999',role:'manager',pos:'Manager',active:true,access:['clock','dining','quick','checkout','kms','inventory','catering','recipes','reports','invoices','development','schedule','closeout','setup'],inventoryScope:'all'},{id:2,name:'FOH Student',studentId:'1001',teacherId:6,pin:'1001',role:'student',pos:'Server',active:true,access:['clock','dining','quick','checkout','kms','inventory','development'],inventoryScope:'assigned'},{id:3,name:'BOH Student',studentId:'1002',teacherId:6,pin:'1002',role:'student',pos:'Line Cook',active:true,access:['clock','dining','quick','checkout','kms','inventory','development'],inventoryScope:'assigned'},{id:4,name:'Cashier Student',studentId:'1003',teacherId:6,pin:'1003',role:'student',pos:'Cashier',active:true,access:['clock','dining','quick','checkout','kms','inventory','development'],inventoryScope:'assigned'},{id:5,name:'Inventory Student',studentId:'1004',teacherId:6,pin:'1004',role:'student',pos:'Inventory Lead',active:true,access:['clock','dining','quick','checkout','kms','inventory','development'],inventoryScope:'assigned'},{id:6,name:'Teacher Demo',pin:'8888',role:'teacher',pos:'Instructor',active:true,access:['clock','inventory','reports'],inventoryScope:'culinary'}],positions:['Manager','Instructor','Server','Host','Cashier','Runner','Expo','Line Cook','Prep Cook','Dishwasher','Inventory Lead','Shift Leader'],tables:Array.from({length:20},(_,i)=>({id:i+1,seats:4,status:'open',orderId:null})),menu:[{id:1,name:'Bistro Burger',price:8.5,inv:'bistro',mods:['No Onion','No Tomato','No Lettuce','Add Cheese','Add Bacon','Medium','Well Done']},{id:2,name:'Southern Cobb Salad',price:9,inv:'bistro',mods:['No Tomato','No Corn','Extra Dressing','Dressing on Side']},{id:3,name:'Peach Tea',price:2.5,inv:'bistro',mods:['Light Ice','No Ice','Extra Peach']},{id:4,name:'Cookie',price:2,inv:'bistro',mods:['Warm Cookie']},{id:5,name:'Box Lunch',price:12,inv:'culinary',mods:['Turkey','Ham','Vegetarian','No Mayo']},{id:6,name:'Catering Dessert Tray',price:35,inv:'culinary',mods:['Assorted','Chocolate Only','No Nuts']}],inventory:[{id:1,division:'bistro',vendor:'HEB',name:'Burger Patties',onHand:24,par:40,unit:'each'},{id:2,division:'bistro',vendor:'HEB',name:'Peach Syrup',onHand:2,par:4,unit:'bottle'},{id:3,division:'culinary',vendor:'Ben E. Keith',name:'Flour',onHand:15,par:30,unit:'lb'},{id:4,division:'culinary',vendor:'Armstrong Chemicals',name:'Sanitizer',onHand:1,par:3,unit:'gal'},{id:5,division:'culinary',vendor:'Amazon',name:'To-Go Containers',onHand:50,par:100,unit:'each'}],orders:[],shifts:[],cashbox:[],deliveries:[],cateringMenus:[{id:1,name:'Executive Lunch Package',price:12,description:'Entree salad or sandwich, dessert, and beverage',items:['Box Lunch','Peach Tea','Cookie']},{id:2,name:'Bistro Box Lunch',price:10,description:'Box lunch package for staff or district events',items:['Box Lunch','Cookie']},{id:3,name:'Dessert Tray Package',price:35,description:'Assorted dessert tray priced per tray',items:['Catering Dessert Tray']},{id:4,name:'Custom Catering Menu',price:0,description:'Build a custom order using culinary menu items',items:[]}]} ;
let db=JSON.parse(localStorage.getItem('guthrieRMS7A')||localStorage.getItem('guthrieRMS5A')||localStorage.getItem('guthrieRMS4K')||localStorage.getItem('guthrieRMS4F')||'null')||seed; if(!db.cateringMenus)db.cateringMenus=seed.cateringMenus; if(!db.settings)db.settings={};
if(db.settings.demoMode===undefined)db.settings.demoMode=true;
if(!db.settings.businessName)db.settings.businessName='Guthrie RMS';
if(!db.settings.businessSubtitle)db.settings.businessSubtitle='Restaurant Management System';
if(!db.settings.vendors)db.settings.vendors=['Armstrong Chemicals','HEB','Ben E. Keith','Amazon'];
if(!db.settings.inventoryLocations)db.settings.inventoryLocations=['Bistro Dry Storage','Bistro Reach-In Cooler','Bistro Freezer','FOH Storage','Kitchen 1','Kitchen 2','Kitchen 3','Bakeshop','Catering Kitchen','Dry Storage','Fine Dining Storage'];
['Walk-In Fridge','Walk-In Freezer'].forEach(loc=>{if(!db.settings.inventoryLocations.includes(loc))db.settings.inventoryLocations.push(loc)});
if(!db.settings.kmsStations)db.settings.kmsStations=['Expo','Grill','Salad','Beverage','Dessert','Catering']; if(!db.settings.operations)db.settings.operations=['Bistro Service','Counter + To-Go','Catering Event','Culinary Lab','Inventory / Receiving','Special Event','Training','Competition Prep'];
(db.inventory||[]).forEach(i=>{if(i.barcode==null)i.barcode='';});
if(db.settings.lowStockThreshold===undefined)db.settings.lowStockThreshold=10;
if(!db.settings.theme)db.settings.theme={};
const themeDefaults={primary:'#003DA5',accent:'#F9A825',success:'#2E7D32',danger:'#C62828',pageBackground:'#F3F6FB',surface:'#FFFFFF',text:'#102033',font:'Arial, Helvetica, sans-serif',cardRadius:18,buttonRadius:12,headerBackground:'#003DA5',backgroundStyle:'solid'};
Object.entries(themeDefaults).forEach(([k,v])=>{if(db.settings.theme[k]===undefined)db.settings.theme[k]=v;}); if(!db.production)db.production={date:new Date().toISOString().slice(0,10),items:{},history:[]}; if(!db.cateringItems)db.cateringItems=[{id:1,name:'Box Lunch',price:12,unit:'per guest',inventorySource:'culinary'},{id:2,name:'Dessert Tray',price:35,unit:'per tray',inventorySource:'culinary'},{id:3,name:'Peach Tea Gallon',price:10,unit:'per gallon',inventorySource:'culinary'},{id:4,name:'Cookie Dozen',price:18,unit:'per dozen',inventorySource:'culinary'}]; if(!db.dailyCloseouts)db.dailyCloseouts=[]; if(!db.invoices)db.invoices=[]; if(!db.evaluations)db.evaluations=[]; if(!db.refunds)db.refunds=[]; if(!db.recipes)db.recipes=[]; if(!db.labUsage)db.labUsage=[]; if(!db.scheduledShifts)db.scheduledShifts=[]; if(!db.positions)db.positions=seed.positions;
const enterpriseStudentPositions=['Team Member','Station Lead','Shift Manager','Department Lead','General Manager (Student)','Grill / Hot-Line Lead','Prep Lead','Pastry / Bakery Lead','Host','Server','Cashier','Catering Crew Lead','Marketing Lead','Inventory Lead','Chef Tables Lead'];
enterpriseStudentPositions.forEach(pos=>{if(!db.positions.includes(pos))db.positions.push(pos)}); if(!db.users.some(u=>u.role==='teacher'))db.users.push({id:Date.now(),name:'Teacher Demo',pin:'8888',role:'teacher',pos:'Instructor',active:true,access:['clock','inventory','reports'],inventoryScope:'culinary'}); db.users.forEach(u=>{ if(!u.access){u.access=u.role==='manager'?['clock','dining','quick','checkout','kms','inventory','catering','recipes','reports','invoices','development','schedule','closeout','setup']:(u.role==='teacher'?['clock','inventory','catering','recipes','reports','invoices','development','schedule']:['clock','dining','quick','checkout','kms','inventory','development']);} if(!u.inventoryScope) u.inventoryScope=u.role==='teacher'?'culinary':(u.role==='manager'?'all':'assigned'); if(u.role==='student'){ if(!('studentId' in u)) u.studentId=''; if(!('teacherId' in u)) u.teacherId=''; } });
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
function login(){applyTheme();app.innerHTML=`<div class="login"><div class="card login-card"><img class="logo" src="assets/guthrie-center-logo.jpg"><h1 class="title">${db.settings?.businessName||'Guthrie RMS'}</h1><p>${db.settings?.businessSubtitle||'Restaurant Management System'}</p><p>Enter Student or Manager PIN</p><div class="pin-display">${'*'.repeat(state.pin.length)}</div><div class="keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-key="${n}">${n}</button>`).join('')}<button class="clear" data-clear>Clear</button><button data-key="0">0</button><button class="login-btn" data-login>Login</button></div><p class="error" id="err"></p>${db.settings?.demoMode?'<p class="small">Demo: Manager 9999 | Teacher 8888 | Student IDs/PINs: FOH 1001 | BOH 1002 | Cashier 1003 | Inventory 1004</p>':''}</div></div>`; document.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{state.pin+=b.dataset.key;login()}); $('[data-clear]').onclick=()=>{state.pin='';login()}; $('[data-login]').onclick=()=>{let u=db.users.find(x=>x.pin===state.pin&&x.active); if(u){state.user=u;state.pin='';state.view='dashboard';render()} else $('#err').textContent='PIN not found or inactive.'};}
function allowedViews(){
  if(!state.user) return [];
  normalizeAccessForUser(state.user);
  const order=['clock','dining','quick','checkout','kms','inventory','catering','recipes','reports','invoices','development','schedule','closeout','setup'];
  return order.filter(v=>(state.user.access||[]).includes(v) || state.user.role==='manager');
}
function canView(v){return allowedViews().includes(v)||state.user.role==='manager';}
function topbar(){let labels={clock:'Clock In/Out',dining:'Dining Room',quick:'Counter + To-Go',checkout:'Checkout',kms:'KMS',inventory:'Inventory',catering:'Catering',recipes:'Recipes/Labs',recipes:'Recipes/Labs',reports:'Reports',invoices:'Invoices',development:'Student Development',schedule:'Scheduling',setup:'Settings',closeout:'End of Day'}; let nav=allowedViews().filter(v=>labels[v]).map(v=>v+':'+labels[v]); return `<header class="topbar"><img src="assets/guthrie-center-logo.jpg"><b>${db.settings?.businessName||'Guthrie RMS'}</b><span>${state.user.name} • ${state.user.pos}</span><span class="spacer"></span><nav class="nav"><button data-view="dashboard" class="${state.view==='dashboard'?'active':''}">🏠 Dashboard</button>${nav.map(x=>{let [v,l]=x.split(':');return `<button data-view="${v}" class="${state.view===v?'active':''}">${l}</button>`}).join('')}<button data-logout>Log Out</button></nav></header>`}
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
  <button class="primary success" onclick="addInventoryItemForm()">Add Inventory Item</button>
  <button class="primary" onclick="checkDelivery()">Check In Delivery</button>
  <button class="primary" onclick="inventoryCount()">Inventory Count</button>
  <button class="primary" onclick="scanInventory()">Scan / Manual Entry</button>
  <button class="primary" onclick="wasteTracking()">Waste Tracking</button>
  <button class="primary" onclick="orderPage()">Generate Vendor Order</button>
  <button class="primary" onclick="exportInventoryData(state.invDivision)">Export This Inventory CSV</button>
  <button class="primary" onclick="exportAllInventoryData()">Export All Inventory CSV</button>
 </div>
 <h2>${state.invDivision==='bistro'?'Bistro':'Culinary Department'} Inventory List</h2>
 <p class="small">Quantities and storage locations can be updated directly below. Use Edit for the full item record.</p>
 <table class="report-table"><tr><th>Item</th><th>Barcode</th><th>Vendor</th><th>Location</th><th>On Hand</th><th>Par</th><th>Unit</th><th>Status</th><th>Edit</th></tr>${items.map(i=>`<tr><td>${i.name}</td><td>${i.barcode||'<span class="small">Not assigned</span>'}</td><td>${i.vendor}</td><td><select class="input inventory-inline" onchange="updInv(${i.id},'location',this.value)">${inventoryLocationOptions(i.location,state.invDivision)}</select></td><td><input class="input inventory-number" type="number" step="0.01" value="${Number(i.onHand)||0}" onchange="updInv(${i.id},'onHand',this.value)"></td><td><input class="input inventory-number" type="number" step="0.01" value="${Number(i.par)||0}" onchange="updInv(${i.id},'par',this.value)"></td><td>${i.unit}</td><td>${Number(i.onHand)<Number(i.par)?'<span class="badge danger">Below Par</span>':'<span class="badge good">OK</span>'}</td><td><button class="small-btn" onclick="editInventoryItem(${i.id})">Edit</button></td></tr>`).join('')}</table><div id="invExtra"></div></section>`
}
function inventoryLocationOptions(current,division){let opts=[...new Set([...(locations(division)||[]),current||'Unassigned'])];return opts.map(x=>`<option ${x===current?'selected':''}>${x}</option>`).join('')}
window.updInv=(id,f,v)=>{let item=db.inventory.find(i=>i.id===id); if(!item)return; item[f]=['onHand','par'].includes(f)?(Number(v)||0):v;save();toast('Inventory item updated.');};
window.addInventoryItemForm=()=>{$('#invExtra').innerHTML=`<div class="section panel"><h2>Add Inventory Item</h2><div class="camera-scan-row"><label>Barcode<input id="newInvBarcode" class="input" inputmode="numeric" placeholder="Scan or type UPC/EAN"></label><button class="primary" onclick="openBarcodeCamera('newInvBarcode','none')">Scan with Tablet Camera</button></div><div id="barcodeCameraMount"></div><div class="form-grid"><label>Item Name<input id="newInvName" class="input" placeholder="Item name"></label><label>Vendor<select id="newInvVendor" class="input">${(db.settings?.vendors||[]).map(v=>`<option>${v}</option>`).join('')}</select></label><label>Starting Quantity<input id="newInvQty" type="number" step="0.01" class="input" value="0"></label><label>Par Level<input id="newInvPar" type="number" step="0.01" class="input" value="0"></label><label>Unit<input id="newInvUnit" class="input" placeholder="each, lb, case, gal"></label><label>Storage Location<select id="newInvLocation" class="input">${locations(state.invDivision).map(x=>`<option>${x}</option>`).join('')}</select></label></div><button class="primary success" onclick="saveNewInventoryItem()">Add Item</button></div>`};
window.saveNewInventoryItem=()=>{let name=$('#newInvName')?.value.trim();let barcode=normalizeBarcode($('#newInvBarcode')?.value);if(!name){alert('Item name is required.');return;}if(db.inventory.some(i=>i.division===state.invDivision&&i.name.toLowerCase()===name.toLowerCase())){alert('That item already exists in this inventory.');return;}if(barcode&&db.inventory.some(i=>normalizeBarcode(i.barcode)===barcode)){alert('That barcode is already assigned to another inventory item.');return;}db.inventory.push({id:Date.now(),division:state.invDivision,vendor:$('#newInvVendor')?.value||'',name,barcode,onHand:Number($('#newInvQty')?.value)||0,par:Number($('#newInvPar')?.value)||0,unit:$('#newInvUnit')?.value||'each',location:$('#newInvLocation')?.value||'Unassigned'});save();stopBarcodeCamera();render();toast('Inventory item added.');};
window.editInventoryItem=id=>{let i=db.inventory.find(x=>x.id===id);if(!i)return;$('#invExtra').innerHTML=`<div class="section panel"><div class="row"><h2>Edit Inventory Item</h2><span class="spacer"></span><button class="small-btn" onclick="stopBarcodeCamera();document.getElementById('invExtra').innerHTML=''">Close</button></div><div class="camera-scan-row"><label>Barcode<input id="editInvBarcode" class="input" inputmode="numeric" value="${i.barcode||''}" placeholder="Scan or type UPC/EAN"></label><button class="primary" onclick="openBarcodeCamera('editInvBarcode','none')">Scan with Tablet Camera</button></div><div id="barcodeCameraMount"></div><div class="form-grid"><label>Item Name<input id="editInvName" class="input" value="${i.name}"></label><label>Vendor<select id="editInvVendor" class="input">${(db.settings?.vendors||[]).map(v=>`<option ${v===i.vendor?'selected':''}>${v}</option>`).join('')}</select></label><label>Quantity On Hand<input id="editInvQty" type="number" step="0.01" class="input" value="${Number(i.onHand)||0}"></label><label>Par Level<input id="editInvPar" type="number" step="0.01" class="input" value="${Number(i.par)||0}"></label><label>Unit<input id="editInvUnit" class="input" value="${i.unit||''}"></label><label>Storage Location<select id="editInvLocation" class="input">${inventoryLocationOptions(i.location,i.division)}</select></label></div><div class="row"><button class="primary success" onclick="saveInventoryItemEdit(${id})">Save Changes</button><button class="small-btn danger" onclick="deleteInventoryItem(${id})">Delete Item</button></div></div>`};
window.saveInventoryItemEdit=id=>{let i=db.inventory.find(x=>x.id===id);if(!i)return;let barcode=normalizeBarcode($('#editInvBarcode')?.value);if(barcode&&db.inventory.some(x=>x.id!==id&&normalizeBarcode(x.barcode)===barcode)){alert('That barcode is already assigned to another item.');return;}i.name=$('#editInvName')?.value.trim()||i.name;i.barcode=barcode;i.vendor=$('#editInvVendor')?.value||i.vendor;i.onHand=Number($('#editInvQty')?.value)||0;i.par=Number($('#editInvPar')?.value)||0;i.unit=$('#editInvUnit')?.value||i.unit;i.location=$('#editInvLocation')?.value||i.location;save();stopBarcodeCamera();render();toast('Inventory item saved.');};
window.deleteInventoryItem=id=>{let i=db.inventory.find(x=>x.id===id);if(!i)return;if(!confirm(`Delete ${i.name} from ${i.division} inventory?`))return;db.inventory=db.inventory.filter(x=>x.id!==id);save();render();toast('Inventory item deleted.');};
window.orderPage=()=>{let below=db.inventory.filter(i=>i.division===state.invDivision&&Number(i.onHand)<Number(i.par)); let by={}; below.forEach(i=>(by[i.vendor]??=[]).push(i)); $('#invExtra').innerHTML=`<div class="section"><h2>Suggested Orders by Vendor</h2>${Object.entries(by).map(([v,arr])=>`<div class="ticket"><h3>${v}</h3><table class="report-table"><tr><th>Item</th><th>On Hand</th><th>Par</th><th>Suggested Order</th><th>Unit</th></tr>${arr.map(i=>`<tr><td>${i.name}</td><td>${i.onHand}</td><td>${i.par}</td><td>${Number(i.par)-Number(i.onHand)}</td><td>${i.unit}</td></tr>`).join('')}</table></div>`).join('')||'<p>All items are at or above par.</p>'}</div>`};
window.checkDelivery=()=>{$('#invExtra').innerHTML=`<div class="section"><h2>Check In Delivery</h2><div class="camera-scan-row"><label>Barcode<input id="deliveryBarcode" class="input" inputmode="numeric" placeholder="Scan UPC/EAN"></label><button class="primary" onclick="openBarcodeCamera('deliveryBarcode','delivery')">Scan with Tablet Camera</button></div><div id="barcodeCameraMount"></div><div class="form-grid"><label>Vendor<select id="vendor" class="input">${(db.settings?.vendors||[]).map(v=>`<option>${v}</option>`).join('')}</select></label><label>Invoice #<input id="invoice" class="input" placeholder="Invoice number"></label><label>Product / Item<input id="item" class="input" placeholder="Item name" autofocus></label><label>Quantity Received<input id="qty" class="input" type="number" value="1"></label><label>Unit<input id="unit" class="input" placeholder="each, lb, case, gal"></label><label>Storage Location<select id="location" class="input">${locations(state.invDivision).map(x=>`<option>${x}</option>`).join('')}</select></label><label>Temperature °F<input id="temp" class="input" placeholder="Optional"></label><label>Quality Check<select id="quality" class="input"><option>Pass</option><option>Packaging Damaged</option><option>Short Delivery</option><option>Wrong Product</option><option>Temperature Concern</option></select></label></div><label>Notes<textarea id="notes" class="input" placeholder="Delivery notes"></textarea></label><button class="primary" onclick="addDelivery()">Submit Delivery</button></div>`};
window.addDelivery=()=>{let barcode=normalizeBarcode($('#deliveryBarcode')?.value),name=$('#item').value.trim(), qty=Number($('#qty').value)||0, vendor=$('#vendor').value, unit=$('#unit').value||'each', location=$('#location').value, invoice=$('#invoice').value, temp=$('#temp').value, quality=$('#quality').value, notes=$('#notes').value;if(!name&&!barcode){alert('Scan a barcode or enter an item name.');return;}let it=findInventoryItem(barcode||name,state.invDivision);if(it){it.onHand=Number(it.onHand)+qty;it.vendor=vendor;it.unit=unit||it.unit;it.location=location;if(barcode&&!it.barcode)it.barcode=barcode;name=it.name;}else{if(!name){alert('This barcode is not assigned yet. Enter the item name before checking in the delivery.');return;}it={id:Date.now(),division:state.invDivision,vendor,name,barcode,onHand:qty,par:0,unit,location};db.inventory.push(it);}db.deliveries.push({date:now(),by:state.user.name,division:state.invDivision,vendor,invoice,name,barcode:it.barcode||barcode,qty,unit,location,temp,quality,notes});save();stopBarcodeCamera();toast('Delivery checked in and inventory updated.');render()};
window.scanInventory=()=>{$('#invExtra').innerHTML=`<div class="section panel ipad-scan-panel"><h2>iPad Barcode Inventory</h2><p>Use the iPad rear camera to scan an item, update the quantity, save, and continue to the next item. Bluetooth scanners and manual barcode entry remain available.</p><div class="scan-workflow"><div class="scan-step active"><b>1</b><span>Scan</span></div><div class="scan-step"><b>2</b><span>Count</span></div><div class="scan-step"><b>3</b><span>Save</span></div><div class="scan-step"><b>4</b><span>Next Item</span></div></div><div class="camera-scan-row"><label>Barcode / Item<input id="scanItem" class="input ipad-barcode-input" inputmode="numeric" autocomplete="off" placeholder="Scan barcode or type item name" autofocus></label><button class="primary success ipad-scan-button" onclick="openBarcodeCamera('scanItem','inventory')">📷 Scan with iPad Camera</button></div><div id="barcodeCameraMount"></div><div class="row"><button class="small-btn" onclick="lookupScannedInventory($('#scanItem')?.value)">Look Up Item</button><button class="small-btn" onclick="stopBarcodeCamera()">Stop Camera</button></div><div id="scanLookupResult" class="section"></div></div>`};
function normalizeBarcode(v){return String(v||'').trim().replace(/\s+/g,'')}
function findInventoryItem(codeOrName,division){let raw=String(codeOrName||'').trim(),code=normalizeBarcode(raw);return db.inventory.find(i=>(!division||i.division===division)&&((i.barcode&&normalizeBarcode(i.barcode)===code)||(i.name||'').toLowerCase()===raw.toLowerCase()))}
window.lookupScannedInventory=(value)=>{let raw=String(value||'').trim();if(!raw)return;let item=findInventoryItem(raw,state.invDivision);let box=$('#scanLookupResult');if(!box)return;if(item){box.innerHTML=`<div class="scan-result found ipad-scan-result"><h3>${item.name}</h3><p><b>Barcode:</b> ${item.barcode||'Not assigned'} &nbsp; <b>Current Qty:</b> ${item.onHand} ${item.unit||''} &nbsp; <b>Location:</b> ${item.location||'Unassigned'}</p><div class="form-grid"><label>Quantity<input id="scanQty" class="input ipad-qty" type="number" step="0.01" value="1"></label><label>Action<select id="scanAction" class="input"><option value="add">Add to On Hand</option><option value="set">Set Exact Count</option><option value="subtract">Subtract / Use</option></select></label></div><div class="row ipad-action-row"><button class="primary success" onclick="applyScannedInventoryToItem(${item.id},false)">Save Quantity</button><button class="primary" onclick="applyScannedInventoryToItem(${item.id},true)">Save & Scan Next</button><button class="small-btn" onclick="editInventoryItem(${item.id})">Edit Full Item</button></div></div>`;}else{let code=normalizeBarcode(raw);box.innerHTML=`<div class="scan-result unknown ipad-scan-result"><h3>New Barcode</h3><p>No ${state.invDivision==='bistro'?'Bistro':'Culinary'} inventory item is assigned to <b>${code}</b>.</p><div class="form-grid"><label>Item Name<input id="scanNewName" class="input" placeholder="Item name"></label><label>Starting Quantity<input id="scanNewQty" class="input ipad-qty" type="number" step="0.01" value="1"></label><label>Par Level<input id="scanNewPar" class="input" type="number" step="0.01" value="0"></label><label>Unit<input id="scanNewUnit" class="input" value="each"></label><label>Vendor<select id="scanNewVendor" class="input">${(db.settings?.vendors||[]).map(v=>`<option>${v}</option>`).join('')}</select></label><label>Location<select id="scanNewLocation" class="input">${locations(state.invDivision).map(x=>`<option>${x}</option>`).join('')}</select></label></div><div class="row ipad-action-row"><button class="primary success" onclick="saveScannedNewItem('${code.replace(/'/g,"\\'")}',false)">Add Item</button><button class="primary" onclick="saveScannedNewItem('${code.replace(/'/g,"\\'")}',true)">Add & Scan Next</button></div></div>`;}};
window.resetInventoryScanner=()=>{stopBarcodeCamera();let input=$('#scanItem');if(input){input.value='';input.focus();}let box=$('#scanLookupResult');if(box)box.innerHTML='';setTimeout(()=>openBarcodeCamera('scanItem','inventory'),250);};
window.applyScannedInventoryToItem=(id,scanNext=false)=>{let item=db.inventory.find(i=>i.id===id);if(!item)return;let qty=Number($('#scanQty')?.value)||0,action=$('#scanAction')?.value||'add';if(action==='add')item.onHand=Number(item.onHand)+qty;if(action==='subtract')item.onHand=Math.max(0,Number(item.onHand)-qty);if(action==='set')item.onHand=qty;db.deliveries.push({date:now(),by:state.user.name,division:item.division,vendor:'Barcode Entry',name:item.name,barcode:item.barcode||'',qty:action==='subtract'?-qty:qty,unit:item.unit,location:item.location,quality:'Barcode Inventory Entry',notes:`${action} quantity via barcode/manual scan`});save();toast('Quantity updated.');if(scanNext){resetInventoryScanner();}else{lookupScannedInventory(item.barcode||item.name);}};
window.saveScannedNewItem=(barcode,scanNext=false)=>{let name=$('#scanNewName')?.value.trim();if(!name){alert('Enter an item name.');return;}if(barcode&&db.inventory.some(i=>normalizeBarcode(i.barcode)===normalizeBarcode(barcode))){alert('That barcode is already assigned.');return;}let item={id:Date.now(),division:state.invDivision,vendor:$('#scanNewVendor')?.value||'',name,barcode:normalizeBarcode(barcode),onHand:Number($('#scanNewQty')?.value)||0,par:Number($('#scanNewPar')?.value)||0,unit:$('#scanNewUnit')?.value||'each',location:$('#scanNewLocation')?.value||'Unassigned'};db.inventory.push(item);save();toast('Scanned item added to inventory.');if(scanNext){resetInventoryScanner();}else{lookupScannedInventory(item.barcode);}};
let barcodeCameraStream=null,barcodeCameraTimer=null,barcodeDetectorInstance=null,html5BarcodeScanner=null;
function isAppleMobile(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
window.stopBarcodeCamera=async()=>{if(barcodeCameraTimer){clearTimeout(barcodeCameraTimer);barcodeCameraTimer=null;}if(html5BarcodeScanner){try{await html5BarcodeScanner.stop();}catch(e){}try{html5BarcodeScanner.clear();}catch(e){}html5BarcodeScanner=null;}if(barcodeCameraStream){barcodeCameraStream.getTracks().forEach(t=>t.stop());barcodeCameraStream=null;}let mount=$('#barcodeCameraMount');if(mount)mount.innerHTML='';};
function handleScannedBarcode(code,targetInputId,mode){code=normalizeBarcode(code);let input=document.getElementById(targetInputId);if(input)input.value=code;stopBarcodeCamera();toast(`Barcode scanned: ${code}`);if(mode==='inventory')lookupScannedInventory(code);if(mode==='delivery'){let item=findInventoryItem(code,state.invDivision);if(item){let name=$('#item');if(name)name.value=item.name;let unit=$('#unit');if(unit)unit.value=item.unit||'';let loc=$('#location');if(loc&&item.location)loc.value=item.location;let ven=$('#vendor');if(ven&&item.vendor)ven.value=item.vendor;}}}
async function startHtml5QrcodeScanner(targetInputId,mode,mount){if(typeof Html5Qrcode==='undefined'){mount.innerHTML='<div class="notice danger"><b>iPad scanner library could not load.</b><br>Check the internet connection, refresh the page, or use Bluetooth/manual entry.</div>';return;}mount.innerHTML=`<div class="barcode-camera ipad-camera"><div class="ipad-camera-head"><b>iPad Rear Camera</b><span class="small">Hold the barcode inside the frame</span></div><div id="html5BarcodeReader"></div><div class="scan-guidance">Move the iPad slowly until the barcode is sharp and fills the center box.</div><button class="small-btn danger" onclick="stopBarcodeCamera()">Cancel Camera</button></div>`;try{html5BarcodeScanner=new Html5Qrcode('html5BarcodeReader',{verbose:false});await html5BarcodeScanner.start({facingMode:'environment'},{fps:10,qrbox:(w,h)=>({width:Math.min(Math.floor(w*.82),420),height:Math.min(Math.floor(h*.34),180)}),aspectRatio:1.777778,disableFlip:true},decoded=>handleScannedBarcode(decoded,targetInputId,mode),()=>{});}catch(err){html5BarcodeScanner=null;mount.innerHTML=`<div class="notice danger"><b>Unable to start the iPad camera.</b><br>In Safari, open Settings → Safari → Camera and allow camera access for this site, then reload Guthrie RMS.<br><span class="small">${err?.message||err||''}</span></div>`;}}
window.openBarcodeCamera=async(targetInputId,mode='inventory')=>{await stopBarcodeCamera();let mount=$('#barcodeCameraMount');if(!mount)return;if(!navigator.mediaDevices?.getUserMedia){mount.innerHTML='<div class="notice danger">Camera access is not available in this browser. Use Bluetooth scanner or manual barcode entry.</div>';return;}if(isAppleMobile()){return startHtml5QrcodeScanner(targetInputId,mode,mount);}if('BarcodeDetector' in window){try{barcodeDetectorInstance=barcodeDetectorInstance||new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code']});barcodeCameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});mount.innerHTML=`<div class="barcode-camera"><video id="barcodeVideo" autoplay playsinline muted></video><div class="barcode-frame"></div><p id="barcodeStatus" class="small">Point the rear camera at the barcode.</p><button class="small-btn danger" onclick="stopBarcodeCamera()">Cancel Camera</button></div>`;let video=$('#barcodeVideo');video.srcObject=barcodeCameraStream;await video.play();let scan=async()=>{if(!barcodeCameraStream||!video)return;try{let codes=await barcodeDetectorInstance.detect(video);if(codes?.length){handleScannedBarcode(codes[0].rawValue,targetInputId,mode);return;}}catch(e){}barcodeCameraTimer=setTimeout(scan,250);};scan();return;}catch(err){}}return startHtml5QrcodeScanner(targetInputId,mode,mount);};
