/* =============== Utilidades =============== */
const $=(s,r)=> (r||document).querySelector(s);
const $$=(s,r)=>[].slice.call((r||document).querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const nf=(d)=>new Intl.NumberFormat('es-ES',{style:'decimal',minimumFractionDigits:d,maximumFractionDigits:d});
const f0=v=>nf(0).format(v), f1=v=>nf(1).format(v), f2=v=>nf(2).format(v), f3=v=>nf(3).format(v);
const pct=(v,d)=>new Intl.NumberFormat('es-ES',{style:'percent',minimumFractionDigits:d==null?2:d,maximumFractionDigits:d==null?2:d}).format(v);
const money=v=>'$'+f2(v);
const pc2=v=>(v>=0?'':'-')+nf(2).format(Math.abs(v))+' %';
const bps=v=>(v>=0?'+':'')+nf(1).format(v*10000)+' pb';
const dstr=d=>new Date(d).toString().slice(0,15);
const sgnCls=v=>v>=0?'pa-pos':'pa-neg';
function rng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function download(name,content,type){const b=new Blob([content],{type:type||'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function toCSV(cols,rows){const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';return '﻿'+[cols.map(c=>q(c.h)).join(';')].concat(rows.map(r=>cols.map(c=>q(c.txt?c.txt(r):r[c.k])).join(';'))).join('\r\n')}
function toXLS(cols,rows){return '﻿<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1"><tr>'+cols.map(c=>'<th>'+esc(c.h)+'</th>').join('')+'</tr>'+rows.map(r=>'<tr>'+cols.map(c=>'<td>'+esc(c.txt?c.txt(r):r[c.k])+'</td>').join('')+'</tr>').join('')+'</table></body></html>'}
function toast(msg){let box=$('#toasts');if(!box)return;const t=document.createElement('div');t.className='toast';t.textContent=msg;box.appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),320)},2600)}
function confirmDlg(title,desc){return new Promise(res=>{const m=document.createElement('div');m.className='modal-back';m.innerHTML='<div class="container-neumorph p-6 rounded-lg" style="max-width:26rem;width:92%"><h3 class="text-lg font-bold mb-2">'+esc(title)+'</h3><p class="text-sm mb-6 opacity-80">'+esc(desc)+'</p><div class="flex justify-end space-x-2"><button class="'+BTN_SEC+'" data-r="0">Cancelar</button><button class="'+BTN_DEL+'" data-r="1">Eliminar</button></div></div>';document.body.appendChild(m);m.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b||e.target===m){m.remove();res(b&&b.dataset.r==='1')}})})}

/* =============== Datos dummy =============== */
const USER={name:'Ramiro Giraldo Colorado',email:'ramiro@somosmakers.co'};
const PORTFOLIOS=[
 {id:1,name:'FIC LIQUIDEZ'},{id:2,name:'FIC RENTA FIJA'},{id:3,name:'PORTAFOLIO DELEGADO 2'},{id:4,name:'PORTAFOLIO DELEGADO 1'},{id:5,name:'PORTAFOLIO DELEGADO 3'},
 {id:6,name:'FIC BALANCEADO 1'},{id:7,name:'FIC BALANCEADO GLOBAL'},{id:8,name:'FIC RENTA FIJA LARGO PLAZO'},{id:9,name:'FONDO MUTUO LV MONETARIO'},
 {id:10,name:'Julian Andres Mesa Restrepo'},{id:11,name:'Andres Julian Murillo Lopez'},{id:12,name:'Gustavo Saldarriaga'},{id:13,name:'Paula Andrea Alvarez'},{id:14,name:'Grupo Corporativo Jham'}
];
const PNAMES=PORTFOLIOS.map(p=>p.name);
const FUNDS=PNAMES.slice(0,9);
const ISSUERS=['CELULOSA ARAUCO Y CONSTITUCION S.A.','TESORERÍA GENERAL DE LA REPÚBLICA DE CHILE','BANCO CENTRAL DE CHILE','ADMINISTRADORA GENERAL DE FONDOS SURA','FALABELLA S.A.','BANCO SANTANDER','COLPENSIONES','FINDETER','TITULARIZADORA COLOMBIANA','ECOPETROL S.A.'];
const INSTR_NAMES=['BARAU-W','BBG00JX7FRX4','BBG011WXKVC4','TFIT11090233','CDTBCB90','CDTBCBS0VD','ECOPETROL','CELSIA','CEMARGOS','BOGOTA','BSANTANDER','BVC','FALABELLA','SURA'];
const HOLDINGS_BASE=[
 ['RENTA FIJA','RENTA FIJA LOCAL','UF','1,440 A 1800','BONOS','AA','CELULOSA ARAUCO Y CONSTITUCION S.A.',388817111],
 ['RENTA FIJA','RENTA FIJA INTERNACIONAL','USD','1081 A 1,440','BONOS','AAA','TESORERÍA GENERAL DE LA REPÚBLICA DE CHILE',476872319],
 ['RENTA FIJA','RENTA FIJA LOCAL','UF','1,081 A 1,440','BONOS','AAA','BANCO CENTRAL DE CHILE',554830120],
 ['RENTA FIJA','RENTA FIJA LOCAL','UF','MAYOR A 1,800','BONOS','AAA','TESORERÍA GENERAL DE LA REPÚBLICA DE CHILE',627442880],
 ['RENTA FIJA','RENTA FIJA LOCAL','CLP','361 A 720','DEPÓSITOS','AAA','BANCO SANTANDER',240115000],
 ['RENTA FIJA','RENTA FIJA LOCAL','CLP','0 A 360','DEPÓSITOS','AA+','BANCO CENTRAL DE CHILE',301270500],
 ['RENTA FIJA','RENTA FIJA INTERNACIONAL','USD','721 A 1,080','BONOS','A-','TESORERÍA GENERAL DE LA REPÚBLICA DE CHILE',198340770],
 ['RENTA FIJA','RENTA FIJA LOCAL','CLP','MAYOR A 1,800','BONOS','AA','FALABELLA S.A.',144900000],
 ['RENTA FIJA','RENTA FIJA LOCAL','UF','721 A 1,080','BONOS','AA-','COLPENSIONES',176230400],
 ['RENTA FIJA','RENTA FIJA LOCAL','CLP','0 A 360','DEPÓSITOS','AAA','BANCO SANTANDER',412000000],
 ['RENTA VARIABLE','CUOTAS DE FONDOS','CLP','SIN PLAZO','FONDOS','AAA','ADMINISTRADORA GENERAL DE FONDOS SURA',211100000],
 ['RENTA VARIABLE','CUOTAS DE FONDOS','CLP','SIN PLAZO','FONDOS','AAA','ADMINISTRADORA GENERAL DE FONDOS SURA',120500000],
 ['RENTA VARIABLE','ACCIONES LOCALES','CLP','SIN PLAZO','ACCIONES','AA-','FALABELLA S.A.',318000000],
 ['RENTA VARIABLE','ACCIONES LOCALES','CLP','SIN PLAZO','ACCIONES','AA','ECOPETROL S.A.',205600000],
 ['RENTA VARIABLE','ACCIONES INTERNACIONALES','USD','SIN PLAZO','ACCIONES','A','BANCO SANTANDER',164250000]
];
function holdingsFor(name){const r=rng(hash(name)), k=0.6+r()*1.4;return HOLDINGS_BASE.map(h=>{const a=h.slice();a[7]=Math.round(h[7]*k*(0.8+r()*0.4)*100)/100;return {macro:a[0],sub:a[1],moneda:a[2],plazo:a[3],clase:a[4],calif:a[5],emisor:a[6],val:a[7]}})}
const SENS=[
 ['FIC BALANCEADO 1',50651746037.4,3.365,2.921,0.171,225019.44],['FIC BALANCEADO GLOBAL',30431813726.1,0.798,0.569,0.06,96190.387],['FIC LIQUIDEZ',24342997953.1,4.537,3.88,0.233,318951.117],
 ['FIC RENTA FIJA',22301418465.1,4.762,4.052,0.242,324530.876],['FIC RENTA FIJA LARGO PLAZO',26776403653.1,4.112,3.516,0.211,285251.503],['FONDO MUTUO LV MONETARIO',3272749058,1.809,2.756,0.223,78315.538],
 ['PORTAFOLIO DELEGADO 1',28838704600.3,3.526,2.983,0.175,232352.99],['PORTAFOLIO DELEGADO 2',35824727545.8,2.88,2.528,0.142,196159.218],['PORTAFOLIO DELEGADO 3',34176945039.1,1.723,1.417,0.098,155309.093]
].map(a=>({port:a[0],val:a[1],dur:a[2],mdur:a[3],conv:a[4],dv01:a[5]}));
const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function flowsFor(port,year){const r=rng(hash(port+year)),out=[];let acc=0;for(let m=0;m<12;m++){const row={mes:MONTHS[m],anio:year,desc:Math.round((1+r()*6)*1e7)/100*(m%3===0?1.8:1),ibr:Math.round(r()*4e8)/100*(m%2?0.6:1.2),ipc:Math.round(r()*9e8)/100,tf:Math.round(r()*1.3e9)/100*(m%4===0?2:1),uvr:Math.round(r()*2.2e8)/100,uf:Math.round(r()*1.1e9)/100};row.total=row.desc+row.ibr+row.ipc+row.tf+row.uvr+row.uf;acc+=row.total;row.acum=acc;out.push(row)}return out}
function mkDate(y,m,d){return new Date(y,m,d,12)}
const FI_ORDERS=(function(){const r=rng(7),st=['F','F','F','R','C'],inst=['BBG011WXKVC4','TFIT11090233','CDTBCB90','CDTBCBS0VD','BBG00JX7FRX4','BARAU-W'],rows=[];const dates=[[2026,8,3],[2026,6,1],[2026,5,2],[2026,4,26],[2026,3,30],[2026,3,7],[2025,11,9],[2025,9,2],[2025,8,19],[2025,8,9]];for(let i=0;i<26;i++){const d=i<dates.length?dates[i]:[2025,Math.max(0,8-Math.floor(i/3)),1+Math.floor(r()*27)];const q=[1e9,1e7,1e5,1.001e9,5e8,2.5e8][Math.floor(r()*6)];const rate=[0.1,0.1137,0.11,0.1065,0.098][Math.floor(r()*5)];rows.push({estatus:st[Math.floor(r()*5)],port:FUNDS[Math.floor(r()*4)],tipo:r()>.3?'COMPRA':'VENTA',instr:inst[Math.floor(r()*inst.length)],cant:q,tasa:rate,valor:q*(0.95+r()*0.3)*(r()>.85?1:0.1),fecha:mkDate(d[0],d[1],d[2]).getTime()})}return rows.sort((a,b)=>b.fecha-a.fecha)})();
const VI_ORDERS=(function(){const r=rng(11),st=['F','F','R','C'],inst=['ECOPETROL','CELSIA','CEMARGOS','BOGOTA','BVC','BSANTANDER'],rows=[];for(let i=0;i<14;i++){const tipo=r()>.3?'COMPRA':'VENTA',ord=r()>.5?'MERCADO':'LIMITE',q=Math.round((500+r()*1.3e6)),pl=ord==='LIMITE'?Math.round(1000+r()*3.2e4):0;rows.push({estatus:st[Math.floor(r()*4)],port:PNAMES[Math.floor(r()*9)],tipo,instr:inst[Math.floor(r()*inst.length)],orden:ord,cant:q,pl,valor:q*pl,fecha:mkDate(2026-Math.floor(i/6),11-i%11,1+Math.floor(r()*27)).getTime()})}return rows.sort((a,b)=>b.fecha-a.fecha)})();
const INSTRUMENTS=(function(){const r=rng(21),types=['UF','DESCUENTO','IBR','IPC','TASA FIJA','UVR'],curr=['UF','USD','EUR','CLP'],rows=[];const seeds=[['BARAU-W','UF','CL0002481738','UF','2,1%','SV',[2018,9,10],[2028,9,10],ISSUERS[0],'AA'],['BBG00JX7FRX4','UF','US168863CF36','USD','3,24%','SV',[2018,1,6],[2028,1,6],ISSUERS[1],'A-'],['BBG011WXKVC4','UF','XS2369244087','EUR','0,1%','SV',[2025,6,11],[2027,0,26],ISSUERS[1],'A-']];seeds.forEach(s=>rows.push({mnem:s[0],tipo:s[1],isin:s[2],moneda:s[3],tasa:s[4],period:s[5],emi:mkDate(s[6][0],s[6][1],s[6][2]).getTime(),ven:mkDate(s[7][0],s[7][1],s[7][2]).getTime(),emisor:s[8],calif:s[9]}));for(let i=0;i<24;i++){const y=2016+Math.floor(r()*9);rows.push({mnem:['CDT','BON','TFIT','BBG0','TES'][Math.floor(r()*5)]+Math.floor(r()*9e6+1e6),tipo:types[Math.floor(r()*6)],isin:['CL','US','CO','XS'][Math.floor(r()*4)]+Math.floor(r()*9e9+1e9),moneda:curr[Math.floor(r()*4)],tasa:f1(r()*9+0.5).replace(/ /g,'')+'%',period:['SV','AV','MV','TV'][Math.floor(r()*4)],emi:mkDate(y,Math.floor(r()*12),1+Math.floor(r()*27)).getTime(),ven:mkDate(y+3+Math.floor(r()*8),Math.floor(r()*12),1+Math.floor(r()*27)).getTime(),emisor:ISSUERS[Math.floor(r()*ISSUERS.length)],calif:['AAA','AA+','AA','AA-','A','A-'][Math.floor(r()*6)]})}return rows.sort((a,b)=>a.mnem<b.mnem?-1:1)})();
const CLIENT_ORDERS=(function(){const r=rng(31),rows=[],ids=['8027825','3563958','1020304050','900123456'],instrV=['BOGOTA','BSANTANDER','CELSIA','ECOPETROL'],instrF=['CDTBCBS0VD','TFIT11090233','CDTBCB90'];for(let i=0;i<14;i++){const rf=r()>.5;rows.push({estatus:['F','F','R','C'][Math.floor(r()*4)],cliente:ids[Math.floor(r()*ids.length)],tipo:r()>.25?'COMPRA':'VENTA',renta:rf?'RENTA FIJA':'RENTA VARIABLE',limite:rf?'':(r()>.6?'LIMITE':'MERCADO'),instr:rf?instrF[Math.floor(r()*3)]:instrV[Math.floor(r()*4)],cant:Math.round(rf?r()*8e8+1e7:r()*6e6+1e5),tasa:rf?[0.123,0.1137,0.105][Math.floor(r()*3)]:null,pl:null,valor:null,fecha:mkDate(2026-(i>8?1:0),[0,11,11,10,9,8,7,6,5,4,3,2,1,0][i],[6,23,22,18,14,9,30,12,3,21,8,17,25,2][i]).getTime()})}return rows.sort((a,b)=>b.fecha-a.fecha)})();
const SUBLIMITS={'MACROACTIVO':['RENTA FIJA','RENTA VARIABLE'],'SUBACTIVO':['RENTA FIJA LOCAL','RENTA FIJA INTERNACIONAL','ACCIONES LOCALES','CUOTAS DE FONDOS'],'CLASE DE INVERSIÓN':['BONOS','DEPÓSITOS','FONDOS','ACCIONES'],'CALIFICACIÓN':['AAA','AA+','AA','AA-','A','A-'],'PLAZO':['0 A 360','361 A 720','721 A 1,080','1,081 A 1,440','MAYOR A 1,800'],'MONEDA':['CLP','UF','USD'],'EMISOR':['TITULARIZADORA COLOMBIANA','FINDETER','COLPENSIONES','BANCO CENTRAL DE CHILE','FALABELLA S.A.']};
const DENOMS=['TOTAL ACTIVO','TOTAL ACTIVO RENTA FIJA','TOTAL ACTIVO RENTA VARIABLE'];
const LIMITS=[
 ['CALIFICACIÓN','MIN',0.10,'AA+','TOTAL ACTIVO RENTA FIJA','FIC LIQUIDEZ',[2025,6,24]],['CALIFICACIÓN','MAX',0.30,'AA+','TOTAL ACTIVO RENTA FIJA','FIC LIQUIDEZ',[2025,4,26]],['CALIFICACIÓN','MIN',0.70,'AA+','TOTAL ACTIVO','FIC RENTA FIJA',[2025,6,17]],
 ['CALIFICACIÓN','MIN',0.80,'AA+','TOTAL ACTIVO','FIC RENTA FIJA',[2026,4,26]],['EMISOR','MAX',0.10,'TITULARIZADORA COLOMBIANA','TOTAL ACTIVO','FIC LIQUIDEZ',[2025,6,23]],['EMISOR','MAX',0.20,'FINDETER','TOTAL ACTIVO','FIC LIQUIDEZ',[2025,6,17]],
 ['EMISOR','MAX',0.10,'COLPENSIONES','TOTAL ACTIVO','FIC LIQUIDEZ',[2025,6,23]],['MACROACTIVO','MAX',0.50,'RENTA VARIABLE','TOTAL ACTIVO','FIC LIQUIDEZ',[2025,11,12]],['MACROACTIVO','MIN',0.90,'RENTA FIJA','TOTAL ACTIVO','FIC LIQUIDEZ',[2025,6,17]],
 ['MACROACTIVO','MAX',0.90,'RENTA FIJA','TOTAL ACTIVO RENTA FIJA','FIC BALANCEADO GLOBAL',[2026,0,6]],['MONEDA','MAX',0.30,'USD','TOTAL ACTIVO','FIC BALANCEADO 1',[2025,7,4]],['PLAZO','MAX',0.25,'MAYOR A 1,800','TOTAL ACTIVO RENTA FIJA','FIC RENTA FIJA LARGO PLAZO',[2025,8,15]],
 ['SUBACTIVO','MAX',0.40,'RENTA FIJA INTERNACIONAL','TOTAL ACTIVO','FIC BALANCEADO GLOBAL',[2025,9,2]],['CLASE DE INVERSIÓN','MAX',0.35,'ACCIONES','TOTAL ACTIVO','FIC BALANCEADO 1',[2025,10,19]],['EMISOR','MAX',0.15,'BANCO SANTANDER','TOTAL ACTIVO','FONDO MUTUO LV MONETARIO',[2026,1,10]]
].map(a=>({tipo:a[0],eval:a[1],pct:a[2],sub:a[3],denom:a[4],port:a[5],fecha:mkDate(a[6][0],a[6][1],a[6][2]).getTime()}));
const PALETTE=['#c50ee9','#6d7e96','#22c55e','#f59e0b','#3b82f6','#ef4444','#14b8a6','#a855f7','#eab308','#f97316'];

/* =============== Datos Performance attribution =============== */
const PERIODS={'MTD':{label:'Mes corrido (MTD)',k:0.12},'YTD':{label:'Año corrido (YTD)',k:1},'12M':{label:'Últimos 12 meses',k:1.25},'SI':{label:'Desde inicio',k:2.6}};
const BENCH_DEF=[
 {port:'FIC LIQUIDEZ',bench:'Benchmark FIC Liquidez',comp:'IBR 3M',peso:0.7,desde:[2025,0,2]},{port:'FIC LIQUIDEZ',bench:'Benchmark FIC Liquidez',comp:'DTF 90D',peso:0.3,desde:[2025,0,2]},
 {port:'FIC RENTA FIJA',bench:'Benchmark FIC Renta Fija',comp:'Índice TES Corto',peso:0.6,desde:[2025,0,2]},{port:'FIC RENTA FIJA',bench:'Benchmark FIC Renta Fija',comp:'Índice Corporativos AAA',peso:0.4,desde:[2025,0,2]},
 {port:'FIC BALANCEADO 1',bench:'Benchmark Balanceado 1',comp:'Índice TES Corto',peso:0.5,desde:[2025,2,3]},{port:'FIC BALANCEADO 1',bench:'Benchmark Balanceado 1',comp:'COLCAP',peso:0.35,desde:[2025,2,3]},{port:'FIC BALANCEADO 1',bench:'Benchmark Balanceado 1',comp:'IBR 1M',peso:0.15,desde:[2025,2,3]},
 {port:'FIC BALANCEADO GLOBAL',bench:'Benchmark Balanceado Global',comp:'MSCI ACWI',peso:0.4,desde:[2025,5,2]},{port:'FIC BALANCEADO GLOBAL',bench:'Benchmark Balanceado Global',comp:'Bloomberg Global Aggregate',peso:0.4,desde:[2025,5,2]},{port:'FIC BALANCEADO GLOBAL',bench:'Benchmark Balanceado Global',comp:'IBR 1M',peso:0.2,desde:[2025,5,2]},
 {port:'FIC RENTA FIJA LARGO PLAZO',bench:'Benchmark RF Largo Plazo',comp:'Índice TES Largo',peso:0.8,desde:[2025,0,2]},{port:'FIC RENTA FIJA LARGO PLAZO',bench:'Benchmark RF Largo Plazo',comp:'Índice Corporativos AAA',peso:0.2,desde:[2025,0,2]},
 {port:'FONDO MUTUO LV MONETARIO',bench:'Benchmark Monetario',comp:'IBR 1M',peso:1,desde:[2025,0,2]}
].map(b=>({port:b.port,bench:b.bench,comp:b.comp,peso:b.peso,desde:mkDate(b.desde[0],b.desde[1],b.desde[2]).getTime()}));
const BENCH_COMPS=['IBR 1M','IBR 3M','DTF 90D','Índice TES Corto','Índice TES Largo','Índice Corporativos AAA','COLCAP','MSCI ACWI','Bloomberg Global Aggregate','IPC + 3%'];
const LEVELS={
 'Macroactivo':['Renta fija','Renta variable','Liquidez'],
 'Subactivo':['Renta fija local','Renta fija internacional','Acciones locales','Cuotas de fondos','Liquidez'],
 'Clase de inversión':['Bonos','Depósitos (CDT)','Fondos','Acciones','Cuentas de ahorro'],
 'Moneda':['CLP','UF','USD']
};
function brinson(port,periodKey,level){
 const cats=LEVELS[level],r=rng(hash(port+level)),k=PERIODS[periodKey].k,n=cats.length;
 let wp=cats.map(()=>0.15+r()),wb=cats.map(()=>0.15+r());
 const sp=wp.reduce((a,b)=>a+b,0),sb=wb.reduce((a,b)=>a+b,0);wp=wp.map(x=>x/sp);wb=wb.map(x=>x/sb);
 const rb=cats.map((c,i)=>(0.004+r()*0.012+(i%2?0.002:0))*k), rp=rb.map(x=>x+(r()-0.42)*0.006*k);
 const RB=wb.reduce((a,w,i)=>a+w*rb[i],0), RP=wp.reduce((a,w,i)=>a+w*rp[i],0);
 const rows=cats.map((c,i)=>{const alloc=(wp[i]-wb[i])*(rb[i]-RB),sel=wb[i]*(rp[i]-rb[i]),inter=(wp[i]-wb[i])*(rp[i]-rb[i]);return {cat:c,wp:wp[i],wb:wb[i],rp:rp[i],rb:rb[i],alloc,sel,inter,tot:alloc+sel+inter}});
 const hg=(typeof hedgeEffect==='function')?hedgeEffect(port,periodKey):null,RPc=RP+(hg?hg.net:0);
 return {rows,RP:RPc,RB,exc:RPc-RB,hedge:hg};
}
function seriesFor(port,periodKey){
 const n={MTD:21,YTD:180,'12M':252,SI:400}[periodKey],r=rng(hash(port)+n),k=PERIODS[periodKey].k;
 const drift=(0.0055*k)/n*12,bdrift=(0.0048*k)/n*12;let p=0,b=0;const pts=[];const today=new Date(2026,8,30);
 for(let i=0;i<=n;i+=Math.max(1,Math.floor(n/60))){}
 const step=Math.max(1,Math.floor(n/60));
 for(let i=0;i<=n;i+=step){for(let j=0;j<(i?step:0);j++){const z=(r()-0.5)*0.0028;p=(1+p)*(1+drift*0.1+z)-1;b=(1+b)*(1+bdrift*0.1+z*0.85+(r()-0.5)*0.0006)-1}
  const d=new Date(today.getTime()-(n-i)*86400000*(n>=180?1.45:1.4));pts.push({d,p,b})}
 return pts;
}
function perfStats(port,periodKey){
 const s=seriesFor(port,periodKey),last=s[s.length-1],r=rng(hash(port+periodKey));
 const vol=0.012+r()*0.02,te=0.004+r()*0.012,ex=last.p-last.b;
 return {series:s,rp:last.p,rb:last.b,ex,vol,te,ir:ex/te*(0.6+r()*0.4),sharpe:(last.p-0.04*PERIODS[periodKey].k*0.5)/vol,dd:-(0.004+r()*0.03),beta:0.85+r()*0.3};
}
function horizons(port){
 const r=rng(hash(port)+5),base=[['1 día',0.0004],['MTD',0.0068],['30 días',0.0071],['YTD',0.0549],['12 meses',0.0712],['36 meses (anualizada)',0.0806]];
 return base.map(b=>{const rp=b[1]*(0.85+r()*0.3),rb=b[1]*(0.8+r()*0.3);return {h:b[0],rp,rb,ex:rp-rb}});
}
function contributions(port,periodKey){
 const hs=holdingsFor(port),r=rng(hash(port+periodKey)),k=PERIODS[periodKey].k,tot=hs.reduce((a,h)=>a+h.val,0);
 const rows=hs.map((h,i)=>{const w=h.val/tot,ret=((h.macro==='RENTA FIJA'?0.004:0.009)+r()*0.012-0.003)*k;return {instr:h.emisor.split(' ').slice(0,3).join(' ')+' · '+h.clase+' '+h.moneda,emisor:h.emisor,macro:h.macro,w,ret,c:w*ret}});
 const T=rows.reduce((a,x)=>a+x.c,0);rows.forEach(x=>x.share=x.c/T);return {rows,T};
}
function fiAttr(port,periodKey){
 const r=rng(hash(port+'fi'+periodKey)),k=PERIODS[periodKey].k;
 const comps=[['Devengo (carry)',0.0021+r()*0.0008],['Efecto curva (duración)',(r()-0.45)*0.0014],['Efecto spread (crédito)',(r()-0.35)*0.0012],['Efecto selección de emisores',(r()-0.4)*0.0011],['Efecto moneda / UF',(r()-0.5)*0.0007],['Costos y comisiones',-(0.0004+r()*0.0002)],['Residual',(r()-0.5)*0.0002]].map(c=>({n:c[0],v:c[1]*k}));
 const exc=comps.reduce((a,c)=>a+c.v,0);
 const dur=[2.1+r()*2,2.0+r()*1.6],spr=[90+r()*60,80+r()*40],ytm=[0.095+r()*0.01,0.091+r()*0.008];
 return {comps,exc,dur,spr,ytm,rb:0.0062*k,rp:0.0062*k+exc};
}
const REPORTS=[
 {n:'Informe de rentabilidad mensual por portafolio',per:'Mensual',ult:mkDate(2026,8,1).getTime(),est:'Generado'},
 {n:'Atribución de desempeño (Brinson) consolidada',per:'Mensual',ult:mkDate(2026,8,1).getTime(),est:'Generado'},
 {n:'Informe de desempeño para comité de inversiones',per:'Trimestral',ult:mkDate(2026,5,30).getTime(),est:'Generado'},
 {n:'Rentabilidad por tipo de participación',per:'Mensual',ult:mkDate(2026,7,31).getTime(),est:'Pendiente'},
 {n:'Atribución de renta fija (curva, spread y selección)',per:'Mensual',ult:mkDate(2026,8,1).getTime(),est:'Generado'},
 {n:'Reporte de desempeño para clientes (mandatos delegados)',per:'Trimestral',ult:mkDate(2026,5,30).getTime(),est:'En revisión'}
];

