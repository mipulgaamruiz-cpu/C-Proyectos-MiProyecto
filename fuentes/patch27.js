const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,110));s=s.replace(a,()=>b)};
rep("'<b>'+ok.length+'</b> registros cargados · <b>'+errs.length+'</b> con errores (no se cargaron).'+list","'<b>'+ok.length+'</b> registros cargados · <b>'+errs.length+'</b> con errores'+(errs.length?' (las filas con error no se cargaron)':'')+'.'+list");
rep("'<b>0</b> registros cargados · <b>'+errs.length+'</b> con errores.'+list","'<b>0</b> registros cargados · <b>'+errs.length+'</b> con errores (ninguna fila se cargó).'+list");
fs.writeFileSync('mk.js',s);console.log('ok');
