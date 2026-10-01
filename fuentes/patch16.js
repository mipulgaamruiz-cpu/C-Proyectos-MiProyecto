const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const a="'<div class=\"mk-accordion'+(k?' collapsed':'')+'\" id=\"acc-'+g.key+'\">";
if(!s.includes(a))throw new Error('missing');
s=s.replace(a,()=>"'<div class=\"mk-accordion collapsed\" id=\"acc-'+g.key+'\">");
fs.writeFileSync('mk.js',s);console.log('ok');
