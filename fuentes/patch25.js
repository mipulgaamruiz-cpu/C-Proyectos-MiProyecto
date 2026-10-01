const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,110));s=s.replace(a,()=>b)};
/* gráficas más anchas que altas (aprovechan el ancho de pantalla) */
/* Atribución de renta fija: cascada y tablas en horizontal */
rep("</div><div class=\"mk-card mk-mb\"><h3 style=\"margin:0 0 6px;font-size:14px\">Descomposición del exceso de retorno</h3>'+waterfallSVG(a.comps,a.exc,'Exceso total')+'</div><div class=\"mk-cols2\"><div class=\"mk-card\"><h3 style=\"margin:0 0 8px;font-size:14px\">Efectos por factor</h3><div id=\"f\"></div></div><div class=\"mk-card\"><h3 style=\"margin:0 0 8px;font-size:14px\">Posicionamiento vs. benchmark</h3><div id=\"p\"></div></div></div>'","</div><div class=\"mk-cols2\" style=\"grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)\"><div class=\"mk-card\"><h3 style=\"margin:0 0 6px;font-size:14px\">Descomposición del exceso de retorno</h3>'+waterfallSVG(a.comps,a.exc,'Exceso total')+'</div><div><div class=\"mk-card mk-mb\"><h3 style=\"margin:0 0 8px;font-size:14px\">Efectos por factor</h3><div id=\"f\"></div></div><div class=\"mk-card\"><h3 style=\"margin:0 0 8px;font-size:14px\">Posicionamiento vs. benchmark</h3><div id=\"p\"></div></div></div></div>'");
fs.writeFileSync('mk.js',s);console.log('mk.js ok');
let css=fs.readFileSync('extras.css','utf8');
if(!css.includes('/* ===== Gráficas bajas ===== */')){css+=`
/* ===== Gráficas bajas ===== */
#gc svg{max-height:170px}
#res .mk-tablewrap,#gt .mk-tablewrap{max-height:max(210px,calc(100vh - 600px))}
#res .mk-cols2 .mk-tablewrap{max-height:none}
`;fs.writeFileSync('extras.css',css)}
console.log('css ok');
