const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,110));s=s.replace(a,()=>b)};
rep("las operaciones de corto plazo: CDT, simultáneas, interbancarios, overnight y títulos de deuda pública de corto plazo.","las operaciones de corto plazo: depósitos a término, repos, interbancarios, overnight y títulos de deuda pública de corto plazo.");
rep("m.cols.map(c=>[c[0],c[1]?'Sí':'No',c[2],c[3]]));\n return buildBook","m.cols.map(c=>[c[0],c[1]?'Sí':'No',loc(c[2]),loc(c[3])]));\n return buildBook");
rep("'</td><td>'+esc(c[2])+'</td><td>'+esc(c[3])+'</td></tr>').join('');download('Manual_","'</td><td>'+esc(loc(c[2]))+'</td><td>'+esc(loc(c[3]))+'</td></tr>').join('');download('Manual_");
fs.writeFileSync('mk.js',s);console.log('ok');
