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
const FALLBACK_TIMEOUT_MS=6000;
const PUSH_DEBOUNCE_MS=500;

function isConfigured(cfg){
  return !!(cfg && cfg.apiKey && !String(cfg.apiKey).startsWith('REPLACE_'));
}

function bootApp(reason,err){
  if(reason) console.warn('Guthrie RMS cloud sync: '+reason+' - running in local-only mode.',err||'');
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

      function cleanForFirestore(data){
        // Strips undefined values and functions, which Firestore rejects.
        return JSON.parse(JSON.stringify(data));
      }

      function pushToCloud(){
        if(!cloudReady||unsubscribed)return;
        clearTimeout(pushTimer);
        pushTimer=setTimeout(()=>{
          try{
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

      await signInAnonymously(auth);

      onSnapshot(sharedDocRef,async(snap)=>{
        try{
          if(!snap.exists()){
            // First device to ever connect seeds the shared database with its current local data.
            const clean=cleanForFirestore(window.db);
            lastSyncedJSON=JSON.stringify(clean);
            await setDoc(sharedDocRef,clean);
          }else{
            const cloudData=snap.data();
            const cloudJSON=JSON.stringify(cloudData);
            if(cloudJSON!==lastSyncedJSON){
              lastSyncedJSON=cloudJSON;
              window.db=cloudData;
              if(window.__guthrieRMSBooted){
                if(typeof window.normalizeOrders==='function') window.normalizeOrders();
                if(typeof window.render==='function') window.render();
              }
            }
          }
          cloudReady=true;
          clearTimeout(fallbackTimer);
          window.__guthrieRMSBooted=true;
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
