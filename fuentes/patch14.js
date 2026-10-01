const fs=require('fs');let b=fs.readFileSync('build2.js','utf8');
const a=".split('FONDO MUTUO LV MONETARIO').join('FIC MONETARIO');";
if(!b.includes(a))throw new Error('missing');
b=b.replace(a,()=>".split('FONDO MUTUO LV MONETARIO').join('FIC MONETARIO').split('Efecto moneda / UF').join('Efecto moneda e indexación');");
fs.writeFileSync('build2.js',b);console.log('ok');
