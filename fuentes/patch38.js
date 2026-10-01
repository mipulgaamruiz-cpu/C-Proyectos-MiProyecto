const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b,all)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,90));s=all?s.split(a).join(b):s.replace(a,()=>b)};
/* deuda previa: el portafolio por defecto de Atribución se resuelve al dibujar, para que respete el país */
rep("port:opts.port||FUNDS[1]","port:opts.pi!=null?FUNDS[opts.pi]:FUNDS[1]");
rep("{level:true,port:FUNDS[5]}","{level:true,pi:5}");
rep("{port:FUNDS[0]}","{pi:0}",true);
fs.writeFileSync('mk.js',s);console.log('ok');
