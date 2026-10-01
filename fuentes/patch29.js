const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const i=s.indexOf('PAGES.oreports=crudPage({'),j=s.indexOf('/* ---------- Dashboard › Mercado monetario');
if(i<0||j<i)throw new Error('bloque oreports');
const NEW=String.raw`const OREPS=[
 ['book','Libro de órdenes · todos los mercados','Renta fija, renta variable y mercado monetario en un solo informe, con su estado.','Operativos',r=>true],
 ['rf','Órdenes de renta fija','Compras y ventas de instrumentos de deuda.','Operativos',r=>r.mercado===MERC[0]],
 ['rv','Órdenes de renta variable','Compras y ventas de acciones, con su modalidad.','Operativos',r=>r.mercado===MERC[1]],
 ['mm','Órdenes de mercado monetario','CDT, simultáneas, interbancarios, overnight y títulos de corto plazo, con su contraparte.','Operativos',r=>r.mercado===MERC[2]],
 ['pend','Órdenes pendientes de complementación','Órdenes registradas o en complementación que aún no finalizan.','Seguimiento',r=>r.estatus==='R'||r.estatus==='C'],
 ['anul','Órdenes anuladas','Órdenes anuladas en el período, con su portafolio y valor.','Seguimiento',r=>r.estatus==='A']
];
const BOOK_COLS=[{h:'N° orden',k:'num',sortable:true},{h:'Mercado',k:'mercado',html:r=>badge(r.mercado,r.mercado===MERC[0]?'success':r.mercado===MERC[1]?'warning':'info'),txt:r=>r.mercado},{h:'Portafolio',k:'port'},{h:'Tipo',k:'tipo',html:r=>r.tipo==='COMPRA'||r.tipo==='VENTA'?side(r.tipo):sentB(r.tipo),txt:r=>r.tipo},{h:'Instrumento / operación',k:'instr'},{h:'Contraparte',k:'cp'},{h:'Cantidad / nominal',k:'cant',fmt:f2},{h:'Tasa',k:'tasa',fmt:v=>v==null?'—':pc2(v*100)},{h:'Plazo (días)',k:'plazo',fmt:v=>v==null?'—':String(v)},{h:'Valor',k:'valor',fmt:money},{h:'Creado',k:'fecha',fmt:dstr,sortable:true}];
PAGES.oreports=function(view,meta){
 const pg=mountPage(view,meta,'Informes','Catálogo de informes de órdenes por categoría'),bc=$('#mkBreadcrumb'),bc0=bc.innerHTML,h1=$('h1',view),help=$('.mk-help',view.querySelector('.mk-headerpage'));
 const setBack=fn=>{const b=$('[data-back]',view),nb=b.cloneNode(true);b.replaceWith(nb);nb.addEventListener('click',fn)};
 const cats=['Operativos','Seguimiento'],st={q:'',cat:''};
 function catalog(){
  bc.innerHTML=bc0;h1.textContent='Informes';help.textContent='Catálogo de informes de órdenes por categoría';setBack(()=>go(meta.grp.home));
  pg.innerHTML='<fieldset class="mk-fieldset"><legend>Filtros</legend><div class="mk-tplfilters mk-filters">'+fld('Buscar reporte','<input class="mk-input" name="q" placeholder="Buscar reporte específico..." value="'+esc(st.q)+'">',{tip:'Escribe parte del nombre o de la descripción del informe.',cls:'mk-field--search'})+fld('Categoría','<div class="mk-combobox"><select class="mk-select" name="cat"><option value="">Todas las categorías</option>'+cats.map(c=>'<option'+(st.cat===c?' selected':'')+'>'+c+'</option>').join('')+'</select></div>',{tip:'Agrupa los informes según su uso: operativos o de seguimiento.'})+'<button class="mk-btn" data-s>Buscar</button><button class="mk-btn mk-btn--secondary" data-l>Limpiar filtros</button></div></fieldset><div class="mk-help mk-mb" id="cnt"></div><div id="grp"></div>';
  const draw=()=>{const q=st.q.toLowerCase(),list=OREPS.filter(r=>(!st.cat||r[3]===st.cat)&&(!q||(r[1]+' '+r[2]).toLowerCase().includes(q)));
   $('#cnt',pg).innerHTML='Mostrando <b>'+list.length+'</b> informes encontrados en '+(st.cat?'la categoría <b>'+st.cat+'</b>':'todas las categorías')+' · país en operación <b>'+S.pais+'</b>';
   $('#grp',pg).innerHTML=list.length?'<div class="mk-repgroup"><span class="mk-repgroup__ico">'+ic('orders')+'</span><div><b>Órdenes</b><div style="font-size:12px;opacity:.9">'+list.length+' reportes</div></div></div><div class="mk-repbody">'+cats.map(c=>{const l=list.filter(r=>r[3]===c);return l.length?'<div class="mk-replbl">'+c+' · '+l.length+' reporte'+(l.length>1?'s':'')+'</div><div class="mk-repgrid">'+l.map(r=>'<button type="button" class="mk-repcard" data-r="'+r[0]+'"><span class="mk-repcard__t">'+esc(r[1])+'</span><span class="mk-repcard__chev">›</span><span class="mk-repcard__d">'+esc(r[2])+'</span></button>').join('')+'</div>':''}).join('')+'</div>':'<div class="mk-card"><div class="mk-empty">Ningún informe coincide con la búsqueda.</div></div>';
   $$('[data-r]',pg).forEach(b=>b.addEventListener('click',()=>report(b.dataset.r)))};
  const apply=()=>{st.q=$('[name=q]',pg).value.trim();st.cat=$('[name=cat]',pg).value;draw()};
  $('[data-s]',pg).addEventListener('click',apply);$('[name=q]',pg).addEventListener('keydown',e=>{if(e.key==='Enter')apply()});
  $('[data-l]',pg).addEventListener('click',()=>{st.q='';st.cat='';catalog()});draw();
 }
 function report(id){
  const rp=OREPS.find(x=>x[0]===id),f={port:'',mercado:'',est:'',tipo:'',d1:'2026-01-01',d2:OPDATE,adv:false};
  bc.innerHTML=bc0.replace('<span class="current">Reportes</span>','<a class="crumb" data-go="#/orders/reports">Reportes</a><span class="sep">›</span><span class="current">Informe - '+esc(rp[1])+'</span>');
  h1.textContent='Informe - '+rp[1];help.textContent=rp[2];setBack(catalog);
  const optsHTML=(first,arr,v)=>'<option value="">'+first+'</option>'+arr.map(x=>'<option'+(v===x?' selected':'')+'>'+esc(x)+'</option>').join('');
  pg.innerHTML='<fieldset class="mk-fieldset"><legend>Filtros del informe</legend><div class="mk-tplfilters mk-filters">'
   +fld('Portafolio','<div class="mk-combobox"><select class="mk-select" name="port">'+optsHTML('Todos los portafolios',PNAMES.slice(0,9),f.port)+'</select></div>',{req:true,name:'port',tip:'Con Todos los portafolios el informe entrega las órdenes de todos los portafolios.'})
   +(id==='book'?fld('Mercado','<div class="mk-combobox"><select class="mk-select" name="mercado">'+optsHTML('Todos los mercados',MERC,f.mercado)+'</select></div>',{name:'mercado',tip:'Renta fija, renta variable o mercado monetario.'}):'')
   +rangeFields(f.d1,f.d2,'el informe')
   +'</div><div class="mk-mt" style="display:flex;align-items:center;gap:8px"><label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" name="adv"> Filtro Avanzado</label>'+info('Permite filtrar además por estado de la orden y por tipo.')+'</div>'
   +'<div class="mk-tplfilters mk-filters mk-mt" id="advp" hidden>'+fld('Estado','<div class="mk-combobox"><select class="mk-select" name="est">'+optsHTML('Todos los estados',Object.values(ESTADO_ORD).map(x=>x[0]),'')+'</select></div>',{name:'est'})+fld('Tipo','<div class="mk-combobox"><select class="mk-select" name="tipo">'+optsHTML('Todos los tipos',['COMPRA','VENTA','INVERSIÓN','CAPTACIÓN'],'')+'</select></div>',{name:'tipo',tip:'Compra o venta en renta fija y variable; inversión o captación en mercado monetario.'})+'</div>'
   +'<div class="mk-repstrip"><span class="mk-help" style="margin:0">Informe por rango de fechas: entrega las órdenes creadas entre la <b>fecha inicial</b> y la <b>fecha final</b>.</span><span style="display:flex;gap:10px"><button type="button" class="mk-btn mk-btn--secondary" data-sug>Rango sugerido</button><button type="button" class="mk-btn" data-gen>Generar informe</button></span></div></fieldset><div id="out"></div>';
  bindClear(pg);
  $('[name=adv]',pg).addEventListener('change',e=>{$('#advp',pg).hidden=!e.target.checked});
  $('[data-sug]',pg).addEventListener('click',()=>{const e=new Date(OPDATE+'T12:00:00'),b=new Date(e.getTime()-30*864e5);$('[name=d2]',pg).value=OPDATE;$('[name=d1]',pg).value=isoD(b.getTime());toast('Se aplicó el rango sugerido: los últimos 30 días.','info','Rango sugerido')});
  $('[data-gen]',pg).addEventListener('click',()=>{
   const g=n=>{const e=$('[name='+n+']',pg);return e?e.value:''},d1=g('d1'),d2=g('d2');
   if(!d1||!d2){errOn(pg,d1?'d2':'d1','Indica la fecha');toast('Indica la fecha inicial y la final.','warning','Faltan datos');return}
   if(d1>d2){errOn(pg,'d1','La fecha inicial no puede ser posterior a la final');toast('La fecha inicial no puede ser posterior a la final.','warning','Rango inválido');return}
   const adv=$('[name=adv]',pg).checked,a=new Date(d1+'T00:00:00').getTime(),b=new Date(d2+'T23:59:59').getTime();
   const rows=bookRows().filter(rp[4]).filter(r=>(!g('port')||r.port===g('port'))&&(!g('mercado')||r.mercado===g('mercado'))&&r.fecha>=a&&r.fecha<=b&&(!adv||((!g('est')||ESTADO_ORD[r.estatus][0]===g('est'))&&(!g('tipo')||r.tipo===g('tipo')))));
   const out=$('#out',pg);out.innerHTML='<div class="mk-loading"><div class="mk-spinner"></div></div>';
   setTimeout(()=>{out.innerHTML='<div class="mk-section-title" style="margin:14px 0 8px;font-weight:600;color:var(--mk-primary)">Resultado del informe · '+fmtD(fromIso(d1))+' – '+fmtD(fromIso(d2))+'</div><div id="rt"></div>';
    DataTable($('#rt',out),{cols:BOOK_COLS,rows:()=>rows,acts:()=>[['ver']],estado:estOrd,kpis:rs=>[['Órdenes',rs.length,'p'],['Renta fija',rs.filter(r=>r.mercado===MERC[0]).length,'b'],['Renta variable',rs.filter(r=>r.mercado===MERC[1]).length,'y'],['Mercado monetario',rs.filter(r=>r.mercado===MERC[2]).length,'g'],['Finalizadas',rs.filter(r=>r.estatus==='F').length,'']],fileName:'informe-'+id,defaultSort:'Creado',defaultDir:-1,searchPh:'N° de orden, portafolio, instrumento o contraparte...',noun:'órdenes',
     onAct:(act,r)=>{const m=openModal({title:'Orden · '+r.num,body:'<div style="margin-bottom:10px">'+estOrd(r)+'</div><div class="mk-formgrid">'+[['N° de orden',r.num],['Mercado',r.mercado],['Portafolio',esc(r.port)],['Tipo',r.tipo],['Instrumento / operación',esc(r.instr)],['Contraparte',esc(r.cp)],['Cantidad / nominal',f2(r.cant)],['Tasa',r.tasa==null?'—':pc2(r.tasa*100)],['Plazo',r.plazo==null?'—':r.plazo+' días'],['Valor',money(r.valor)],['Creada',dstr(r.fecha)]].map(x=>fdRow(x[0],x[1])).join('')+'</div>',foot:'<button class="mk-btn mk-btn--secondary" data-c>Cerrar</button>'});$('[data-c]',m.el).addEventListener('click',m.close)}});
    toast(rows.length+' órdenes en el informe.','success','Informe generado')},350)});
 }
 catalog();
};

`;
s=s.slice(0,i)+NEW+s.slice(j);
fs.writeFileSync('mk.js',s);
let css=fs.readFileSync('extras.css','utf8');
if(!css.includes('/* ===== Catálogo de informes ===== */'))css+=`
/* ===== Catálogo de informes ===== */
.mk-repgroup{display:flex;align-items:center;gap:12px;background:var(--mk-primary);color:#fff;border-radius:var(--mk-radius) var(--mk-radius) 0 0;padding:12px 18px}
.mk-repgroup__ico{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center}
.mk-repbody{border:1px solid var(--mk-primary-100);border-top:0;border-radius:0 0 var(--mk-radius) var(--mk-radius);padding:12px 16px;background:var(--mk-surface)}
.mk-replbl{font-size:12px;font-weight:600;color:var(--mk-primary);text-transform:uppercase;margin:4px 0 8px}
.mk-repgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin-bottom:12px}
.mk-repcard{position:relative;text-align:center;border:1px solid var(--mk-border);border-radius:10px;background:var(--mk-surface);padding:14px 28px 14px 14px;cursor:pointer;font:inherit;color:var(--mk-text);transition:box-shadow .15s,border-color .15s}
.mk-repcard:hover{border-color:var(--mk-primary);box-shadow:var(--mk-shadow)}
.mk-repcard__t{display:block;color:var(--mk-primary);font-weight:600;margin-bottom:6px}
.mk-repcard__d{display:block;font-size:12.5px;color:var(--mk-text-muted)}
.mk-repcard__chev{position:absolute;right:12px;top:10px;color:var(--mk-text-muted);font-size:18px}
.mk-repstrip{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;border:1px solid var(--mk-primary-100);border-radius:10px;padding:12px 16px;margin-top:12px}
`;
fs.writeFileSync('extras.css',css);console.log('ok');
