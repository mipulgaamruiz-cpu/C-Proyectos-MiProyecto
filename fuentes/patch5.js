const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,70));s=s.replace(a,()=>b)};
rep("title:(row?'Editar ':'Nuevo ')+cfg.entity","title:(row?'Editar ':(/^La /.test(cfg.entityArt||'')?'Nueva ':'Nuevo '))+cfg.entity");
rep("const v=$('#view'),tk=++S.token;","$$('.mk-modal-overlay').forEach(m=>m.remove());const v=$('#view'),tk=++S.token;");
fs.writeFileSync('mk.js',s);console.log('ok');
