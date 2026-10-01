const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,90));s=s.replace(a,()=>b)};
// ---- constantes y helper ----
rep("/* --- Renta fija --- */",`const APO={
 port:[['Renta fija','#/orders/fixed-income'],['Renta variable','#/orders/variable-income'],['Evaluación de límites','#/limit-control/limit-evaluation'],['Performance attribution','#/performance-attribution/summary']],
 instr:[['Renta fija','#/orders/fixed-income'],['Renta variable','#/orders/variable-income'],['Flujos futuros','#/dashboard/future-flows'],['Visor de portafolio','#/dashboard/graphics']],
 index:[['Benchmarks','#/parametrizacion/benchmarks'],['Resumen de desempeño','#/performance-attribution/summary'],['Atribución de retorno','#/performance-attribution/brinson']],
 bench:[['Resumen de desempeño','#/performance-attribution/summary'],['Atribución de retorno','#/performance-attribution/brinson'],['Reportes','#/performance-attribution/reports']],
 limits:[['Evaluación de límites','#/limit-control/limit-evaluation']],
 flow:[['Renta fija','#/orders/fixed-income'],['Renta variable','#/orders/variable-income']],
 cat:[
  [['Visor de portafolio','#/dashboard/graphics'],['Configuración de límites','#/parametrizacion/limits']],
  [['Visor de portafolio','#/dashboard/graphics'],['Configuración de límites','#/parametrizacion/limits']],
  [['Renta fija','#/orders/fixed-income'],['Flujos futuros','#/dashboard/future-flows'],['Visor de portafolio','#/dashboard/graphics']],
  [['Configuración de límites','#/parametrizacion/limits'],['Evaluación de límites','#/limit-control/limit-evaluation']]
 ]
};
const apoyaHTML=a=>'<div class="mk-apoya"><span>Apoya a:</span>'+a.map(x=>'<a class="mk-chip" data-go="'+x[1]+'" href="'+x[1]+'">'+esc(x[0])+'</a>').join('')+'</div>';
/* --- Renta fija --- */`);
// ---- crudPage: línea "Apoya a" + aviso al inactivar ----
rep("let table;\n  const repaint=()=>table.render();","if(cfg.apoya)pg.insertAdjacentHTML('beforebegin',apoyaHTML(cfg.apoya));\n  let table;\n  const repaint=()=>table.render();");
rep("mkConfirm({title:t.title,danger:t.danger,message:t.message,","mkConfirm({title:t.title,danger:t.danger,message:t.message+(t.danger&&cfg.apoya?'<div class=\"mk-help\" style=\"margin-top:6px\">Apoya a: '+cfg.apoya.map(a=>a[0]).join(', ')+'.</div>':''),");
// ---- cada maestro ----
rep("entity:'portafolio',","apoya:APO.port,entity:'portafolio',");
rep("entity:'instrumento',","apoya:APO.instr,entity:'instrumento',");
rep("entity:'índice',","apoya:APO.index,entity:'índice',");
rep("entity:'componente de benchmark',","apoya:APO.bench,entity:'componente de benchmark',");
rep("function limitsPage(title,help){return crudPage({title:title,help:help,entity:'límite',","function limitsPage(title,help){return crudPage({title:title,help:help,apoya:APO.limits,entity:'límite',");
// ---- Flujo de órdenes y Catálogos ----
rep("const pg=mountPage(view,meta,'Flujo de órdenes','Estados de una orden y las acciones permitidas en cada uno.');","const pg=mountPage(view,meta,'Flujo de órdenes','Estados de una orden y las acciones permitidas en cada uno.');\n pg.insertAdjacentHTML('beforebegin',apoyaHTML(APO.flow));");
rep("$('#cp',pg).innerHTML='<div id=\"ct\"></div>';","$('#cp',pg).innerHTML=apoyaHTML(APO.cat[st.tab])+'<div id=\"ct\"></div>';");
fs.writeFileSync('mk.js',s);console.log('mk.js ok');
// ---- CSS ----
let css=fs.readFileSync('extras.css','utf8');
if(!css.includes('.mk-apoya')){css+="\n/* ===== Línea 'Apoya a' de los maestros ===== */\n.mk-apoya{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:-4px 0 14px;font-size:12.5px;color:var(--mk-text-muted)}\n.mk-apoya span{font-weight:600}\n.mk-apoya .mk-chip,.mk-tabpanel .mk-apoya .mk-chip{text-decoration:none;padding:3px 10px;font-size:12px;transition:background .15s,color .15s}\n.mk-apoya .mk-chip:hover{background:var(--mk-primary-50);color:var(--mk-primary)}\nhtml.dark .mk-apoya .mk-chip:hover{background:#2a2040;color:#e3c8f8}\n";fs.writeFileSync('extras.css',css)}
// ---- libreto: escena 7 ----
let l=fs.readFileSync('libreto.js','utf8');
const a="'Mostrar rápido **Portafolios**, **Índices de referencia**, **Benchmarks** y **Configuración de límites** (Ver, Editar, Inactivar).'";
if(!l.includes(a))throw new Error('libreto scene 7 missing');
l=l.replace(a,()=>a+",'Señalar la línea **Apoya a** de cada maestro: qué pantallas alimenta y qué se afecta si se inactiva.'");
fs.writeFileSync('libreto.js',l);console.log('libreto ok');
