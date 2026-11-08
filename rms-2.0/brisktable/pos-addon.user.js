// ==UserScript==
// @name         Guthrie RMS - BriskTable POS add-on
// @description  Groups item tiles on the BriskTable POS into sections (Entrées, Drinks, ...) and shrinks item photos to fit BriskTable's 500 KB limit.
// @version      1.3
// @match        https://www.brisktable.com/apps/pos/terminal*
// @match        https://www.brisktable.com/apps/pos?*
// @updateURL    https://nakhestciafranklin-ctrl.github.io/GuthrieRMS/rms-2.0/brisktable/pos-addon.user.js
// @downloadURL  https://nakhestciafranklin-ctrl.github.io/GuthrieRMS/rms-2.0/brisktable/pos-addon.user.js
// @run-at       document-end
// @inject-into  page
// @grant        none
// ==/UserScript==
//
// Sections: BriskTable lists a category's items alphabetically. The add-on regroups the tiles under
// section bars taken from each item's BriskTable Description (Breakfast, Entrées, Sides, Bakery & Desserts,
// Drinks, Catering). Change an item's Description in BriskTable to move it to another section.
//
// Photos: BriskTable refuses item images over 500 KB (iPad photos are several MB). On BriskTable's
// item editor (POS Setup > Products), a picked photo is shrunk to about 1000 px before BriskTable
// checks it, so photos can be added straight from the iPad camera or photo library.
//
// Each iPad runs its own copy and only changes what that iPad shows; it stores nothing and never
// writes orders, so any number of iPads can use it at once. Also works as a bookmarklet
// (see rms-2.0/brisktable/index.html). Safe to run more than once.
(function(){
  if(window.__rmsPosAddon)return;window.__rmsPosAddon=true;
  var SECTION_ORDER=['Breakfast','Entrées','Sides','Bakery & Desserts','Drinks','Catering'];
  function state(){return window.ux592&&window.ux592.state;}

  // ---- Sections in the item grid ----
  function sectionOf(p){
    if(!p)return 'Other';
    if(p.is_modifier)return 'Modifiers';
    return String(p.description||'').trim()||'Other';
  }
  function rank(name){var i=SECTION_ORDER.indexOf(name);return i>=0?i:(name==='Other'?900:name==='Modifiers'?950:500);}
  var lastLayout='';
  function organize(){
    var grid=document.getElementById('terminal__grid');var s=state();if(!grid||!s||!s.products)return;
    var tiles=[].slice.call(grid.querySelectorAll(':scope > .terminal__grid-item[data-item-id]'));
    var key=tiles.map(function(t){return t.getAttribute('data-item-id');}).join(',');
    if(!tiles.length||key===lastLayout)return;
    var byId={};s.products.forEach(function(p){byId[p.id]=p;});
    var rows=tiles.map(function(t,i){var sec=sectionOf(byId[t.getAttribute('data-item-id')]);return {t:t,i:i,sec:sec,r:rank(sec)};});
    var secs={};rows.forEach(function(x){secs[x.sec]=1;});
    if(Object.keys(secs).length<2&&secs.Other)return;   // no sections set up: leave BriskTable's order
    rows.sort(function(a,b){return a.r-b.r||(a.sec<b.sec?-1:a.sec>b.sec?1:0)||a.i-b.i;});
    [].slice.call(grid.querySelectorAll('.rms-section-head')).forEach(function(h){h.remove();});
    var anchor=tiles[0].previousSibling;var frag=document.createDocumentFragment();var cur=null;
    rows.forEach(function(x){
      if(x.sec!==cur){cur=x.sec;var h=document.createElement('div');h.className='rms-section-head';h.textContent=cur;
        h.style.cssText='display:block;pointer-events:none;margin:1.1em 0.5em 0.4em;padding:0.45em 0.8em;background:#41577E;color:#fff;border-radius:6px;font-weight:700;font-size:1.1em;letter-spacing:0.03em;text-transform:uppercase;text-align:left';
        frag.appendChild(h);}
      frag.appendChild(x.t);
    });
    grid.insertBefore(frag,anchor?anchor.nextSibling:grid.firstChild);
    lastLayout=rows.map(function(x){return x.t.getAttribute('data-item-id');}).join(',');
  }
  var gridObserver=null;
  function watchGrid(){
    var grid=document.getElementById('terminal__grid');if(!grid||grid.__rmsWatched)return;grid.__rmsWatched=true;
    gridObserver=new MutationObserver(function(){gridObserver.disconnect();try{lastLayout='';organize();}finally{gridObserver.observe(grid,{childList:true});}});
    gridObserver.observe(grid,{childList:true});organize();
  }

  // ---- Item photos: shrink to fit BriskTable's 500 KB limit ----
  var MAX_BYTES=450000,MAX_SIDE=1000;
  function shrink(file){
    return new Promise(function(resolve,reject){
      var url=URL.createObjectURL(file),img=new Image();
      img.onload=function(){
        URL.revokeObjectURL(url);
        var scale=Math.min(1,MAX_SIDE/Math.max(img.naturalWidth,img.naturalHeight));
        var w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
        var c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d');
        g.fillStyle='#fff';g.fillRect(0,0,w,h);g.drawImage(img,0,0,w,h);
        var q=0.85;
        (function next(){c.toBlob(function(b){
          if(!b){reject(new Error('Could not read this photo.'));return;}
          if(b.size>MAX_BYTES&&q>0.4){q-=0.1;next();return;}
          if(b.size>MAX_BYTES&&c.width>400){var c2=document.createElement('canvas');c2.width=Math.round(c.width*0.75);c2.height=Math.round(c.height*0.75);c2.getContext('2d').drawImage(c,0,0,c2.width,c2.height);c=c2;q=0.8;next();return;}
          resolve(new File([b],(file.name||'photo').replace(/\.[^.]*$/,'')+'.jpg',{type:'image/jpeg'}));
        },'image/jpeg',q);})();
      };
      img.onerror=function(){URL.revokeObjectURL(url);reject(new Error('Could not read this photo.'));};
      img.src=url;
    });
  }
  document.addEventListener('change',function(e){
    var input=e.target;
    if(!input||!input.classList||!input.classList.contains('modal__product__image-input')||input.__rmsShrunk)return;
    var f=input.files&&input.files[0];if(!f||f.size<=MAX_BYTES||!/^image\//.test(f.type||'image/'))return;
    e.stopImmediatePropagation();e.preventDefault();
    shrink(f).then(function(small){
      var dt=new DataTransfer();dt.items.add(small);input.files=dt.files;
      input.__rmsShrunk=true;try{input.dispatchEvent(new Event('change',{bubbles:true}));}finally{input.__rmsShrunk=false;}
    }).catch(function(err){alert(err.message+' Try a different photo.');input.value='';});
  },true);

  setInterval(function(){watchGrid();organize();},400);
  watchGrid();
})();
