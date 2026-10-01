const S={hash:'',pais:'Colombia',token:0,open:{}};
/* =============== FASE 1 · Módulos externos, precarga, eventos y derivados (núcleo) =============== */
/* Regla transversal: todo dato que otro módulo ya tiene se trae precargado del módulo dueño; el gestor no lo digita. */
const MODS={derivados:'Derivados',newinv:'New Inversiones',adminfondo:'Administración del fondo',adminactivos:'Administración de activos y crédito',contabilidad:'Contabilidad',cumplimiento:'Cumplimiento'};
/* SUPUESTO: días transcurridos desde la última lectura de cada módulo (Administración del fondo llega con 3 días: demuestra la advertencia y el botón Refrescar). */
const SRC_AGE={derivados:0,newinv:0,adminfondo:3,adminactivos:1,contabilidad:0,cumplimiento:0};
/* SUPUESTO: parámetros ilustrativos y editables (Parametrización › Flujo de órdenes). No son normas: por definir con Compliance. */
const PARAMS={minQuotes:3,tol:0.5,staleDays:2,valMonths:12};
const USERS=['Ramiro Giraldo Colorado','Laura Medina','Camilo Ortega','Paula Rincón'];
const EVENTS=[
 {tipo:'Orden ejecutada',ref:'DV-0001',det:'Forward USD/COP · FIC BALANCEADO GLOBAL · confirmada',dest:'contabilidad',ts:new Date(2026,8,28,10).getTime()},
 {tipo:'Límite excedido',ref:'LIM-0412',det:'Cupo de BANCOLOMBIA S.A. al 93,33 % · aviso al módulo de Cumplimiento',dest:'cumplimiento',ts:new Date(2026,8,29,15).getTime()},
 {tipo:'Orden ejecutada',ref:'DV-0006',det:'Swap IBR 3M · FIC RENTA FIJA LARGO PLAZO · confirmada',dest:'contabilidad',ts:new Date(2026,8,30,9).getTime()}
];
const srcDate=m=>new Date(fromIso(OPDATE)-SRC_AGE[m]*864e5);
const srcChip=m=>{const stale=SRC_AGE[m]>PARAMS.staleDays;return '<span class="mk-srcchip'+(stale?' is-stale':'')+'" data-srcchip="'+m+'"><span>Fuente: <b>'+esc(MODS[m])+'</b> · actualizado '+fmtD(srcDate(m).getTime())+'</span>'+(stale?'<span class="mk-badge mk-badge--warning">desactualizado</span>':'')+'<button type="button" class="mk-srcchip__r" data-refresh="'+m+'"'+TIP('Vuelve a leer los datos desde el módulo dueño')+'>Refrescar</button></span>'};
document.addEventListener('click',e=>{const b=e.target.closest('[data-refresh]');if(!b)return;e.preventDefault();e.stopPropagation();const m=b.dataset.refresh;SRC_AGE[m]=0;$$('[data-srcchip="'+m+'"]').forEach(el=>{el.outerHTML=srcChip(m)});toast('Se leyeron de nuevo los datos de '+MODS[m]+'.','success','Datos actualizados')},true);
function instInfo(name){const n=normH(name),r=INSTRUMENTS.find(i=>normH(i.mnem)===n),h=hash(String(name));
 if(r)return {emisor:r.emisor,moneda:r.moneda,tipo:r.tipo,valor:80+(hash(r.mnem)%4000)/100};
 const vi=VI_LIST().some(x=>normH(x)===n);return {emisor:ISSUERS[h%ISSUERS.length],moneda:MONEDAS()[0],tipo:vi?'ACCIÓN':'—',valor:vi?1000+h%30000:80+(h%4000)/100}}
/* preload(módulo, clave): devuelve {data, mod, asOf}. Simula la lectura del módulo dueño. */
function preload(mod,key,arg){const asOf=srcDate(mod).getTime();let data=null;
 if(mod==='newinv'&&/^instr:/.test(key))data=instInfo(key.slice(6));
 else if(mod==='newinv'&&/^rate:/.test(key)){const r=MM_RATES.find(x=>x.code===key.slice(5))||MM_RATES[1];data={code:r.code,valor:r.valor}}
 else if(mod==='derivados'&&key==='indicativo')data=derivIndicative(arg);
 else if(mod==='adminfondo'&&key==='flujos'){const r=rng(hash(arg));data=Array.from({length:12},(_,i)=>({mes:MONTHS[i],neto:Math.round((r()-0.35)*8e8)}))}
 else if(mod==='adminactivos'&&key==='flujos'){const r=rng(hash(arg+'a'));data=Array.from({length:12},(_,i)=>({mes:MONTHS[i],canon:Math.round((0.8+r()*0.4)*3.2e8),perdida:Math.round(r()*2.5e7),desemb:Math.round(r()*1.6e9*(i<6?1:0.4)),cartera:Math.round((0.8+r()*0.5)*2.4e8)}))}
 return {data,mod:MODS[mod],asOf}}
function publishEvent(tipo,ref,det,dest){EVENTS.unshift({tipo,ref,det,dest,ts:Date.now()});}
function openEvents(){const m=openModal({title:'Eventos publicados',sub:'Eventos que el Front publica para otros módulos (contrato entre módulos). Solo lectura.',cls:'mk-modal--form',body:'<div id="evt"></div>',foot:'<button class="mk-btn mk-btn--secondary" data-c>Cerrar</button>'});$('[data-c]',m.el).addEventListener('click',m.close);
 DataTable($('#evt',m.el),{cols:[{h:'Fecha y hora',k:'ts',fmt:v=>new Date(v).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}),sortable:true},{h:'Evento',k:'tipo',html:r=>badge(r.tipo,r.tipo==='Límite excedido'?'danger':r.tipo==='Decisión aprobada'?'success':r.tipo==='Avalúo registrado'?'warning':'info'),txt:r=>r.tipo},{h:'Referencia',k:'ref'},{h:'Detalle',k:'det'},{h:'Módulo destino',k:'dest',html:r=>esc(MODS[r.dest]||r.dest),txt:r=>MODS[r.dest]||r.dest}],rows:()=>EVENTS,searchPh:'Evento, referencia o detalle...',fileName:'eventos-publicados',defaultSort:'Fecha y hora',defaultDir:-1,noun:'eventos',pageSize:8})}
/* Naturaleza de los límites. SUPUESTO: el cupo por contraparte y las concentraciones propias del gestor son INTERNOS (se pueden exceder con aprobación registrada); el resto (emisor, calificación, macroactivo, moneda, plazo, propósito y sobrecobertura) se tratan como NORMATIVOS y bloquean. Ramiro/Compliance los confirman. */
const NAT_INT=['CONTRAPARTE','CONTRAPARTE POTENCIAL'];
function natOf(l){return l.nat||(NAT_INT.includes(l.tipo)?'Interno':'Normativo')}
const natB=n=>badge(n,n==='Normativo'?'danger':'info');

/* ---------- Derivados: datos ---------- */
/* SUPUESTO: spot, tasa en USD y factores de exposición potencial son ilustrativos; las convenciones de mercado por país las valida Ramiro (base de días, calendario, fixing). */
const DERIV_P={'Colombia':{mon:'COP',par:'USD/COP',unit:'COP por USD',ref:'IBR',spot:4000,inst:['Forward','Swap','Opción','Futuro']},'Chile':{mon:'CLP',par:'USD/CLP',unit:'CLP por USD',ref:'TAB',spot:950,inst:['Forward','Swap','Opción']},'República Dominicana':{mon:'DOP',par:'USD/DOP',unit:'DOP por USD',ref:'TASA REFERENCIA',spot:60,inst:['Forward','Swap']},'Panamá':{mon:'PAB',par:'EUR/USD',unit:'USD por EUR',ref:'SOFR',spot:1.08*4000/4000,inst:['Forward','Swap']}};
const dp=()=>DERIV_P[S.pais];
const DERIV_INST=()=>dp().inst.slice();
const DERIV_STATES=['En cotización','Por justificar','Registrada','Confirmada','Anulada'];
const DERIV_BASE={Forward:0.15,Swap:0.08,'Opción':0.12,Futuro:0.05};
const pfe=(inst,noc,plazo)=>noc*(DERIV_BASE[inst]||0.1)*Math.sqrt(Math.max(plazo,30)/365);
function derivIndicative(q){const d=dp(),t=q.plazo/365,r=(MM_RATES[2]?MM_RATES[2].valor:10.4)/100,ru=0.043;let v,u;
 if(q.inst==='Swap'){v=(r+0.0015+0.001*t)*100;u='% E.A. (tasa fija)'}
 else if(q.inst==='Opción'){v=0.8*Math.sqrt(t)*(1+r);u='% del nocional (prima)'}
 else{v=d.spot*(1+r*t)/(1+ru*t);u=d.unit}
 return {valor:v,unidad:u,curva:'Curva '+d.ref+' y curva en USD (ilustrativa)',fecha:fromIso(OPDATE)}}
const fmtInd=(v,u)=>/%/.test(u)?f2(v)+' %':f2(v);
const DERIV_SEED=[
 ['DV-0001','FIC BALANCEADO GLOBAL','Forward','USD/COP',4800000000,90,'Cobertura','BANCO DAVIVIENDA','Confirmada',[2026,8,22],'Laura Medina','Camilo Ortega',0,''],
 ['DV-0002','FIC BALANCEADO GLOBAL','Swap','IBR 3M',5000000000,365,'Cobertura','BANCO DE BOGOTÁ','Registrada',[2026,8,28],'Camilo Ortega',null,0,''],
 ['DV-0003','FIC BALANCEADO 1','Forward','USD/COP',3600000000,60,'Cobertura','BANCO DE BOGOTÁ','Confirmada',[2026,8,15],'Laura Medina','Ramiro Giraldo Colorado',1,'Se eligió la segunda cotización por mejor liquidación en la fecha de cumplimiento y menor riesgo operativo con la contraparte; la diferencia frente a la mejor oferta está dentro de la tolerancia.'],
 ['DV-0004','FIC BALANCEADO 1','Opción','USD/COP',2000000000,120,'Cobertura','BANCO DAVIVIENDA','Registrada',[2026,8,29],'Paula Rincón',null,0,''],
 ['DV-0005','FIC BALANCEADO GLOBAL','Futuro','USD/COP',1200000000,30,'Posición propia','BANCO DAVIVIENDA','Confirmada',[2026,8,10],'Laura Medina','Camilo Ortega',0,''],
 ['DV-0006','FIC RENTA FIJA LARGO PLAZO','Swap','IBR 3M',8000000000,365,'Cobertura','BANCO DAVIVIENDA','Confirmada',[2026,8,8],'Camilo Ortega','Paula Rincón',1,'La mejor cotización no cumple con el plazo de liquidación exigido por el comité; se eligió la segunda opción, que queda dentro de la tolerancia frente al valor indicativo.'],
 ['DV-0007','FIC BALANCEADO 1','Forward','USD/COP',2400000000,90,'Cobertura',null,'En cotización',[2026,8,30],'Ramiro Giraldo Colorado',null,0,''],
 ['DV-0008','FIC BALANCEADO GLOBAL','Forward','USD/COP',3000000000,180,'Cobertura','BANCO DE BOGOTÁ','Por justificar',[2026,8,30],'Laura Medina',null,0,'']
];
const QCPS=['BANCOLOMBIA S.A.','BANCO DAVIVIENDA','BANCO DE BOGOTÁ'];
const qcps=()=>S.pais==='Colombia'?QCPS:QCPS.map(loc);
function seedQuotes(o,second){const ind=derivIndicative(o),k=/%/.test(ind.unidad)?0.002*ind.valor:ind.valor*0.0012,others=qcps().filter(c=>c!==o.cp).slice(0,2),order=second?[others[0],o.cp,others[1]]:[o.cp,others[0],others[1]],hs=["09:42","10:05","10:31"],fs=["Teléfono","Plataforma","Chat"];
 return order.map((cp,i)=>({cp,precio:+(ind.valor+(i-1)*k).toFixed(4),hora:hs[i],fuente:fs[i]}))}
const DERIV_ORDERS=DERIV_SEED.map(a=>{const o={id:a[0],port:a[1],inst:a[2],sub:a[3],noc:a[4],plazo:a[5],prop:a[6],cp:a[7],estado:a[8],fecha:mkDate(a[9][0],a[9][1],a[9][2]).getTime(),uReg:a[10],uConf:a[11],just:a[13],quotes:[],evId:null,precio:null,apr:null};
 if(o.id==="DV-0007"){o.quotes=seedQuotes(Object.assign({},o,{cp:QCPS[0]}),false).slice(0,2)}
 else{o.quotes=seedQuotes(o,!!a[12]||o.id==="DV-0008");o.precio=o.quotes.find(q=>q.cp===o.cp).precio}
 return o}).sort((a,b)=>b.id<a.id?-1:1);
const DERIV_EVID=[];
DERIV_ORDERS.filter(o=>o.precio!=null&&['Registrada','Confirmada'].includes(o.estado)).forEach((o,i)=>{const ind=derivIndicative(o),best=o.quotes.slice().sort((x,y)=>x.precio-y.precio)[0];o.evId='EV-'+String(DERIV_EVID.length+1).padStart(4,'0');
 DERIV_EVID.push({id:o.evId,ord:o.id,ver:1,cp:o.cp,precio:o.precio,hora:(o.quotes.find(q=>q.cp===o.cp)||{}).hora,indicativo:ind.valor,unidad:ind.unidad,mejor:best.cp,just:o.just,user:o.uReg,fecha:o.fecha,quotes:o.quotes.map(q=>Object.assign({},q)),nota:''})});
/* Exposición bruta por portafolio y subyacente. SUPUESTO: cifras ilustrativas. */
const DERIV_EXPO=[['FIC BALANCEADO GLOBAL','USD/COP',12000000000],['FIC BALANCEADO GLOBAL','IBR 3M',7000000000],['FIC BALANCEADO 1','USD/COP',6000000000],['FIC RENTA FIJA LARGO PLAZO','IBR 3M',12000000000]].map(a=>({port:a[0],sub:a[1],bruta:a[2]}));
const MTMS={'DV-0001':38500000,'DV-0002':-12400000,'DV-0003':21800000,'DV-0004':9600000,'DV-0005':-4300000,'DV-0006':-31200000};
const DERIV_POS=DERIV_ORDERS.filter(o=>MTMS[o.id]!==undefined).map(o=>({ord:o.id,port:o.port,inst:o.inst,sub:o.sub,noc:o.noc,plazo:o.plazo,rest:Math.max(3,Math.round(o.plazo*0.62)),prop:o.prop,cp:o.cp,mtm:MTMS[o.id],delta:o.inst==='Opción'?0.46:null,vega:o.inst==='Opción'?132000:null}));
const hedged=(port,sub)=>DERIV_POS.filter(p=>p.port===port&&p.sub===sub&&p.prop==='Cobertura').reduce((a,p)=>a+p.noc,0);
const cpPfe=n=>DERIV_POS.filter(p=>p.cp===n).reduce((a,p)=>a+pfe(p.inst,p.noc,p.plazo),0);
const cpTotal=n=>cpUsed(n)+cpPfe(n);
const hasDeriv=port=>DERIV_POS.some(p=>p.port===port&&p.prop==='Cobertura');
/* Validación de límites para una orden de derivado. 'cp' es opcional: el cupo se evalúa cuando ya hay contraparte elegida. */
function limitCheck(q,cp){const out=[],P=PORTS.find(p=>p.name===q.port);
 const solo=P&&P.soloCob&&q.prop==='Posición propia';
 out.push({n:'Restricción por propósito',nat:'Normativo',det:solo?q.port+' solo admite operaciones de cobertura; no puede abrir posición propia.':'Propósito permitido para '+q.port+'.',estado:solo?'Excedido':'Cumple'});
 if(q.prop==='Cobertura'){const ex=DERIV_EXPO.find(e=>e.port===q.port&&e.sub===q.sub),cob=hedged(q.port,q.sub)+q.noc;
  const over=!ex||cob>ex.bruta+1;out.push({n:'Cobertura sobre exposición bruta',nat:'Normativo',det:!ex?'No hay exposición bruta en '+q.sub+' para cubrir.':'Cobertura total '+money(cob)+' frente a exposición bruta '+money(ex.bruta)+' ('+pct(cob/ex.bruta,1)+').',estado:over?'Excedido':(cob/ex.bruta>=0.9?'Alerta':'Cumple')})}
 if(cp){const c=MM_CP.find(x=>x.name===cp),add=pfe(q.inst,q.noc,q.plazo),tot=c?(cpTotal(cp)+add)/c.cupo:0;
  out.push({n:'Cupo de contraparte (exposición potencial)',nat:'Interno',det:cp+': '+pct(tot,1)+' del cupo con esta orden (exposición potencial nueva '+money(add)+').',estado:tot>1?'Excedido':tot>=0.9?'Alerta':'Cumple'})}
 return {checks:out,blocked:out.some(x=>x.nat==='Normativo'&&x.estado==='Excedido'),needApproval:out.some(x=>x.nat==='Interno'&&x.estado==='Excedido')}}
const nextId=(p,arr)=>p+'-'+String(arr.length+1).padStart(4,'0');
const DERIV_FIELDS_NOTE='Dato de mercado ilustrativo';
