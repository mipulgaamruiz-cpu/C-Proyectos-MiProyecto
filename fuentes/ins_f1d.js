function extraEval(fac){const out=[];
 MM_CP.filter(c=>c.activo&&cpTotal(c.name)>0).forEach(c=>{const uso=cpUtil(c)*fac;out.push({port:'Consolidado',tipo:'CONTRAPARTE POTENCIAL',sub:c.name,eval:'MAX',pct:1,actual:uso,uso,estado:uso>=1?'Incumple':uso>=0.9?'Alerta':'Cumple',nat:'Interno'})});
 PORTS.filter(p=>p.soloCob&&p.activo).forEach(p=>{const propia=DERIV_POS.filter(x=>x.port===p.name&&x.prop==='Posición propia').reduce((a,x)=>a+x.noc,0),tot=DERIV_POS.filter(x=>x.port===p.name).reduce((a,x)=>a+x.noc,0),uso=tot?propia/tot:0;out.push({port:p.name,tipo:'PROPÓSITO',sub:'Solo cobertura',eval:'MAX',pct:0,actual:uso,uso,estado:uso>0?'Incumple':'Cumple',nat:'Normativo'})});
 PORTS.filter(p=>vehKind(p.name)==='fvp'&&p.activo).forEach(p=>{const pf=FVP_PERFILES.find(x=>new RegExp(x.toUpperCase()).test(p.name));if(!pf)return;const reg=regVigente().p[pf],h=holdingsFor(p.name),tot=h.reduce((a,x)=>a+x.val,0),rv=h.filter(x=>x.ca==='Renta variable').reduce((a,x)=>a+x.val,0)/tot,rf=h.filter(x=>x.ca==='Renta fija').reduce((a,x)=>a+x.val,0)/tot;
  const ur=rv/(reg.rvMax/100)*fac,uf=rf/(reg.rfMin/100)*fac;
  out.push({port:p.name,tipo:'RÉGIMEN DE INVERSIÓN',sub:'Tope en renta variable',eval:'MAX',pct:reg.rvMax/100,actual:rv*fac,uso:ur,estado:ur>=1?'Incumple':ur>=0.9?'Alerta':'Cumple',nat:'Normativo'});
  out.push({port:p.name,tipo:'RÉGIMEN DE INVERSIÓN',sub:'Mínimo en renta fija',eval:'MIN',pct:reg.rfMin/100,actual:rf*fac,uso:uf,estado:uf<1?'Incumple':'Cumple',nat:'Normativo'})});
 return out}
function evalEmit(st){const rows=evalRows(st),op=(st&&st.op)||OPDATE;
 rows.filter(x=>x.estado==='Incumple').forEach(x=>{const k=x.port+'|'+x.tipo+'|'+x.sub+'|'+op;if(!EVSEEN.has(k)){EVSEEN.add(k);publishEvent('Límite excedido','LIM-'+String(1000+hash(k)%9000),x.tipo+' '+x.sub+' · '+x.port+' ('+x.nat+')','cumplimiento')}});
 return rows}
const optAgg=(port,k)=>{const o=DERIV_POS.filter(p=>p.port===port&&p.inst==='Opción');if(!o.length)return null;return o.reduce((a,p)=>a+(k==='delta'?p.delta*p.noc:p.vega),0)};
/* SUPUESTO: en el Libro de órdenes los estados de derivados se muestran con la escala común de órdenes (En cotización y Por justificar = Complementación). */
const DERIV_ESTATUS={'En cotización':'C','Por justificar':'C','Registrada':'R','Confirmada':'F','Anulada':'A'};
