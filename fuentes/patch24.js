const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,110));s=s.replace(a,()=>b)};

/* 1) CSV / Excel en la misma fila que los filtros (una fila menos) */
const EXP="<div class=\"mk-export\" style=\"margin-left:auto\"><button class=\"mk-btn mk-btn--secondary\" data-x=\"csv\"'+TIP('Descargar los datos filtrados en CSV')+'>'+ic('clouddl')+'CSV</button><button class=\"mk-btn mk-btn--excel\" data-x=\"xls\"'+TIP('Descargar los datos filtrados en Excel')+'>'+ic('clouddl')+'Excel</button></div>";
rep("const filt=o.noFilters?'':","const exp=o.noTools?'':'"+EXP+"';\n  const filt=o.noFilters?'':");
rep("data-clear>Limpiar</button></div>';","data-clear>Limpiar</button>'+exp+'</div>';");
{const a=s.indexOf("(o.noTools?'':'<div class=\"mk-datatable__toolbar\">"),mark="Excel</button></div></div>')",b=s.indexOf(mark,a);if(a<0||b<0)throw new Error('toolbar');
 s=s.slice(0,a)+"(o.noTools||!o.noFilters?'':'<div class=\"mk-datatable__toolbar\"><div class=\"mk-search\"></div>'+exp+'</div>')"+s.slice(b+mark.length)}

/* 2) Carga masiva: Documentos e Importación lado a lado */
rep("return '<fieldset class=\"mk-fieldset\"><legend>Documentos</legend>","return '<div class=\"mk-massgrid\"><fieldset class=\"mk-fieldset\"><legend>Documentos</legend>");
rep("<div data-result class=\"mk-mt\"></div></fieldset>';","<div data-result class=\"mk-mt\"></div></fieldset></div>';");
fs.writeFileSync('mk.js',s);console.log('mk.js ok');

/* 3) CSS: pantallas compactas y horizontales */
let css=fs.readFileSync('extras.css','utf8');
if(!css.includes('/* ===== Compacto y horizontal ===== */')){css+=`
/* ===== Compacto y horizontal ===== */
.mk-page{padding:12px 18px 22px}
.mk-section{padding:14px 18px}
.mk-headerpage{margin-bottom:8px}.mk-headerpage h1{font-size:20px}
.mk-kpis{gap:8px;margin-bottom:10px}.mk-kpi{padding:6px 12px}.mk-kpi__v{font-size:17px;margin-top:0}.mk-kpi__l{font-size:11px}
.mk-tplfilters,.mk-filters{margin-bottom:10px;gap:10px}
.mk-tplfilters .mk-field,.mk-filters .mk-field{min-width:150px}
.mk-tplfilters .mk-field--search,.mk-filters .mk-field--search{flex:1 1 200px;min-width:180px}
.mk-tabs.mk-mb{margin-bottom:10px!important}
.mk-tablewrap{max-height:max(280px,calc(100vh - 400px));overflow:auto}
.mk-table thead th{position:sticky;top:0;z-index:2}
.mk-datatable__foot{margin-top:8px}
.mk-datatable__toolbar{margin-bottom:8px}
.mk-apoya{margin:-2px 0 8px}
.mk-card{padding:12px}
.mk-mb{margin-bottom:10px}.mk-mt{margin-top:10px}
.mk-modal--form{width:min(900px,100%)}
.mk-modal--form .mk-formgrid{grid-template-columns:repeat(3,minmax(0,1fr))}
@media(max-width:900px){.mk-modal--form .mk-formgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.mk-modal--form .mk-formgrid{grid-template-columns:1fr}}
.mk-massgrid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:16px;align-items:start}
.mk-massgrid .mk-fieldset{margin:0}
.mk-massgrid .mk-massrow{flex-direction:column}
.mk-massgrid .mk-massrow .mk-fileupload{flex:1 1 auto;min-height:110px;width:100%}
.mk-massgrid .mk-massside{flex:0 0 auto;width:100%}
@media(max-width:1100px){.mk-massgrid{grid-template-columns:1fr}}
.mk-accordion__body .mk-massgrid{padding:0}
`;fs.writeFileSync('extras.css',css)}
console.log('css ok');
