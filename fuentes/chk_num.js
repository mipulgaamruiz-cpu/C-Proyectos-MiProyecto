const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('C:/Derivados AF/front-inversiones-performance-attribution.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.scrollTo=()=>{}}});
const w=dom.window,d=new Date(),op=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
for(const f of ['FIC LIQUIDEZ','FIC MONETARIO']){const c=w.__mk.mmCalc(f,op);console.log(f,'saldo',Math.round(c.tot),'wam',c.wam.toFixed(2),'tasa',(c.tasa*100).toFixed(3),'v7',Math.round(c.v7),c.n7,'liq1',(c.liq1/c.tot*100).toFixed(2),'dev',Math.round(c.dev))}
console.log('bancolombia usado',w.__mk.cpUsed('BANCOLOMBIA S.A.'));
console.log('libro filas',w.__mk.bookRows().length);
