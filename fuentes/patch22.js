const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,100));s=s.replace(a,()=>b)};

/* ---------- 1. Reemplazar bloque MASS + bindMass ---------- */
const a1=s.indexOf('const MASS={'),b1=s.indexOf('function massHTML(m){');
if(a1<0||b1<0)throw new Error('MASS block');
const NEWMASS=String.raw`/* ===== Carga masiva: lectura de CSV y Excel, validación y carga ===== */
const normH=s=>String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const findCI=(arr,v)=>arr.find(x=>normH(x)===normH(v));
const numP=v=>{let t=String(v==null?'':v).trim().replace(/\s/g,'');if(!t)return null;if(t.includes(',')&&!t.includes('.'))t=t.replace(',','.');else t=t.replace(/,/g,'');const n=parseFloat(t);return isNaN(n)?NaN:n};
const isoP=v=>{v=String(v==null?'':v).trim();if(!v)return null;let m=v.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[1]+'-'+m[2]+'-'+m[3];m=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');if(/^\d{5}(\.\d+)?$/.test(v)){const d=new Date(Math.round((+v-25569)*864e5));return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0')}return undefined};
const _crcT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=_crcT[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
function zipStore(files){const enc=new TextEncoder(),parts=[],cd=[];let off=0;
 files.forEach(f=>{const nm=enc.encode(f.name),data=enc.encode(f.data),crc=crc32(data);
  const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(12,0x21,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(lh.buffer),nm,data);
  const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(14,0x21,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
  cd.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+data.length});
 const cdSize=cd.reduce((a,p)=>a+p.length,0),end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cdSize,true);end.setUint32(16,off,true);
 const all=parts.concat(cd,[new Uint8Array(end.buffer)]),out=new Uint8Array(all.reduce((a,p)=>a+p.length,0));let o=0;all.forEach(p=>{out.set(p,o);o+=p.length});return out}
const colL=i=>String.fromCharCode(65+i);
const xe=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sheetXml=(rows,dv,width)=>'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><cols><col min="1" max="'+Math.max(1,rows.reduce((a,r)=>Math.max(a,r.length),1))+'" width="'+(width||26)+'" customWidth="1"/></cols><sheetData>'+rows.map((row,ri)=>'<row r="'+(ri+1)+'">'+row.map((v,ci)=>'<c r="'+colL(ci)+(ri+1)+'" t="inlineStr"><is><t>'+xe(v)+'</t></is></c>').join('')+'</row>').join('')+'</sheetData>'+(dv||'')+'</worksheet>';
function buildXlsx(m){
 const head=m.cols.map(c=>c[0]),ej=m.ej();const lists=[];
 m.lists.forEach((fn,ci)=>{if(fn)lists.push({ci,name:head[ci],vals:fn()})});
 const dv=lists.length?'<dataValidations count="'+lists.length+'">'+lists.map((l,k)=>'<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="'+colL(l.ci)+'2:'+colL(l.ci)+'1000"><formula1>Listas!$'+colL(k)+'$2:$'+colL(k)+'$'+(l.vals.length+1)+'</formula1></dataValidation>').join('')+'</dataValidations>':'';
 const maxL=lists.reduce((a,l)=>Math.max(a,l.vals.length),0),listRows=[lists.map(l=>l.name)];for(let i=0;i<maxL;i++)listRows.push(lists.map(l=>l.vals[i]==null?'':l.vals[i]));
 const inst=[['Campo','Obligatorio','Valores permitidos','Ejemplo']].concat(m.cols.map(c=>[c[0],c[1]?'Sí':'No',c[2],c[3]]));
 const wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Estructura" sheetId="1" r:id="rId1"/><sheet name="Instrucciones" sheetId="2" r:id="rId2"/><sheet name="Listas" sheetId="3" r:id="rId3"/></sheets></workbook>';
 return zipStore([
  {name:'[Content_Types].xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'},
  {name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
  {name:'xl/workbook.xml',data:wb},
  {name:'xl/_rels/workbook.xml.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/></Relationships>'},
  {name:'xl/worksheets/sheet1.xml',data:sheetXml([head,ej],dv)},
  {name:'xl/worksheets/sheet2.xml',data:sheetXml(inst,'',34)},
  {name:'xl/worksheets/sheet3.xml',data:sheetXml(listRows,'',30)}
 ]);
}
async function inflateRaw(u8){const ds=new DecompressionStream('deflate-raw');return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(ds)).arrayBuffer())}
async function unzip(buf){const u=new Uint8Array(buf),dv=new DataView(buf);let e=u.length-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw new Error('no es un archivo Excel válido');const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const out={},dec=new TextDecoder();
 for(let i=0;i<n;i++){const meth=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true),name=dec.decode(u.subarray(p+46,p+46+nl)),lnl=dv.getUint16(lo+26,true),lel=dv.getUint16(lo+28,true),st=lo+30+lnl+lel,raw=u.subarray(st,st+cs);out[name]=meth===0?raw:await inflateRaw(raw);p+=46+nl+el+cl}return out}
async function readXlsx(file){const z=await unzip(await file.arrayBuffer()),dec=new TextDecoder(),X=n=>z[n]?new DOMParser().parseFromString(dec.decode(z[n]),'application/xml'):null;
 const wb=X('xl/workbook.xml'),rels=X('xl/_rels/workbook.xml.rels');if(!wb||!rels)throw new Error('no es un archivo Excel válido');
 const first=wb.getElementsByTagName('sheet')[0],rid=first.getAttribute('r:id')||first.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'),rel=[...rels.getElementsByTagName('Relationship')].find(r=>r.getAttribute('Id')===rid);
 let target=rel.getAttribute('Target').replace(/^\//,'');if(!target.startsWith('xl/'))target='xl/'+target;
 const ss=X('xl/sharedStrings.xml'),shared=ss?[...ss.getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].map(t=>t.textContent).join('')):[],sh=X(target),rows=[];
 [...sh.getElementsByTagName('row')].forEach(r=>{const arr=[];[...r.getElementsByTagName('c')].forEach(c=>{const ref=c.getAttribute('r'),ci=ref.replace(/\d+/g,'').split('').reduce((a,ch)=>a*26+ch.charCodeAt(0)-64,0)-1,t=c.getAttribute('t');let v='';if(t==='s'){const ve=c.getElementsByTagName('v')[0];v=ve?shared[+ve.textContent]:''}else if(t==='inlineStr'){v=[...c.getElementsByTagName('t')].map(x=>x.textContent).join('')}else{const ve=c.getElementsByTagName('v')[0];v=ve?ve.textContent:''}arr[ci]=v});rows.push(Array.from(arr,x=>x==null?'':String(x).trim()))});
 return rows}
function parseCSV(t){t=t.replace(/^﻿/,'');const L=t.split(/\r?\n/).filter(x=>x.trim());if(!L.length)return[];const d=(L[0].match(/;/g)||[]).length>(L[0].match(/,/g)||[]).length?';':',';return L.map(l=>{const out=[];let cur='',q=false;for(let i=0;i<l.length;i++){const ch=l[i];if(q){if(ch==='"'&&l[i+1]==='"'){cur+='"';i++}else if(ch==='"')q=false;else cur+=ch}else if(ch==='"')q=true;else if(ch===d){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out.map(x=>x.trim())})}
const VI_LIST=()=>Array.from(new Set(VI_ORDERS.map(o=>o.instr).concat(LOCL(['FALABELLA','SURA','GRUPOSURA','NUTRESA','ECOPETROL','CELSIA','CEMARGOS','BOGOTA','BVC','BSANTANDER']))));
const CALIFS=['AAA','AA+','AA','AA-','A','A-','BBB'];
const sv=x=>String(x==null?'':x);
const MASS={
 fixed:{id:'fixed',nombre:'Órdenes de Renta Fija',cols:[['Portafolio',1,'Nombre exacto del maestro de Portafolios','FIC RENTA FIJA'],['Tipo',1,'COMPRA o VENTA','COMPRA'],['Instrumento',1,'Nemotécnico del maestro de Instrumentos','TFIT11090233'],['Cantidad',1,'Número mayor a 0','1000000'],['Tasa de negociación',0,'Porcentaje, con punto decimal','10.50'],['Valor giro',0,'Valor en moneda del portafolio','1094250']],
  descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de los maestros de portafolios e instrumentos.',descM:'Instructivo campo por campo, con valores permitidos y errores frecuentes en órdenes de renta fija.',
  lists:[()=>PNAMES.slice(),()=>['COMPRA','VENTA'],()=>INSTR_NAMES.slice(),null,null,null],
  ej:()=>[FUNDS[1],'COMPRA',INSTR_NAMES[3]||INSTR_NAMES[0],'1000000','10.50','1094250'],
  row:c=>{const e=[],port=findCI(PNAMES,sv(c[0])),tipo=sv(c[1]).trim().toUpperCase(),instr=findCI(INSTR_NAMES.concat(INSTRUMENTS.map(i=>i.mnem)),sv(c[2])),cant=numP(c[3]),tasa=numP(c[4]),val=numP(c[5]);
   if(!port)e.push('el portafolio "'+sv(c[0])+'" no existe');if(tipo!=='COMPRA'&&tipo!=='VENTA')e.push('el tipo debe ser COMPRA o VENTA');if(!instr)e.push('el instrumento "'+sv(c[2])+'" no existe en el maestro');if(!(cant>0))e.push('la cantidad debe ser un número mayor a 0');if(Number.isNaN(tasa)||Number.isNaN(val))e.push('la tasa y el valor giro deben ser números');
   return e.length?{e}:{d:{estatus:'R',port,tipo,instr,cant,tasa:(tasa||0)/100,valor:val||0,fecha:Date.now()}}},
  add:d=>FI_ORDERS.unshift(d)},
 variable:{id:'variable',nombre:'Órdenes de Renta Variable',cols:[['Portafolio',1,'Nombre exacto del maestro de Portafolios','FIC BALANCEADO 1'],['Tipo',1,'COMPRA o VENTA','COMPRA'],['Instrumento',1,'Nemotécnico de la acción','ECOPETROL'],['Modalidad',1,'MERCADO o LIMITE','LIMITE'],['Cantidad',1,'Número mayor a 0','10000'],['Precio límite',0,'Obligatorio si la modalidad es LIMITE','2500']],
  descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de los maestros de portafolios y emisores.',descM:'Instructivo campo por campo, con valores permitidos y errores frecuentes en órdenes de renta variable.',
  lists:[()=>PNAMES.slice(),()=>['COMPRA','VENTA'],VI_LIST,()=>['MERCADO','LIMITE'],null,null],
  ej:()=>[FUNDS[5],'COMPRA',VI_LIST()[0],'LIMITE','10000','2500'],
  row:c=>{const e=[],port=findCI(PNAMES,sv(c[0])),tipo=sv(c[1]).trim().toUpperCase(),instr=findCI(VI_LIST(),sv(c[2])),mod=sv(c[3]).trim().toUpperCase(),cant=numP(c[4]),pl=numP(c[5]);
   if(!port)e.push('el portafolio "'+sv(c[0])+'" no existe');if(tipo!=='COMPRA'&&tipo!=='VENTA')e.push('el tipo debe ser COMPRA o VENTA');if(!instr)e.push('el instrumento "'+sv(c[2])+'" no existe');if(mod!=='MERCADO'&&mod!=='LIMITE')e.push('la modalidad debe ser MERCADO o LIMITE');if(!(cant>0))e.push('la cantidad debe ser un número mayor a 0');if(Number.isNaN(pl))e.push('el precio límite debe ser un número');else if(mod==='LIMITE'&&!(pl>0))e.push('con modalidad LIMITE el precio límite es obligatorio');
   return e.length?{e}:{d:{estatus:'R',port,tipo,instr,orden:mod,cant,pl:mod==='LIMITE'?pl:0,valor:mod==='LIMITE'?cant*pl:0,fecha:Date.now()}}},
  add:d=>VI_ORDERS.unshift(d)},
 instr:{id:'instr',nombre:'Instrumentos',cols:[['Nemotécnico',1,'Código único del instrumento','TFIT11090233'],['Tipo',1,'Tipo de instrumento del catálogo','TASA FIJA'],['ISIN',0,'Código internacional de 12 caracteres','CO000000000X'],['Moneda',1,'Moneda del catálogo','COP'],['Tasa facial',0,'Porcentaje, con punto decimal','7.25'],['Periodicidad',0,'Código de periodicidad de pago','SV'],['Fecha emisión',1,'Formato AAAA-MM-DD','2024-01-15'],['Fecha vencimiento',1,'Posterior a la emisión, AAAA-MM-DD','2030-01-15'],['Emisor',0,'Nombre del catálogo de emisores','MINISTERIO DE HACIENDA (TES)'],['Calificación',0,'Escala del catálogo de calificaciones','AAA']],
  descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de los catálogos de tipos, monedas, emisores y calificaciones.',descM:'Instructivo campo por campo, con valores permitidos y errores frecuentes en la carga de instrumentos.',
  lists:[null,()=>TIPOS(),null,()=>MONEDAS(),null,null,null,null,()=>ISSUERS.slice(),()=>CALIFS.slice()],
  ej:()=>['CARGA'+String(Date.now()).slice(-6),TIPOS()[3],'XX0000000000',MONEDAS()[0],'7.25','SV','2024-01-15','2030-01-15',ISSUERS[0],'AAA'],
  row:c=>{const e=[],mn=sv(c[0]).trim(),tipo=findCI(TIPOS(),sv(c[1])),mon=findCI(MONEDAS(),sv(c[3])),tasa=numP(c[4]),emi=isoP(c[6]),ven=isoP(c[7]);
   if(!mn)e.push('el nemotécnico es obligatorio');else if(INSTRUMENTS.some(i=>normH(i.mnem)===normH(mn)))e.push('el nemotécnico "'+mn+'" ya existe');if(!tipo)e.push('el tipo "'+sv(c[1])+'" no está en el catálogo');if(!mon)e.push('la moneda "'+sv(c[3])+'" no está en el catálogo');if(Number.isNaN(tasa))e.push('la tasa facial debe ser un número');if(!emi)e.push('la fecha de emisión es obligatoria (AAAA-MM-DD)');if(!ven)e.push('la fecha de vencimiento es obligatoria (AAAA-MM-DD)');if(emi&&ven&&ven<=emi)e.push('el vencimiento debe ser posterior a la emisión');
   return e.length?{e}:{d:{mnem:mn,tipo,isin:sv(c[2]).trim(),moneda:mon,tasa:tasa==null?'':tasa+'%',period:sv(c[5]).trim(),emi:fromIso(emi),ven:fromIso(ven),emisor:sv(c[8]).trim(),calif:sv(c[9]).trim(),activo:true}}},
  add:d=>INSTRUMENTS.unshift(d)},
 bench:{id:'bench',pre:'Importación de',nombre:'Composición de Benchmarks',cols:[['Portafolio',1,'Nombre exacto del maestro de Portafolios','FIC RENTA FIJA'],['Benchmark',1,'Nombre del benchmark compuesto','Benchmark FIC Renta Fija'],['Componente',1,'Código del maestro de Índices de referencia','IBR 3M'],['Peso',1,'Porcentaje; los pesos de un benchmark suman 100','60'],['Vigente desde',1,'Formato AAAA-MM-DD','2025-01-02']],
  descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de los maestros de portafolios e índices de referencia.',descM:'Instructivo campo por campo, con valores permitidos y errores frecuentes al importar la composición de benchmarks.',
  lists:[()=>PNAMES.slice(),null,()=>BENCH_COMPS.slice(),null,null],
  ej:()=>[FUNDS[2],'Benchmark '+FUNDS[2],BENCH_COMPS[0],'100','2026-01-02'],
  row:c=>{const e=[],port=findCI(PNAMES,sv(c[0])),b=sv(c[1]).trim(),comp=findCI(BENCH_COMPS,sv(c[2])),peso=numP(c[3]),d=isoP(c[4]);
   if(!port)e.push('el portafolio "'+sv(c[0])+'" no existe');if(!b)e.push('el nombre del benchmark es obligatorio');if(!comp)e.push('el componente "'+sv(c[2])+'" no existe en los índices de referencia');if(!(peso>0&&peso<=100))e.push('el peso debe estar entre 0 y 100');if(!d)e.push('la fecha de vigencia es obligatoria (AAAA-MM-DD)');
   return e.length?{e}:{d:{port,bench:b,comp,peso:peso/100,desde:fromIso(d),activo:true}}},
  add:d=>BENCH_DEF.unshift(d)}
};
`;
s=s.slice(0,a1)+NEWMASS+s.slice(b1);

/* bindMass nuevo */
const a2=s.indexOf('function bindMass(root,m){'),b2=s.indexOf('const APO={');
if(a2<0||b2<0)throw new Error('bindMass block');
const NEWBIND=String.raw`function bindMass(root,m,onLoad){
 const base=m.nombre.replace(/\s+/g,'_'),pre=m.pre?'Importacion':'Cargue_Masivo',tit=(m.pre?'de '+m.pre:'Cargue Masivo de')+' '+m.nombre;
 $$('[data-dl]',root).forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.dl==='estructura'){download('Estructura_'+pre+'_'+base+'.xlsx',buildXlsx(m),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');toast('Estructura de '+m.nombre+' descargada (Excel con listas desplegables).','success','Descarga lista')}
  else{const rows=m.cols.map(c=>'<tr><td>'+esc(c[0])+'</td><td>'+(c[1]?'Sí':'No')+'</td><td>'+esc(c[2])+'</td><td>'+esc(c[3])+'</td></tr>').join('');download('Manual_'+pre+'_'+base+'.html','<!doctype html><meta charset="utf-8"><title>Manual '+esc(tit)+'</title><body style="font-family:Segoe UI,Arial;max-width:900px;margin:30px auto;color:#1F2937"><h1 style="color:#6A1B9A">Manual '+esc(tit)+'</h1><p>Descarga la estructura (Excel), diligénciala y cárgala en la pestaña de carga masiva. Formatos .xlsx o .csv, hasta 5.000 filas. La primera fila son los encabezados, en el mismo orden y con el mismo nombre. La hoja <b>Listas</b> del Excel trae los valores permitidos de cada maestro y las columnas con lista tienen desplegable.</p><table border="1" cellpadding="8" style="border-collapse:collapse;width:100%"><tr style="background:#6A1B9A;color:#fff"><th>Campo</th><th>Obligatorio</th><th>Valores permitidos</th><th>Ejemplo</th></tr>'+rows+'</table><h2 style="color:#6A1B9A">Cómo se procesa</h2><ul><li>Se validan todas las filas. Las filas válidas se cargan; las que tienen errores se informan con su número de fila y no se cargan.</li><li>Los registros cargados quedan en estado Registrada (órdenes) o Activo (maestros).</li></ul><h2 style="color:#6A1B9A">Errores frecuentes</h2><ul><li>Cambiar el orden o el nombre de las columnas.</li><li>Usar un valor que no exista en el maestro correspondiente.</li><li>Dejar vacío un campo obligatorio.</li><li>Usar coma decimal en .csv con separador coma; usa punto decimal.</li><li>Repetir un código que ya existe (por ejemplo, un nemotécnico).</li></ul></body>','text/html;charset=utf-8');toast('Manual '+tit+' descargado.','success','Descarga lista')}
 }));
 const z=$('[data-up]',root),inp=$('input[type=file]',z),nm=$('[data-fname]',root),pb=$('[data-proc]',root),res=$('[data-result]',root);let file=null;
 const pick=f=>{res.innerHTML='';if(!f)return;if(!/\.(xlsx|csv)$/i.test(f.name)){file=null;nm.value='';pb.disabled=true;res.innerHTML=alertB('danger','Formato no permitido','Solo se aceptan archivos .xlsx o .csv.',true);toast('Formato no permitido. Usa .xlsx o .csv.','danger','Archivo inválido');return}file=f;nm.value=f.name;pb.disabled=false};
 z.addEventListener('click',()=>inp.click());z.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inp.click()}});inp.addEventListener('change',()=>pick(inp.files[0]));
 ['dragover','dragenter'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.add('is-over')}));['dragleave','drop'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.remove('is-over')}));z.addEventListener('drop',e=>pick(e.dataTransfer.files[0]));
 const fail=(msg)=>{res.innerHTML=alertB('danger','No se pudo procesar el archivo',esc(msg)+' Revisa la estructura y vuelve a intentarlo.',true);toast(msg,'danger','Archivo con errores')};
 pb.addEventListener('click',async()=>{if(!file)return;pb.classList.add('is-loading');
  let rows;try{rows=/\.csv$/i.test(file.name)?parseCSV(await file.text()):await readXlsx(file)}catch(e){pb.classList.remove('is-loading');return fail('No se pudo leer el archivo ('+(e&&e.message?e.message:'formato no válido')+').')}
  rows=rows.filter(r=>r.some(x=>String(x).trim()));
  await new Promise(r=>setTimeout(r,500));pb.classList.remove('is-loading');
  if(!rows.length)return fail('El archivo está vacío.');
  const head=rows[0].map(normH),want=m.cols.map(c=>normH(c[0]));
  if(head.length<want.length||want.some((w,i)=>head[i]!==w))return fail('Los encabezados no coinciden con la estructura de '+m.nombre+'. Se esperaba: '+m.cols.map(c=>c[0]).join(', ')+'.');
  const data=rows.slice(1);if(!data.length)return fail('El archivo no tiene filas de datos.');if(data.length>5000)return fail('El archivo supera las 5.000 filas permitidas.');
  const ok=[],errs=[];data.forEach((c,i)=>{const r=m.row(c);if(r.e)errs.push('Fila '+(i+2)+': '+r.e.join('; '));else ok.push(r.d)});
  ok.slice().reverse().forEach(d=>m.add(d));onLoad&&onLoad(ok.length);
  const list=errs.length?'<ul style="margin:6px 0 0;padding-left:18px">'+errs.slice(0,6).map(x=>'<li>'+esc(x)+'</li>').join('')+(errs.length>6?'<li>… y '+(errs.length-6)+' más</li>':'')+'</ul>':'';
  if(ok.length){res.innerHTML=alertB(errs.length?'warning':'success',errs.length?'Archivo procesado con observaciones':'Archivo procesado','<b>'+ok.length+'</b> registros cargados · <b>'+errs.length+'</b> con errores (no se cargaron).'+list+(ok.length?'<div style="margin-top:6px">Ya puedes verlos en la tabla de '+(m.pre?'la pantalla':'registro')+'.</div>':''),true);toast(ok.length+' registros cargados'+(errs.length?', '+errs.length+' con errores':'')+'.',errs.length?'warning':'success','Carga masiva')}
  else{res.innerHTML=alertB('danger','Ningún registro válido','<b>0</b> registros cargados · <b>'+errs.length+'</b> con errores.'+list,true);toast('Ningún registro válido en el archivo.','danger','Carga masiva')}
  file=null;nm.value='';inp.value='';pb.disabled=true});
}
`;
s=s.slice(0,a2)+NEWBIND+s.slice(b2);

/* ---------- 2. Conectar con las tablas ---------- */
rep("bindMass(me,cfg.mass);","bindMass(me,cfg.mass,()=>repaint());");
rep("if(cfg.extra)cfg.extra(pg);","if(cfg.extra)cfg.extra(pg,()=>repaint());");
rep("extra:pg=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class=\"mk-accordion__head\"><span class=\"mk-accordion__ico\">'+ic('upload')+'</span><span><span class=\"mk-accordion__t\">Carga masiva de instrumentos</span>","extra:(pg,rp)=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class=\"mk-accordion__head\"><span class=\"mk-accordion__ico\">'+ic('upload')+'</span><span><span class=\"mk-accordion__t\">Carga masiva de instrumentos</span>");
rep("bindAcc(x);bindMass(x,MASS.instr)}","bindAcc(x);bindMass(x,MASS.instr,rp)}");
rep("extra:pg=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class=\"mk-accordion__head\"><span class=\"mk-accordion__ico\">'+ic('upload')+'</span><span><span class=\"mk-accordion__t\">Importar composición de benchmarks</span>","extra:(pg,rp)=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class=\"mk-accordion__head\"><span class=\"mk-accordion__ico\">'+ic('upload')+'</span><span><span class=\"mk-accordion__t\">Importar composición de benchmarks</span>");
rep("bindAcc(x);bindMass(x,MASS.bench)}","bindAcc(x);bindMass(x,MASS.bench,rp)}");
rep("bindAC(f,'instr',['ECOPETROL','CELSIA','CEMARGOS','BOGOTA','BVC','BSANTANDER','FALABELLA','SURA','GRUPOSURA','NUTRESA'])","bindAC(f,'instr',VI_LIST())");
fs.writeFileSync('mk.js',s);console.log('mk.js ok');
