const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const a="table=DataTable(pg,{cols:cfg.cols,";
if(!s.includes(a))throw new Error('missing');
s=s.replace(a,()=>"const tbHost=document.createElement('div');pg.appendChild(tbHost);table=DataTable(tbHost,{cols:cfg.cols,");
fs.writeFileSync('mk.js',s);console.log('ok');
