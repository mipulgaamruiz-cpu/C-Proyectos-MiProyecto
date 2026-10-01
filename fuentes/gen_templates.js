const fs=require('fs'),path=require('path'),{JSDOM,VirtualConsole}=require('jsdom'),ExcelJS=require('exceljs');
const html=fs.readFileSync('C:/Derivados AF/front-inversiones-performance-attribution.html','utf8');
const vc=new VirtualConsole();
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.scrollTo=()=>{};w.matchMedia=w.matchMedia||(()=>({matches:false,addListener(){},removeListener(){}}))}});
const w=dom.window,OUT='C:/Derivados AF/Plantillas_carga_masiva';
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_|_$/g,'');
const ids=['fixed','variable','mm','instr','bench','cp'];
(async()=>{
 const report=[];
 for(const pais of ['Colombia','Chile','República Dominicana','Panamá']){
  w.__mk.applyCountry(pais);
  const dir=path.join(OUT,slug(pais));fs.mkdirSync(dir,{recursive:true});
  for(const id of ids){
   const f=w.__mk.files(id),base='Ejemplo_'+(f.pre?'Importacion':'Cargue_Masivo')+'_'+slug(f.nombre);
   fs.writeFileSync(path.join(dir,base+'.xlsx'),Buffer.from(f.xlsx));
   fs.writeFileSync(path.join(dir,base+'.csv'),f.csv,'utf8');
   fs.writeFileSync(path.join(dir,'Estructura_'+(f.pre?'Importacion':'Cargue_Masivo')+'_'+slug(f.nombre)+'.xlsx'),Buffer.from(f.estructura));
   /* validación con ExcelJS (lector independiente) */
   const wb=new ExcelJS.Workbook();await wb.xlsx.readFile(path.join(dir,base+'.xlsx'));
   const ws=wb.getWorksheet('Estructura'),rows=[];ws.eachRow(r=>rows.push(r.values.slice(1).map(v=>v==null?'':String(v))));
   const okHead=JSON.stringify(rows[0])===JSON.stringify(f.head),okRows=rows.length-1===f.rows.length;
   const dvs=ws.dataValidations&&ws.dataValidations.model?Object.keys(ws.dataValidations.model).length:0;
   const lists=wb.getWorksheet('Listas'),ins=wb.getWorksheet('Instrucciones');
   report.push([pais,id,'filas '+f.rows.length,okHead&&okRows?'OK':'FALLA','listas desplegables: '+dvs,'hojas: '+wb.worksheets.map(x=>x.name).join('/')].join(' | '));
  }
 }
 console.log(report.join('\n'));
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
