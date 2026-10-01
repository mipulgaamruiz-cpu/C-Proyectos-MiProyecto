const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,80));s=s.replace(a,()=>b)};
// 1) eliminar la pantalla Órdenes de Clientes
const a=s.indexOf("/* --- Órdenes de clientes --- */"),b=s.indexOf("/* --- Control de límites --- */");
if(a<0||b<0||b<a)throw new Error('bloque clientes no encontrado');
s=s.slice(0,a)+s.slice(b);
rep(",['#/orders/client-orders','Ordenes de Clientes','clip','clients','Gestiona las órdenes de clientes.']","");
rep("desc:'Captura y gestión de órdenes de renta fija, renta variable y clientes.'","desc:'Captura y gestión de órdenes de renta fija y renta variable.'");
rep("INSTRUMENTS,CLIENT_ORDERS,LIMITS","INSTRUMENTS,LIMITS");
// 2) Parametrización primero en el menú y en el Home
const ps=s.indexOf(" {key:'param',label:'Parametrización'");
if(ps<0)throw new Error('param no encontrado');
const pe=s.indexOf("\n];",ps);
let paramObj=s.slice(ps,pe);           // incluye la coma final si la hay
s=s.slice(0,ps)+s.slice(pe);           // quita param del final
paramObj=paramObj.replace(/,\s*$/,'');
// el elemento previo termina con ',' -> quitar coma sobrante antes de '];'
s=s.replace(/,\n\];(\nconst S=)/,"\n];$1");
const ns=s.indexOf("const NAV=[\n")+"const NAV=[\n".length;
s=s.slice(0,ns)+paramObj+",\n"+s.slice(ns);
fs.writeFileSync('mk.js',s);console.log('ok');
