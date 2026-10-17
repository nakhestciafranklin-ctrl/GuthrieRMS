// Salon Booking cloud sync (same approach as Guthrie RMS's firebase-sync.js).
// Keeps one Firestore document in sync with window.db so every device -- the front
// desk tablet, the stylists' phones, and the online booking page -- sees the same data.
//
// SETUP: paste your own Firebase web-app config below
// (Firebase Console -> Project Settings -> General -> Your apps -> Web app).
// Until you do, the app runs in local-only mode (data stays in this browser).
const firebaseConfig={
  apiKey:'REPLACE_WITH_YOUR_API_KEY',
  authDomain:'REPLACE.firebaseapp.com',
  projectId:'REPLACE',
  storageBucket:'REPLACE.firebasestorage.app',
  messagingSenderId:'REPLACE',
  appId:'REPLACE'
};

const SHARED_DOC_PATH=['salonBooking','sharedState'];
const FALLBACK_TIMEOUT_MS=6000;
const PUSH_DEBOUNCE_MS=500;

const isConfigured=cfg=>!!(cfg&&cfg.apiKey&&!String(cfg.apiKey).startsWith('REPLACE'));
const setCloudStatus=(ok,message)=>{window.__salonCloudStatus={ok,message};};

function bootApp(reason,err){
  if(reason){
    console.warn('Salon cloud sync: '+reason+' - running in local-only mode.',err||'');
    setCloudStatus(false,'Local only — '+reason);
  }
  if(typeof window.startSalonApp==='function') window.startSalonApp();
}

if(!isConfigured(firebaseConfig)){
  bootApp('Firebase is not configured yet');
}else{
  (async()=>{
    const fallbackTimer=setTimeout(()=>bootApp('cloud connection timed out'),FALLBACK_TIMEOUT_MS);
    try{
      const [{initializeApp},{getAuth,signInAnonymously},{getFirestore,doc,onSnapshot,setDoc}]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
      ]);
      const fbApp=initializeApp(firebaseConfig);
      const firestore=getFirestore(fbApp);
      const sharedDocRef=doc(firestore,...SHARED_DOC_PATH);
      let cloudReady=false,lastSyncedJSON=null,pushTimer=null,applyingCloud=false;

      function pushToCloud(){
        if(!cloudReady||applyingCloud)return;
        clearTimeout(pushTimer);
        pushTimer=setTimeout(()=>{
          // JSON round-trip strips undefined values, which Firestore rejects.
          const json=JSON.stringify(window.db);
          if(json===lastSyncedJSON)return;
          lastSyncedJSON=json;
          setDoc(sharedDocRef,JSON.parse(json)).catch(err=>console.warn('Salon cloud sync: push failed, will retry on next change.',err));
        },PUSH_DEBOUNCE_MS);
      }

      await signInAnonymously(getAuth(fbApp));

      onSnapshot(sharedDocRef,async snap=>{
        try{
          if(!snap.exists()){
            // The first device ever to connect seeds the cloud with its local data.
            lastSyncedJSON=JSON.stringify(window.db);
            await setDoc(sharedDocRef,JSON.parse(lastSyncedJSON));
          }else{
            const cloudJSON=JSON.stringify(snap.data());
            if(cloudJSON!==lastSyncedJSON){
              lastSyncedJSON=cloudJSON;
              applyingCloud=true;
              try{
                window.db=snap.data();
                localStorage.setItem('salonBooking1',cloudJSON);
              }finally{applyingCloud=false;}
              if(cloudReady&&typeof window.render==='function') window.render();
            }
          }
          cloudReady=true;
          clearTimeout(fallbackTimer);
          setCloudStatus(true,'Connected — shared with all devices');
          bootApp();
        }catch(err){
          clearTimeout(fallbackTimer);
          bootApp('error applying cloud data',err);
        }
      },err=>{clearTimeout(fallbackTimer);bootApp('cloud sync error',err);});

      // Wrap app.js's save() so every local save is also pushed to the cloud.
      const originalSave=window.save;
      window.save=function(){originalSave();pushToCloud();};
    }catch(err){
      clearTimeout(fallbackTimer);
      bootApp('failed to load or initialize',err);
    }
  })();
}
