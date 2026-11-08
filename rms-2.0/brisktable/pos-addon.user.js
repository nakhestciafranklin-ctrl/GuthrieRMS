// ==UserScript==
// @name         Guthrie RMS - BriskTable POS add-on
// @description  Guest name box under the Takeout/Table dropdown, and item tiles grouped into sections (Entrées, Drinks, ...).
// @version      1.1
// @match        https://www.brisktable.com/apps/pos/terminal*
// @run-at       document-end
// @inject-into  page
// @grant        none
// ==/UserScript==
//
// Students type the guest's name in the box; it goes onto the order before Submit order / Checkout.
// Behind the scenes it does what BriskTable's own Add Customer does: saves a customer with just that
// name and attaches it to the order, so the name shows on the order, the Orders list and the receipt.
//
// Sections: BriskTable lists a category's items alphabetically. The add-on regroups the tiles under
// headings taken from each item's BriskTable Description (Breakfast, Entrées, Sides, Bakery & Desserts,
// Drinks, Catering). Change an item's Description in BriskTable to move it to another section.
// Also works as a bookmarklet (see rms-2.0/brisktable/README.md). Safe to run more than once.
(function(){
  if(window.__rmsGuestName)return;window.__rmsGuestName=true;
  var SECTION_ORDER=['Breakfast','Entrées','Sides','Bakery & Desserts','Drinks','Catering'];
  var BOX_ID='rms-guest-name';
  var applied='';      // name currently attached to the order by this box
  var applying=null;   // promise while a name is being saved
  var bypass=false;    // lets our own re-click through

  function state(){return window.ux592&&window.ux592.state;}
  function order(){var s=state();return s&&s.current_order;}
  function rerender(){try{if(typeof window.ux1AB==='function')window.ux1AB(false);}catch(e){}}

  function attach(id,name){
    if(typeof window.ux629==='function'){window.ux629(id,name,'');return;}
    var o=order();if(!o)return;o.customer_id=id;o.customer_name=name;rerender();
  }
  function detach(){
    var o=order();if(!o||!o.customer_id)return;
    var x=document.getElementById('terminal__tray__header__customer-remove');
    if(x){x.click();return;}
    o.customer_id='';o.customer_name='';rerender();
  }
  function saveCustomer(name){
    var body='name='+encodeURIComponent(name)+'&address=&phone=&email=';
    return fetch('/api/pos/customeradd',{method:'POST',credentials:'same-origin',
      headers:{'X-AJAX':'true','Content-type':'application/x-www-form-urlencoded'},body:body})
      .then(function(r){return r.text();}).then(function(t){
        var j;try{j=JSON.parse(t);}catch(e){throw new Error('BriskTable did not save the guest name.');}
        if(!j.key)throw new Error(j.errormsg||'BriskTable did not save the guest name.');
        return j.key;
      });
  }
  function apply(){
    var box=document.getElementById(BOX_ID);if(!box)return Promise.resolve();
    var name=box.value.replace(/\s+/g,' ').trim().slice(0,40);
    var o=order();if(!o)return Promise.resolve();
    if(name===(o.customer_name||'')&&(!name||o.customer_id)){applied=name;return Promise.resolve();}
    if(!name){applied='';detach();return Promise.resolve();}
    box.disabled=true;box.style.opacity='0.6';
    applying=saveCustomer(name).then(function(id){attach(id,name);applied=name;})
      .catch(function(e){alert(e.message+' Use Add Customer instead.');})
      .then(function(){box.disabled=false;box.style.opacity='';applying=null;});
    return applying;
  }
  function pending(){
    var box=document.getElementById(BOX_ID);if(!box)return false;
    var name=box.value.replace(/\s+/g,' ').trim();var o=order()||{};
    return !!applying||name!==(o.customer_name||'');
  }
  // Submit order / Checkout wait for the name to be attached first.
  document.addEventListener('click',function(e){
    if(bypass)return;
    var btn=e.target&&e.target.closest&&e.target.closest('#terminal__order-save,#terminal__order-checkout');
    if(!btn||!pending())return;
    e.preventDefault();e.stopImmediatePropagation();
    (applying||apply()).then(function(){bypass=true;try{btn.click();}finally{bypass=false;}});
  },true);

  function addBox(){
    if(document.getElementById(BOX_ID))return;
    var sel=document.getElementById('terminal__table-select');if(!sel)return;
    var box=document.createElement('input');
    box.id=BOX_ID;box.type='text';box.placeholder='Guest name';box.autocomplete='off';box.maxLength=40;
    box.setAttribute('autocapitalize','words');box.setAttribute('autocorrect','off');box.setAttribute('enterkeyhint','done');
    box.style.cssText='display:block;width:100%;box-sizing:border-box;margin:0.4em 0 0.2em;padding:0.55em 0.6em;font-size:1.05em;border:2px solid #1a73e8;border-radius:6px;background:#fff;color:#000';
    box.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();box.blur();}});
    box.addEventListener('blur',function(){apply();});
    sel.parentNode.insertBefore(box,sel.nextSibling);
  }
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
        h.style.cssText='display:block;pointer-events:none;margin:0.9em 0.5em 0.1em;padding-bottom:0.2em;border-bottom:2px solid #41577E;color:#41577E;font-weight:700;font-size:1.05em;text-align:left';
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

  // Keep the box in step with the order on screen (new order = empty box; opening an order shows its name).
  setInterval(function(){
    watchGrid();organize();
    addBox();
    var box=document.getElementById(BOX_ID);if(!box||document.activeElement===box||applying)return;
    var o=order();var name=(o&&o.customer_name)||'';
    if(box.value!==name){box.value=name;applied=name;}
  },400);
  addBox();
})();
