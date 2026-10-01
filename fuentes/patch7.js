const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const a="LEVELS.Moneda=['DOP','USD','EUR'];SUBLIMITS.MONEDA=['DOP','USD','EUR']}";
if(!s.includes(a))throw new Error('missing');
s=s.replace(a,()=>"LEVELS.Moneda=['DOP','USD','EUR'];SUBLIMITS.MONEDA=['DOP','USD','EUR'];HOLDINGS_BASE.forEach(h=>{if(/LOCAL/.test(h[1])&&h[2]==='USD')h[2]='DOP'})}");
fs.writeFileSync('mk.js',s);console.log('ok');
