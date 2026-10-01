const fs=require('fs');let s=fs.readFileSync('libreto.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,70));s=s.split(a).join(b)};
const pa=` ,
 {file:'Panama',pais:'Panamá',mon:'PAB',fondo:'FONDO DE INVERSIÓN RENTA FIJA',fondo2:'FONDO DE INVERSIÓN LIQUIDEZ',fondoMM:'FONDO DE INVERSIÓN MONETARIO',emisor:'BANCO HIPOTECARIO NACIONAL',instr:'LTES…',bonos:'letras y bonos del Tesoro',op:'DPF',repo:'repos',cp:'BANCO GENERAL',ref:'SOFR y tasa de depósitos a plazo fijo',
  aud:'Administradoras de fondos de inversión, casas de valores y áreas de inversiones: gerente de inversiones, riesgos y operaciones.',
  extra:'Moneda base PAB (balboa, a la par con el dólar) con circulación en USD; sin indexación (no hay UF ni UVR); tasas SOFR y de depósitos a plazo fijo; índice de la Bolsa de Valores de Panamá; mercado monetario con DPF, repos, interbancarios, overnight y letras del Tesoro de corto plazo.',
  multi:'Cambiar País a Colombia, Chile o República Dominicana para mostrar que emisores, monedas, índices y operaciones monetarias cambian.'}`;
rep("multi:'Cambiar País a Chile o República Dominicana para mostrar","multi:'Cambiar País a Chile, República Dominicana o Panamá para mostrar");
rep("multi:'Cambiar País a Colombia o República Dominicana para mostrar","multi:'Cambiar País a Colombia, República Dominicana o Panamá para mostrar");
rep("multi:'Cambiar País a Colombia o Chile para mostrar","multi:'Cambiar País a Colombia, Chile o Panamá para mostrar");
rep("entre Colombia, Chile y República Dominicana, incluidas","entre Colombia, Chile, República Dominicana y Panamá, incluidas");
/* añadir Panamá al arreglo */
const i=s.indexOf("multi:'Cambiar País a Colombia o Chile")>=0?-1:s.indexOf("multi:'Cambiar País a Colombia, Chile o Panamá para mostrar");
const j=s.indexOf("}\n];",i);if(i<0||j<0)throw new Error('array');
s=s.slice(0,j+1)+pa+s.slice(j+1);
rep("Las cifras son ilustrativas: no compararlas con portafolios reales del cliente.'","Las cifras son ilustrativas: no compararlas con portafolios reales del cliente.','Los nombres de bancos, instrumentos y tasas de cada país son ilustrativos; en Panamá, además, deben validarse con el negocio antes de la demo (no hay UF ni UVR, y el balboa circula a la par con el dólar).'");
fs.writeFileSync('libreto.js',s);console.log('ok');
