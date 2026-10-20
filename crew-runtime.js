"use strict";
const $=s=>document.querySelector(s),STORE='mp_walkthrough_v1';
function readMain(){try{const v=JSON.parse(localStorage.getItem(STORE)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return {}}}
const original=readMain();let hall='DH1',storageOK=true;
const S={lang:'en',scope:{building:'CBL5'},jobRuns:original.crewTasks||{},operations:{blockers:[],meta:{}},profile:{},shiftNotes:{}};
const scope=$('#scope');for(const b of ['CB4','CB5'])for(let h=1;h<=4;h++){const o=document.createElement('option');o.value=b+'_DH'+h;o.textContent=b+' / DH'+h;scope.append(o)}scope.value=/^CB[45]_DH[1-4]$/.test(original.activeHall)?original.activeHall:'CB5_DH1';
function applyScope(){const [b,h]=scope.value.split('_');S.scope.building=b==='CB4'?'CBL4':'CBL5';hall=h}applyScope();
const stamp=()=>new Date().toISOString(),canonicalBuilding=b=>b==='CB4'?'CBL4':b==='CB5'?'CBL5':b,buildingLabel=b=>b.replace('CBL','CB'),tx=(a,b)=>S.lang==='es'?b:a;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(s){$('#toast').textContent=s;$('#toast').style.display='block'}
function persist(){try{const latest=readMain();latest.crewTasks=S.jobRuns;localStorage.setItem(STORE,JSON.stringify(latest));storageOK=true;$('#toast').style.display='none'}catch{storageOK=false}}
function modal(title,body){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=body;$('#modal').open=true;window.scrollTo(0,0);$('#modalTitle').setAttribute('tabindex','-1');$('#modalTitle').focus()}
$('#modal').close=()=>{};
function on(id,event,fn){const e=$('#'+id);if(e)e.addEventListener(event,fn)}
function safeExtras(x){return x}function validateImport(x){return x}function mergePayloads(){return {}}
function currentReportPrefs(){return {}}function nyWall(s){return s}function reportText(){return ''}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function csv(name,rows){const keys=Object.keys(rows[0]||{building:'',hall:'',reference:'',checkpoints:'',status:''}),cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';download(name,'\ufeff'+[keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8')}
function go(page){location.href='./index.html#/'+(page==='report'?'report':'home')}
let labelTab='';function enqueueLabel(){location.href='./guide.html'}
function openPDF(n){modal(tx('Reference detail','Detalle de referencia'),'<p>'+tx('Project reference page: ','Página de referencia del proyecto: ')+n+'</p><p>'+tx('Use the current approved project guide and cutsheet.','Usa la guía y cutsheet aprobados vigentes.')+'</p><a href="./guide.html">'+tx('Open cable field guide','Abrir guía de cables')+'</a>')}
scope.onchange=()=>{applyScope();jobBoard()};$('#lang').onclick=()=>{S.lang=S.lang==='en'?'es':'en';document.documentElement.lang=S.lang;$('#lang').textContent=S.lang==='en'?'Español':'English';$('#title').textContent=tx('Crew checkpoints','Controles de cuadrilla');$('#locationLabel').textContent=tx('Location','Ubicación');jobBoard()};
