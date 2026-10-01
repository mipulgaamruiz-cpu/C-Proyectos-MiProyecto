const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,100));s=s.replace(a,()=>b)};
const repRe=(re,b)=>{if(!re.test(s))throw new Error('regex missing: '+re);s=s.replace(re,()=>b)};

/* ---------- 1. Quitar letreros ---------- */
repRe(/\+alertB\('info','Datos de ejemplo','[^']*',true\)/,'');
repRe(/\+alertB\('warning','Supuestos del prototipo','[^']*',false\)/,'');
repRe(/alertB\('info','Catálogos de consulta','[^']*',true\)\+/,'');
rep("toast('Se cargaron los datos de ejemplo de '+c+' ('+MON_P[c][0]+'). Las ediciones hechas antes del cambio se reinician.','info','País: '+c)","toast('Se actualizaron emisores, monedas e índices ('+MON_P[c][0]+').','info','País: '+c)");

/* ---------- 2. Tooltips que no se quedan fijos ---------- */
{const a=s.indexOf('/* Tooltips (capa flotante, no se recortan) */'),b=s.indexOf('/* Toast (Sonner) */');if(a<0||b<0)throw new Error('tooltips block');
s=s.slice(0,a)+`/* Tooltips (capa flotante): aparecen al pasar el cursor o con teclado y se ocultan siempre */
let tipT=null,tipFor=null;
function hideTip(){const tp=$('#mkTip');if(tp)tp.classList.remove('show');tipFor=null;clearTimeout(tipT)}
function showTip(t){const tp=$('#mkTip');if(!tp||!t.dataset.tip)return;tp.textContent=t.dataset.tip;tp.classList.add('show');const r=t.getBoundingClientRect(),w=tp.offsetWidth,h=tp.offsetHeight;let x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)),y=r.top-h-8;if(y<8)y=r.bottom+8;tp.style.left=x+'px';tp.style.top=y+'px';tipFor=t;clearTimeout(tipT);tipT=setTimeout(hideTip,6000)}
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(t){if(t!==tipFor)showTip(t)}else if(tipFor)hideTip()});
document.addEventListener('mouseout',e=>{if(tipFor&&!(e.relatedTarget&&tipFor.contains&&tipFor.contains(e.relatedTarget)))hideTip()});
document.addEventListener('mousemove',e=>{if(tipFor&&(!tipFor.isConnected||!tipFor.contains(e.target)))hideTip()});
document.addEventListener('focusin',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(t&&e.target.matches&&e.target.matches(':focus-visible'))showTip(t)});
document.addEventListener('focusout',hideTip);
['mousedown','keydown','scroll','wheel','touchstart'].forEach(ev=>document.addEventListener(ev,hideTip,true));
window.addEventListener('blur',hideTip);

`+s.slice(b)}
rep("function openModal(o){","function openModal(o){hideTip();");
rep("$$('.mk-modal-overlay').forEach(m=>m.remove());","hideTip();$$('.mk-modal-overlay').forEach(m=>m.remove());");

/* ---------- 3. Fecha operativa, rango de fechas, carga masiva (helpers) ---------- */
rep("const valC=(v,txt)=>","const OPDATE=(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})();\nconst dfac=d=>d===OPDATE?1:1+((hash(d)%21)-10)/200;\nconst TIP_OP='Fecha operativa. Viene con el día en curso y muestra la foto a ese día: lo del día y lo que siga abierto de días anteriores. Puedes cambiarla para ver otro día; no se deja en blanco, porque una pantalla operativa siempre trabaja sobre un día.';\nconst perKey=(a,b)=>{const n=(new Date(b)-new Date(a))/864e5;return n<=35?'MTD':n<=300?'YTD':n<=420?'12M':'SI'};\nconst valC=(v,txt)=>");
rep("/* Tooltips (capa flotante)","/* Campos de fecha */\nconst opField=v=>fld('Fecha operativa','<div class=\"mk-datepicker\"><input class=\"mk-input\" type=\"date\" name=\"op\" value=\"'+v+'\"></div>',{tip:TIP_OP,name:'op'});\nconst rangeFields=(d1,d2,ctx,pre)=>{pre=pre||'';return fld('Fecha inicial','<div class=\"mk-datepicker\"><input class=\"mk-input\" type=\"date\" name=\"'+pre+'d1\" value=\"'+(d1||'')+'\"></div>',{tip:'Inicio de '+ctx+'. Déjala en blanco para no limitar desde el principio.',name:pre+'d1'})+fld('Fecha final','<div class=\"mk-datepicker\"><input class=\"mk-input\" type=\"date\" name=\"'+pre+'d2\" value=\"'+(d2||'')+'\"></div>',{tip:'Fin de '+ctx+'. Debe ser igual o posterior a la fecha inicial.',name:pre+'d2'})};\nfunction bindOp(root,st,onChange){const i=$('[name=op]',root);if(!i)return;i.addEventListener('change',()=>{if(!i.value){i.value=st.op||OPDATE;toast('La fecha operativa no se deja en blanco; se restableció el último día válido.','warning','Fecha operativa');return}st.op=i.value;onChange&&onChange()})}\n/* Tooltips (capa flotante)");

/* ---------- 4. DataTable: fecha operativa + rango ---------- */
rep("const st={q:'',page:1,sort:o.defaultSort||null,dir:o.defaultDir||1,f:{}};","const st={q:'',page:1,sort:o.defaultSort||null,dir:o.defaultDir||1,f:{},d1:'',d2:'',op:OPDATE};");
rep("const rowsAll=()=>o.rows();","const rowsAll=()=>o.rows(st);");
rep("(o.filters||[]).forEach(fl=>{const v=st.f[fl.id];if(v)rows=rows.filter(r=>String(fl.get(r))===v)});","(o.filters||[]).forEach(fl=>{const v=st.f[fl.id];if(v)rows=rows.filter(r=>String(fl.get(r))===v)});\n  if(o.dateRange){const a=st.d1?new Date(st.d1+'T00:00:00').getTime():null,b=st.d2?new Date(st.d2+'T23:59:59').getTime():null;rows=rows.filter(r=>{const t=r[o.dateRange.k];return (!a||t>=a)&&(!b||t<=b)})}");
rep("esc(st.q)+'\"></div>'+(o.filters||[]).map(fl=>","esc(st.q)+'\"></div>'+(o.opDate?opField(st.op):'')+(o.dateRange?rangeFields(st.d1,st.d2,'la '+o.dateRange.label):'')+(o.filters||[]).map(fl=>");
rep("$$('[data-fl]',host).forEach(s=>s.addEventListener('change',()=>{st.f[s.dataset.fl]=s.value;st.page=1;render()}));","$$('[data-fl]',host).forEach(s=>s.addEventListener('change',()=>{st.f[s.dataset.fl]=s.value;st.page=1;render()}));\n  $$('[name=d1],[name=d2]',host).forEach(i=>i.addEventListener('change',()=>{const n=i.name,prev=st[n];st[n]=i.value;if(st.d1&&st.d2&&st.d1>st.d2){st[n]=prev;toast('La fecha inicial no puede ser posterior a la final.','warning','Rango de fechas');render();return}st.page=1;render()}));\n  const opi=$('[name=op]',host);if(opi)opi.addEventListener('change',()=>{if(!opi.value){opi.value=st.op;toast('La fecha operativa no se deja en blanco; se restableció el último día válido.','warning','Fecha operativa');return}st.op=opi.value;st.page=1;render()});");
rep("cl.addEventListener('click',()=>{st.q='';st.f={};st.page=1;render()});","cl.addEventListener('click',()=>{st.q='';st.f={};st.d1='';st.d2='';st.page=1;render()});");
rep("filters:cfg.filters,acts:cfg.acts","filters:cfg.filters,dateRange:cfg.dateRange,opDate:cfg.opDate,acts:cfg.acts");

/* ---------- 5. Carga masiva: componente y pestañas ---------- */
rep("const APO={",`const MASS={
 fixed:{id:'fixed',nombre:'Órdenes de Renta Fija',cols:[['Portafolio',1,'Nombre exacto del maestro de Portafolios','FIC RENTA FIJA'],['Tipo',1,'COMPRA o VENTA','COMPRA'],['Instrumento',1,'Nemotécnico del maestro de Instrumentos','TFIT11090233'],['Cantidad',1,'Número mayor a 0','1000000'],['Tasa de negociación',0,'Porcentaje, con punto decimal','10.50'],['Valor giro',0,'Valor en moneda del portafolio','1094250']],descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de los maestros de portafolios e instrumentos.',descM:'Instructivo campo por campo, con valores permitidos y errores frecuentes en órdenes de renta fija.'},
 variable:{id:'variable',nombre:'Órdenes de Renta Variable',cols:[['Portafolio',1,'Nombre exacto del maestro de Portafolios','FIC BALANCEADO 1'],['Tipo',1,'COMPRA o VENTA','COMPRA'],['Instrumento',1,'Nemotécnico de la acción','ECOPETROL'],['Modalidad',1,'MERCADO o LIMITE','LIMITE'],['Cantidad',1,'Número mayor a 0','10000'],['Precio límite',0,'Obligatorio si la modalidad es LIMITE','2500']],descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de los maestros de portafolios y emisores.',descM:'Instructivo campo por campo, con valores permitidos y errores frecuentes en órdenes de renta variable.'},
 instr:{id:'instr',nombre:'Instrumentos',cols:[['Nemotécnico',1,'Código único del instrumento','TFIT11090233'],['Tipo',1,'Tipo de instrumento del catálogo','TASA FIJA'],['ISIN',0,'Código internacional de 12 caracteres','CO000000000X'],['Moneda',1,'Moneda del catálogo','COP'],['Tasa facial',0,'Porcentaje, con punto decimal','7.25'],['Periodicidad',0,'Código de periodicidad de pago','SV'],['Fecha emisión',1,'Formato AAAA-MM-DD','2024-01-15'],['Fecha vencimiento',1,'Posterior a la emisión, AAAA-MM-DD','2030-01-15'],['Emisor',0,'Nombre del catálogo de emisores','MINISTERIO DE HACIENDA (TES)'],['Calificación',0,'Escala del catálogo de calificaciones','AAA']],descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de los catálogos de tipos, monedas, emisores y calificaciones.',descM:'Instructivo campo por campo, con valores permitidos y errores frecuentes en la carga de instrumentos.'},
 bench:{id:'bench',nombre:'Composición de Benchmarks',cols:[['Portafolio',1,'Nombre exacto del maestro de Portafolios','FIC RENTA FIJA'],['Benchmark',1,'Nombre del benchmark compuesto','Benchmark FIC Renta Fija'],['Componente',1,'Código del maestro de Índices de referencia','IBR 3M'],['Peso',1,'Porcentaje; los pesos de un benchmark suman 100','60'],['Vigente desde',1,'Formato AAAA-MM-DD','2025-01-02']],descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de los maestros de portafolios e índices de referencia.',descM:'Instructivo campo por campo, con valores permitidos y errores frecuentes al importar la composición de benchmarks.'}
};
function massHTML(m){
 const dl=(k,t)=>'<button class="mk-iconbtn mk-iconbtn--view" type="button" data-dl="'+k+'"'+TIP(t)+' aria-label="'+t+'">'+ic('download')+'</button>';
 const th=(t,tip)=>'<th><span class="mk-th-info">'+t+info(tip)+'</span></th>';
 return '<fieldset class="mk-fieldset"><legend>Documentos</legend><p class="mk-help mk-mb">Descarga aquí la estructura de la plantilla y el manual antes de preparar el archivo.</p><div class="mk-tablewrap"><table class="mk-table"><thead><tr>'+th('Documento','Nombre del documento de apoyo para la carga.')+th('Descripción','Qué contiene el documento.')+th('Archivo','Descarga el documento.')+'</tr></thead><tbody><tr><td><b>Estructura de Cargue Masivo de '+esc(m.nombre)+'</b> <span class="mk-badge mk-badge--success" style="padding:2px 10px;font-size:11px">Excel</span></td><td>'+m.descE+'</td><td>'+dl('estructura','Descargar la estructura (Excel)')+'</td></tr><tr><td><b>Manual Cargue Masivo de '+esc(m.nombre)+'</b></td><td>'+m.descM+'</td><td>'+dl('manual','Descargar el manual')+'</td></tr></tbody></table></div></fieldset>'
 +'<fieldset class="mk-fieldset"><legend>Importación Masiva</legend><div class="mk-field"><label class="mk-label"><span>Archivo</span><span class="req">*</span>'+info('Archivo .xlsx o .csv con la estructura descargada. Máximo 5.000 filas.')+'</label></div><div class="mk-massrow"><div class="mk-fileupload" data-up tabindex="0" role="button" aria-label="Seleccionar archivo">'+ic('upload','lg')+'<div style="margin-top:6px"><strong>Seleccionar archivo</strong> o arrastrarlo a esta zona</div><div class="mk-help" style="margin-top:4px">Formatos .xlsx y .csv · hasta 5.000 filas</div><input type="file" accept=".xlsx,.csv" hidden></div><div class="mk-massside"><input class="mk-input" data-fname readonly placeholder="Ningún archivo seleccionado"><button class="mk-btn" type="button" data-proc disabled>Procesar</button></div></div><div data-result class="mk-mt"></div></fieldset>';
}
function bindMass(root,m){
 const base=m.nombre.replace(/\\s+/g,'_');
 $$('[data-dl]',root).forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.dl==='estructura'){const cols=m.cols.map((c,i)=>({h:c[0],txt:r=>r[i]}));download('Estructura_Cargue_Masivo_'+base+'.xls',toXLS(cols,[m.cols.map(c=>c[3])]),'application/vnd.ms-excel');toast('Estructura de '+m.nombre+' descargada.','success','Descarga lista')}
  else{const rows=m.cols.map(c=>'<tr><td>'+esc(c[0])+'</td><td>'+(c[1]?'Sí':'No')+'</td><td>'+esc(c[2])+'</td><td>'+esc(c[3])+'</td></tr>').join('');download('Manual_Cargue_Masivo_'+base+'.html','<!doctype html><meta charset=\"utf-8\"><title>Manual Cargue Masivo de '+esc(m.nombre)+'</title><body style=\"font-family:Segoe UI,Arial;max-width:900px;margin:30px auto;color:#1F2937\"><h1 style=\"color:#6A1B9A\">Manual Cargue Masivo de '+esc(m.nombre)+'</h1><p>Prepara el archivo con la estructura descargada. Formatos .xlsx o .csv, hasta 5.000 filas. La primera fila son los encabezados, en el mismo orden.</p><table border=\"1\" cellpadding=\"8\" style=\"border-collapse:collapse;width:100%\"><tr style=\"background:#6A1B9A;color:#fff\"><th>Campo</th><th>Obligatorio</th><th>Valores permitidos</th><th>Ejemplo</th></tr>'+rows+'</table><h2 style=\"color:#6A1B9A\">Errores frecuentes</h2><ul><li>Cambiar el orden o el nombre de las columnas.</li><li>Usar un valor que no exista en el maestro correspondiente.</li><li>Dejar vacío un campo obligatorio.</li><li>Usar coma decimal; usa punto decimal.</li></ul></body>','text/html;charset=utf-8');toast('Manual de '+m.nombre+' descargado.','success','Descarga lista')}
 }));
 const z=$('[data-up]',root),inp=$('input[type=file]',z),nm=$('[data-fname]',root),pb=$('[data-proc]',root),res=$('[data-result]',root);let file=null;
 const pick=f=>{res.innerHTML='';if(!f){return}const ok=/\\.(xlsx|csv)$/i.test(f.name);if(!ok){file=null;nm.value='';pb.disabled=true;res.innerHTML=alertB('danger','Formato no permitido','Solo se aceptan archivos .xlsx o .csv.',true);toast('Formato no permitido. Usa .xlsx o .csv.','danger','Archivo inválido');return}file=f;nm.value=f.name;pb.disabled=false};
 z.addEventListener('click',()=>inp.click());z.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inp.click()}});inp.addEventListener('change',()=>pick(inp.files[0]));
 ['dragover','dragenter'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.add('is-over')}));['dragleave','drop'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.remove('is-over')}));z.addEventListener('drop',e=>pick(e.dataTransfer.files[0]));
 pb.addEventListener('click',async()=>{if(!file)return;pb.classList.add('is-loading');let n=12,bad=0,msg='';
  if(/\\.csv$/i.test(file.name)){try{const t=await file.text();const L=t.split(/\\r?\\n/).filter(x=>x.trim());const h=(L[0]||'').split(/[;,]/).length;n=Math.max(0,L.length-1);if(h!==m.cols.length){bad=-1;msg='El archivo trae '+h+' columnas y la estructura de '+m.nombre+' tiene '+m.cols.length+'.'}else if(n>5000){bad=-1;msg='El archivo supera las 5.000 filas permitidas.'}else if(n===0){bad=-1;msg='El archivo no tiene filas de datos.'}}catch(e){bad=-1;msg='No se pudo leer el archivo.'}}
  setTimeout(()=>{pb.classList.remove('is-loading');if(bad<0){res.innerHTML=alertB('danger','No se pudo procesar el archivo',esc(msg)+' Revisa la estructura y vuelve a intentarlo.',true);toast(msg,'danger','Archivo con errores')}else{res.innerHTML=alertB('success','Archivo procesado','<b>'+n+'</b> registros válidos · <b>0</b> con errores. El resultado también llega al Centro de Notificaciones.',true);toast(n+' registros procesados correctamente.','success','Carga masiva');file=null;nm.value='';inp.value='';pb.disabled=true}},700)});
}
const APO={`);
/* pestañas Registro Individual / Carga Masiva en crudPage */
rep("if(cfg.apoya)pg.insertAdjacentHTML('beforebegin',apoyaHTML(cfg.apoya));","if(cfg.apoya)pg.insertAdjacentHTML('beforebegin',apoyaHTML(cfg.apoya));\n  if(cfg.mass){pg.insertAdjacentHTML('beforebegin','<div class=\"mk-tabs mk-mb\" role=\"tablist\" id=\"rtabs\"><button class=\"mk-tab active\" data-rt=\"0\" role=\"tab\">Registro Individual</button><button class=\"mk-tab\" data-rt=\"1\" role=\"tab\">Carga Masiva</button></div>');const me=document.createElement('div');me.id='mass';me.hidden=true;me.innerHTML=massHTML(cfg.mass);pg.after(me);bindMass(me,cfg.mass);$$('[data-rt]',view).forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.rt==='1';$$('[data-rt]',view).forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b)});pg.hidden=m;me.hidden=!m;const nb=$('[data-new]',view);if(nb)nb.hidden=m}))}");
rep("entity:'orden de renta fija',","mass:MASS.fixed,dateRange:{k:'fecha',label:'fecha de creación'},entity:'orden de renta fija',");
rep("entity:'orden de renta variable',","mass:MASS.variable,dateRange:{k:'fecha',label:'fecha de creación'},entity:'orden de renta variable',");
rep("help:'Genera y descarga los informes de desempeño.',noNew:true,","help:'Genera y descarga los informes de desempeño.',noNew:true,dateRange:{k:'ult',label:'fecha de generación'},");
/* instrumentos y benchmarks: mismo componente dentro de su acordeón */
function swapExtra(key,title,desc,massKey){const a=s.indexOf("extra:pg=>{",s.indexOf(key));const z=s.indexOf("bindFile(x)},",a);if(a<0||z<0)throw new Error('extra '+title);s=s.slice(0,a)+"extra:pg=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class=\"mk-accordion__head\"><span class=\"mk-accordion__ico\">'+ic('upload')+'</span><span><span class=\"mk-accordion__t\">"+title+"</span><span class=\"mk-accordion__d\">"+desc+"</span></span><span class=\"mk-accordion__chev\">&#9662;</span></div><div class=\"mk-accordion__body\">'+massHTML(MASS."+massKey+")+'</div>';pg.appendChild(x);bindAcc(x);bindMass(x,MASS."+massKey+")},"+s.slice(z+"bindFile(x)},".length)}
swapExtra("PAGES.instruments=crudPage","Carga masiva de instrumentos","Descarga la estructura y el manual, y carga el archivo","instr");
swapExtra("PAGES.pabench=crudPage","Importar composición de benchmarks","Descarga la estructura y el manual, y carga el archivo","bench");

/* ---------- 6. Fecha operativa en consultas ---------- */
rep("const st={port:FUNDS[1],sel:['calif','emisor','moneda'],done:true};","const st={port:FUNDS[1],sel:['calif','emisor','moneda'],done:true,op:OPDATE};");
rep("pg.innerHTML=queryBar(fld('Portafolio',  '<div","pg.innerHTML=queryBar(opField(st.op)+fld('Portafolio',  '<div");
rep("const sel=$('[name=port]',pg);sel.addEventListener('change',()=>{st.port=sel.value;clearErr(sel)});","const sel=$('[name=port]',pg);sel.addEventListener('change',()=>{st.port=sel.value;clearErr(sel)});bindOp(pg,st,()=>{if(st.done)result()});");
rep("$('[data-clear]',pg).addEventListener('click',()=>{st.port='';st.sel=[];st.done=false;draw()});","$('[data-clear]',pg).addEventListener('click',()=>{st.port='';st.sel=[];st.done=false;st.op=OPDATE;draw()});");
rep("const data=holdingsFor(st.port),r=$('#res',pg);","const fac=dfac(st.op),data=holdingsFor(st.port).map(h=>Object.assign({},h,{val:h.val*fac})),r=$('#res',pg);");
rep("const st={port:FUNDS[1],year:'2026',done:true};","const st={port:FUNDS[1],year:'2026',done:true,op:OPDATE};");
rep("pg.innerHTML=queryBar(selF('port','Portafolio',FUNDS,st.port,{req:true})+selF('year'","pg.innerHTML=queryBar(opField(st.op)+selF('port','Portafolio',FUNDS,st.port,{req:true})+selF('year'");
rep("$('[name=port]',pg).addEventListener('change',e=>st.port=e.target.value);$('[name=year]',pg).addEventListener('change',e=>st.year=e.target.value);bindClear(pg);","$('[name=port]',pg).addEventListener('change',e=>st.port=e.target.value);$('[name=year]',pg).addEventListener('change',e=>st.year=e.target.value);bindClear(pg);bindOp(pg,st,()=>{if(st.done)result()});");
rep("$('[data-clear]',pg).addEventListener('click',()=>{st.port='';st.year='';st.done=false;draw()});","$('[data-clear]',pg).addEventListener('click',()=>{st.port='';st.year='';st.done=false;st.op=OPDATE;draw()});");
rep("function result(){const rows=flowsFor(st.port,st.year);","function result(){const f=dfac(st.op),rows=flowsFor(st.port,st.year).map(r=>Object.assign({},r,{desc:r.desc*f,ibr:r.ibr*f,ipc:r.ipc*f,tf:r.tf*f,uvr:r.uvr*f,uf:r.uf*f,total:r.total*f,acum:r.acum*f}));");
/* sensibilidad y evaluación */
rep("rows:()=>SENS,acts:()=>[['ver']],filters:[],","rows:st=>{const f=dfac((st&&st.op)||OPDATE);return SENS.map(r=>Object.assign({},r,{val:r.val*f}))},opDate:true,acts:()=>[['ver']],filters:[{id:'p',label:'Portafolio',opts:()=>PNAMES.slice(0,9),get:r=>r.port}],");
rep("function evalRows(){return LIMITS.filter(l=>l.activo).map(l=>{","function evalRows(st){const fac=dfac((st&&st.op)||OPDATE);return LIMITS.filter(l=>l.activo).map(l=>{");
rep("uso=demo?0.92:(hash(l.sub+l.port)%11===0?1.06:0.35+r()*0.5);","uso=(demo?0.92:(hash(l.sub+l.port)%11===0?1.06:0.35+r()*0.5))*fac;");
rep("uso=(hash(l.sub+l.port)%7===0)?0.85:1.08+r()*0.4;","uso=((hash(l.sub+l.port)%7===0)?0.85:1.08+r()*0.4)*fac;");
rep("rows:evalRows,estado:","rows:evalRows,opDate:true,estado:");

/* ---------- 7. Performance attribution: Fecha inicial / Fecha final ---------- */
rep("const def=()=>({port:opts.port||FUNDS[1],per:'YTD',mes:'2026-09',lvl:'Macroactivo',tab:opts.tab||0});","const def=()=>({port:opts.port||FUNDS[1],d1:'2026-01-01',d2:'2026-09-30',per:'YTD',mes:'2026-09',lvl:'Macroactivo',tab:opts.tab||0});");
rep("+selF('per','Periodo',Object.keys(PERIODS).map(k=>({value:k,label:PERIODS[k].label})),st.per)+(opts.month?fld('Mes de corte','<div class=\"mk-datepicker\"><input class=\"mk-input\" type=\"month\" name=\"mes\" value=\"'+st.mes+'\"></div>',{name:'mes'}):'')+(opts.level","+rangeFields(st.d1,st.d2,'el período de análisis')+(opts.level");
rep("$('[name=per]',pg).addEventListener('change',e=>st.per=e.target.value);","$$('[name=d1],[name=d2]',pg).forEach(i=>i.addEventListener('change',()=>{st[i.name]=i.value;clearErr(i)}));");
rep("const me=$('[name=mes]',pg);if(me)me.addEventListener('change',()=>st.mes=me.value||st.mes);","");
rep("return}done=true;const r=$('#res',pg);","return}if(!st.d1||!st.d2){errOn(pg,st.d1?'d2':'d1','Indica la fecha');toast('Indica la fecha inicial y la final.','warning','Faltan datos');return}if(st.d1>st.d2){errOn(pg,'d1','La fecha inicial no puede ser posterior a la final');toast('La fecha inicial no puede ser posterior a la final.','warning','Rango inválido');return}done=true;const r=$('#res',pg);");
rep("const out=()=>build($('#res',pg),st,()=>out());","const out=()=>{st.per=perKey(st.d1,st.d2);st.mes=st.d2.slice(0,7);build($('#res',pg),st,()=>out())};");
/* asistente de reportes */
rep("const st={step:0,port:FUNDS[1],per:'YTD',mes:'2026-09',fmt:'Excel',p:0}","const st={step:0,port:FUNDS[1],d1:'2026-01-01',d2:'2026-09-30',fmt:'Excel',p:0}");
rep("+selF('w-per','Periodo',Object.keys(PERIODS).map(k=>({value:k,label:PERIODS[k].label})),st.per)+fld('Mes de corte','<input class=\"mk-input\" type=\"month\" name=\"w-mes\" value=\"'+st.mes+'\">')+","+rangeFields(st.d1,st.d2,'el período del reporte','w-')+");
rep("+fdRow('Periodo',PERIODS[st.per].label)+fdRow('Mes de corte',MES_TXT[+st.mes.split('-')[1]-1]+' '+st.mes.split('-')[0])+","+fdRow('Periodo',fmtD(fromIso(st.d1))+' – '+fmtD(fromIso(st.d2)))+");
rep("$$('[name=\"w-per\"]',m.el).forEach(s=>s.addEventListener('change',()=>st.per=s.value));$$('[name=\"w-mes\"]',m.el).forEach(s=>s.addEventListener('change',()=>st.mes=s.value||st.mes));","$$('[name=\"w-d1\"],[name=\"w-d2\"]',m.el).forEach(s=>s.addEventListener('change',()=>{st[s.name==='w-d1'?'d1':'d2']=s.value}));");
rep("if(st.step===0&&!st.port){toast('Selecciona un portafolio.','warning');return}","if(st.step===0&&!st.port){toast('Selecciona un portafolio.','warning');return}if(st.step===0&&(!st.d1||!st.d2||st.d1>st.d2)){toast('Revisa el rango: la fecha inicial debe ser igual o anterior a la final.','warning','Rango de fechas');return}");
rep("const s=perfStats(p,st.per,endOf(st.mes));","const s=perfStats(p,perKey(st.d1,st.d2),new Date(st.d2));");

/* ---------- 8. Flujo de órdenes: Estado al final ---------- */
rep("cols:[{h:'Estado',k:'e',html:r=>badge(r.e,r.e==='Registrada'?'info':r.e==='Complementación'?'warning':r.e==='Finalizada'?'success':'danger',true),txt:r=>r.e},{h:'Ver detalle',k:'v',html:r=>r.v,txt:r=>strip(r.v)},{h:'Editar',k:'ed',html:r=>r.ed,txt:r=>strip(r.ed)},{h:'Anular',k:'an',html:r=>r.an,txt:r=>strip(r.an)},{h:'Siguiente estado',k:'sig'}]","cols:[{h:'Paso',k:'p'},{h:'Ver detalle',k:'v',html:r=>r.v,txt:r=>strip(r.v)},{h:'Editar',k:'ed',html:r=>r.ed,txt:r=>strip(r.ed)},{h:'Anular',k:'an',html:r=>r.an,txt:r=>strip(r.an)},{h:'Siguiente estado',k:'sig'},{h:'Estado',k:'e',html:r=>badge(r.e,r.e==='Registrada'?'info':r.e==='Complementación'?'warning':r.e==='Finalizada'?'success':'danger',true),txt:r=>r.e}]");
rep(".map(a=>({e:a[0],v:a[1],ed:a[2],an:a[3],sig:a[4]}))",".map((a,i)=>({p:['1','2','3','Alterno'][i],e:a[0],v:a[1],ed:a[2],an:a[3],sig:a[4]}))");
fs.writeFileSync('mk.js',s);console.log('mk.js ok');

/* ---------- CSS ---------- */
let css=fs.readFileSync('extras.css','utf8');
if(!css.includes('.mk-massrow')){css+=`
/* ===== Carga masiva (Documentos + Importación Masiva) ===== */
[hidden]{display:none!important}
.mk-fieldset{border:1px solid var(--mk-border);border-radius:var(--mk-radius);padding:14px 16px 16px;margin:0 0 16px;min-width:0}
.mk-fieldset>legend{font-size:12px;color:var(--mk-primary);padding:0 6px;font-weight:600}
.mk-massrow{display:flex;gap:16px;align-items:stretch;flex-wrap:wrap}
.mk-massrow .mk-fileupload{flex:1 1 380px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px 16px;min-height:120px}
.mk-massrow .mk-fileupload svg{color:var(--mk-primary)}
.mk-massside{flex:1 1 380px;display:flex;gap:12px;align-items:center}
.mk-massside .mk-input{flex:1}
.mk-fieldset .mk-table td{white-space:normal}
html.dark .mk-fieldset{border-color:var(--mk-border)}
`;fs.writeFileSync('extras.css',css)}
console.log('css ok');
