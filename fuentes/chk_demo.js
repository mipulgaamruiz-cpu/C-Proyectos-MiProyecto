const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('C:/Derivados AF/front-inversiones-performance-attribution.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.scrollTo=()=>{}}});
const w=dom.window;const out=[];
for(const p of ['Colombia','Chile','República Dominicana']){w.__mk.applyCountry(p);
 for(const id of ['fixed','variable','mm','instr','bench','cp']){const m=w.__mk.MASS[id];const rows=m.demo();const res=rows.map(r=>m.row(r));const bad=res.map((r,i)=>r.e?'fila '+(i+2)+': '+r.e.join('; '):null).filter(Boolean);
  const csv=w.__mk.parseCSV(w.__mk.demoCsv(m));const csvOk=csv.length===rows.length+1&&csv[1].length===m.cols.length;
  out.push(p+' | '+id+' | '+(bad.length?'ERRORES '+bad.join(' || '):'todas válidas ('+rows.length+')')+' | csv '+(csvOk?'ok':'MAL'))}}
console.log(out.join('\n'));process.exit(0)
