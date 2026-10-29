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
      const [{initializeApp},{getAuth,signInAnonymously},{getFirestore,doc,onSnapshot,setDoc}]=await Promise.all([
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
      function stampLocalChanges(){
        (window.db?.orders||[]).forEach(o=>{
          const k=orderKey(o);
          if(baseOrders.get(o.id)!==k&&stamped.get(o.id)!==k){o.updatedAt=Date.now();stamped.set(o.id,orderKey(o));}
        });
      }
      // Returns true when this device holds order changes the cloud doesn't have yet.
      function mergeOrders(cloudData,localOrders){
        const cloudOrders=cloudData.orders||[];
        const local=new Map((localOrders||[]).map(o=>[o.id,o]));
        const seen=new Set(); const out=[]; let localWins=false;
        cloudOrders.forEach(c=>{
          seen.add(c.id);
          const l=local.get(c.id);
          if(l){ if((Number(l.updatedAt)||0)>(Number(c.updatedAt)||0)){out.push(l);localWins=true;} else out.push(c); }
          else if(baseOrders.has(c.id)&&baseOrders.get(c.id)===orderKey(c)){ localWins=true; } // removed on this device
          else out.push(c);
        });
        (localOrders||[]).forEach(l=>{
          if(seen.has(l.id))return;
          if(!baseOrders.has(l.id)){out.push(l);localWins=true;} // new on this device, not pushed yet
        });
        cloudData.orders=out;
        // Keep each open table pointed at its order.
        (cloudData.tables||[]).forEach(t=>{
          if(t.orderId)return;
          const o=out.find(x=>x.type==='table'&&x.tableId===t.id&&!x.paid&&x.kmsStage!=='completed'&&x.status!=='completed');
          if(o){t.orderId=o.id;if(t.status==='open')t.status=o.sent?'sent':'active';}
        });
        return localWins;
      }

      function cleanForFirestore(data){
        // Strips undefined values and functions, which Firestore rejects.
        return JSON.parse(JSON.stringify(data));
      }

      function pushToCloud(){
        if(!cloudReady||unsubscribed)return;
        if(window.__guthrieRMSApplyingCloud)return;
        clearTimeout(pushTimer);
        pushTimer=setTimeout(()=>{
          try{
            if(APP_VERSION&&!(Number(window.db.appVersion)>=APP_VERSION))window.db.appVersion=APP_VERSION;
            stampLocalChanges();
            const clean=cleanForFirestore(window.db);
            const json=JSON.stringify(clean);
            if(json===lastSyncedJSON)return;
            lastSyncedJSON=json;
            setDoc(sharedDocRef,clean).catch(err=>console.warn('Guthrie RMS cloud sync: push failed, will retry on next change.',err));
          }catch(err){
            console.warn('Guthrie RMS cloud sync: could not prepare data for cloud push.',err);
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
            if(cloudJSON!==lastSyncedJSON){
              lastSyncedJSON=cloudJSON;
              // First load takes the cloud's orders as-is (this device's saved copy may be days old).
              // After that, merge so orders this device just entered or updated aren't lost.
              if(firstSnapshot){ rememberBase(cloudData.orders); }
              else { stampLocalChanges(); const localOrders=window.db?.orders||[]; localWins=mergeOrders(cloudData,localOrders); rememberBase(JSON.parse(cloudJSON).orders); }
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
              if(window.__guthrieRMSBooted&&typeof window.render==='function') window.render();
            }
          }
          cloudReady=true;
          // On connect only: if this device's migrations changed the cloud copy (new menu
          // items, modifiers, prices), send the result up once so every device gets it.
          if(firstSnapshot){firstSnapshot=false;pushToCloud();}
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
