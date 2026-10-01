const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b,all)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,70));s=all?s.split(a).join(b):s.replace(a,()=>b)};
// ---- Colombia ----
rep("'TASA FIJA','UVR','UF'","'TASA FIJA','UVR','DTF'",true);
rep("['CLP','UF','USD','EUR']","['COP','UVR','USD','EUR']",true);
rep("{h:'UF',k:'uf',fmt:f2}","{h:'DTF',k:'uf',fmt:f2}");
rep("toast('Los datos de la sesión se mostrarán para '+S.pais+'.','info','País: '+S.pais)","toast(S.pais==='Colombia'?'Datos de ejemplo de Colombia (COP).':'En esta maqueta los datos de ejemplo son de Colombia; el país define la parametrización en la versión real.','info','País: '+S.pais)");
const a=s.indexOf("const NOTIFS=[");const b=s.indexOf("function ntfRender");
s=s.slice(0,a)+"const NOTIFS=[['warn','Límite de emisor al 92%','FIC LIQUIDEZ se acerca al tope del 20% definido para FINDETER.','Límites','Advertencia','lim-014',1],['info','Orden pendiente de complementación','Orden de compra de TES sobre FIC RENTA FIJA requiere completar la tasa.','Órdenes','Informativo','ord-231',1],['ok','Reporte mensual generado','El informe de rentabilidad de septiembre está listo para descargar.','Reportes','Exitoso','rep-001',1],['err','Falló la carga de instrumentos','El archivo tiene 3 filas con ISIN inválido.','Importación','Error','imp-008',0],['ok','Benchmark actualizado','Se actualizó la composición del benchmark de FIC RENTA FIJA.','Performance','Exitoso','bch-003',0]];\n"+s.slice(b);
// ---- Estados por defecto con datos (demo) ----
rep("const st={port:'',sel:[],done:false};","const st={port:'FIC RENTA FIJA',sel:['calif','emisor','moneda'],done:true};");
rep("const st={port:'',year:'',done:false};","const st={port:'FIC RENTA FIJA',year:'2026',done:true};");
// ---- Navegación ----
rep("['#/orders/instruments','Instrumentos','coins','instruments','Consulta, registra y administra los instrumentos disponibles.'],","");
rep("desc:'Captura y gestión de órdenes de inversión.'","desc:'Captura y gestión de órdenes de renta fija, renta variable y clientes.'");
rep("'Genera y descarga los informes de desempeño.']]}\n];","'Genera y descarga los informes de desempeño.']]},\n {key:'param',label:'Parametrización',icon:'sliders',desc:'Flujo de órdenes y maestros que alimentan el Front de inversiones.',home:'#/m/param',items:[['#/parametrizacion/flow','Flujo de órdenes','flows','pflow','Estados de una orden y las acciones permitidas en cada uno.'],['#/parametrizacion/portfolios','Portafolios','pie','pport','Fondos, mandatos y clientes sobre los que se opera.'],['#/parametrizacion/instruments','Instrumentos','coins','instruments','Consulta, registra y administra los instrumentos disponibles.'],['#/parametrizacion/indices','Índices de referencia','network','pindex','Índices que componen los benchmarks.'],['#/parametrizacion/catalogs','Catálogos','doc','pcat','Emisores, calificaciones, monedas y tipos de límite.']]}\n];");
// ---- Páginas de Parametrización ----
const pages=`
/* =============== PARAMETRIZACIÓN =============== */
const PORTS=PORTFOLIOS.map((p,i)=>({name:p.name,tipo:(i>=9?'Cliente':(i>=2&&i<=4)?'Mandato delegado':'FIC'),moneda:'COP',inicio:mkDate(2019+(i%5),(i*3)%12,1+(i*2)%25).getTime(),activo:i!==12}));
function benchOf(n){const b=BENCH_DEF.find(x=>x.port===n);return b?b.bench:'—'}
PAGES.pport=crudPage({title:'Portafolios',help:'Fondos, mandatos y clientes sobre los que se opera.',entity:'portafolio',entityArt:'El portafolio',fileName:'portafolios',defaultSort:'Portafolio',searchPh:'Nombre del portafolio...',noun:'portafolios',
 filters:[{id:'t',label:'Tipo',opts:()=>['FIC','Mandato delegado','Cliente'],get:r=>r.tipo},{id:'e',label:'Estado',opts:()=>['Activo','Inactivo'],get:r=>r.activo?'Activo':'Inactivo'}],
 kpis:rows=>[['Portafolios',rows.length,'p'],['FIC',rows.filter(r=>r.tipo==='FIC').length,'b'],['Mandatos delegados',rows.filter(r=>r.tipo==='Mandato delegado').length,'y'],['Clientes',rows.filter(r=>r.tipo==='Cliente').length,'g']],
 cols:[{h:'Portafolio',k:'name',sortable:true},{h:'Tipo',k:'tipo',html:r=>badge(r.tipo,r.tipo==='FIC'?'info':r.tipo==='Cliente'?'success':'warning'),txt:r=>r.tipo},{h:'Moneda base',k:'moneda'},{h:'Fecha de inicio',k:'inicio',fmt:fmtD},{h:'Benchmark',html:r=>esc(benchOf(r.name)),txt:r=>benchOf(r.name)}],
 rows:()=>PORTS,estado:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral',true),acts:r=>[['ver'],['edit'],r.activo?['off']:['on']],
 toggle:r=>r.activo?{title:'Inactivar portafolio',danger:true,message:'Vas a inactivar <b>'+esc(r.name)+'</b>. No podrá seleccionarse en nuevas órdenes; las posiciones y órdenes vigentes no se modifican.',confirm:'Inactivar',done:'Portafolio inactivado.',apply:()=>{r.activo=false}}:{title:'Activar portafolio',message:'¿Deseas activar <b>'+esc(r.name)+'</b> para operar?',confirm:'Activar',done:'Portafolio activado.',apply:()=>{r.activo=true}},
 detail:r=>[['Portafolio',esc(r.name)],['Tipo',r.tipo],['Moneda base',r.moneda],['Fecha de inicio',fmtD(r.inicio)],['Benchmark',esc(benchOf(r.name))]],detailTitle:r=>r.name,badges:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral'),
 form:row=>({html:'<div class="mk-formgrid">'+inpF('name','Nombre del portafolio',row&&row.name,{req:true})+selF('tipo','Tipo',['FIC','Mandato delegado','Cliente'],row&&row.tipo,{req:true})+selF('moneda','Moneda base',['COP','USD'],row?row.moneda:'COP',{req:true})+dateF('inicio','Fecha de inicio',row&&row.inicio,{req:true})+'</div>',
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[];if(!g('name'))errs.push(['name','Indica el nombre','Nombre']);if(!g('tipo'))errs.push(['tipo','Selecciona el tipo','Tipo']);if(!g('moneda'))errs.push(['moneda','Selecciona la moneda','Moneda']);const d=fromIso(g('inicio'));if(!d)errs.push(['inicio','Indica la fecha de inicio','Fecha de inicio']);if(errs.length)return {ok:false,errs};return {ok:true,data:{name:g('name'),tipo:g('tipo'),moneda:g('moneda'),inicio:d,activo:row?row.activo:true}}}}),
 review:d=>[['Portafolio',d.name],['Tipo',d.tipo],['Moneda base',d.moneda],['Fecha de inicio',fmtD(d.inicio)]],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else{PORTS.unshift(o);if(!PNAMES.includes(o.name))PNAMES.push(o.name)}}
});
const INDICES=[['IBR 1M','Indicador Bancario de Referencia a 1 mes','Tasa','Banco de la República'],['IBR 3M','Indicador Bancario de Referencia a 3 meses','Tasa','Banco de la República'],['DTF 90D','Depósito a Término Fijo a 90 días','Tasa','Banco de la República'],['Índice TES Corto','Índice de TES de corto plazo','Renta fija','Bolsa de Valores de Colombia'],['Índice TES Largo','Índice de TES de largo plazo','Renta fija','Bolsa de Valores de Colombia'],['Índice Corporativos AAA','Bonos corporativos con calificación AAA','Renta fija','Bolsa de Valores de Colombia'],['COLCAP','Índice de capitalización bursátil','Renta variable','Bolsa de Valores de Colombia'],['MSCI ACWI','Acciones globales, mercados desarrollados y emergentes','Renta variable','MSCI'],['Bloomberg Global Aggregate','Renta fija global grado de inversión','Renta fija','Bloomberg'],['IPC + 3%','Inflación más 3 puntos porcentuales','Tasa','DANE']].map((a,i)=>({code:a[0],nombre:a[1],tipo:a[2],fuente:a[3],activo:i!==8}));
PAGES.pindex=crudPage({title:'Índices de referencia',help:'Índices que componen los benchmarks de los portafolios.',entity:'índice',entityArt:'El índice',fileName:'indices',defaultSort:'Código',searchPh:'Código, nombre o fuente...',noun:'índices',
 filters:[{id:'t',label:'Tipo',opts:()=>['Tasa','Renta fija','Renta variable'],get:r=>r.tipo},{id:'e',label:'Estado',opts:()=>['Activo','Inactivo'],get:r=>r.activo?'Activo':'Inactivo'}],
 kpis:rows=>[['Índices',rows.length,'p'],['Activos',rows.filter(r=>r.activo).length,'g'],['De tasa',rows.filter(r=>r.tipo==='Tasa').length,'b'],['De mercado',rows.filter(r=>r.tipo!=='Tasa').length,'y']],
 cols:[{h:'Código',k:'code',sortable:true},{h:'Nombre',k:'nombre'},{h:'Tipo',k:'tipo'},{h:'Fuente',k:'fuente'}],
 rows:()=>INDICES,estado:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral',true),acts:r=>[['ver'],['edit'],r.activo?['off']:['on']],
 toggle:r=>r.activo?{title:'Inactivar índice',danger:true,message:'Vas a inactivar <b>'+esc(r.code)+'</b>. No podrá elegirse en nuevos benchmarks; los benchmarks que ya lo usan no cambian.',confirm:'Inactivar',done:'Índice inactivado.',apply:()=>{r.activo=false}}:{title:'Activar índice',message:'¿Deseas activar <b>'+esc(r.code)+'</b>?',confirm:'Activar',done:'Índice activado.',apply:()=>{r.activo=true}},
 detail:r=>[['Código',esc(r.code)],['Nombre',esc(r.nombre)],['Tipo',r.tipo],['Fuente',esc(r.fuente)]],detailTitle:r=>r.code,badges:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral'),
 form:row=>({html:'<div class="mk-formgrid">'+inpF('code','Código',row&&row.code,{req:true})+selF('tipo','Tipo',['Tasa','Renta fija','Renta variable'],row&&row.tipo,{req:true})+inpF('nombre','Nombre',row&&row.nombre,{req:true,cls:'span2'})+inpF('fuente','Fuente',row&&row.fuente)+'</div>',
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[];if(!g('code'))errs.push(['code','Indica el código','Código']);if(!g('nombre'))errs.push(['nombre','Indica el nombre','Nombre']);if(!g('tipo'))errs.push(['tipo','Selecciona el tipo','Tipo']);if(errs.length)return {ok:false,errs};return {ok:true,data:{code:g('code'),nombre:g('nombre'),tipo:g('tipo'),fuente:g('fuente'),activo:row?row.activo:true}}}}),
 review:d=>[['Código',d.code],['Nombre',d.nombre],['Tipo',d.tipo],['Fuente',d.fuente||'—']],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else{INDICES.unshift(o);if(!BENCH_COMPS.includes(o.code))BENCH_COMPS.push(o.code)}}
});
PAGES.pcat=function(view,meta){
 const pg=mountPage(view,meta,'Catálogos','Emisores, calificaciones, monedas y tipos de límite.');
 const st={tab:0};
 const CATS=[
  ['Emisores',[{h:'Emisor',k:'n'},{h:'Sector',k:'s'},{h:'Calificación',k:'c'},{h:'País',k:'p'}],[['ECOPETROL S.A.','Energía','AAA','Colombia'],['BANCOLOMBIA S.A.','Financiero','AAA','Colombia'],['BANCO DAVIVIENDA','Financiero','AAA','Colombia'],['BANCO DE BOGOTÁ','Financiero','AAA','Colombia'],['GRUPO SURA','Holding','AA+','Colombia'],['ISA S.A. E.S.P.','Energía','AAA','Colombia'],['FINDETER','Fomento','AAA','Colombia'],['TITULARIZADORA COLOMBIANA','Financiero','AAA','Colombia'],['COLPENSIONES','Seguridad social','AAA','Colombia'],['CEMENTOS ARGOS','Industrial','AA+','Colombia'],['MINISTERIO DE HACIENDA (TES)','Gobierno','AAA','Colombia']].map(a=>({n:a[0],s:a[1],c:a[2],p:a[3]}))],
  ['Calificaciones',[{h:'Calificación',k:'c'},{h:'Grado',k:'g'},{h:'Descripción',k:'d'}],[['AAA','Grado de inversión','Capacidad de pago excepcional'],['AA+','Grado de inversión','Capacidad de pago muy alta'],['AA','Grado de inversión','Capacidad de pago muy alta'],['AA-','Grado de inversión','Capacidad de pago muy alta'],['A','Grado de inversión','Capacidad de pago alta'],['A-','Grado de inversión','Capacidad de pago alta'],['BBB','Grado de inversión','Capacidad de pago adecuada']].map(a=>({c:a[0],g:a[1],d:a[2]}))],
  ['Monedas',[{h:'Código',k:'c'},{h:'Moneda',k:'n'},{h:'Uso',k:'u'}],[['COP','Peso colombiano','Moneda base'],['USD','Dólar estadounidense','Inversiones internacionales'],['EUR','Euro','Inversiones internacionales'],['UVR','Unidad de Valor Real','Títulos indexados a la inflación']].map(a=>({c:a[0],n:a[1],u:a[2]}))],
  ['Tipos de límite',[{h:'Tipo de límite',k:'t'},{h:'Valores posibles',k:'v'}],Object.keys(SUBLIMITS).map(k=>({t:k,v:SUBLIMITS[k].join(', ')})).concat(DENOMS.map(d=>({t:'Denominador',v:d})))]
 ];
 pg.innerHTML=alertB('info','Catálogos de consulta','Estos catálogos se administran en los módulos transversales de la plataforma (Emisores, Precios). Aquí solo se consultan para evitar duplicar la información.',true)+'<div class="mk-tabs mk-mt" role="tablist">'+CATS.map((c,i)=>'<button class="mk-tab'+(i===0?' active':'')+'" data-t="'+i+'" role="tab">'+c[0]+'</button>').join('')+'</div><div class="mk-tabpanel" id="cp"></div>';
 const show=()=>{const c=CATS[st.tab];$('#cp',pg).innerHTML='<div id="ct"></div>';DataTable($('#ct',pg),{cols:c[1],rows:()=>c[2],noPage:true,fileName:'catalogo-'+c[0].toLowerCase().replace(/\\s+/g,'-'),searchPh:'Buscar...',noun:'registros'})};
 $$('[data-t]',pg).forEach(b=>b.addEventListener('click',()=>{st.tab=+b.dataset.t;$$('[data-t]',pg).forEach(x=>x.classList.toggle('active',x===b));show()}));
 show();
};
PAGES.pflow=function(view,meta){
 const pg=mountPage(view,meta,'Flujo de órdenes','Estados de una orden y las acciones permitidas en cada uno.');
 const ST=[['R','Registrada','info','La orden se captura y queda pendiente de completar.'],['C','Complementación','warning','Se completa la información faltante (tasa, valor giro, contraparte).'],['F','Finalizada','success','La orden queda cerrada; solo se consulta.'],['A','Anulada','danger','La orden se cancela antes de finalizar; no se puede deshacer.']];
 const box=(s,w)=>'<div style="flex:1;min-width:'+(w||170)+'px;border:1px solid var(--mk-border);border-radius:10px;padding:14px;background:#fff;text-align:center"><div>'+badge(s[1],s[2],true)+'</div><div class="mk-help" style="margin-top:8px">'+s[3]+'</div></div>';
 const arrow=c=>'<div style="display:flex;align-items:center;color:var(--mk-primary);font-size:24px;font-weight:700">'+c+'</div>';
 pg.innerHTML='<div class="mk-subhead">'+ic('flows')+'Ciclo de vida de una orden</div><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:stretch">'+box(ST[0])+arrow('→')+box(ST[1])+arrow('→')+box(ST[2])+'</div><div style="display:flex;gap:12px;margin-top:12px;align-items:center;flex-wrap:wrap"><span class="mk-help">Desde Registrada o Complementación también se puede anular:</span>'+arrow('→')+'<div style="width:260px">'+box(ST[3],200)+'</div></div><div class="mk-subhead mk-mt">'+ic('check')+'Acciones permitidas por estado</div><div id="ft"></div>'+alertB('warning','Supuestos del prototipo','Los estados y las transiciones son una propuesta para validar con el área de inversiones. Finalizada y Anulada son estados terminales y solo admiten consulta.',false);
 const Y='<span class="pos">Sí</span>',N='<span class="mk-na">No</span>';
 const rows=[['Registrada',Y,Y,Y,'Complementación, Anulada'],['Complementación',Y,Y,Y,'Finalizada, Anulada'],['Finalizada',Y,N,N,'—'],['Anulada',Y,N,N,'—']].map(a=>({e:a[0],v:a[1],ed:a[2],an:a[3],sig:a[4]}));
 const strip=h=>h.replace(/<[^>]+>/g,'');
 DataTable($('#ft',pg),{cols:[{h:'Estado',k:'e',html:r=>badge(r.e,r.e==='Registrada'?'info':r.e==='Complementación'?'warning':r.e==='Finalizada'?'success':'danger',true),txt:r=>r.e},{h:'Ver detalle',k:'v',html:r=>r.v,txt:r=>strip(r.v)},{h:'Editar',k:'ed',html:r=>r.ed,txt:r=>strip(r.ed)},{h:'Anular',k:'an',html:r=>r.an,txt:r=>strip(r.an)},{h:'Siguiente estado',k:'sig'}],rows:()=>rows,noPage:true,noFilters:true,noTools:true,noFoot:true});
};
`;
rep("/* =============== Shell: navbar",pages+"\n/* =============== Shell: navbar");
fs.writeFileSync('mk.js',s);console.log('mk.js patched');
// ---- build2: datos de Colombia ----
let bf=fs.readFileSync('build2.js','utf8');
if(!bf.includes('COLOMBIA')){
 const mark="data=rep(data,\"'pa-pos':'pa-neg'\"";
 if(!bf.includes(mark))throw new Error('mark missing in build2');
 const col="/*COLOMBIA*/data=data.split('CELULOSA ARAUCO Y CONSTITUCION S.A.').join('ISA S.A. E.S.P.').split('TESORERÍA GENERAL DE LA REPÚBLICA DE CHILE').join('MINISTERIO DE HACIENDA (TES)').split('BANCO CENTRAL DE CHILE').join('BANCO DE LA REPÚBLICA').split('ADMINISTRADORA GENERAL DE FONDOS SURA').join('FIDUCIARIA BANCOLOMBIA').split('BANCO SANTANDER').join('BANCOLOMBIA S.A.').split('FALABELLA S.A.').join('GRUPO SURA').split(\"types=['UF','DESCUENTO'\").join(\"types=['DTF','DESCUENTO'\").split(\"'UF'\").join(\"'UVR'\").split(\"'CLP'\").join(\"'COP'\");\n";
 bf=bf.replace(mark,()=>col+mark);
 fs.writeFileSync('build2.js',bf);console.log('build2 patched');
}
