// Guthrie RMS cloud sync
// This file connects the app to a shared Firebase Firestore database so every
// device sees the same users, inventory, orders, and settings in real time.
//
// SETUP: replace the values below with your own Firebase project's config
// (Firebase Console -> Project Settings -> General -> Your apps -> Web app).
// These values are safe to be public in client-side code; real protection
// comes from the Firestore Security Rules set in the Firebase Console, not
// from hiding this config.
//
// If this is left unconfigured (or Firebase is unreachable), the app falls
// back to local-only mode automatically -- nothing here can hard-break the
// app for anyone.
const firebaseConfig={
  apiKey:'AIzaSyAtG-I3wJZqIEA1AM4BvANp2YHEs9PCdL8',
  authDomain:'guthrie-rms.firebaseapp.com',
  projectId:'guthrie-rms',
  storageBucket:'guthrie-rms.firebasestorage.app',
  messagingSenderId:'515721873582',
  appId:'1:515721873582:web:c4f7825c8d616b69e5853f'
};

const SHARED_DOC_PATH=['guthrieRMS','sharedState'];
// App version from app.js. Every push stamps it on the shared doc; a device that sees a
// newer version in the cloud is running stale cached code and reloads itself.
const APP_VERSION=Number(window.GUTHRIE_RMS_VERSION)||0;
const RELOAD_GUARD_MS=5*60*1000;
const FALLBACK_TIMEOUT_MS=6000;
const PUSH_DEBOUNCE_MS=500;

function isConfigured(cfg){
  return !!(cfg && cfg.apiKey && !String(cfg.apiKey).startsWith('REPLACE_'));
}

// Sync health for the app's banners: when the last push succeeded, since when pushes have been
// failing (null when fine), why, and the shared doc's size (Firestore's limit is 1 MiB per doc).
const syncHealth=window.__guthrieSyncHealth={lastOk:0,failingSince:null,error:'',bytes:0,limit:1048576};
function setCloudStatus(ok,message){
  window.__guthrieRMSCloudStatus={ok,message};
}

function bootApp(reason,err){
  if(reason){
    console.warn('Guthrie RMS cloud sync: '+reason+' - running in local-only mode.',err||'');
    const detail=err&&err.message?(' ('+err.message+')'):'';
    setCloudStatus(false,'Local only — '+reason+detail);
  }
  if(typeof window.startGuthrieRMS==='function') window.startGuthrieRMS();
}

if(!isConfigured(firebaseConfig)){
  bootApp('Firebase is not configured yet');
} else {
  (async()=>{
    const fallbackTimer=setTimeout(()=>bootApp('cloud connection timed out'),FALLBACK_TIMEOUT_MS);
    try{
      const [{initializeApp},{getAuth,signInAnonymously},{getFirestore,doc,onSnapshot,setDoc,runTransaction,getDoc}]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
      ]);

      const app=initializeApp(firebaseConfig);
      const auth=getAuth(app);
      const firestore=getFirestore(app);
      const sharedDocRef=doc(firestore,...SHARED_DOC_PATH);

      let cloudReady=false;
      let lastSyncedJSON=null;
      let pushTimer=null;
      let unsubscribed=false;

      // ---- Order merging ----
      // The whole app shares one cloud document, so a device saving a slightly older copy used
      // to wipe out other devices' new orders and KMS progress. Orders are now merged by id:
      // each order carries updatedAt (stamped when this device changes it) and the newer copy wins.
      // baseOrders only changes when a cloud snapshot arrives (never on push): an order this
      // device pushed is not "in the cloud" until the cloud sends it back.
      let baseOrders=new Map();      // id -> order JSON (without updatedAt) as last seen in the cloud
      const stamped=new Map();       // id -> JSON this device already stamped, so it isn't re-stamped
      const orderKey=o=>{const c={...o};delete c.updatedAt;return JSON.stringify(c);};
      function rememberBase(orders){baseOrders=new Map((orders||[]).map(o=>[o.id,orderKey(o)]));}
      // Deleted orders are recorded in db.deletedOrders (id -> time). An order missing from an
      // incoming copy is NOT taken as deleted: with many devices, one that hadn't received a new
      // order yet would send a copy without it, and the others used to drop it (a lost sale).
      const TOMBSTONE_DAYS=3;
      // Orders changed on this device that the cloud hasn't confirmed yet, kept in this iPad's
      // storage as id -> {at: updatedAt, base: the cloud copy the change was made on}. If the iPad
      // reloads before they reach the cloud (Wi-Fi dropped), they are merged into the cloud copy
      // on the next connect (field by field, against that base) instead of being lost.
      const PENDING_KEY='guthrieRMSPendingOrders';
      let pending={}; try{pending=JSON.parse(localStorage.getItem(PENDING_KEY)||'{}')||{};}catch(e){pending={};}
      function savePending(){try{localStorage.setItem(PENDING_KEY,JSON.stringify(pending));}catch(e){}}
      function confirmPending(cloudOrders){
        let changed=false; const byId=new Map((cloudOrders||[]).map(o=>[String(o.id),o]));
        Object.entries(pending).forEach(([id,p])=>{const c=byId.get(id);if(c&&(Number(c.updatedAt)||0)>=Number(p?.at??p)){delete pending[id];changed=true;}});
        if(changed)savePending();
      }
      function stampLocalChanges(){
        const data=window.db;
        if(data){
          const ids=new Set((data.orders||[]).map(o=>o.id));
          baseOrders.forEach((_,id)=>{if(!ids.has(id)){data.deletedOrders=data.deletedOrders||{};if(!data.deletedOrders[id])data.deletedOrders[id]=Date.now();}});
        }
        (window.db?.orders||[]).forEach(o=>{
          const k=orderKey(o);
          if(baseOrders.get(o.id)!==k&&stamped.get(o.id)!==k){o.updatedAt=Date.now();stamped.set(o.id,orderKey(o));pending[o.id]={at:o.updatedAt,base:pending[o.id]?.base??baseOrders.get(o.id)??null};savePending();}
        });
      }
      // ---- Field-level merge of one order ----
      // Two devices often change the same order at the same moment (the register marks it paid
      // while a KMS station taps Complete). Taking the whole newer copy dropped the other
      // device's change (a lost payment or a lost tap). Instead this is a three-way merge against
      // the copy this device last received from the cloud (base): a field changed on only one
      // side takes that side's value; a field changed on both sides takes the newer order's
      // value. Ticket lines merge by lineId (each line, and each part of a line, field by field),
      // so a line removed on one device stays removed and a line added on another is kept.
      // The KMS log and refunds are combined from both sides.
      const J=v=>v===undefined?'\u0000':JSON.stringify(v);
      const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
      function merge3(b,l,c,localNewer){
        const lj=J(l),cj=J(c); if(lj===cj)return c;
        const bj=J(b); if(lj===bj)return c; if(cj===bj)return l;
        if(isObj(l)&&isObj(c)&&(b===undefined||isObj(b))){
          const out={};
          new Set([...Object.keys(c),...Object.keys(l)]).forEach(k=>{const v=merge3(b?.[k],l[k],c[k],localNewer);if(v!==undefined)out[k]=v;});
          return out;
        }
        return localNewer?l:c;
      }
      function unionList(b,l,c){
        const lj=J(l),cj=J(c); if(lj===cj)return c; if(lj===J(b))return c; if(cj===J(b))return l;
        const out=[...(c||[])], seen=new Set(out.map(x=>JSON.stringify(x)));
        (l||[]).forEach(x=>{const k=JSON.stringify(x);if(!seen.has(k)){seen.add(k);out.push(x);}});
        if(out.every(x=>x&&x.time))out.sort((x,y)=>new Date(x.time)-new Date(y.time));
        return out;
      }
      function mergeLines(b,l,c,localNewer){
        const key=i=>String(i&&(i.lineId??i.id));
        const B=new Map((b||[]).map(i=>[key(i),i])), L=new Map((l||[]).map(i=>[key(i),i])), C=new Map((c||[]).map(i=>[key(i),i]));
        const order=[...C.keys()]; L.forEach((_,k)=>{if(!C.has(k))order.push(k);});
        const out=[];
        order.forEach(k=>{
          const bi=B.get(k), li=L.get(k), ci=C.get(k);
          if(li&&ci){out.push(merge3(bi,li,ci,localNewer));return;}
          const only=li||ci;
          // Present on one side only: new there (keep it), or removed on the other side
          // (stays removed unless this side changed it since).
          if(!bi||J(only)!==J(bi))out.push(only);
        });
        return out;
      }
      function mergeOrder(baseJSON,l,c){
        const localNewer=(Number(l.updatedAt)||0)>(Number(c.updatedAt)||0);
        // No shared starting copy (an order created here that the cloud hadn't confirmed yet):
        // merge against an empty one, so anything either side has is kept (a KMS tap from the
        // cloud and a payment made here offline both survive); only real conflicts go to the newer.
        const b=baseJSON?JSON.parse(baseJSON):{}, out={};
        new Set([...Object.keys(c),...Object.keys(l),...Object.keys(b)]).forEach(k=>{
          if(k==='updatedAt')return;
          let v;
          if(k==='items')v=mergeLines(b.items,l.items,c.items,localNewer);
          else if(k==='kmsLog'||k==='refunds')v=unionList(b[k],l[k],c[k]);
          else v=merge3(b[k],l[k],c[k],localNewer);
          if(v!==undefined)out[k]=v;
        });
        // Ticket stage follows the combined log: completed (or cleared) stays completed unless it
        // was recalled or more items were sent after that, so a done ticket never pops back up.
        const life=(out.kmsLog||[]).filter(e=>/^(Completed|Cleared \(Inactive\)|Recalled|Sent to Kitchen|Added Items Sent)$/.test(e?.stage)).pop();
        if(life&&/^(Completed|Cleared)/.test(life.stage)&&out.kmsStage!=='completed')out.kmsStage='completed';
        else if(life&&out.kmsStage==='completed'&&!/^(Completed|Cleared)/.test(life.stage))out.kmsStage=life.stage==='Recalled'?'started':'sent';
        // A paid order stays paid even if a KMS device moved its ticket status meanwhile.
        if(out.paid&&!/paid|refund/i.test(String(out.status||'')))out.status='paid';
        out.updatedAt=Math.max(Number(l.updatedAt)||0,Number(c.updatedAt)||0);
        return out;
      }
      // Returns true when this device holds order changes the cloud doesn't have yet.
      function mergeOrders(cloudData,localOrders,localDeleted,base=baseOrders){
        const cloudOrders=cloudData.orders||[];
        const local=new Map((localOrders||[]).map(o=>[o.id,o]));
        const seen=new Set(); const out=[]; let localWins=false;
        const cutoff=Date.now()-TOMBSTONE_DAYS*864e5;
        const deleted={};
        [cloudData.deletedOrders||{},localDeleted||{}].forEach(t=>Object.entries(t).forEach(([id,at])=>{if(Number(at)>cutoff)deleted[id]=Math.max(Number(at),deleted[id]||0);}));
        if(Object.keys(deleted).some(id=>!(cloudData.deletedOrders||{})[id]))localWins=true;
        cloudOrders.forEach(c=>{
          seen.add(c.id);
          if(deleted[c.id]){localWins=true;return;}
          const l=local.get(c.id);
          if(l){
            if(orderKey(l)===orderKey(c)){out.push(c);return;}
            const m=mergeOrder(base.get(c.id),l,c);
            if(orderKey(m)!==orderKey(c))localWins=true;
            out.push(m);
          }
          else out.push(c);
        });
        (localOrders||[]).forEach(l=>{
          if(seen.has(l.id)||deleted[l.id])return;
          out.push(l);localWins=true; // the cloud copy is missing it (new here, or a device sent an older copy)
        });
        cloudData.deletedOrders=deleted;
        cloudData.orders=out;
        // Keep each open table pointed at its order.
        (cloudData.tables||[]).forEach(t=>{
          if(t.orderId)return;
          const o=out.find(x=>x.type==='table'&&x.tableId===t.id&&!x.paid&&x.kmsStage!=='completed'&&x.status!=='completed');
          if(o){t.orderId=o.id;if(t.status==='open')t.status=o.sent?'sent':'active';}
        });
        return localWins;
      }

      // ---- Everything else (pars, menu, settings, inventory, ...) ----
      // Same idea for the rest of the shared doc. Each top-level section, the production day
      // (date/history), and each item's par/count is a "unit". When this device changes a unit,
      // its time goes in db.syncStamps; on merge the newer stamp wins. Without this, an update
      // from another device replaced the whole doc and wiped out pars saved here moments before.
      // baseUnits is what this device last took from the cloud (after migrations), so a
      // migration's own changes are not stamped and pushed (see the loop note further down).
      const UNSTAMPED=['orders','deletedOrders','production','syncStamps','appVersion'];
      function units(data){
        const out=new Map();
        Object.keys(data||{}).forEach(k=>{if(!UNSTAMPED.includes(k))out.set(k,data[k]);});
        const prod=data?.production;
        if(prod){
          out.set('production',{date:prod.date,history:prod.history});
          Object.entries(prod.items||{}).forEach(([id,item])=>out.set('production.items.'+id,item));
        }
        return out;
      }
      let baseUnits=new Map();       // unit -> JSON as last taken from the cloud
      const stampedUnits=new Map();  // unit -> JSON this device already stamped
      function rememberUnits(data){baseUnits=new Map([...units(data)].map(([k,v])=>[k,JSON.stringify(v)]));}
      function stampLocalUnits(){
        const data=window.db; if(!data)return;
        units(data).forEach((v,k)=>{
          const j=JSON.stringify(v);
          if(baseUnits.get(k)!==j&&stampedUnits.get(k)!==j){data.syncStamps=data.syncStamps||{};data.syncStamps[k]=Date.now();stampedUnits.set(k,j);}
        });
      }
      // Keeps this device's units that are newer than the cloud's. Returns true if any were kept.
      function mergeUnits(cloudData,local){
        const cs=cloudData.syncStamps||{}, ls=local?.syncStamps||{};
        const stamps={...cs}; let localWins=false;
        const newer=k=>(Number(ls[k])||0)>(Number(cs[k])||0);
        const keep=k=>{stamps[k]=ls[k];localWins=true;};
        Object.keys(local||{}).forEach(k=>{if(!UNSTAMPED.includes(k)&&newer(k)){cloudData[k]=local[k];keep(k);}});
        const lp=local?.production;
        if(lp){
          const cp=cloudData.production=cloudData.production||{};
          cp.items=cp.items||{};
          if(newer('production')){cp.date=lp.date;cp.history=lp.history;keep('production');}
          Object.entries(lp.items||{}).forEach(([id,item])=>{const k='production.items.'+id;if(newer(k)){cp.items[id]=item;keep(k);}});
        }
        // The list of archived days only ever grows: combine both sides so a day archived on one
        // iPad isn't dropped by another iPad saving its list at the same moment.
        if(Array.isArray(local?.archiveDays)||Array.isArray(cloudData.archiveDays)){
          const all=[...new Set([...(cloudData.archiveDays||[]),...(local?.archiveDays||[])])].sort();
          if(all.length!==(cloudData.archiveDays||[]).length)localWins=true;
          cloudData.archiveDays=all;
        }
        cloudData.syncStamps=stamps;
        return localWins;
      }

      function cleanForFirestore(data){
        // Strips undefined values and functions, which Firestore rejects.
        return JSON.parse(JSON.stringify(data));
      }

      // Each push is a transaction: read the latest cloud copy, merge this device's changes into it,
      // and write only if no other device wrote in between (Firestore retries if one did). A plain
      // write of this device's whole copy used to overwrite orders and pars that other devices had
      // just saved, and with many devices busy at once it could take a long time to sort itself out.
      let pushing=false, pushAgain=false;
      function pushToCloud(){
        if(!cloudReady||unsubscribed)return;
        if(window.__guthrieRMSApplyingCloud)return;
        clearTimeout(pushTimer);
        pushTimer=setTimeout(async()=>{
          if(pushing){pushAgain=true;return;}
          let json, base;
          try{
            if(APP_VERSION&&!(Number(window.db.appVersion)>=APP_VERSION))window.db.appVersion=APP_VERSION;
            stampLocalChanges();
            stampLocalUnits();
            json=JSON.stringify(cleanForFirestore(window.db));
            if(json===lastSyncedJSON)return;
            // The cloud copy this device's data was based on, captured with it, so a retry after
            // another device's write still merges against the right starting point.
            base=new Map(baseOrders);
            lastSyncedJSON=json;
          }catch(err){
            console.warn('Guthrie RMS cloud sync: could not prepare data for cloud push.',err);
            return;
          }
          pushing=true;
          try{
            await runTransaction(firestore,async tx=>{
              const local=JSON.parse(json);
              const snap=await tx.get(sharedDocRef);
              let out=local;
              if(snap.exists()){
                out=snap.data();
                mergeOrders(out,local.orders,local.deletedOrders,base);
                mergeUnits(out,local);
                out.appVersion=Math.max(Number(out.appVersion)||0,Number(local.appVersion)||0);
              }
              const clean=cleanForFirestore(out);
              syncHealth.bytes=JSON.stringify(clean).length;
              tx.set(sharedDocRef,clean);
            });
            syncHealth.lastOk=Date.now(); syncHealth.failingSince=null; syncHealth.error='';
          }catch(err){
            console.warn('Guthrie RMS cloud sync: push failed, retrying.',err);
            if(!syncHealth.failingSince)syncHealth.failingSince=Date.now();
            syncHealth.error=String(err&&(err.message||err.code)||err||'');
            lastSyncedJSON=null;
            setTimeout(pushToCloud,2000);
          }finally{
            pushing=false;
            if(pushAgain){pushAgain=false;pushToCloud();}
          }
        },PUSH_DEBOUNCE_MS);
      }

      // Reload once (at most every few minutes) when the shared data was written by a newer app version.
      function newerVersionInCloud(cloudData){
        if(!APP_VERSION||!(Number(cloudData?.appVersion)>APP_VERSION))return false;
        try{
          const last=Number(sessionStorage.getItem('guthrieRMSReloadAt'))||0;
          if(Date.now()-last<RELOAD_GUARD_MS)return false;
          sessionStorage.setItem('guthrieRMSReloadAt',String(Date.now()));
        }catch(e){return false;}
        setCloudStatus(false,'Updating to the newest version…');
        location.reload();
        return true;
      }
      let firstSnapshot=true;
      // Updates from other devices redraw the screen, which would close an open item popup or wipe
      // what a student is typing. Wait until no popup is open and no box is being typed in.
      let renderWaiting=null;
      function screenBusy(){
        if(document.querySelector('.modal'))return true;
        // Pars typed on Daily Pars but not saved yet: a redraw would put the old numbers back.
        if([...document.querySelectorAll('[data-par-id]')].some(i=>i.value!==i.defaultValue))return true;
        const el=document.activeElement;
        return !!(el&&/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)&&document.getElementById('app')?.contains(el));
      }
      function renderWhenIdle(){
        if(typeof window.render!=='function')return;
        if(!screenBusy()){clearTimeout(renderWaiting);renderWaiting=null;window.render();return;}
        if(renderWaiting)return;
        const check=()=>{if(screenBusy()){renderWaiting=setTimeout(check,400);return;}renderWaiting=null;window.render();};
        renderWaiting=setTimeout(check,400);
      }

      await signInAnonymously(auth);

      onSnapshot(sharedDocRef,async(snap)=>{
        let localWins=false;
        try{
          if(!snap.exists()){
            // First device to ever connect seeds the shared database with its current local data.
            const clean=cleanForFirestore(window.db);
            lastSyncedJSON=JSON.stringify(clean);
            await setDoc(sharedDocRef,clean);
          }else{
            const cloudData=snap.data();
            if(newerVersionInCloud(cloudData))return;
            const cloudJSON=JSON.stringify(cloudData);
            syncHealth.bytes=cloudJSON.length; syncHealth.lastSnapshot=Date.now();
            if(cloudJSON!==lastSyncedJSON){
              lastSyncedJSON=cloudJSON;
              // First load takes the cloud's orders as-is (this device's saved copy may be days old).
              // After that, merge so orders this device just entered or updated aren't lost.
              if(firstSnapshot){
                rememberBase(cloudData.orders);
                // Orders this iPad changed that never reached the cloud (e.g. it reloaded while offline).
                const localOrders=window.db?.orders||[], cloudOrders=cloudData.orders=cloudData.orders||[];
                const dead=cloudData.deletedOrders||{};
                Object.keys(pending).forEach(id=>{
                  const l=localOrders.find(o=>String(o.id)===id); if(!l||dead[id]){delete pending[id];return;}
                  const i=cloudOrders.findIndex(o=>String(o.id)===id);
                  if(i<0){cloudOrders.push(l);localWins=true;return;}
                  const c=cloudOrders[i], base=pending[id]?.base??null;
                  if(orderKey(l)===orderKey(c)){delete pending[id];return;}
                  // Merge against the copy the offline change was made on, so changes other
                  // devices made meanwhile (KMS taps, payment) are kept too.
                  const m=mergeOrder(base,l,c);
                  if(orderKey(m)!==orderKey(c)){cloudOrders[i]=m;localWins=true;}else delete pending[id];
                });
                savePending();
              }
              else {
                stampLocalChanges(); stampLocalUnits();
                const local=window.db, localOrders=local?.orders||[];
                localWins=mergeOrders(cloudData,localOrders,local?.deletedOrders);
                if(mergeUnits(cloudData,local))localWins=true;
                rememberBase(JSON.parse(cloudJSON).orders);
              }
              confirmPending(JSON.parse(cloudJSON).orders);
              window.db=cloudData;
              // Re-applying migrations must not push on its own: a device running different
              // code would undo it and push back, and the two would overwrite each other's
              // orders in an endless loop. The migrated result is pushed once, on connect.
              window.__guthrieRMSApplyingCloud=true;
              try{
                if(typeof window.importRosterStudents==='function') window.importRosterStudents();
                if(typeof window.importCafeMenu==='function') window.importCafeMenu();
                if(typeof window.importBistroMenu==='function') window.importBistroMenu();
                if(typeof window.importExemptionMenu==='function') window.importExemptionMenu();
                if(typeof window.addCafeServicesOperation==='function') window.addCafeServicesOperation();
                if(typeof window.addBistroTeamPositions==='function') window.addBistroTeamPositions();
                if(typeof window.assignBistroTeamPositions==='function') window.assignBistroTeamPositions();
                if(window.__guthrieRMSBooted&&typeof window.normalizeOrders==='function') window.normalizeOrders();
              }finally{
                window.__guthrieRMSApplyingCloud=false;
              }
              rememberUnits(window.db);
              if(window.__guthrieRMSBooted) renderWhenIdle();
            }
          }
          cloudReady=true;
          // On connect only: if this device's migrations changed the cloud copy (new menu
          // items, modifiers, prices), send the result up once so every device gets it.
          if(firstSnapshot){firstSnapshot=false;pushToCloud();if(localWins)console.info('Guthrie RMS: re-sending orders saved on this iPad while offline.');}
          // This device had newer order changes than the cloud copy it just received: send them back up.
          else if(localWins){pushToCloud();}
          clearTimeout(fallbackTimer);
          window.__guthrieRMSBooted=true;
          setCloudStatus(true,'Connected — shared with all devices');
          bootApp();
        }catch(err){
          clearTimeout(fallbackTimer);
          bootApp('error applying cloud data',err);
        }
      },(err)=>{
        clearTimeout(fallbackTimer);
        bootApp('cloud sync error',err);
      });

      // ---- Order archive (long-term storage) ----
      // Paid orders from earlier days are moved out of the shared doc into one archive doc per
      // day (guthrieRMS/archive_YYYY-MM-DD, then _2, _3... if a day passes ~900 KB), so the shared
      // doc stays small and fast while history is kept for reports.
      const ARCHIVE_PART_BYTES=900000;
      const archiveRef=(day,part)=>doc(firestore,'guthrieRMS','archive_'+day+(part>1?'_'+part:''));
      window.__guthrieArchive={
        async save(day,orders){
          let remaining=orders.slice();
          for(let part=1;part<=30&&remaining.length;part++){
            let left=[];
            await runTransaction(firestore,async tx=>{
              const snap=await tx.get(archiveRef(day,part));
              const cur=snap.exists()?(snap.data().orders||[]):[];
              const ids=new Map(cur.map((o,i)=>[o.id,i])); let size=JSON.stringify(cur).length; left=[];
              remaining.forEach(o=>{
                if(ids.has(o.id)){cur[ids.get(o.id)]=o;return;}
                const n=JSON.stringify(o).length;
                if(size+n<ARCHIVE_PART_BYTES||!cur.length){cur.push(o);ids.set(o.id,cur.length-1);size+=n;}else left.push(o);
              });
              tx.set(archiveRef(day,part),cleanForFirestore({day,part,orders:cur,updatedAt:Date.now()}));
            });
            remaining=left;
          }
          if(remaining.length)throw new Error('archive full for '+day);
        },
        async load(day){
          const out=[];
          for(let part=1;part<=30;part++){const snap=await getDoc(archiveRef(day,part));if(!snap.exists())break;out.push(...(snap.data().orders||[]));}
          return out;
        }
      };

      // Wrap the app's existing save() so every local save is also pushed to the cloud.
      const originalSave=window.save;
      if(typeof originalSave==='function'){
        window.save=function(){
          originalSave();
          pushToCloud();
        };
      }

      window.addEventListener('beforeunload',()=>{unsubscribed=true;});
    }catch(err){
      clearTimeout(fallbackTimer);
      bootApp('failed to load or initialize',err);
    }
  })();
}
