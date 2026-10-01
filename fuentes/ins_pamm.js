/* --- Atribución de mercado monetario (devengo, plazo, contraparte, liquidez) --- */
function mmAttr(port,per){
 const r=rng(hash(port+'mm'+per)),k=PERIODS[per].k;
 const comps=[['Devengo (carry)',0.0019+r()*0.0006],['Efecto plazo (WAM)',(r()-0.4)*0.0008],['Efecto spread de contraparte',(r()-0.3)*0.0009],['Efecto liquidez (overnight)',-(r()*0.0004)],['Costos y comisiones',-(0.0003+r()*0.0002)],['Residual',(r()-0.5)*0.0001]].map(c=>({n:c[0],v:c[1]*k}));
 const exc=comps.reduce((a,c)=>a+c.v,0),pos=MM_POS.filter(p=>p.port===port),tot=pos.reduce((a,p)=>a+p.nominal,0);
 const wam=tot?pos.reduce((a,p)=>a+p.nominal*p.rest,0)/tot:28+r()*30,liq=tot?pos.filter(p=>p.rest<=1).reduce((a,p)=>a+p.nominal,0)/tot:0.06+r()*0.05;
 const byCp={};pos.forEach(p=>{byCp[p.cp]=(byCp[p.cp]||0)+p.nominal});const conc=tot?Math.max.apply(null,Object.keys(byCp).map(x=>byCp[x]))/tot:0.2+r()*0.1;
 return {comps,exc,rb:0.0058*k,rp:0.0058*k+exc,wam:[wam,32+r()*10],tasa:[0.1045+r()*0.004,0.1030+r()*0.003],liq:[liq,0.1],conc:[conc,0.25]};
}
PAGES.pamm=paPage('Atribución mercado monetario','Explica el exceso de retorno de las operaciones monetarias: devengo, plazo, contraparte y liquidez.',(r,st)=>{
 const a=mmAttr(st.port,st.per),ef=v=>valC(v,bps(v)),d=(x,y,f)=>(x-y>=0?'+':'')+f(x-y);
 r.innerHTML='<div class="mk-kpis">'+kpiBox('Retorno monetario',pcs(a.rp),'p')+kpiBox('Retorno benchmark',pcs(a.rb),'b')+kpiBox('Exceso de retorno',ef(a.exc),'g')+kpiBox('Plazo promedio (días)',f1(a.wam[0])+' vs '+f1(a.wam[1]),'','Portafolio frente a su benchmark')+'</div><div class="mk-cols2" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)"><div class="mk-card"><h3 style="margin:0 0 6px;font-size:14px">Descomposición del exceso de retorno</h3>'+waterfallSVG(a.comps,a.exc,'Exceso total')+'</div><div><div class="mk-card mk-mb"><h3 style="margin:0 0 8px;font-size:14px">Efectos por factor</h3><div id="f"></div></div><div class="mk-card"><h3 style="margin:0 0 8px;font-size:14px">Posicionamiento vs. benchmark</h3><div id="p"></div></div></div></div>';
 DataTable($('#f',r),{cols:[{h:'Factor',k:'n'},{h:'Efecto',k:'v',html:x=>ef(x.v),txt:x=>bps(x.v)}],rows:()=>a.comps,noPage:true,noFilters:true,noTools:true,noFoot:true,totals:()=>['Exceso total',ef(a.exc)]});
 DataTable($('#p',r),{cols:[{h:'Métrica',k:'m'},{h:'Portafolio',k:'p'},{h:'Benchmark',k:'b'},{h:'Diferencia',k:'d'}],rows:()=>[{m:'Plazo promedio ponderado (días)',p:f1(a.wam[0]),b:f1(a.wam[1]),d:d(a.wam[0],a.wam[1],f1)},{m:'Tasa promedio E.A.',p:pct(a.tasa[0],2),b:pct(a.tasa[1],2),d:d(a.tasa[0],a.tasa[1],v=>pct(v,2))},{m:'Liquidez a 1 día',p:pct(a.liq[0],1),b:pct(a.liq[1],1),d:d(a.liq[0],a.liq[1],v=>pct(v,1))},{m:'Mayor concentración por contraparte',p:pct(a.conc[0],1),b:pct(a.conc[1],1),d:d(a.conc[0],a.conc[1],v=>pct(v,1))}],noPage:true,noFilters:true,noTools:true,noFoot:true});
},{port:FUNDS[0]});

/* --- Datos de los reportes de desempeño descargables --- */
function reportData(name,st){
 const funds=st.port==='Todos'?FUNDS:[st.port],per=perKey(st.d1,st.d2),end=new Date(st.d2+'T12:00:00'),P=v=>({n:v,s:4}),N=v=>({n:v,s:2}),pb=v=>N(v*10000);
 let heads,rows=[];
 if(/Brinson/.test(name)){heads=['Portafolio','Categoría','Peso portafolio','Peso benchmark','Asignación (pb)','Selección (pb)','Interacción (pb)','Total (pb)'];funds.forEach(p=>brinson(p,per,'Macroactivo').rows.forEach(x=>rows.push([p,x.cat,P(x.wp),P(x.wb),pb(x.alloc),pb(x.sel),pb(x.inter),pb(x.tot)])))}
 else if(/comité/.test(name)){heads=['Portafolio','Rentabilidad','Benchmark','Exceso (pb)','Volatilidad','Tracking error','Information ratio','Sharpe','Máx. drawdown'];funds.forEach(p=>{const s=perfStats(p,per,end);rows.push([p,P(s.rp),P(s.rb),pb(s.ex),P(s.vol),P(s.te),N(s.ir),N(s.sharpe),P(s.dd)])})}
 else if(/participaci/.test(name)){heads=['Portafolio','Tipo de participación','Comisión E.A.','Rentabilidad neta del período','Valor de la unidad'];const T=[['Tipo A (institucional)',0.012],['Tipo B (persona natural)',0.0185],['Tipo C (corporativo)',0.015]];funds.forEach(p=>{const s=perfStats(p,per,end);T.forEach(t=>{const net=s.rp-t[1]*PERIODS[per].k;rows.push([p,t[0],P(t[1]),P(net),N(10000*(1+net))])})})}
 else if(/renta fija/.test(name)){const a0=fiAttr(funds[0],per);heads=['Portafolio'].concat(a0.comps.map(c=>c.n+' (pb)'),['Exceso total (pb)']);funds.forEach(p=>{const a=fiAttr(p,per);rows.push([p].concat(a.comps.map(c=>pb(c.v)),[pb(a.exc)]))})}
 else if(/clientes/.test(name)){heads=['Mandato','Valor del portafolio','Rentabilidad','Benchmark','Exceso (pb)'];(st.port==='Todos'?FUNDS.filter(x=>/DELEGADO/.test(x)):[st.port]).forEach(p=>{const s=perfStats(p,per,end),sv0=SENS.find(x=>x.port===p);rows.push([p,N(sv0?sv0.val:1e10+hash(p)%1e9),P(s.rp),P(s.rb),pb(s.ex)])})}
 else{heads=['Portafolio','Rentabilidad','Benchmark','Exceso (pb)'];funds.forEach(p=>{const s=perfStats(p,per,end);rows.push([p,P(s.rp),P(s.rb),pb(s.ex)])})}
 return {heads,rows};
}
