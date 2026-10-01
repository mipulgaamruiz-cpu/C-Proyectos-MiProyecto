const fs=require('fs');let s=fs.readFileSync('mk.before_f1.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,90));s=s.replace(a,()=>b)};
const R=f=>fs.readFileSync(f,'utf8');
/* 0) S antes de los datos (los datos de derivados necesitan el país actual al cargar) */
rep("const S={hash:'',pais:'Colombia',token:0,open:{}};\n","");
/* 1) bloques nuevos */
rep("/* --- Carga de archivos --- */",R('ins_f1a.js')+"\n"+R('ins_f1b.js')+"\n"+R('ins_f1c.js')+"\n/* --- Carga de archivos --- */");
/* 2) crudPage: acciones propias de crear y editar */
rep("if(nb)nb.addEventListener('click',()=>form(null));","if(nb)nb.addEventListener('click',()=>cfg.onNew?cfg.onNew(()=>repaint()):form(null));");
rep("else if(a==='edit')form(r);","else if(a==='edit')(cfg.onEdit?cfg.onEdit(r,()=>repaint()):form(r));");
rep("if(e)e.addEventListener('click',()=>{m.close();form(r)})","if(e)e.addEventListener('click',()=>{m.close();cfg.onEdit?cfg.onEdit(r,()=>repaint()):form(r)})");
/* 3) cupos: mercado monetario + derivados */
rep("const cpAvail=n=>{const c=MM_CP.find(x=>x.name===n);return c?c.cupo-cpUsed(n):0};","const cpAvail=n=>{const c=MM_CP.find(x=>x.name===n);return c?c.cupo-cpTotal(n):0};");
rep("const cpUtil=c=>c.cupo?cpUsed(c.name)/c.cupo:0;","const cpUtil=c=>c.cupo?cpTotal(c.name)/c.cupo:0;");
rep("' · utilizado '+money(cpUsed(n))+'","' · utilizado '+money(cpTotal(n))+'");
rep("{h:'Utilizado',sv:r=>cpUsed(r.name),num:r=>cpUsed(r.name),html:r=>f0(cpUsed(r.name)),txt:r=>f0(cpUsed(r.name))}","{h:'Utilizado (mercado monetario)',sv:r=>cpUsed(r.name),num:r=>cpUsed(r.name),html:r=>f0(cpUsed(r.name)),txt:r=>f0(cpUsed(r.name))},{h:'Exposición potencial de derivados',sv:r=>cpPfe(r.name),num:r=>cpPfe(r.name),html:r=>f0(cpPfe(r.name)),txt:r=>f0(cpPfe(r.name)),tip:'Exposición potencial futura de los derivados vigentes con la contraparte (estimación ilustrativa)'}");
rep("{h:'Disponible',sv:r=>r.cupo-cpUsed(r.name),num:r=>r.cupo-cpUsed(r.name),html:r=>f0(r.cupo-cpUsed(r.name)),txt:r=>f0(r.cupo-cpUsed(r.name))}","{h:'Disponible',sv:r=>r.cupo-cpTotal(r.name),num:r=>r.cupo-cpTotal(r.name),html:r=>f0(r.cupo-cpTotal(r.name)),txt:r=>f0(r.cupo-cpTotal(r.name))}");
rep("{h:'Utilización',sv:cpUtil,html:cpBar,txt:r=>pc2(cpUtil(r)*100),tip:'Operaciones vigentes dividido por el cupo autorizado. En alerta desde 90 %.'}","{h:'Utilización total',sv:cpUtil,html:cpBar,txt:r=>pc2(cpUtil(r)*100),tip:'Mercado monetario más exposición potencial de derivados, dividido por el cupo autorizado. En alerta desde 90 %.'}");
rep("['Utilizado',money(cpUsed(r.name))],['Disponible',money(r.cupo-cpUsed(r.name))],['Utilización',pc2(cpUtil(r)*100)]","['Utilizado en mercado monetario',money(cpUsed(r.name))],['Exposición potencial de derivados',money(cpPfe(r.name))],['Disponible',money(r.cupo-cpTotal(r.name))],['Utilización total',pc2(cpUtil(r)*100)]");
/* 4) naturaleza de los límites */
rep("cols:[{h:'Tipo de límite',k:'tipo',sortable:true},{h:'Evaluación',k:'eval',html:r=>badge(r.eval,r.eval==='MAX'?'danger':'info'),txt:r=>r.eval,tip:'MAX: tope que no se puede superar · MIN: piso mínimo a mantener'},","cols:[{h:'Tipo de límite',k:'tipo',sortable:true},{h:'Evaluación',k:'eval',html:r=>badge(r.eval,r.eval==='MAX'?'danger':'info'),txt:r=>r.eval,tip:'MAX: tope que no se puede superar · MIN: piso mínimo a mantener'},{h:'Naturaleza',k:'nat',html:r=>natB(natOf(r)),txt:r=>natOf(r),tip:'Normativo: si se excede, bloquea la orden. Interno: se permite continuar con aprobación registrada.'},");
rep("{h:'Sublímite',k:'sub'},{h:'Evaluación',k:'eval',html:r=>badge(r.eval,r.eval==='MAX'?'danger':'info'),txt:r=>r.eval,tip:'MAX: tope que no se puede superar · MIN: piso mínimo a mantener'},","{h:'Sublímite',k:'sub'},{h:'Evaluación',k:'eval',html:r=>badge(r.eval,r.eval==='MAX'?'danger':'info'),txt:r=>r.eval,tip:'MAX: tope que no se puede superar · MIN: piso mínimo a mantener'},{h:'Naturaleza',k:'nat',html:r=>natB(r.nat),txt:r=>r.nat,tip:'Normativo: bloquea la orden. Interno: permite continuar con aprobación registrada.'},");
rep("get:r=>r.activo?'Activo':'Inactivo'}],\n kpis:rows=>[['Límites',rows.length,'p']","get:r=>r.activo?'Activo':'Inactivo'},{id:'n',label:'Naturaleza',opts:()=>['Normativo','Interno'],get:natOf}],\n kpis:rows=>[['Límites',rows.length,'p']");
rep("{id:'s',label:'Estado',opts:()=>['Cumple','Alerta','Incumple'],get:r=>r.estado}]","{id:'s',label:'Estado',opts:()=>['Cumple','Alerta','Incumple'],get:r=>r.estado},{id:'n',label:'Naturaleza',opts:()=>['Normativo','Interno'],get:r=>r.nat}]");
rep("+inpF('pct','Porcentaje',row?(row.pct*100).toString():''","+selF('nat','Naturaleza',['Normativo','Interno'],row?natOf(row):'Normativo',{req:true,tip:'Normativo: si se excede, bloquea la orden. Interno: se permite continuar con aprobación registrada.'})+inpF('pct','Porcentaje',row?(row.pct*100).toString():''");
rep("pct:p/100,denom:g('den')","pct:p/100,nat:g('nat')||'Normativo',denom:g('den')");
rep("['Porcentaje',pc2(d.pct*100)],['Denominador',d.denom],","['Naturaleza',d.nat||'Normativo'],['Porcentaje',pc2(d.pct*100)],['Denominador',d.denom],");
rep("['Evaluación',r.eval==='MAX'?'MAX (tope)':'MIN (piso)'],['Porcentaje',pc2(r.pct*100)],['Denominador',r.denom]","['Evaluación',r.eval==='MAX'?'MAX (tope)':'MIN (piso)'],['Naturaleza',natOf(r)],['Porcentaje',pc2(r.pct*100)],['Denominador',r.denom]");
rep("return {port:l.port,tipo:l.tipo,sub:l.sub,eval:l.eval,pct:l.pct,actual,uso,estado}})}","return {port:l.port,tipo:l.tipo,sub:l.sub,eval:l.eval,pct:l.pct,actual,uso,estado,nat:natOf(l)}}).concat(extraEval(fac))}\n"+R('ins_f1d.js'));
rep("rows:evalRows,opDate:true","rows:evalEmit,opDate:true");
rep("['Límite',pc2(r.pct*100)],['Posición actual'","['Naturaleza',r.nat],['Límite',pc2(r.pct*100)],['Posición actual'");
/* 5) sensibilidad: delta y vega de opciones */
rep("SENS.map(r=>Object.assign({},r,{val:r.val*f}))","SENS.map(r=>Object.assign({},r,{val:r.val*f,delta:optAgg(r.port,'delta'),vega:optAgg(r.port,'vega')}))");
rep("{h:'DV01',k:'dv01',fmt:f3,tip:'Cambio en valor por +1 punto básico de tasa'}],","{h:'DV01',k:'dv01',fmt:f3,tip:'Cambio en valor por +1 punto básico de tasa'},{h:'Delta (opciones)',k:'delta',fmt:v=>v==null?'—':f0(v),tip:'Nocional equivalente: delta de cada opción por su nocional'},{h:'Vega (opciones)',k:'vega',fmt:v=>v==null?'—':f0(v),tip:'Cambio en valor por +1 punto de volatilidad implícita'}],");
rep("['DV01',f3(r.dv01)]]","['DV01',f3(r.dv01)],['Delta (opciones)',r.delta==null?'—':f0(r.delta)],['Vega (opciones)',r.vega==null?'—':f0(r.vega)]]");
/* 6) portafolios: solo cobertura */
rep("activo:i!==12}));","activo:i!==12,soloCob:p.name==='FIC BALANCEADO 1'}));");
rep("{h:'Benchmark',html:r=>esc(benchOf(r.name)),txt:r=>benchOf(r.name)}]","{h:'Benchmark',html:r=>esc(benchOf(r.name)),txt:r=>benchOf(r.name)},{h:'Derivados',html:r=>badge(r.soloCob?'Solo cobertura':'Cobertura y posición propia',r.soloCob?'warning':'neutral'),txt:r=>r.soloCob?'Solo cobertura':'Cobertura y posición propia',tip:'Un portafolio de solo cobertura no puede abrir posición propia con derivados.'}]");
rep("dateF('inicio','Fecha de inicio',row&&row.inicio,{req:true})+'</div>',","dateF('inicio','Fecha de inicio',row&&row.inicio,{req:true})+radiosF('cob','Derivados',['Cobertura y posición propia','Solo cobertura'],row&&row.soloCob?'Solo cobertura':'Cobertura y posición propia',{tip:'Solo cobertura: la evaluación de límites bloquea cualquier posición propia con derivados.'})+'</div>',");
rep("data:{name:g('name'),tipo:g('tipo'),moneda:g('moneda'),inicio:d,activo:row?row.activo:true}","data:{name:g('name'),tipo:g('tipo'),moneda:g('moneda'),inicio:d,soloCob:rv(f,'cob')==='Solo cobertura',activo:row?row.activo:true}");
rep("['Fecha de inicio',fmtD(d.inicio)]],","['Fecha de inicio',fmtD(d.inicio)],['Derivados',d.soloCob?'Solo cobertura':'Cobertura y posición propia']],");
rep("['Fecha de inicio',fmtD(r.inicio)],['Benchmark',esc(benchOf(r.name))]]","['Fecha de inicio',fmtD(r.inicio)],['Benchmark',esc(benchOf(r.name))],['Derivados',r.soloCob?'Solo cobertura':'Cobertura y posición propia']]");
/* 7) flujo de órdenes */
rep("rows:()=>rows,noPage:true,noFilters:true,noTools:true,noFoot:true});\n};","rows:()=>rows,noPage:true,noFilters:true,noTools:true,noFoot:true});\n flowExtras(pg);\n};");
/* 8) campana: eventos publicados */
rep("<button class=\"mk-btn\" id=\"ntfGo\">Consultar</button></div>","<button class=\"mk-btn\" id=\"ntfGo\">Consultar</button><button class=\"mk-btn mk-btn--secondary\" id=\"evBtn\">Eventos publicados</button></div>");
rep("$('#ntfGo').addEventListener('click',ntfRender);ntfRender();","$('#ntfGo').addEventListener('click',ntfRender);$('#evBtn').addEventListener('click',()=>{ntfToggle(false);openEvents()});ntfRender();");
rep("function publishEvent(tipo,ref,det,dest){EVENTS.unshift({tipo,ref,det,dest,ts:Date.now()});}","function publishEvent(tipo,ref,det,dest){EVENTS.unshift({tipo,ref,det,dest,ts:Date.now()});if(tipo==='Orden ejecutada'||tipo==='Decisión aprobada'){NOTIFS.unshift(['ok',tipo+' · '+ref,det,'Órdenes','Exitoso','ev-'+ref,1]);if(document.getElementById('ntfList'))ntfRender()}}");
/* 9) precarga y chips en formularios y pantallas */
rep("inpF('value','Valor giro',row?'$'+row.valor.toFixed(2):'$0.00')+'</div>',","inpF('value','Valor giro',row?'$'+row.valor.toFixed(2):'$0.00')+'</div>'+preBlock(),");
rep("bind:f=>{bindAC(f,'instr',INSTR_NAMES.concat(INSTRUMENTS.slice(0,8).map(i=>i.mnem)));","bind:f=>{bindAC(f,'instr',INSTR_NAMES.concat(INSTRUMENTS.slice(0,8).map(i=>i.mnem)));bindPre(f,'instr');");
rep("+'<div id=\"plw\">'+(row&&row.orden==='LIMITE'?inpF('limit','Precio límite',row.pl.toFixed(2),{req:true}):'')+'</div></div>',","+'<div id=\"plw\">'+(row&&row.orden==='LIMITE'?inpF('limit','Precio límite',row.pl.toFixed(2),{req:true}):'')+'</div></div>'+preBlock(),");
rep("bind:f=>{bindAC(f,'instr',VI_LIST());","bind:f=>{bindAC(f,'instr',VI_LIST());bindPre(f,'instr');");
rep("<div class=\"mk-help mk-mt\" id=\"cpinfo\">Selecciona una contraparte para ver su cupo disponible.</div>',","<div class=\"mk-help mk-mt\" id=\"cpinfo\">Selecciona una contraparte para ver su cupo disponible.</div><div class=\"mk-mt\">'+srcChip('newinv')+'</div>',");
rep("r.innerHTML='<div class=\"mk-grid cols-3 mk-mb\" id=\"gc\"></div><div id=\"gt\"></div>';","r.innerHTML='<div class=\"mk-mb\">'+srcChip('newinv')+'</div><div class=\"mk-grid cols-3 mk-mb\" id=\"gc\"></div><div id=\"gt\"></div>';");
rep("DataTable($('#res',pg),{cols:[{h:'Mes',k:'mes'},{h:'Año',k:'anio'}","const hostF=$('#res',pg);hostF.innerHTML='<div class=\"mk-mb\">'+srcChip('newinv')+'</div><div id=\"fl\"></div><div id=\"fx\"></div>';DataTable($('#fl',pg),{cols:[{h:'Mes',k:'mes'},{h:'Año',k:'anio'}");
rep("fileName:'flujos-futuros',noun:'meses'})}","fileName:'flujos-futuros',noun:'meses'});flowsExtra($('#fx',pg),st.port,f)}");
/* 10) atribución: cobertura */
rep("+kpiBox('Interacción',valC(sum('inter'),bps(sum('inter'))),'','Efecto conjunto de asignación y selección')+'</div><div id=\"tabs\"></div>';","+kpiBox('Interacción',valC(sum('inter'),bps(sum('inter'))),'','Efecto conjunto de asignación y selección')+(b.hedge?kpiBox('Efecto cobertura',valC(b.hedge.net,bps(b.hedge.net)),'','Costo o ganancia de la cobertura (puntos forward) ponderado por la exposición cubierta'):'')+'</div><div id=\"tabs\"></div>';");
rep("hbarSVG(b.rows,['alloc','sel','inter'],['#6A1B9A','#15803D','#D97706'],['Asignación','Selección','Interacción'])+'</div>';","hbarSVG(b.rows,['alloc','sel','inter'],['#6A1B9A','#15803D','#D97706'],['Asignación','Selección','Interacción'])+'</div>'+(b.hedge?hedgeCard(b.hedge):'');");
rep("rows:()=>b.rows,noPage:true,noFilters:true,fileName:'atribucion-brinson'","rows:()=>b.hedge?b.rows.concat([{cat:'Efecto de la cobertura',wp:0,wb:0,rp:0,rb:0,alloc:0,sel:0,inter:0,tot:b.hedge.net}]):b.rows,noPage:true,noFilters:true,fileName:'atribucion-brinson'");
rep("ef(sum('inter')),ef(sum('tot'))]})}});","ef(sum('inter')),ef(sum('tot')+(b.hedge?b.hedge.net:0))]})}});");
rep("· Interacción = (Wp − Wb)·(Rp,i − Rb,i).","· Interacción = (Wp − Wb)·(Rp,i − Rb,i) · Efecto de cobertura = peso cubierto × costo o ganancia por puntos forward.");
rep("kpiBox('Máx. drawdown','<span class=\"neg\">'+pct(s.dd,2)+'</span>','r','Mayor caída acumulada desde un máximo')+'</div>'+","kpiBox('Máx. drawdown','<span class=\"neg\">'+pct(s.dd,2)+'</span>','r','Mayor caída acumulada desde un máximo')+(hedgeEffect(st.port,st.per)?kpiBox('Retorno sin cubrir',pcs(s.rp),'','Retorno del portafolio sin el efecto de los derivados de cobertura')+kpiBox('Retorno cubierto','<span class=\"'+sgnCls(s.rp+hedgeEffect(st.port,st.per).net)+'\">'+pcs(s.rp+hedgeEffect(st.port,st.per).net)+'</span>','b','Retorno del portafolio incluido el efecto de la cobertura'):'')+'</div>'+");
rep("funds.forEach(p=>brinson(p,per,'Macroactivo').rows.forEach(x=>rows.push([p,x.cat,P(x.wp),P(x.wb),pb(x.alloc),pb(x.sel),pb(x.inter),pb(x.tot)])))","funds.forEach(p=>{const b=brinson(p,per,'Macroactivo');b.rows.forEach(x=>rows.push([p,x.cat,P(x.wp),P(x.wb),pb(x.alloc),pb(x.sel),pb(x.inter),pb(x.tot)]));if(b.hedge)rows.push([p,'Efecto de la cobertura',P(0),P(0),N(0),N(0),N(0),pb(b.hedge.net)])})");
/* 11) libro de órdenes: derivados */
rep("estatus:o.estatus}))).sort((a,b)=>b.fecha-a.fecha);\nconst MERC=['Renta fija','Renta variable','Mercado monetario'];","estatus:o.estatus}))).concat(DERIV_ORDERS.map(o=>({mercado:'Derivados',num:o.id,fecha:o.fecha,port:o.port,tipo:o.prop,instr:o.inst+' · '+o.sub,cp:o.cp||'—',cant:o.noc,tasa:null,plazo:o.plazo,valor:o.noc,estatus:DERIV_ESTATUS[o.estado]}))).sort((a,b)=>b.fecha-a.fecha);\nconst MERC=['Renta fija','Renta variable','Mercado monetario','Derivados'];");
rep("r.tipo==='COMPRA'||r.tipo==='VENTA'?side(r.tipo):sentB(r.tipo)","r.tipo==='COMPRA'||r.tipo==='VENTA'?side(r.tipo):(r.tipo==='INVERSIÓN'||r.tipo==='CAPTACIÓN')?sentB(r.tipo):badge(r.tipo,'neutral')");
rep("r.mercado===MERC[1]?'warning':'info')","r.mercado===MERC[1]?'warning':r.mercado===MERC[3]?'neutral':'info')");
rep("['Mercado monetario',rs.filter(r=>r.mercado===MERC[2]).length,'g'],['Finalizadas'","['Mercado monetario',rs.filter(r=>r.mercado===MERC[2]).length,'g'],['Derivados',rs.filter(r=>r.mercado===MERC[3]).length,'b'],['Finalizadas'");
rep("'Renta fija, renta variable y mercado monetario en un solo informe, con su estado.'","'Renta fija, renta variable, mercado monetario y derivados en un solo informe, con su estado.'");
/* 12) navegación */
rep("label:'Ordenes'","label:'Órdenes'");
rep("desc:'Captura y gestión de órdenes de renta fija, renta variable y mercado monetario, y su libro de órdenes.'","desc:'Captura y gestión de órdenes de renta fija, renta variable, mercado monetario y derivados, y su libro de órdenes.'");
rep("['#/orders/reports','Reportes','doc','oreports'","['#/orders/derivatives','Derivados','layers','deriv','Cotiza, compara con el valor indicativo y registra con evidencia de mejor ejecución.'],['#/orders/reports','Reportes','doc','oreports'");
rep("['#/dashboard/money-market','Mercado monetario','coins','mmpos','Posición, vencimientos y devengo de las operaciones monetarias.']]}","['#/dashboard/money-market','Mercado monetario','coins','mmpos','Posición, vencimientos y devengo de las operaciones monetarias.'],['#/dashboard/exposure','Exposición y cobertura','network','exposure','Exposición bruta, cobertura con derivados y descubierto.']]}");
rep("desc:'Consulta de portafolios, flujos y sensibilidades.'","desc:'Consulta de portafolios, flujos, sensibilidades, mercado monetario y exposición y cobertura.'");
rep("Consulta de portafolios, operación de órdenes de inversión (renta fija, renta variable y mercado monetario)","Consulta de portafolios, operación de órdenes de inversión (renta fija, renta variable, mercado monetario y derivados)");
/* 13) datos por país */
rep("INSTR_NAMES,ISSUERS,MM_ORDERS,MM_POS,MM_CP,MM_RATES};","INSTR_NAMES,ISSUERS,MM_ORDERS,MM_POS,MM_CP,MM_RATES,DERIV_ORDERS,DERIV_EVID,DERIV_POS,DERIV_EXPO,EVENTS,PARAMS,SRC_AGE};");
rep("m:[['BANCO POPULAR S.A.','BANCO SECURITY']","m:[['USD/COP','USD/CLP'],['BANCO POPULAR S.A.','BANCO SECURITY']");
rep("m:[['BANCO POPULAR S.A.','BANCO LÓPEZ DE HARO']","m:[['USD/COP','USD/DOP'],['BANCO POPULAR S.A.','BANCO LÓPEZ DE HARO']");
rep("m:[[\"BANCO POPULAR S.A.\",\"BAC PANAMÁ\"]","m:[[\"USD/COP\",\"EUR/USD\"],[\"BANCO POPULAR S.A.\",\"BAC PANAMÁ\"]");
rep("NIT:'RUT empresa','Cédula de Extranjería':'RUT extranjero'}\n },","NIT:'RUT empresa','Cédula de Extranjería':'RUT extranjero'},\n  fix:derivFix\n },");
rep("fix:()=>{const ok=TIPOS_P['República Dominicana'];","fix:()=>{derivFix();const ok=TIPOS_P['República Dominicana'];");
rep("fix:()=>{const ok=TIPOS_P['Panamá'];","fix:()=>{derivFix();const ok=TIPOS_P['Panamá'];");
/* 14) utilidades de prueba */
rep("window.__mk={contributions,","window.__mk={derivIndicative,limitCheck,exposureCalc,hedgeEffect,preload,srcChip,evidenceView,derivWizard,cpTotal,cpPfe,PARAMS,SRC_AGE,EVENTS,openEvents,contributions,");
fs.writeFileSync('mk.js',s);
/* data.part.js: la cobertura entra en el retorno del portafolio */
let d=fs.readFileSync('data.part.js','utf8');
if(!d.includes('hedgeEffect')){const a="return {rows,RP,RB,exc:RP-RB};";if(!d.includes(a))throw new Error('brinson');d=d.replace(a,()=>"const hg=(typeof hedgeEffect==='function')?hedgeEffect(port,periodKey):null,RPc=RP+(hg?hg.net:0);\n return {rows,RP:RPc,RB,exc:RPc-RB,hedge:hg};");fs.writeFileSync('data.part.js',d)}
/* CSS */
let css=fs.readFileSync('extras.css','utf8');
if(!css.includes('/* ===== Fuente de datos precargados ===== */'))css+=`
/* ===== Fuente de datos precargados ===== */
.mk-srcchip{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;border:1px dashed var(--mk-primary-100);border-radius:999px;padding:3px 12px;font-size:11.5px;color:var(--mk-text-muted);background:var(--mk-surface)}
.mk-srcchip b{color:var(--mk-primary);font-weight:600}
.mk-srcchip.is-stale{border-style:solid;border-color:var(--mk-warning,#B45309)}
.mk-srcchip__r{border:0;background:none;color:var(--mk-primary);font:inherit;font-weight:600;cursor:pointer;text-decoration:underline;padding:0}
@media print{body>*:not(.mk-modal-overlay){display:none!important}.mk-modal-overlay{position:static!important;background:none!important}.mk-modal{box-shadow:none!important;max-height:none!important}.mk-modal [data-c],.mk-modal__foot{display:none!important}}
`;
fs.writeFileSync('extras.css',css);
console.log('ok',s.length);
