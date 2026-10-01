/* =============== MERCADO MONETARIO: datos, cargas masivas y pantallas =============== */
const MM_OPS_BASE=['CDT','SIMULTÁNEA','INTERBANCARIO','OVERNIGHT','TES CORTO'];
const MM_OPS=()=>LOCL(MM_OPS_BASE);
const MM_SENT=['INVERSIÓN','CAPTACIÓN'];
const CP_TIPOS=['Banco','Comisionista','Entidad pública'];
const MM_CP=[
 ['BANCOLOMBIA S.A.','Banco','AAA',7200000000],['BANCO DAVIVIENDA','Banco','AAA',8000000000],['BANCO DE BOGOTÁ','Banco','AAA',6000000000],['FINDETER','Entidad pública','AAA',3000000000],['MINISTERIO DE HACIENDA (TES)','Entidad pública','AAA',10000000000],['CORFICOLOMBIANA','Comisionista','AA+',2000000000],['BANCO COOMEVA','Banco','A',1000000000,0]
].map(a=>({name:a[0],tipo:a[1],calif:a[2],cupo:a[3],activo:a[4]!==0}));
const MM_ORDERS=[
 ['F','FIC LIQUIDEZ','CDT','INVERSIÓN','BANCOLOMBIA S.A.',3200000000,10.85,90,[2026,8,28]],
 ['F','FIC LIQUIDEZ','SIMULTÁNEA','INVERSIÓN','BANCOLOMBIA S.A.',2000000000,10.40,7,[2026,8,29]],
 ['R','FIC LIQUIDEZ','OVERNIGHT','INVERSIÓN','BANCO DAVIVIENDA',520000000,10.15,1,[2026,8,30]],
 ['F','FIC MONETARIO','CDT','INVERSIÓN','BANCO DE BOGOTÁ',450000000,10.95,120,[2026,8,22]],
 ['C','FIC MONETARIO','SIMULTÁNEA','INVERSIÓN','BANCOLOMBIA S.A.',400000000,10.40,7,[2026,8,29]],
 ['F','FIC MONETARIO','INTERBANCARIO','INVERSIÓN','BANCO DE BOGOTÁ',300000000,10.30,3,[2026,8,29]],
 ['F','FIC LIQUIDEZ','TES CORTO','INVERSIÓN','MINISTERIO DE HACIENDA (TES)',2300000000,10.55,180,[2026,8,15]],
 ['A','FIC MONETARIO','CDT','INVERSIÓN','BANCO DAVIVIENDA',500000000,10.70,60,[2026,8,18]],
 ['F','FIC LIQUIDEZ','CDT','INVERSIÓN','FINDETER',1000000000,11.05,180,[2026,8,10]],
 ['F','FIC RENTA FIJA','OVERNIGHT','INVERSIÓN','BANCO DAVIVIENDA',800000000,10.12,1,[2026,8,26]],
 ['F','FIC LIQUIDEZ','SIMULTÁNEA','CAPTACIÓN','BANCO DE BOGOTÁ',600000000,10.20,5,[2026,8,24]],
 ['F','FIC LIQUIDEZ','INTERBANCARIO','CAPTACIÓN','BANCO DAVIVIENDA',450000000,10.25,2,[2026,8,23]],
 ['F','FIC MONETARIO','CDT','INVERSIÓN','BANCOLOMBIA S.A.',600000000,10.85,90,[2026,8,9]],
 ['F','FIC MONETARIO','OVERNIGHT','INVERSIÓN','BANCO DAVIVIENDA',500000000,10.15,1,[2026,8,30]],
 ['F','FIC LIQUIDEZ','CDT','INVERSIÓN','BANCO DE BOGOTÁ',1800000000,10.95,120,[2026,7,25]],
 ['F','FIC LIQUIDEZ','CDT','INVERSIÓN','BANCO DAVIVIENDA',2200000000,10.70,60,[2026,7,20]],
 ['F','FIC MONETARIO','TES CORTO','INVERSIÓN','MINISTERIO DE HACIENDA (TES)',350000000,10.55,180,[2026,7,12]],
 ['F','FIC RENTA FIJA','CDT','INVERSIÓN','BANCO DE BOGOTÁ',1200000000,10.90,90,[2026,7,5]]
].map(a=>({estatus:a[0],port:a[1],op:a[2],sentido:a[3],cp:a[4],nominal:a[5],tasa:a[6]/100,plazo:a[7],fecha:mkDate(a[8][0],a[8][1],a[8][2]).getTime()})).sort((a,b)=>b.fecha-a.fecha);
const MM_POS=[
 ['FIC LIQUIDEZ','CDT','BANCOLOMBIA S.A.',3200000000,10.85,90,61],['FIC LIQUIDEZ','SIMULTÁNEA','BANCOLOMBIA S.A.',2000000000,10.40,7,3],['FIC LIQUIDEZ','OVERNIGHT','BANCOLOMBIA S.A.',520000000,10.15,1,1],
 ['FIC LIQUIDEZ','CDT','BANCO DAVIVIENDA',2200000000,10.70,60,21],['FIC LIQUIDEZ','SIMULTÁNEA','BANCO DAVIVIENDA',1500000000,10.35,7,4],
 ['FIC LIQUIDEZ','CDT','BANCO DE BOGOTÁ',1800000000,10.95,120,88],['FIC LIQUIDEZ','INTERBANCARIO','BANCO DE BOGOTÁ',900000000,10.30,3,1],
 ['FIC LIQUIDEZ','CDT','FINDETER',1000000000,11.05,180,131],['FIC LIQUIDEZ','TES CORTO','MINISTERIO DE HACIENDA (TES)',2300000000,10.55,180,97],
 ['FIC MONETARIO','CDT','BANCOLOMBIA S.A.',600000000,10.85,90,12],['FIC MONETARIO','CDT','BANCO DAVIVIENDA',500000000,10.70,60,28],['FIC MONETARIO','CDT','BANCO DE BOGOTÁ',450000000,10.95,120,65],
 ['FIC MONETARIO','SIMULTÁNEA','BANCOLOMBIA S.A.',400000000,10.40,7,2],['FIC MONETARIO','INTERBANCARIO','BANCO DE BOGOTÁ',300000000,10.30,3,1],['FIC MONETARIO','OVERNIGHT','BANCO DAVIVIENDA',500000000,10.15,1,1],
 ['FIC MONETARIO','TES CORTO','MINISTERIO DE HACIENDA (TES)',350000000,10.55,180,75],['FIC MONETARIO','CDT','FINDETER',172749058,11.05,90,40],
 ['FIC RENTA FIJA','OVERNIGHT','BANCO DAVIVIENDA',800000000,10.12,1,1],['FIC RENTA FIJA','CDT','BANCO DE BOGOTÁ',1200000000,10.90,90,50]
].map(a=>({port:a[0],op:a[1],cp:a[2],nominal:a[3],tasa:a[4]/100,plazo:a[5],rest:a[6]}));
const MM_RATES=[
 ['IBR OVERNIGHT','Indicador Bancario de Referencia a 1 día',10.12],['IBR 1M','Indicador Bancario de Referencia a 1 mes',10.25],['IBR 3M','Indicador Bancario de Referencia a 3 meses',10.41],['DTF 90D','Depósito a Término Fijo a 90 días',10.68],['TASA DE REPO BANREP','Tasa de política monetaria del Banco de la República',10.25]
].map((a,i)=>({code:a[0],desc:a[1],valor:a[2],desde:mkDate(2026,8,29).getTime(),fuente:'Banco de la República',activo:true}));
const cpNames=()=>MM_CP.filter(c=>c.activo).map(c=>c.name);
const cpUsed=n=>MM_POS.filter(p=>p.cp===n).reduce((a,p)=>a+p.nominal,0);
const cpAvail=n=>{const c=MM_CP.find(x=>x.name===n);return c?c.cupo-cpUsed(n):0};
const cpUtil=c=>c.cupo?cpUsed(c.name)/c.cupo:0;
/* Límites propios del mercado monetario */
SUBLIMITS['CONTRAPARTE']=['BANCOLOMBIA S.A.','BANCO DAVIVIENDA','BANCO DE BOGOTÁ','FINDETER'];
SUBLIMITS['INSTRUMENTO MONETARIO']=['CDT','SIMULTÁNEA','INTERBANCARIO','OVERNIGHT','TES CORTO'];
[['CONTRAPARTE','MAX',0.25,'BANCOLOMBIA S.A.','TOTAL ACTIVO','FIC LIQUIDEZ',[2026,7,3]],['CONTRAPARTE','MAX',0.30,'BANCO DAVIVIENDA','TOTAL ACTIVO','FIC MONETARIO',[2026,7,3]],['INSTRUMENTO MONETARIO','MIN',0.02,'OVERNIGHT','TOTAL ACTIVO','FIC LIQUIDEZ',[2026,7,10]],['INSTRUMENTO MONETARIO','MAX',0.60,'CDT','TOTAL ACTIVO','FIC MONETARIO',[2026,7,10]],['INSTRUMENTO MONETARIO','MAX',0.30,'SIMULTÁNEA','TOTAL ACTIVO','FIC LIQUIDEZ',[2026,7,10]],['CALIFICACIÓN','MIN',0.90,'AA+','TOTAL ACTIVO','FIC MONETARIO',[2026,7,17]]].forEach(a=>LIMITS.push({tipo:a[0],eval:a[1],pct:a[2],sub:a[3],denom:a[4],port:a[5],fecha:mkDate(a[6][0],a[6][1],a[6][2]).getTime(),activo:true}));
Object.assign(APO,{
 mm:[['Posición monetaria','#/dashboard/money-market'],['Libro de órdenes','#/orders/reports'],['Evaluación de límites','#/limit-control/limit-evaluation'],['Atribución mercado monetario','#/performance-attribution/money-market']],
 cp:[['Mercado monetario','#/orders/money-market'],['Posición monetaria','#/dashboard/money-market'],['Evaluación de límites','#/limit-control/limit-evaluation']],
 rates:[['Posición monetaria','#/dashboard/money-market'],['Atribución mercado monetario','#/performance-attribution/money-market'],['Benchmarks','#/parametrizacion/benchmarks']]
});
APO.flow.push(['Mercado monetario','#/orders/money-market']);
APO.port.push(['Mercado monetario','#/orders/money-market']);
APO.cat.push([['Mercado monetario','#/orders/money-market'],['Posición monetaria','#/dashboard/money-market']]);
const cupoTxt=n=>{const c=MM_CP.find(x=>x.name===n);return c?'Cupo de '+n+': '+money(c.cupo)+' · utilizado '+money(cpUsed(n))+' · <b>disponible '+money(Math.max(0,cpAvail(n)))+'</b>':''};

MASS.mm={id:'mm',nombre:'Órdenes de Mercado Monetario',cols:[['Portafolio',1,'Nombre exacto del maestro de Portafolios','FIC LIQUIDEZ'],['Sentido',1,'INVERSIÓN o CAPTACIÓN','INVERSIÓN'],['Operación',1,'Tipo de operación monetaria del catálogo','CDT'],['Contraparte',1,'Contraparte activa del maestro de Contrapartes y cupos','BANCO DE BOGOTÁ'],['Valor nominal',1,'Número mayor a 0, en moneda del portafolio','500000000'],['Tasa E.A.',1,'Porcentaje efectivo anual, con punto decimal','10.90'],['Plazo (días)',1,'Número entero de días mayor o igual a 1','90']],
 descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de portafolios, operaciones y contrapartes activas.',descM:'Instructivo campo por campo, con valores permitidos, control de cupo por contraparte y errores frecuentes en operaciones monetarias.',
 lists:[()=>FUNDS.slice(),()=>MM_SENT.slice(),()=>MM_OPS(),()=>cpNames(),null,null,null],
 ej:()=>[FUNDS[0],MM_SENT[0],MM_OPS()[0],cpNames()[2],'500000000','10.90','90'],
 demo:()=>{const o=MM_OPS(),c=cpNames();return [[FUNDS[0],MM_SENT[0],o[0],c[2],'500000000','10.90','90'],[FUNDS[0],MM_SENT[0],o[3],c[1],'400000000','10.12','1'],[FUNDS[8],MM_SENT[0],o[1],c[1],'300000000','10.35','7'],[FUNDS[8],MM_SENT[0],o[2],c[2],'250000000','10.28','3'],[FUNDS[1],MM_SENT[0],o[4],c[4],'600000000','10.58','120'],[FUNDS[0],MM_SENT[1],o[1],c[3],'200000000','10.22','5']]},
 row:c=>{const e=[],port=findCI(FUNDS,sv(c[0])),sent=findCI(MM_SENT,sv(c[1])),op=findCI(MM_OPS(),sv(c[2])),cp=findCI(cpNames(),sv(c[3])),nom=numP(c[4]),tasa=numP(c[5]),pl=numP(c[6]);
  if(!port)e.push('el portafolio "'+sv(c[0])+'" no existe');if(!sent)e.push('el sentido debe ser INVERSIÓN o CAPTACIÓN');if(!op)e.push('la operación "'+sv(c[2])+'" no está en el catálogo');if(!cp)e.push('la contraparte "'+sv(c[3])+'" no existe o está inactiva');if(!(nom>0))e.push('el valor nominal debe ser mayor a 0');if(!(tasa>0&&tasa<=100))e.push('la tasa debe estar entre 0 y 100');if(!(pl>=1&&pl===Math.floor(pl)))e.push('el plazo debe ser un número entero de días');
  if(cp&&sent===MM_SENT[0]&&nom>0&&nom>cpAvail(cp))e.push('supera el cupo disponible de '+cp+' ('+money(Math.max(0,cpAvail(cp)))+')');
  return e.length?{e}:{d:{estatus:'R',port,op,sentido:sent,cp,nominal:nom,tasa:tasa/100,plazo:pl,fecha:Date.now()}}},
 add:d=>MM_ORDERS.unshift(d)};
MASS.cp={id:'cp',nombre:'Contrapartes y Cupos',cols:[['Contraparte',1,'Nombre de la entidad (único)','BANCO POPULAR S.A.'],['Tipo',1,'Banco, Comisionista o Entidad pública','Banco'],['Calificación',1,'Escala del catálogo de calificaciones','AAA'],['Cupo autorizado',1,'Valor máximo en moneda local','2000000000']],
 descE:'Plantilla de <b>selección</b>: listas desplegables por columna, hoja de instrucciones y listas de tipos y calificaciones.',descM:'Instructivo campo por campo, con valores permitidos y errores frecuentes al cargar contrapartes.',
 lists:[null,()=>LOCL(CP_TIPOS),()=>CALIFS.slice(),null],
 ej:()=>[loc('BANCO POPULAR S.A.'),LOCL(CP_TIPOS)[0],'AAA','2000000000'],
 demo:()=>{const t=LOCL(CP_TIPOS);return [[loc('BANCO POPULAR S.A.'),t[0],'AAA','2000000000'],[loc('BANCO AV VILLAS'),t[0],'AA+','1500000000'],[loc('SCOTIABANK COLPATRIA'),t[0],'AAA','3000000000'],[loc('CORFICOLOMBIANA')+' II',t[1],'AA','1000000000']]},
 row:c=>{const e=[],n=sv(c[0]).trim(),tipo=findCI(LOCL(CP_TIPOS),sv(c[1])),cal=findCI(CALIFS,sv(c[2])),cupo=numP(c[3]);
  if(!n)e.push('el nombre es obligatorio');else if(MM_CP.some(x=>normH(x.name)===normH(n)))e.push('la contraparte "'+n+'" ya existe');if(!tipo)e.push('el tipo "'+sv(c[1])+'" no es válido');if(!cal)e.push('la calificación "'+sv(c[2])+'" no está en el catálogo');if(!(cupo>0))e.push('el cupo debe ser un número mayor a 0');
  return e.length?{e}:{d:{name:n,tipo,calif:cal,cupo,activo:true}}},
 add:d=>MM_CP.unshift(d)};
/* Ejemplos con datos de demostración (todas las filas son válidas) */
MASS.fixed.demo=()=>{const I=INSTR_NAMES;return [[FUNDS[1],'COMPRA',I[3],'2000000','10.25','2050000'],[FUNDS[1],'COMPRA',I[4],'1500000','10.40','1560000'],[FUNDS[0],'COMPRA',I[5],'3000000','10.10','3030000'],[FUNDS[7],'COMPRA',I[3],'5000000','11.05','5250000'],[FUNDS[1],'VENTA',I[4],'800000','10.30','824000'],[FUNDS[4],'COMPRA',I[5],'2500000','10.55','2590000']]};
MASS.variable.demo=()=>{const V=VI_LIST();return [[FUNDS[5],'COMPRA',V[0],'LIMITE','10000','2500'],[FUNDS[5],'COMPRA',V[1],'MERCADO','8000',''],[FUNDS[6],'COMPRA',V[2],'LIMITE','15000','3100'],[FUNDS[5],'VENTA',V[0],'MERCADO','5000',''],[FUNDS[6],'COMPRA',V[3],'LIMITE','12000','1850'],[FUNDS[5],'COMPRA',V[4],'MERCADO','6000','']]};
MASS.instr.demo=()=>{const T=TIPOS(),M=MONEDAS(),I=ISSUERS;return [[loc('TFIT2027A'),T[3],'XX0000000001',M[0],'7.25','SV','2024-01-15','2027-06-15',I[0],'AAA'],[loc('TFIT2029B'),T[3],'XX0000000002',M[0],'8.10','SV','2024-03-10','2029-03-10',I[1],'AAA'],[loc('CDT2026C'),T[1],'XX0000000003',M[0],'10.85','AV','2026-06-01','2026-12-01',I[2],'AA+'],[loc('TFIT2031D'),T[3],'XX0000000004',M[0],'9.40','SV','2025-02-20','2031-02-20',I[3],'AA'],[loc('BONO2030E'),T[0],'XX0000000005',M[0],'6.75','MV','2025-08-05','2030-08-05',I[4],'AAA']]};
MASS.bench.demo=()=>{const B=BENCH_COMPS;return [[FUNDS[8],'Benchmark Monetario Demo',B[0],'70','2026-09-01'],[FUNDS[8],'Benchmark Monetario Demo',B[2],'30','2026-09-01'],[FUNDS[0],'Benchmark Liquidez Demo',B[1],'60','2026-09-01'],[FUNDS[0],'Benchmark Liquidez Demo',B[2],'40','2026-09-01']]};

/* ---------- Órdenes › Mercado monetario ---------- */
const togMM=r=>({title:'Anular operación',danger:true,message:'Vas a anular la operación de <b>'+esc(r.op)+'</b> de <b>'+esc(r.port)+'</b> con <b>'+esc(r.cp)+'</b> por <b>'+money(r.nominal)+'</b>. Esta acción no se puede deshacer.',confirm:'Anular',done:'Operación anulada correctamente.',apply:()=>{r.estatus='A'}});
const sentB=s=>badge(s,s===MM_SENT[0]?'info':'warning');
const venMM=r=>r.fecha+r.plazo*864e5;
PAGES.mm=crudPage({title:'Mercado monetario',help:'Registra y administra las operaciones de corto plazo: CDT, simultáneas, interbancarios, overnight y títulos de deuda pública de corto plazo.',mass:MASS.mm,apoya:APO.mm,dateRange:{k:'fecha',label:'fecha de creación'},entity:'operación monetaria',entityArt:'La operación',fileName:'mercado-monetario',defaultSort:'Creado',defaultDir:-1,searchPh:'Portafolio, operación o contraparte...',noun:'operaciones',
 filters:[{id:'port',label:'Portafolio',opts:()=>FUNDS.slice(),get:r=>r.port},{id:'op',label:'Operación',opts:()=>MM_OPS(),get:r=>r.op},{id:'sent',label:'Sentido',opts:()=>MM_SENT,get:r=>r.sentido},filtOrd[1]],kpis:kpiOrd,
 cols:[{h:'Portafolio',k:'port'},{h:'Operación',k:'op',html:r=>badge(r.op,'neutral'),txt:r=>r.op},{h:'Sentido',k:'sentido',html:r=>sentB(r.sentido),txt:r=>r.sentido},{h:'Contraparte',k:'cp'},{h:'Valor nominal',k:'nominal',fmt:f0},{h:'Tasa E.A.',k:'tasa',fmt:v=>pc2(v*100)},{h:'Plazo (días)',k:'plazo'},{h:'Vencimiento',k:'fecha',html:r=>fmtD(venMM(r)),txt:r=>fmtD(venMM(r)),sv:venMM,sortable:true},{h:'Creado',k:'fecha',fmt:dstr,sortable:true}],
 rows:()=>MM_ORDERS,acts:actsOrd,estado:estOrd,toggle:togMM,
 detail:r=>[['Portafolio',esc(r.port)],['Operación',esc(r.op)],['Sentido',r.sentido],['Contraparte',esc(r.cp)],['Valor nominal',money(r.nominal)],['Tasa E.A.',pc2(r.tasa*100)],['Plazo',r.plazo+' días'],['Vencimiento',fmtD(venMM(r))],['Creada',dstr(r.fecha)],['Estado',ESTADO_ORD[r.estatus][0]]],badges:r=>sentB(r.sentido)+' '+estOrd(r),detailTitle:r=>'Operación · '+r.op,
 form:row=>({html:'<div class="mk-formgrid">'+radiosF('sent','Sentido',MM_SENT,row?row.sentido:MM_SENT[0],{req:true,tip:'Inversión: el portafolio coloca recursos. Captación: el portafolio toma recursos.'})+selF('op','Operación',MM_OPS(),row&&row.op,{req:true})+selF('port','Portafolio',FUNDS,row&&row.port,{req:true})+selF('cp','Contraparte',cpNames(),row&&row.cp,{req:true,tip:'Solo contrapartes activas del maestro de Contrapartes y cupos.'})+inpF('nominal','Valor nominal',row?row.nominal.toFixed(2):'0.00',{req:true})+inpF('rate','Tasa E.A.',row?(row.tasa*100).toFixed(2)+'%':'0.00%',{req:true})+inpF('plazo','Plazo (días)',row?String(row.plazo):'',{req:true,ph:'Ej: 30'})+'</div><div class="mk-help mk-mt" id="cpinfo">Selecciona una contraparte para ver su cupo disponible.</div>',
  bind:f=>{bindMask(f,'nominal',mask.qty);bindMask(f,'rate',mask.rate);const up=()=>{const n=$('[name=cp]',f).value;$('#cpinfo',f).innerHTML=n?cupoTxt(n):'Selecciona una contraparte para ver su cupo disponible.'};$('[name=cp]',f).addEventListener('change',up);up()},
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[],nom=okNum(g('nominal')),tasa=okNum(g('rate')),pl=parseInt(g('plazo'),10),sent=rv(f,'sent');if(!g('op'))errs.push(['op','Selecciona la operación','Operación']);if(!g('port'))errs.push(['port','Selecciona un portafolio','Portafolio']);if(!g('cp'))errs.push(['cp','Selecciona la contraparte','Contraparte']);if(!(nom>0))errs.push(['nominal','El valor debe ser mayor a 0','Valor nominal']);if(!(tasa>0&&tasa<=100))errs.push(['rate','Ingresa una tasa entre 0 y 100','Tasa']);if(!(pl>=1))errs.push(['plazo','El plazo debe ser de 1 día o más','Plazo']);
   if(g('cp')&&sent===MM_SENT[0]&&nom>0){const av=cpAvail(g('cp')),prev=(row&&row.cp===g('cp')&&row.sentido===MM_SENT[0]&&row.estatus!=='A')?0:0;if(nom>av+prev)errs.push(['cp','Supera el cupo disponible ('+money(Math.max(0,av))+')','Cupo de contraparte'])}
   if(errs.length)return {ok:false,errs};return {ok:true,data:{estatus:row?row.estatus:'R',port:g('port'),op:g('op'),sentido:sent,cp:g('cp'),nominal:nom,tasa:tasa/100,plazo:pl,fecha:row?row.fecha:Date.now()}}}}),
 review:d=>[['Sentido',d.sentido],['Operación',d.op],['Portafolio',d.port],['Contraparte',d.cp],['Valor nominal',money(d.nominal)],['Tasa E.A.',pc2(d.tasa*100)],['Plazo',d.plazo+' días']],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else MM_ORDERS.unshift(o)}
});

/* ---------- Órdenes › Reportes (Libro de órdenes) ---------- */
const ordNum=(p,o)=>p+'-'+String(1000+hash(p+o.port+(o.instr||o.op)+o.fecha+o.cant)%9000);
const bookRows=()=>FI_ORDERS.map(o=>({mercado:'Renta fija',num:ordNum('RF',o),fecha:o.fecha,port:o.port,tipo:o.tipo,instr:o.instr,cp:'—',cant:o.cant,tasa:o.tasa,plazo:null,valor:o.valor,estatus:o.estatus}))
 .concat(VI_ORDERS.map(o=>({mercado:'Renta variable',num:ordNum('RV',o),fecha:o.fecha,port:o.port,tipo:o.tipo,instr:o.instr,cp:'—',cant:o.cant,tasa:null,plazo:null,valor:o.valor,estatus:o.estatus})))
 .concat(MM_ORDERS.map(o=>({mercado:'Mercado monetario',num:ordNum('MM',{port:o.port,op:o.op,fecha:o.fecha,cant:o.nominal}),fecha:o.fecha,port:o.port,tipo:o.sentido,instr:o.op,cp:o.cp,cant:o.nominal,tasa:o.tasa,plazo:o.plazo,valor:o.nominal,estatus:o.estatus}))).sort((a,b)=>b.fecha-a.fecha);
const MERC=['Renta fija','Renta variable','Mercado monetario'];
PAGES.oreports=crudPage({title:'Reportes · Libro de órdenes',help:'Todas las órdenes de renta fija, renta variable y mercado monetario en un solo informe. Filtra y descarga en CSV o Excel.',noNew:true,dateRange:{k:'fecha',label:'fecha de creación'},fileName:'libro-de-ordenes',defaultSort:'Creado',defaultDir:-1,searchPh:'N° de orden, portafolio, instrumento o contraparte...',noun:'órdenes',
 filters:[{id:'m',label:'Mercado',opts:()=>MERC,get:r=>r.mercado},{id:'port',label:'Portafolio',opts:()=>PNAMES.slice(0,9),get:r=>r.port},filtOrd[1]],
 kpis:rows=>[['Órdenes',rows.length,'p'],['Renta fija',rows.filter(r=>r.mercado===MERC[0]).length,'b'],['Renta variable',rows.filter(r=>r.mercado===MERC[1]).length,'y'],['Mercado monetario',rows.filter(r=>r.mercado===MERC[2]).length,'g'],['Finalizadas',rows.filter(r=>r.estatus==='F').length,'']],
 cols:[{h:'N° orden',k:'num',sortable:true},{h:'Mercado',k:'mercado',html:r=>badge(r.mercado,r.mercado===MERC[0]?'success':r.mercado===MERC[1]?'warning':'info'),txt:r=>r.mercado},{h:'Portafolio',k:'port'},{h:'Tipo',k:'tipo',html:r=>r.tipo==='COMPRA'||r.tipo==='VENTA'?side(r.tipo):sentB(r.tipo),txt:r=>r.tipo},{h:'Instrumento / operación',k:'instr'},{h:'Contraparte',k:'cp'},{h:'Cantidad / nominal',k:'cant',fmt:f2},{h:'Tasa',k:'tasa',fmt:v=>v==null?'—':pc2(v*100)},{h:'Plazo (días)',k:'plazo',fmt:v=>v==null?'—':String(v)},{h:'Valor',k:'valor',fmt:money},{h:'Creado',k:'fecha',fmt:dstr,sortable:true}],
 rows:bookRows,acts:()=>[['ver']],estado:estOrd,
 detail:r=>[['N° de orden',r.num],['Mercado',r.mercado],['Portafolio',esc(r.port)],['Tipo',r.tipo],['Instrumento / operación',esc(r.instr)],['Contraparte',esc(r.cp)],['Cantidad / nominal',f2(r.cant)],['Tasa',r.tasa==null?'—':pc2(r.tasa*100)],['Plazo',r.plazo==null?'—':r.plazo+' días'],['Valor',money(r.valor)],['Creada',dstr(r.fecha)],['Estado',ESTADO_ORD[r.estatus][0]]],detailTitle:r=>'Orden · '+r.num,badges:r=>estOrd(r),
 form:()=>({html:'',read:()=>({ok:false})}),review:()=>[],onSave:()=>{},entity:'',entityArt:'',toggle:()=>({})
});

/* ---------- Dashboard › Mercado monetario (posición, vencimientos y devengo) ---------- */
function mmCalc(port,dt){const fac=dfac(dt),base=fromIso(dt),day=parseInt(dt.slice(8,10),10)||1;
 const rows=MM_POS.filter(p=>p.port===port).map(p=>{const nominal=p.nominal*fac,dev=nominal*(Math.pow(1+p.tasa,1/365)-1);return Object.assign({},p,{nominal,venc:base+p.rest*864e5,devDia:dev,devMes:dev*day})});
 const tot=rows.reduce((a,p)=>a+p.nominal,0)||1,sum=f=>rows.reduce((a,p)=>a+f(p),0);
 return {rows,tot,wam:sum(p=>p.nominal*p.rest)/tot,tasa:sum(p=>p.nominal*p.tasa)/tot,v7:sum(p=>p.rest<=7?p.nominal:0),n7:rows.filter(p=>p.rest<=7).length,liq1:sum(p=>p.rest<=1?p.nominal:0),dev:sum(p=>p.devDia)}}
const MM_BUCKETS=[['1 día',0,1],['2 a 7 días',2,7],['8 a 30 días',8,30],['31 a 90 días',31,90],['Más de 90 días',91,1e9]];
function columnSVG(items){const W=1100,Hh=230,m={l:16,r:16,t:28,b:44},iw=W-m.l-m.r,ih=Hh-m.t-m.b,n=items.length,bw=iw/n*0.5;let mx=0;items.forEach(i=>{mx=Math.max(mx,i.v)});mx=mx||1;
 let g='<line x1="'+m.l+'" x2="'+(W-m.r)+'" y1="'+(Hh-m.b)+'" y2="'+(Hh-m.b)+'" stroke="currentColor" opacity=".4"/>';
 items.forEach((it,i)=>{const x=m.l+iw/n*i+(iw/n-bw)/2,h=ih*it.v/mx,y=Hh-m.b-h;g+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+Math.max(h,1)+'" rx="3" fill="#6A1B9A"><title>'+esc(it.l)+': '+f0(it.v)+'</title></rect><text x="'+(x+bw/2)+'" y="'+(y-7)+'" text-anchor="middle" class="chart-txt" style="font-weight:600">'+f0(it.v/1e6)+' M</text><text x="'+(x+bw/2)+'" y="'+(Hh-m.b+20)+'" text-anchor="middle" class="chart-txt">'+esc(it.l)+'</text>'});
 return '<svg viewBox="0 0 '+W+' '+Hh+'" width="100%" style="display:block;max-height:240px" role="img" aria-label="Escalera de vencimientos">'+g+'</svg>'}
PAGES.mmpos=function(view,meta){
 const pg=mountPage(view,meta,'Mercado monetario','Posición, vencimientos y devengo de las operaciones monetarias por portafolio.');
 const ports=()=>Array.from(new Set(MM_POS.map(p=>p.port)));
 const st={port:FUNDS[0],op:OPDATE,done:true,tab:0};
 const draw=()=>{
  pg.innerHTML=queryBar(opField(st.op)+selF('port','Portafolio',ports(),st.port,{req:true}))+'<div id="res"></div>';
  $('[name=port]',pg).addEventListener('change',e=>st.port=e.target.value);bindClear(pg);bindOp(pg,st,()=>{if(st.done)result()});
  $('[data-clear]',pg).addEventListener('click',()=>{st.port='';st.done=false;st.op=OPDATE;draw()});
  $('[data-consult]',pg).addEventListener('click',()=>{if(!st.port){errOn(pg,'port','Selecciona un portafolio para consultar');toast('Selecciona un portafolio.','warning','Falta un dato');return}st.done=true;result()});
  if(st.done)result();else $('#res',pg).innerHTML='<div class="mk-card"><div class="mk-emptybig"><div class="mk-emptybig__ico">'+ic('coins','xl')+'</div><div class="mk-emptybig__t">Aún no hay resultados</div><div class="mk-emptybig__d">Elige un portafolio y pulsa Consultar.</div></div></div>';
 };
 function result(){
  const c=mmCalc(st.port,st.op),r=$('#res',pg),det=x=>{const m=openModal({title:'Detalle de la operación',body:'<div class="mk-formgrid">'+fdRow('Operación',esc(x.op))+fdRow('Contraparte',esc(x.cp))+fdRow('Valor nominal',money(x.nominal))+fdRow('Tasa E.A.',pct(x.tasa,2))+fdRow('Plazo',x.plazo+' días')+fdRow('Días al vencimiento',x.rest)+fdRow('Vencimiento',fmtD(x.venc))+fdRow('Devengo del día',money(x.devDia))+'</div>',foot:'<button class="mk-btn mk-btn--secondary" data-c>Cerrar</button>'});$('[data-c]',m.el).addEventListener('click',m.close)};
  r.innerHTML='<div class="mk-kpis">'+kpiBox('Saldo monetario',f0(c.tot),'p','Suma de las operaciones vigentes del portafolio')+kpiBox('Plazo promedio ponderado',f1(c.wam)+' días','b','Días al vencimiento ponderados por valor. Tope de política: 90 días.')+kpiBox('Tasa promedio E.A.','<span class="pos">'+pct(c.tasa,2)+'</span>','g','Tasa efectiva anual ponderada por valor')+kpiBox('Vence en 7 días',f0(c.v7)+' · '+c.n7+' op.','y','Recursos que se liberan en la próxima semana')+kpiBox('Liquidez a 1 día',pct(c.liq1/c.tot,1),'','Porción del saldo que vence al día siguiente')+'</div><div id="tabs"></div>';
  tabsUI($('#tabs',r),['Posición vigente','Escalera de vencimientos','Devengo y rentabilidad'],st,(i,p)=>{
   if(i===0){p.innerHTML='<div id="t"></div>';DataTable($('#t',p),{cols:[{h:'Operación',k:'op',html:x=>badge(x.op,'neutral'),txt:x=>x.op,sortable:true},{h:'Contraparte',k:'cp',sortable:true},{h:'Valor nominal',k:'nominal',fmt:f0,sortable:true},{h:'Tasa E.A.',k:'tasa',fmt:v=>pct(v,2),sortable:true},{h:'Plazo (días)',k:'plazo'},{h:'Días al vencimiento',k:'rest',sortable:true},{h:'Vencimiento',k:'venc',fmt:fmtD,sortable:true},{h:'Devengo del día',k:'devDia',fmt:f0}],rows:()=>c.rows,acts:()=>[['ver']],onAct:(a,x)=>det(x),searchPh:'Operación o contraparte...',fileName:'posicion-monetaria',defaultSort:'Días al vencimiento',noun:'operaciones',totals:rows=>['Total','',f0(rows.reduce((a,x)=>a+x.nominal,0)),pct(c.tasa,2),'',f1(c.wam),'',f0(rows.reduce((a,x)=>a+x.devDia,0))]})}
   else if(i===1){const items=MM_BUCKETS.map(b=>({l:b[0],v:c.rows.filter(x=>x.rest>=b[1]&&x.rest<=b[2]).reduce((a,x)=>a+x.nominal,0),n:c.rows.filter(x=>x.rest>=b[1]&&x.rest<=b[2]).length}));
    p.innerHTML='<div class="mk-card mk-mb"><h3 style="margin:0 0 6px;font-size:14px">Vencimientos por rango (valor en millones)</h3>'+columnSVG(items)+'</div><div id="b"></div>';
    DataTable($('#b',p),{cols:[{h:'Rango de vencimiento',k:'l'},{h:'Valor',k:'v',fmt:f0},{h:'% del saldo',k:'pc',fmt:v=>pct(v,1)},{h:'Operaciones',k:'n'}],rows:()=>items.map(x=>Object.assign({pc:x.v/c.tot},x)),noPage:true,noFilters:true,noFoot:true,fileName:'escalera-vencimientos',totals:rows=>['Total',f0(c.tot),'100,0 %',String(c.rows.length)]})}
   else{p.innerHTML='<div class="mk-kpis"><div class="mk-kpi mk-kpi--g"><div class="mk-kpi__l">Devengo del día</div><div class="mk-kpi__v">'+f0(c.dev)+'</div></div><div class="mk-kpi mk-kpi--b"><div class="mk-kpi__l">Rentabilidad diaria</div><div class="mk-kpi__v">'+pct(Math.pow(1+c.tasa,1/365)-1,4)+'</div></div><div class="mk-kpi mk-kpi--p"><div class="mk-kpi__l">Rentabilidad E.A.</div><div class="mk-kpi__v">'+pct(c.tasa,2)+'</div></div></div><div id="d"></div>';
    DataTable($('#d',p),{cols:[{h:'Operación',k:'op',html:x=>badge(x.op,'neutral'),txt:x=>x.op},{h:'Contraparte',k:'cp'},{h:'Valor nominal',k:'nominal',fmt:f0},{h:'Tasa E.A.',k:'tasa',fmt:v=>pct(v,2)},{h:'Devengo del día',k:'devDia',fmt:f0,tip:'Valor × ((1 + tasa E.A.)^(1/365) − 1)'},{h:'Devengo acumulado del mes',k:'devMes',fmt:f0},{h:'% del saldo',k:'pc',fmt:v=>pct(v,1)}],rows:()=>c.rows.map(x=>Object.assign({pc:x.nominal/c.tot},x)),searchPh:'Operación o contraparte...',fileName:'devengo-monetario',noun:'operaciones',totals:rows=>['Total','',f0(rows.reduce((a,x)=>a+x.nominal,0)),pct(c.tasa,2),f0(rows.reduce((a,x)=>a+x.devDia,0)),f0(rows.reduce((a,x)=>a+x.devMes,0)),'100,0 %']})}
  });
 }
 draw();
};

/* ---------- Parametrización › Contrapartes y cupos / Tasas de referencia ---------- */
const cpBar=r=>{const u=cpUtil(r);return '<div style="min-width:110px">'+pc2(u*100)+'<div class="mk-util"><div class="mk-util__b'+(u>=1?' hi':'')+'" style="width:'+Math.min(100,u*100)+'%"></div></div></div>'};
PAGES.pcp=crudPage({title:'Contrapartes y cupos',help:'Entidades con las que se opera en mercado monetario y el cupo autorizado para cada una.',apoya:APO.cp,entity:'contraparte',entityArt:'La contraparte',fileName:'contrapartes-cupos',defaultSort:'Contraparte',searchPh:'Nombre de la contraparte...',noun:'contrapartes',
 filters:[{id:'t',label:'Tipo',opts:()=>LOCL(CP_TIPOS),get:r=>r.tipo},{id:'e',label:'Estado',opts:()=>['Activo','Inactivo'],get:r=>r.activo?'Activo':'Inactivo'}],
 kpis:rows=>[['Contrapartes',rows.length,'p'],['Activas',rows.filter(r=>r.activo).length,'g'],['Cupo total activo',f0(rows.filter(r=>r.activo).reduce((a,r)=>a+r.cupo,0)),'b'],['Cupo en alerta (90 % o más)',rows.filter(r=>r.activo&&cpUtil(r)>=0.9).length,'y']],
 cols:[{h:'Contraparte',k:'name',sortable:true},{h:'Tipo',k:'tipo'},{h:'Calificación',k:'calif'},{h:'Cupo autorizado',k:'cupo',fmt:f0,sortable:true},{h:'Utilizado',sv:r=>cpUsed(r.name),num:r=>cpUsed(r.name),html:r=>f0(cpUsed(r.name)),txt:r=>f0(cpUsed(r.name))},{h:'Disponible',sv:r=>r.cupo-cpUsed(r.name),num:r=>r.cupo-cpUsed(r.name),html:r=>f0(r.cupo-cpUsed(r.name)),txt:r=>f0(r.cupo-cpUsed(r.name))},{h:'Utilización',sv:cpUtil,html:cpBar,txt:r=>pc2(cpUtil(r)*100),tip:'Operaciones vigentes dividido por el cupo autorizado. En alerta desde 90 %.'}],
 rows:()=>MM_CP,estado:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral',true),acts:r=>[['ver'],['edit'],r.activo?['off']:['on']],
 toggle:r=>r.activo?{title:'Inactivar contraparte',danger:true,message:'Vas a inactivar <b>'+esc(r.name)+'</b>. No podrá elegirse en nuevas operaciones'+(cpUsed(r.name)?'; las posiciones vigentes por <b>'+money(cpUsed(r.name))+'</b> no se modifican':'')+'.',confirm:'Inactivar',done:'Contraparte inactivada.',apply:()=>{r.activo=false}}:{title:'Activar contraparte',message:'¿Deseas activar <b>'+esc(r.name)+'</b> para operar?',confirm:'Activar',done:'Contraparte activada.',apply:()=>{r.activo=true}},
 detail:r=>[['Contraparte',esc(r.name)],['Tipo',r.tipo],['Calificación',r.calif],['Cupo autorizado',money(r.cupo)],['Utilizado',money(cpUsed(r.name))],['Disponible',money(r.cupo-cpUsed(r.name))],['Utilización',pc2(cpUtil(r)*100)]],detailTitle:r=>r.name,badges:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral'),
 extra:(pg,rp)=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class="mk-accordion__head"><span class="mk-accordion__ico">'+ic('upload')+'</span><span><span class="mk-accordion__t">Carga masiva de contrapartes</span><span class="mk-accordion__d">Descarga la estructura y el manual, y carga el archivo</span></span><span class="mk-accordion__chev">&#9662;</span></div><div class="mk-accordion__body">'+massHTML(MASS.cp)+'</div>';pg.appendChild(x);bindAcc(x);bindMass(x,MASS.cp,rp)},
 form:row=>({html:'<div class="mk-formgrid">'+inpF('name','Contraparte',row&&row.name,{req:true,cls:'span2'})+selF('tipo','Tipo',LOCL(CP_TIPOS),row&&row.tipo,{req:true})+selF('calif','Calificación',CALIFS,row&&row.calif,{req:true})+inpF('cupo','Cupo autorizado',row?String(row.cupo):'',{req:true,ph:'Ej: 5000000000'})+'</div>',
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[],cupo=okNum(g('cupo'));if(!g('name'))errs.push(['name','Indica el nombre','Contraparte']);else if(MM_CP.some(x=>x!==row&&normH(x.name)===normH(g('name'))))errs.push(['name','Ya existe una contraparte con ese nombre','Contraparte']);if(!g('tipo'))errs.push(['tipo','Selecciona el tipo','Tipo']);if(!g('calif'))errs.push(['calif','Selecciona la calificación','Calificación']);if(!(cupo>0))errs.push(['cupo','El cupo debe ser mayor a 0','Cupo']);if(errs.length)return {ok:false,errs};return {ok:true,data:{name:g('name'),tipo:g('tipo'),calif:g('calif'),cupo,activo:row?row.activo:true}}}}),
 review:d=>[['Contraparte',d.name],['Tipo',d.tipo],['Calificación',d.calif],['Cupo autorizado',money(d.cupo)]],
 onSave:(o,row)=>{if(row){if(row.name!==o.name){MM_POS.forEach(p=>{if(p.cp===row.name)p.cp=o.name});MM_ORDERS.forEach(p=>{if(p.cp===row.name)p.cp=o.name})}Object.assign(row,o)}else MM_CP.unshift(o)}
});
PAGES.prates=crudPage({title:'Tasas de referencia',help:'Tasas de mercado que se usan para valorar, comparar y explicar el desempeño monetario.',apoya:APO.rates,entity:'tasa de referencia',entityArt:'La tasa',fileName:'tasas-referencia',defaultSort:'Tasa',searchPh:'Código, descripción o fuente...',noun:'tasas',
 filters:[{id:'e',label:'Estado',opts:()=>['Activo','Inactivo'],get:r=>r.activo?'Activo':'Inactivo'}],
 kpis:rows=>[['Tasas',rows.length,'p'],['Activas',rows.filter(r=>r.activo).length,'g'],['Tasa más alta (E.A.)',pct(Math.max.apply(null,rows.map(r=>r.valor))/100,2),'b']],
 cols:[{h:'Tasa',k:'code',sortable:true},{h:'Descripción',k:'desc'},{h:'Valor (E.A.)',k:'valor',fmt:v=>pct(v/100,2)},{h:'Vigente desde',k:'desde',fmt:fmtD},{h:'Fuente',k:'fuente'}],
 rows:()=>MM_RATES,estado:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral',true),acts:r=>[['ver'],['edit'],r.activo?['off']:['on']],
 toggle:r=>r.activo?{title:'Inactivar tasa',danger:true,message:'Vas a inactivar <b>'+esc(r.code)+'</b>. Dejará de usarse para comparar y valorar operaciones monetarias.',confirm:'Inactivar',done:'Tasa inactivada.',apply:()=>{r.activo=false}}:{title:'Activar tasa',message:'¿Deseas activar <b>'+esc(r.code)+'</b>?',confirm:'Activar',done:'Tasa activada.',apply:()=>{r.activo=true}},
 detail:r=>[['Tasa',esc(r.code)],['Descripción',esc(r.desc)],['Valor (E.A.)',pct(r.valor/100,2)],['Vigente desde',fmtD(r.desde)],['Fuente',esc(r.fuente)]],detailTitle:r=>r.code,badges:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral'),
 form:row=>({html:'<div class="mk-formgrid">'+inpF('code','Tasa',row&&row.code,{req:true})+inpF('valor','Valor (% E.A.)',row?String(row.valor):'',{req:true,ph:'Ej: 10.25'})+inpF('desc','Descripción',row&&row.desc,{req:true,cls:'span2'})+dateF('desde','Vigente desde',row?row.desde:OPDATE_TS(),{req:true})+inpF('fuente','Fuente',row&&row.fuente)+'</div>',
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[],v=okNum(g('valor'));if(!g('code'))errs.push(['code','Indica el código','Tasa']);if(!g('desc'))errs.push(['desc','Indica la descripción','Descripción']);if(!(v>0&&v<=100))errs.push(['valor','Ingresa un valor entre 0 y 100','Valor']);const d=fromIso(g('desde'));if(!d)errs.push(['desde','Indica la fecha','Vigencia']);if(errs.length)return {ok:false,errs};return {ok:true,data:{code:g('code'),desc:g('desc'),valor:v,desde:d,fuente:g('fuente'),activo:row?row.activo:true}}}}),
 review:d=>[['Tasa',d.code],['Descripción',d.desc],['Valor (E.A.)',pct(d.valor/100,2)],['Vigente desde',fmtD(d.desde)],['Fuente',d.fuente||'—']],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else MM_RATES.unshift(o)}
});
function OPDATE_TS(){return fromIso(OPDATE)}
