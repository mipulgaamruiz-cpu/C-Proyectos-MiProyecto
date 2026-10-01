const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,80));s=s.replace(a,()=>b)};
rep("title:'Revisa '+cfg.entityArt,","title:'Revisa '+cfg.entityArt.toLowerCase(),");
rep("toast(row?cfg.entityArt+' actualizado correctamente.':cfg.entityArt+' creado correctamente.','success',row?'Cambios guardados':'Registro creado')","{const fem=/^La /.test(cfg.entityArt);toast(row?cfg.entityArt+(fem?' actualizada':' actualizado')+' correctamente.':cfg.entityArt+(fem?' creada':' creado')+' correctamente.','success',row?'Cambios guardados':(fem?'Registro creado':'Registro creado'))}");
fs.writeFileSync('mk.js',s);
let b=fs.readFileSync('build2.js','utf8');
if(!b.includes('LV MONETARIO')){b=b.replace(".split(\"'CLP'\").join(\"'COP'\");",()=>".split(\"'CLP'\").join(\"'COP'\").split('FONDO MUTUO LV MONETARIO').join('FIC MONETARIO');");fs.writeFileSync('build2.js',b)}
console.log('ok',b.includes('LV MONETARIO'));
