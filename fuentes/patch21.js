const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const a="<button class=\"mk-btn mk-btn--outline mk-btn--sm\" data-x=\"csv\"'+TIP('Descargar los datos filtrados en CSV')+'>CSV</button><button class=\"mk-btn mk-btn--outline mk-btn--sm\" data-x=\"xls\"'+TIP('Descargar los datos filtrados en Excel')+'>Excel</button>";
if(!s.includes(a))throw new Error('missing');
s=s.replace(a,()=>"<button class=\"mk-btn mk-btn--secondary\" data-x=\"csv\"'+TIP('Descargar los datos filtrados en CSV')+'>'+ic('clouddl')+'CSV</button><button class=\"mk-btn mk-btn--excel\" data-x=\"xls\"'+TIP('Descargar los datos filtrados en Excel')+'>'+ic('clouddl')+'Excel</button>");
fs.writeFileSync('mk.js',s);console.log('ok');
