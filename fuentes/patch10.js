const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,90));s=s.replace(a,()=>b)};
// ---- NAV: la configuración vive en Parametrización ----
rep("['#/limit-control/limit-config','Configuración','sliders','limitcfg','Gestiona límites, parámetros y ajustes del sistema.'],","");
rep("desc:'Parametrización y evaluación de límites de inversión.'","desc:'Seguimiento del cumplimiento de los límites definidos en Parametrización.'");
rep(",['#/performance-attribution/benchmarks','Benchmarks','sliders','pabench','Composición del benchmark de cada portafolio.']","");
rep("['#/parametrizacion/indices','Índices de referencia','network','pindex','Índices que componen los benchmarks.'],","['#/parametrizacion/indices','Índices de referencia','network','pindex','Índices que componen los benchmarks.'],['#/parametrizacion/benchmarks','Benchmarks','sliders','pabench','Composición del benchmark de cada portafolio.'],['#/parametrizacion/limits','Configuración de límites','limits','limitcfg','Límites por emisor, calificación, moneda y plazo.'],");
rep("desc:'Flujo de órdenes y maestros que alimentan el Front de inversiones.'","desc:'Flujo de órdenes, maestros, benchmarks y límites que alimentan el Front de inversiones.'");
// ---- Evaluación de límites: pantalla propia (utilización) ----
const old="PAGES.limitcfg=limitsPage('Configuración de límites','Gestiona límites, parámetros y ajustes del sistema.');PAGES.limiteval=limitsPage('Evaluación de límites','Consulta y administra los límites que se evalúan sobre cada portafolio.');";
const nw=`PAGES.limitcfg=limitsPage('Configuración de límites','Define los límites por emisor, calificación, moneda, plazo y otros criterios.');
function evalRows(){return LIMITS.filter(l=>l.activo).map(l=>{const r=rng(hash(l.port+l.tipo+l.sub+l.eval)),demo=(l.port===PNAMES[0]&&l.tipo==='EMISOR'&&l.eval==='MAX'&&Math.abs(l.pct-0.2)<1e-9);let actual,uso,estado;
 if(l.eval==='MAX'){uso=demo?0.92:(hash(l.sub+l.port)%11===0?1.06:0.35+r()*0.5);actual=l.pct*uso;estado=uso>=1?'Incumple':uso>=0.9?'Alerta':'Cumple'}
 else{uso=(hash(l.sub+l.port)%7===0)?0.85:1.08+r()*0.4;actual=l.pct*uso;estado=uso<1?'Incumple':'Cumple'}
 return {port:l.port,tipo:l.tipo,sub:l.sub,eval:l.eval,pct:l.pct,actual,uso,estado}})}
const EST_EV={Cumple:'success',Alerta:'warning',Incumple:'danger'};
PAGES.limiteval=crudPage({title:'Evaluación de límites',help:'Seguimiento del cumplimiento de los límites definidos en Parametrización.',noNew:true,fileName:'evaluacion-limites',defaultSort:'Utilización',defaultDir:-1,searchPh:'Portafolio, tipo o sublímite...',noun:'límites',
 filters:[{id:'p',label:'Portafolio',opts:()=>PNAMES.slice(0,9),get:r=>r.port},{id:'e',label:'Evaluación',opts:()=>['MAX','MIN'],get:r=>r.eval},{id:'s',label:'Estado',opts:()=>['Cumple','Alerta','Incumple'],get:r=>r.estado}],
 kpis:rows=>[['Límites evaluados',rows.length,'p'],['Cumplen',rows.filter(r=>r.estado==='Cumple').length,'g'],['En alerta',rows.filter(r=>r.estado==='Alerta').length,'y'],['Incumplen',rows.filter(r=>r.estado==='Incumple').length,'r']],
 cols:[{h:'Portafolio',k:'port'},{h:'Tipo de límite',k:'tipo'},{h:'Sublímite',k:'sub'},{h:'Evaluación',k:'eval',html:r=>badge(r.eval,r.eval==='MAX'?'danger':'info'),txt:r=>r.eval,tip:'MAX: tope que no se puede superar · MIN: piso mínimo a mantener'},{h:'Límite',k:'pct',fmt:v=>pc2(v*100)},{h:'Posición actual',k:'actual',fmt:v=>pc2(v*100)},{h:'Utilización',k:'uso',sortable:true,tip:'Posición actual dividida por el límite. En alerta desde 90%; incumple al superar el 100% de un tope.',html:r=>'<div style="min-width:110px">'+pc2(r.uso*100)+'<div class="mk-util"><div class="mk-util__b'+(r.estado==='Incumple'?' hi':'')+'" style="width:'+Math.min(100,r.uso*100)+'%"></div></div></div>',txt:r=>pc2(r.uso*100)}],
 rows:evalRows,estado:r=>badge(r.estado,EST_EV[r.estado],true),acts:()=>[['ver']],
 detail:r=>[['Portafolio',esc(r.port)],['Tipo de límite',r.tipo],['Sublímite',esc(r.sub)],['Evaluación',r.eval==='MAX'?'MAX (tope)':'MIN (piso)'],['Límite',pc2(r.pct*100)],['Posición actual',pc2(r.actual*100)],['Utilización',pc2(r.uso*100)],['Estado',r.estado]],detailTitle:r=>'Límite · '+r.tipo,badges:r=>badge(r.estado,EST_EV[r.estado]),
 form:()=>({html:'',read:()=>({ok:false})}),review:()=>[],onSave:()=>{},entity:'',entityArt:'',toggle:()=>({})
});`;
rep(old,nw);
fs.writeFileSync('mk.js',s);console.log('ok');
