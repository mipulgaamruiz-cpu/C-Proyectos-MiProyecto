const fs=require('fs');let s=fs.readFileSync('libreto.js','utf8');
const a="  bullet('Tener claro el hilo: todo se cuenta con **'+c.fondo+'**.'),";
if(!s.includes(a))throw new Error('missing');
s=s.replace(a,()=>"  bullet('Dejar el **tema claro** (botón luna/sol, a la derecha de País). El tema oscuro se puede mostrar al final como detalle opcional.'),\n"+a);
fs.writeFileSync('libreto.js',s);console.log('ok');
