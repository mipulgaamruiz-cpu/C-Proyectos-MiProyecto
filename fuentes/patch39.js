const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b,all)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,100));s=all?s.split(a).join(b):s.replace(a,()=>b)};
const R=f=>fs.readFileSync(f,'utf8');
/* 1) bloques de las fases 2 y 3 (primero límites y ayudas; luego activos y decisiones) */
rep("/* --- Carga de archivos --- */",R('ins_f2b.js')+"\n"+R('ins_f2a.js')+"\n/* --- Carga de archivos --- */");
/* 2) crudPage: detalle ampliable y edición propia */
rep("const detail=r=>{","const editRow=r=>{if((cfg.onEdit?cfg.onEdit(r,()=>repaint()):'default')==='default')form(r)};\n  const detail=r=>{");
rep("+'</div>',foot:(cfg.acts(r)","+'</div>'+(cfg.detailExtra?cfg.detailExtra(r):''),foot:(cfg.acts(r)");
rep("$('[data-c]',m.el).addEventListener('click',m.close);const e=$('[data-e]',m.el);","$('[data-c]',m.el).addEventListener('click',m.close);cfg.detailBind&&cfg.detailBind(m.el,r,()=>repaint());const e=$('[data-e]',m.el);");
rep("m.close();cfg.onEdit?cfg.onEdit(r,()=>repaint()):form(r)","m.close();editRow(r)");
rep("else if(a==='edit')(cfg.onEdit?cfg.onEdit(r,()=>repaint()):form(r));","else if(a==='edit')editRow(r);");
/* 3) instrumentos: clase de activo */
rep("filters:[{id:'t',label:'Tipo',opts:()=>TIPOS(),get:r=>r.tipo},{id:'m',label:'Moneda'","filters:[{id:'c',label:'Clase de activo',opts:()=>ASSET_CLASSES,get:claseOf},{id:'t',label:'Tipo',opts:()=>TIPOS(),get:r=>r.tipo},{id:'m',label:'Moneda'");
rep("cols:[{h:'Nemotécnico',k:'mnem',sortable:true},{h:'Tipo',k:'tipo'},","cols:[{h:'Nemotécnico',k:'mnem',sortable:true},{h:'Clase de activo',k:'clase',fmt:v=>v||'Renta fija'},{h:'Tipo',k:'tipo'},");
rep("{h:'Fecha emisión',k:'emi',fmt:fmtD},{h:'Fecha vencimiento',k:'ven',fmt:fmtD}","{h:'Fecha emisión',k:'emi',fmt:v=>v?fmtD(v):'—'},{h:'Fecha vencimiento',k:'ven',fmt:v=>v?fmtD(v):'—'}");
rep("detail:r=>[['Nemotécnico',esc(r.mnem)]","detail:r=>(r.clase&&r.clase!=='Renta fija')?assetDetail(r):[['Nemotécnico',esc(r.mnem)]");
rep(" extra:(pg,rp)=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class=\"mk-accordion__head\"><span class=\"mk-accordion__ico\">'+ic('upload')+'</span><span><span class=\"mk-accordion__t\">Carga masiva de instrumentos"," detailExtra:assetExtra,detailBind:assetBind,onEdit:(r,rp)=>(r.clase&&r.clase!=='Renta fija')?assetForm(r,rp):'default',\n extra:(pg,rp)=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class=\"mk-accordion__head\"><span class=\"mk-accordion__ico\">'+ic('upload')+'</span><span><span class=\"mk-accordion__t\">Carga masiva de instrumentos");
rep("bindAcc(x);bindMass(x,MASS.instr,rp)}","bindAcc(x);bindMass(x,MASS.instr,rp);const hb=document.createElement('button');hb.className='mk-btn mk-btn--outline';hb.type='button';hb.innerHTML=ic('plus')+'Nuevo activo no listado';hb.setAttribute('data-tip','Inmueble, proyecto, TCC o cartera');hb.addEventListener('click',()=>assetForm(null,rp));const hd=document.querySelector('#view .mk-headerpage > div:last-child');if(hd)hd.prepend(hb)}");
/* 4) portafolios: tipos de vehículo nuevos */
rep("tipo:(i>=9?'Cliente':(i>=2&&i<=4)?'Mandato delegado':'FIC')","tipo:(i>=14?['Fondo inmobiliario','Fondo alternativo','FVP','FVP','FVP'][i-14]:i>=9?'Cliente':(i>=2&&i<=4)?'Mandato delegado':'FIC')");
rep("LOCL(['FIC','Mandato delegado','Cliente'])","LOCL(['FIC','Mandato delegado','Cliente','Fondo inmobiliario','Fondo alternativo','FVP'])",true);
rep("{id:'p',label:'Portafolio',opts:()=>PNAMES.slice(0,9),get:r=>r.port}","{id:'p',label:'Portafolio',opts:()=>FUNDS.slice(),get:r=>r.port}",true);
/* 5) límites: régimen de inversión del FVP */
rep("onSave:(o,row)=>{if(row)Object.assign(row,o);else LIMITS.unshift(o)}\n})}","onSave:(o,row)=>{if(row)Object.assign(row,o);else LIMITS.unshift(o)},\n extra:regimenExtra\n})}");
/* 6) catálogos nuevos */
rep(".map(a=>({o:a[0],d:a[1],p:a[2]}))]\n ];",".map(a=>({o:a[0],d:a[1],p:a[2]}))],\n  ['Avaluadores',[{h:'Avaluador',k:'a'},{h:'Especialidad',k:'e'}],AVALUADORES.map((a,i)=>({a,e:['Oficinas y comercial','Logística e industrial','Vivienda y proyectos'][i%3]}))],\n  ['Propósito de la operación',[{h:'Propósito',k:'p'},{h:'Descripción',k:'d'}],[['Cobertura','Operación que reduce una exposición existente; no puede superar la exposición bruta.'],['Posición propia','Operación con fines de inversión; no está permitida en portafolios de solo cobertura.']].map(a=>({p:a[0],d:a[1]}))]\n ];");
/* 7) Visor de portafolio: clase de activo, valoración y seguimiento */
rep("const st={port:FUNDS[1],sel:['calif','emisor','moneda'],done:true,op:OPDATE};","const st={port:FUNDS[1],sel:['calif','emisor','moneda'],done:true,op:OPDATE,tab:0,clase:''};");
rep("+multiSel('g','Gráficos',GRAPHS,st.sel,3))","+fld('Clase de activo','<div class=\"mk-combobox\"><select class=\"mk-select\" name=\"clase\"><option value=\"\">Todas</option>'+claseOpts(st.port,st.clase)+'</select></div>',{name:'clase',tip:'Filtra las posiciones por clase de activo.'})+multiSel('g','Gráficos',GRAPHS,st.sel,3))");
rep("const sel=$('[name=port]',pg);sel.addEventListener('change',()=>{st.port=sel.value;clearErr(sel)});bindOp(pg,st,()=>{if(st.done)result()});","const sel=$('[name=port]',pg);sel.addEventListener('change',()=>{st.port=sel.value;st.clase='';clearErr(sel);draw()});bindOp(pg,st,()=>{if(st.done)result()});$('[name=clase]',pg).addEventListener('change',e=>{st.clase=e.target.value;if(st.done)result()});");
rep("st.port='';st.sel=[];st.done=false;st.op=OPDATE;draw()","st.port='';st.sel=[];st.clase='';st.done=false;st.op=OPDATE;draw()");
rep("function result(){\n  const fac=dfac(st.op),data=holdingsFor(st.port).map(h=>Object.assign({},h,{val:h.val*fac})),r=$('#res',pg);","function result(){const R0=$('#res',pg);if(vehKind(st.port)==='alt'){R0.innerHTML='<div id=\"vt\"></div>';tabsUI($('#vt',R0),['Posiciones','Seguimiento'],st,(i,p)=>{p.innerHTML='<div id=\"res2\"></div>';if(i===0)resultIn($('#res2',p));else altTrack($('#res2',p),st.port,st.op)});return}resultIn(R0)}\n function resultIn(r){\n  const fac=dfac(st.op),data=holdingsFor(st.port).filter(h=>!st.clase||h.ca===st.clase).map(h=>Object.assign({},h,{val:h.val*fac}));");
rep("r.innerHTML='<div class=\"mk-mb\">'+srcChip('newinv')+'</div><div class=\"mk-grid cols-3 mk-mb\" id=\"gc\">","r.innerHTML='<div class=\"mk-mb\">'+(data.some(h=>h.fuente)?srcChip('adminactivos'):srcChip('newinv'))+'</div><div class=\"mk-grid cols-3 mk-mb\" id=\"gc\">");
rep("{h:'Valoración moneda local',k:'val',fmt:f2,sortable:true}],rows:()=>data","{h:'Valoración moneda local',k:'val',fmt:f2,sortable:true}].concat(data.some(h=>h.fuente)?[{h:'Fuente de la valoración',k:'fuente',fmt:v=>v||'—'},{h:'Fecha de valoración',k:'fechaVal',fmt:v=>v?fmtD(v):'—'},{h:'Estado de la valoración',k:'vencida',html:h=>h.fuente?valBadge(h):'—',txt:h=>h.fuente?(h.vencida?'Valoración vencida':'Vigente'):'—'}]:[]),rows:()=>data");
/* 8) atribución por tipo de vehículo */
rep("(r,st)=>{\n const s=perfStats(st.port,st.per,endOf(st.mes))","(r,st)=>{\n if(vehSummary(r,st))return;const s=perfStats(st.port,st.per,endOf(st.mes))");
rep("tabsUI($('#tabs',r),['Evolución','Horizontes'],st,(i,p)=>{if(i===0)p.innerHTML='<div class=\"mk-card\">'+lineSVG(s.series,","tabsUI($('#tabs',r),vehKind(st.port)==='fvp'?['Evolución','Horizontes','Comparación entre perfiles']:['Evolución','Horizontes'],st,(i,p)=>{if(i===2){profilesTab(p,st);return}if(i===0)p.innerHTML='<div class=\"mk-card\">'+lineSVG(s.series,");
rep("let heads,rows=[];\n if(/Brinson/.test(name))","let heads,rows=[];\n if(/inmobiliarios|TIR y MOIC|por perfil/.test(name))return vehReportData(name,st,per,end);\n if(/Brinson/.test(name))");
rep("rows:()=>REPORTS,acts","rows:()=>REPORTS.map(r=>Object.assign({},r,{n:loc(r.n)})),acts");
/* 9) navegación */
rep("['#/orders/reports','Reportes','doc','oreports'","['#/orders/investment-decisions','Decisiones de inversión','scale','idec','Inmuebles, proyectos y cartera: propuesta, comité y acta de aprobación.'],['#/orders/reports','Reportes','doc','oreports'");
rep("renta variable, mercado monetario y derivados, y su libro de órdenes.'","renta variable, mercado monetario y derivados, decisiones de inversión en activos sin mercado y su libro de órdenes.'");
/* 10) datos por país */
rep("MM_RATES,DERIV_ORDERS,DERIV_EVID,DERIV_POS,DERIV_EXPO,EVENTS,PARAMS,SRC_AGE};","MM_RATES,DERIV_ORDERS,DERIV_EVID,DERIV_POS,DERIV_EXPO,EVENTS,PARAMS,SRC_AGE,DEC_ORDERS,DEC_ACTAS,FVP_REG};");
const CITY=(a,b,c)=>"['Bogotá','"+a+"'],['Medellín','"+b+"'],['Barranquilla','"+c+"'],";
rep("m:[['USD/COP','USD/CLP'],","m:[['USD/COP','USD/CLP'],"+CITY('Santiago','Valparaíso','Concepción')+"['FVP','APV'],");
rep("m:[['USD/COP','USD/DOP'],","m:[['USD/COP','USD/DOP'],"+CITY('Santo Domingo','Santiago de los Caballeros','Punta Cana'));
rep("m:[[\"USD/COP\",\"EUR/USD\"],","m:[[\"USD/COP\",\"EUR/USD\"],[\"Bogotá\",\"Ciudad de Panamá\"],[\"Medellín\",\"Colón\"],[\"Barranquilla\",\"David\"],");
/* 11) utilidades de prueba */
rep("window.__mk={derivIndicative,","window.__mk={assetVal,isValStale,inmMetrics,altMetrics,concCheck,regVigente,vehKind,holdingsFor,derivIndicative,");
fs.writeFileSync('mk.js',s);console.log('ok',s.length);
