const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,90));s=s.replace(a,()=>b)};
const i=s.indexOf("const OREPS=["),j=s.indexOf("const BOOK_COLS=");
s=s.slice(0,i)+"const OREPS=[\n ['book','Libro de órdenes','Renta fija, renta variable y mercado monetario en un solo informe, con su estado.','Operativos',r=>true]\n];\n"+s.slice(j);
/* sin filtro avanzado */
let a=s.indexOf("+'</div><div class=\"mk-mt\" style=\"display:flex;align-items:center;gap:8px\"><label"),b=s.indexOf("+'<div class=\"mk-repstrip\">");
if(a<0||b<0)throw new Error('adv');s=s.slice(0,a)+"+'</div>'\n   "+s.slice(b);
rep("<div class=\"mk-repstrip\"><span class=\"mk-help\" style=\"margin:0\">Informe por rango de fechas: entrega las órdenes creadas entre la <b>fecha inicial</b> y la <b>fecha final</b>.</span><span style=\"display:flex;gap:10px\">","<div class=\"mk-repstrip\" style=\"justify-content:flex-end\"><span style=\"display:flex;gap:10px\">");
rep("  $('[name=adv]',pg).addEventListener('change',e=>{$('#advp',pg).hidden=!e.target.checked});\n","");
rep("const adv=$('[name=adv]',pg).checked,a=new Date(","const a=new Date(");
rep("&&r.fecha>=a&&r.fecha<=b&&(!adv||((!g('est')||ESTADO_ORD[r.estatus][0]===g('est'))&&(!g('tipo')||r.tipo===g('tipo')))));","&&r.fecha>=a&&r.fecha<=b);");
fs.writeFileSync('mk.js',s);
let l=fs.readFileSync('libreto.js','utf8');
const x="Abrir **Libro de órdenes · todos los mercados**.";if(!l.includes(x))throw new Error('l1');l=l.replace(x,()=>"Abrir **Libro de órdenes**.");
const y=" Mostrar “Filtro Avanzado” (estado y tipo).";if(!l.includes(y))throw new Error('l2');l=l.replace(y,()=>"");
fs.writeFileSync('libreto.js',l);console.log('ok');
