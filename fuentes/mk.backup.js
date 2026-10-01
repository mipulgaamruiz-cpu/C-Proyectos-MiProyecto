(function(){
'use strict';
/*DATA*/
/*ICONS*/
/*CHARTS*/

/* =============== Helpers base =============== */
const MODULE_NAME='Front de inversiones';
const TIP=t=>' data-tip="'+esc(t)+'"';
const info=t=>'<span class="mk-info" tabindex="0" data-tip="'+esc(t)+'">i</span>';
const okNum=v=>parseFloat(String(v).replace(/[^0-9.\-]/g,''))||0;
function fmtD(ts){return new Date(ts).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'})}
function isoD(ts){const d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function fromIso(v){if(!v)return null;const[y,m,d]=v.split('-');return new Date(+y,+m-1,+d,12).getTime()}
const badge=(t,c,w)=>'<span class="mk-badge mk-badge--'+(c||'info')+(w?' mk-badge--wide':'')+'">'+esc(t)+'</span>';
const pcs=v=>(v>=0?'+':'')+pct(v,2);
const fdRow=(l,v)=>'<div class="mk-detail"><span class="mk-detail__label">'+esc(l)+'</span><span class="mk-detail__value">'+(v==null||v===''?'—':v)+'</span></div>';
const alertB=(kind,title,text,close)=>'<div class="mk-alert mk-alert--'+kind+'"><span class="mk-alert__icon">'+ic(kind==='danger'?'alert':kind==='success'?'badge':'info')+'</span><div class="mk-alert__body">'+(title?'<strong>'+esc(title)+'</strong>':'')+text+'</div>'+(close?'<button class="mk-alert__close" aria-label="Cerrar" onclick="this.parentNode.remove()">&times;</button>':'')+'</div>';
const kpiBox=(l,v,cls,tip)=>'<div class="mk-kpi'+(cls?' mk-kpi--'+cls:'')+'"><div class="mk-kpi__l">'+l+(tip?info(tip):'')+'</div><div class="mk-kpi__v">'+v+'</div></div>';
const valC=(v,txt)=>'<span class="'+(v>=0?'pos':'neg')+'">'+txt+'</span>';

/* Tooltips (capa flotante, no se recortan) */
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('[data-tip]'),tp=$('#mkTip');if(!tp)return;if(!t){tp.classList.remove('show');return}tp.textContent=t.dataset.tip;tp.classList.add('show');const r=t.getBoundingClientRect(),w=tp.offsetWidth,h=tp.offsetHeight;let x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)),y=r.top-h-8;if(y<8)y=r.bottom+8;tp.style.left=x+'px';tp.style.top=y+'px'});
document.addEventListener('mousedown',()=>{const tp=$('#mkTip');tp&&tp.classList.remove('show')});
document.addEventListener('scroll',()=>{const tp=$('#mkTip');tp&&tp.classList.remove('show')},true);

/* Toast (Sonner) */
function toast(msg,type,title){type=type||'info';const w=$('#mkSonner');if(!w)return;const t=document.createElement('div');t.className='mk-toast mk-toast--'+type;t.innerHTML='<span class="mk-alert__icon">'+ic(type==='danger'?'alert':type==='success'?'badge':'info')+'</span><div class="mk-alert__body">'+(title?'<strong>'+esc(title)+'</strong>':'')+msg+'</div><button class="mk-toast__close" onclick="this.parentNode.remove()">&times;</button>';w.appendChild(t);while(w.children.length>3)w.removeChild(w.firstChild);setTimeout(()=>t.remove(),type==='danger'?9000:4500)}
/* Modal */
function openModal(o){const ov=document.createElement('div');ov.className='mk-modal-overlay open';ov.style.zIndex=o.z||70;ov.innerHTML='<div class="mk-modal '+(o.cls||'')+'" role="dialog" aria-modal="true"><div class="mk-modal__head'+(o.brand?' mk-modal__head--brand':'')+'">'+(o.brand?'<span>'+esc(o.title)+'</span>':esc(o.title))+'<button class="mk-sidebar__close" data-x aria-label="Cerrar" style="position:static">&times;</button></div>'+(o.sub?'<div class="mk-modal__sub">'+o.sub+'</div>':'')+'<div class="mk-modal__body">'+(o.body||'')+'</div><div class="mk-modal__foot">'+(o.foot||'')+'</div></div>';document.body.appendChild(ov);const close=()=>{ov.remove();o.onClose&&o.onClose()};$('[data-x]',ov).addEventListener('click',close);ov.addEventListener('mousedown',e=>{if(e.target===ov&&!o.sticky)close()});ov.addEventListener('keydown',e=>{if(e.key==='Escape')close()});return {el:ov,close,body:$('.mk-modal__body',ov),foot:$('.mk-modal__foot',ov)}}
function mkConfirm(o){const m=openModal({title:o.title||'Confirmar',body:alertB(o.danger?'danger':'warning','',o.message||'¿Deseas continuar?'),foot:'<button class="mk-btn mk-btn--secondary" data-c>'+(o.cancelText||'Cancelar')+'</button><button class="mk-btn'+(o.danger?' mk-btn--danger-solid':'')+'" data-ok>'+(o.confirmText||'Confirmar')+'</button>'});$('[data-c]',m.el).addEventListener('click',m.close);$('[data-ok]',m.el).addEventListener('click',()=>{m.close();o.onConfirm&&o.onConfirm()});$('[data-c]',m.el).focus()}

/* =============== Campos de formulario (nativos, como la Plataforma) =============== */
const fld=(label,ctrl,o)=>{o=o||{};return '<div class="mk-field'+(o.cls?' '+o.cls:'')+'" data-f="'+(o.name||'')+'"><label class="mk-label"><span>'+esc(label)+'</span>'+(o.req?'<span class="req">*</span>':'')+(o.tip?info(o.tip):'')+'</label>'+ctrl+'<div class="mk-help mk-help--error" hidden></div></div>'};
const inpF=(name,label,val,o)=>{o=o||{};return fld(label,'<input class="mk-input" name="'+name+'" type="'+(o.type||'text')+'" value="'+esc(val==null?'':val)+'" placeholder="'+esc(o.ph||'')+'" '+(o.ro?'readonly ':'')+(o.attrs||'')+'>',Object.assign({name},o))};
const selF=(name,label,opts,val,o)=>{o=o||{};return fld(label,'<div class="mk-combobox"><select class="mk-select" name="'+name+'"><option value="">'+(o.ph||'Seleccionar')+'</option>'+opts.map(x=>{const v=typeof x==='object'?x.value:x,l=typeof x==='object'?x.label:x;return '<option value="'+esc(v)+'"'+(String(v)===String(val)?' selected':'')+'>'+esc(l)+'</option>'}).join('')+'</select></div>',Object.assign({name},o))};
const dateF=(name,label,ts,o)=>fld(label,'<div class="mk-datepicker"><input class="mk-input" type="date" name="'+name+'" value="'+(ts?isoD(ts):'')+'"></div>',Object.assign({name},o||{}));
const radiosF=(name,label,opts,val,o)=>fld(label,'<div class="mk-radiorow">'+opts.map(x=>'<label class="mk-radio"><input type="radio" name="'+name+'" value="'+esc(x)+'"'+(x===val?' checked':'')+'> '+esc(x)+'</label>').join('')+'</div>',Object.assign({name},o||{}));
const rv=(f,n)=>{const e=$('[name="'+n+'"]:checked',f);return e?e.value:''};
function acF(name,label,ph,val,o){return fld(label,'<div class="ac-wrap" style="position:relative"><input class="mk-input" name="'+name+'" value="'+esc(val||'')+'" placeholder="'+esc(ph)+'" autocomplete="off"></div>',Object.assign({name},o||{}))}
function bindAC(f,name,list){const inp=$('[name="'+name+'"]',f),w=inp.parentElement;inp.addEventListener('input',()=>{$$('.ac-list',w).forEach(x=>x.remove());const q=inp.value.toLowerCase();if(!q)return;const m=list.filter(x=>x.toLowerCase().includes(q)).slice(0,8);if(!m.length)return;const ul=document.createElement('div');ul.className='ac-list';ul.innerHTML=m.map(x=>'<div class="opt">'+esc(x)+'</div>').join('');ul.addEventListener('click',e=>{const o=e.target.closest('.opt');if(o){inp.value=o.textContent;ul.remove();clearErr(inp)}});w.appendChild(ul)})}
document.addEventListener('click',e=>{if(!e.target.closest('.ac-wrap'))$$('.ac-list').forEach(x=>x.remove());if(!e.target.closest('.mk-multiselect'))$$('.mk-multiselect.open').forEach(x=>x.classList.remove('open'))});
function errOn(f,name,msg){const c=$('[name="'+name+'"]',f);if(!c)return;const box=c.closest('.mk-field');if(c.classList)c.classList.add('mk-input--error');const h=$('.mk-help--error',box);if(h){h.textContent=msg||'Campo obligatorio';h.hidden=false}}
function clearErr(c){const box=c.closest&&c.closest('.mk-field');if(!box)return;$$('.mk-input--error',box).forEach(x=>x.classList.remove('mk-input--error'));const h=$('.mk-help--error',box);if(h)h.hidden=true}
function bindClear(f){f.addEventListener('input',e=>clearErr(e.target));f.addEventListener('change',e=>clearErr(e.target))}
const mask={qty:v=>(parseFloat(String(v).replace(/[^0-9.]/g,''))||0).toFixed(2),rate:v=>(parseFloat(String(v).replace(/[^0-9.]/g,''))||0).toFixed(2)+'%',money:v=>'$'+(parseFloat(String(v).replace(/[^0-9.]/g,''))||0).toFixed(2)};
function bindMask(f,name,fn){const i=$('[name="'+name+'"]',f);if(i)i.addEventListener('blur',()=>{i.value=fn(i.value)})}

/* =============== Tabla de datos (DataTable de la Plataforma) =============== */
/* Convención de la Plataforma: Acciones como primera columna y Estado al final. */
function DataTable(host,o){
 const st={q:'',page:1,sort:o.defaultSort||null,dir:o.defaultDir||1,f:{}};
 const rowsAll=()=>o.rows();
 function filtered(){let rows=rowsAll();
  (o.filters||[]).forEach(fl=>{const v=st.f[fl.id];if(v)rows=rows.filter(r=>String(fl.get(r))===v)});
  if(st.q){const q=st.q.toLowerCase();rows=rows.filter(r=>o.cols.some(c=>String(c.txt?c.txt(r):(c.fmt?c.fmt(r[c.k]):r[c.k])).toLowerCase().includes(q)))}
  if(st.sort){const c=o.cols.find(c=>c.h===st.sort);rows=rows.slice().sort((a,b)=>{const x=c.sv?c.sv(a):a[c.k],y=c.sv?c.sv(b):b[c.k];return (x>y?1:x<y?-1:0)*st.dir})}return rows}
 function render(){
  const all=filtered(),ps=o.pageSize||10,pages=o.noPage?1:Math.max(1,Math.ceil(all.length/ps));if(st.page>pages)st.page=pages;
  const rows=o.noPage?all:all.slice((st.page-1)*ps,st.page*ps);
  const hasActs=!!o.acts;
  const th=(hasActs?'<th>Acciones</th>':'')+o.cols.map(c=>'<th'+(c.sortable?' style="cursor:pointer" data-h="'+esc(c.h)+'"':'')+'>'+(c.tip?'<span class="mk-th-info">'+esc(c.h)+info(c.tip)+'</span>':esc(c.h))+(st.sort===c.h?' <span style="font-size:11px">'+(st.dir>0?'▲':'▼')+'</span>':'')+'</th>').join('')+(o.estado?'<th>Estado</th>':'');
  const body=rows.length?rows.map((r,i)=>'<tr data-i="'+i+'">'+(hasActs?'<td>'+actsHTML(o.acts(r),i)+'</td>':'')+o.cols.map(c=>'<td'+(c.cls?' class="'+c.cls+'"':'')+'>'+(c.html?c.html(r):esc(c.fmt?c.fmt(r[c.k]):r[c.k]))+'</td>').join('')+(o.estado?'<td>'+o.estado(r)+'</td>':'')+'</tr>').join(''):'<tr><td colspan="'+(o.cols.length+(hasActs?1:0)+(o.estado?1:0))+'"><div class="mk-empty">'+(o.empty||'Sin resultados')+'</div></td></tr>';
  const tot=o.totals&&rows.length?'<tr style="font-weight:700;border-top:2px solid var(--mk-primary)">'+(hasActs?'<td></td>':'')+o.totals(all).map(t=>'<td>'+t+'</td>').join('')+'</tr>':'';
  let pager='';if(!o.noPage&&pages>1){pager='<div class="mk-pagination"><span class="mk-pagination__info">Página '+st.page+' de '+pages+'</span><button data-pp="1" aria-label="Primera página"'+(st.page===1?' disabled':'')+'>«</button><button data-pp="'+(st.page-1)+'" aria-label="Página anterior"'+(st.page===1?' disabled':'')+'>‹</button>';for(let p=1;p<=pages;p++)pager+='<button data-pp="'+p+'" class="'+(p===st.page?'active':'')+'">'+p+'</button>';pager+='<button data-pp="'+(st.page+1)+'" aria-label="Página siguiente"'+(st.page===pages?' disabled':'')+'>›</button><button data-pp="'+pages+'" aria-label="Última página"'+(st.page===pages?' disabled':'')+'>»</button></div>'}
  const filt=o.noFilters?'':'<div class="mk-tplfilters mk-filters"><div class="mk-field mk-field--search"><label class="mk-label">Buscar</label><input class="mk-input" data-q placeholder="'+esc(o.searchPh||'Buscar...')+'" value="'+esc(st.q)+'"></div>'+(o.filters||[]).map(fl=>'<div class="mk-field"><label class="mk-label">'+esc(fl.label)+'</label><div class="mk-combobox"><select class="mk-select" data-fl="'+fl.id+'"><option value="">Todos</option>'+fl.opts().map(v=>'<option'+(st.f[fl.id]===v?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select></div></div>').join('')+'<button class="mk-btn mk-btn--secondary" data-clear>Limpiar</button></div>';
  host.innerHTML=(o.kpis&&!o.noFilters?'<div class="mk-kpis">'+o.kpis(rowsAll()).map(k=>kpiBox(k[0],k[1],k[2])).join('')+'</div>':'')+filt+'<div class="mk-card">'+(o.noTools?'':'<div class="mk-datatable__toolbar"><div class="mk-search"></div><div class="mk-export"><button class="mk-btn mk-btn--outline mk-btn--sm" data-x="csv"'+TIP('Descargar los datos filtrados en CSV')+'>CSV</button><button class="mk-btn mk-btn--outline mk-btn--sm" data-x="xls"'+TIP('Descargar los datos filtrados en Excel')+'>Excel</button></div></div>')+'<div class="mk-tablewrap"><table class="mk-table"><thead><tr>'+th+'</tr></thead><tbody>'+body+tot+'</tbody></table></div>'+(o.noFoot?'':'<div class="mk-datatable__foot"><span class="mk-rowinfo">Mostrando '+rows.length+' de '+all.length+' '+(o.noun||'registros')+'</span>'+pager+'</div>')+'</div>';
  const q=$('[data-q]',host);if(q)q.addEventListener('input',()=>{st.q=q.value;st.page=1;const p=q.selectionStart;render();const n=$('[data-q]',host);n.focus();n.setSelectionRange(p,p)});
  $$('[data-fl]',host).forEach(s=>s.addEventListener('change',()=>{st.f[s.dataset.fl]=s.value;st.page=1;render()}));
  const cl=$('[data-clear]',host);if(cl)cl.addEventListener('click',()=>{st.q='';st.f={};st.page=1;render()});
  $$('th[data-h]',host).forEach(t=>t.addEventListener('click',()=>{if(st.sort===t.dataset.h)st.dir*=-1;else{st.sort=t.dataset.h;st.dir=1}render()}));
  $$('[data-pp]',host).forEach(b=>b.addEventListener('click',()=>{st.page=+b.dataset.pp;render()}));
  $$('[data-x]',host).forEach(b=>b.addEventListener('click',()=>{const a=filtered(),name=(o.fileName||'datos')+'-'+new Date().toISOString().slice(0,10);if(!a.length){toast('No hay datos para descargar.','warning');return}const cols=o.cols;if(b.dataset.x==='csv')download(name+'.csv',toCSV(cols,a),'text/csv;charset=utf-8');else download(name+'.xls',toXLS(cols,a),'application/vnd.ms-excel');toast(a.length+' registros exportados.','success','Descarga lista')}));
  $$('[data-act]',host).forEach(b=>b.addEventListener('click',()=>{const tr=b.closest('tr');o.onAct&&o.onAct(b.dataset.act,rows[+tr.dataset.i])}));
 }
 render();return {render,state:st};
}
/* Iconos de acción: Ver Detalle, Editar, Inactivar/Activar/Anular */
const AI={ver:['mk-iconbtn--view','eye','Ver detalle'],edit:['mk-iconbtn--edit','pen','Editar'],off:['mk-iconbtn--delete','trash','Inactivar'],on:['mk-iconbtn--ok','check','Activar'],anular:['mk-iconbtn--delete','trash','Anular'],gen:['','doc','Generar'],clone:['','copy','Clonar']};
function actsHTML(list){return '<div class="mk-acts">'+list.map(a=>{const d=AI[a[0]];return '<button class="mk-iconbtn '+d[0]+'" data-act="'+a[0]+'"'+TIP(a[1]||d[2])+' aria-label="'+esc(a[1]||d[2])+'">'+ic(d[1])+'</button>'}).join('')+'</div>'}

/* =============== Estructura de página =============== */
function sectionHTML(meta,title,help,o){o=o||{};const backTo=meta&&meta.grp?meta.grp.label:null;return '<div class="mk-section"><div class="mk-headerpage"><div><h1>'+esc(title)+'</h1>'+(help?'<div class="mk-help">'+esc(help)+'</div>':'')+'</div><div style="display:flex;gap:10px;align-items:center">'+(backTo?'<button class="mk-iconbtn mk-iconbtn--dark" data-back'+TIP('Volver a '+backTo)+' aria-label="Volver a '+esc(backTo)+'">'+ic('back')+'</button>':'')+(o.actions||'')+'</div></div><div id="pg"></div></div>'}
function mountPage(view,meta,title,help,o){view.innerHTML=sectionHTML(meta,title,help,o);const b=$('[data-back]',view);if(b)b.addEventListener('click',()=>go(meta.grp.home));return $('#pg',view)}
const BTN_NEW=lbl=>'<button class="mk-btn" data-new>'+ic('plus')+esc(lbl||'Nuevo')+'</button>';

/* ---------- Página de listado con Crear / Ver / Editar / Inactivar ---------- */
function crudPage(cfg){
 return function(view,meta){
  const pg=mountPage(view,meta,cfg.title,cfg.help,{actions:cfg.noNew?'':BTN_NEW(cfg.newLabel)});
  if(cfg.apoya)pg.insertAdjacentHTML('beforebegin',apoyaHTML(cfg.apoya));
  let table;
  const repaint=()=>table.render();
  const detail=r=>{const m=openModal({title:cfg.detailTitle?cfg.detailTitle(r):'Detalle',body:(cfg.badges?'<div style="margin-bottom:10px">'+cfg.badges(r)+'</div>':'')+'<div class="mk-formgrid">'+cfg.detail(r).map(x=>fdRow(x[0],x[1])).join('')+'</div>',foot:(cfg.acts(r).some(a=>a[0]==='edit')?'<button class="mk-btn mk-btn--outline" data-e>'+ic('pen')+'Editar</button>':'')+'<button class="mk-btn mk-btn--secondary" data-c>Cerrar</button>'});$('[data-c]',m.el).addEventListener('click',m.close);const e=$('[data-e]',m.el);if(e)e.addEventListener('click',()=>{m.close();form(r)})};
  const form=row=>{
   const f=cfg.form(row),m=openModal({brand:true,cls:'mk-modal--form',title:(row?'Editar ':(/^La /.test(cfg.entityArt||'')?'Nueva ':'Nuevo '))+cfg.entity,sticky:true,body:'<form novalidate>'+f.html+'</form>',foot:'<button class="mk-btn mk-btn--secondary" data-c>Cancelar</button><button class="mk-btn" data-s>'+ic('save')+'Guardar</button>'});
   const fm=$('form',m.el);f.bind&&f.bind(fm);bindClear(fm);let dirty=false;fm.addEventListener('input',()=>dirty=true);fm.addEventListener('change',()=>dirty=true);
   const cancel=()=>{if(dirty){mkConfirm({title:'¿Descartar cambios?',message:'Tienes cambios sin guardar. Si cierras ahora se perderán.',confirmText:'Descartar',danger:true,onConfirm:m.close})}else m.close()};
   $('[data-c]',m.el).addEventListener('click',cancel);$('[data-x]',m.el).addEventListener('click',e=>{e.stopImmediatePropagation();cancel()},true);
   const save=()=>{$$('.mk-help--error',fm).forEach(h=>h.hidden=true);$$('.mk-input--error',fm).forEach(x=>x.classList.remove('mk-input--error'));const res=f.read(fm);if(!res.ok){(res.errs||[]).forEach(e=>errOn(fm,e[0],e[1]));toast('Completa: '+(res.errs||[]).map(e=>e[2]||e[0]).join(', ')+'.','warning','Faltan datos');return}
    const rv2=openModal({title:'Revisa '+cfg.entityArt.toLowerCase(),z:80,sticky:true,sub:'Verifica la información antes de guardar.',body:'<div class="mk-formgrid">'+cfg.review(res.data).map(x=>fdRow(x[0],esc(x[1]))).join('')+'</div>',foot:'<button class="mk-btn mk-btn--secondary" data-b>Volver a editar</button><button class="mk-btn" data-ok>'+ic('check')+'Confirmar y guardar</button>'});
    $('[data-b]',rv2.el).addEventListener('click',rv2.close);$('[data-ok]',rv2.el).addEventListener('click',()=>{const btn=$('[data-ok]',rv2.el);btn.classList.add('is-loading');setTimeout(()=>{cfg.onSave(res.data,row);rv2.close();m.close();repaint();{const fem=/^La /.test(cfg.entityArt);toast(row?cfg.entityArt+(fem?' actualizada':' actualizado')+' correctamente.':cfg.entityArt+(fem?' creada':' creado')+' correctamente.','success',row?'Cambios guardados':(fem?'Registro creado':'Registro creado'))}},350)})};
   $('[data-s]',m.el).addEventListener('click',save);
  };
  const toggle=r=>{const t=cfg.toggle(r);mkConfirm({title:t.title,danger:t.danger,message:t.message+(t.danger&&cfg.apoya?'<div class="mk-help" style="margin-top:6px">Apoya a: '+cfg.apoya.map(a=>a[0]).join(', ')+'.</div>':''),confirmText:t.confirm,onConfirm:()=>{t.apply();repaint();toast(t.done,t.danger?'warning':'success')}})};
  table=DataTable(pg,{cols:cfg.cols,rows:cfg.rows,filters:cfg.filters,acts:cfg.acts,estado:cfg.estado,kpis:cfg.kpis,pageSize:10,fileName:cfg.fileName,defaultSort:cfg.defaultSort,defaultDir:cfg.defaultDir,searchPh:cfg.searchPh,noun:cfg.noun,
   onAct:(a,r)=>{if(a==='ver')detail(r);else if(a==='edit')form(r);else if(a==='off'||a==='on'||a==='anular')toggle(r);else cfg.onAct&&cfg.onAct(a,r,repaint)}});
  const nb=$('[data-new]',view);if(nb)nb.addEventListener('click',()=>form(null));
  if(cfg.extra)cfg.extra(pg);
 };
}
const ESTADO_ORD={R:['Registrada','info'],C:['Complementación','warning'],F:['Finalizada','success'],A:['Anulada','danger']};
const estOrd=r=>badge(ESTADO_ORD[r.estatus][0],ESTADO_ORD[r.estatus][1],true);
const actsOrd=r=>{const a=[['ver']];if(r.estatus==='R'||r.estatus==='C'){a.push(['edit']);a.push(['anular','Anular orden'])}return a};
const togOrd=(noun)=>r=>({title:'Anular '+noun,danger:true,message:'Vas a anular '+noun+' de <b>'+esc(r.port||r.cliente)+'</b> sobre <b>'+esc(r.instr)+'</b>. Esta acción no se puede deshacer.',confirm:'Anular',done:'Orden anulada correctamente.',apply:()=>{r.estatus='A'}});
const kpiOrd=rows=>[['Registradas',rows.filter(r=>r.estatus==='R').length,'b'],['En complementación',rows.filter(r=>r.estatus==='C').length,'y'],['Finalizadas',rows.filter(r=>r.estatus==='F').length,'g'],['Anuladas',rows.filter(r=>r.estatus==='A').length,'r']];
const filtOrd=[{id:'tipo',label:'Tipo',opts:()=>['COMPRA','VENTA'],get:r=>r.tipo},{id:'est',label:'Estado',opts:()=>Object.values(ESTADO_ORD).map(x=>x[0]),get:r=>ESTADO_ORD[r.estatus][0]}];
const side=t=>badge(t,t==='COMPRA'?'info':'danger');

const APO={
 port:[['Renta fija','#/orders/fixed-income'],['Renta variable','#/orders/variable-income'],['Evaluación de límites','#/limit-control/limit-evaluation'],['Performance attribution','#/performance-attribution/summary']],
 instr:[['Renta fija','#/orders/fixed-income'],['Renta variable','#/orders/variable-income'],['Flujos futuros','#/dashboard/future-flows'],['Visor de portafolio','#/dashboard/graphics']],
 index:[['Benchmarks','#/parametrizacion/benchmarks'],['Resumen de desempeño','#/performance-attribution/summary'],['Atribución de retorno','#/performance-attribution/brinson']],
 bench:[['Resumen de desempeño','#/performance-attribution/summary'],['Atribución de retorno','#/performance-attribution/brinson'],['Reportes','#/performance-attribution/reports']],
 limits:[['Evaluación de límites','#/limit-control/limit-evaluation']],
 flow:[['Renta fija','#/orders/fixed-income'],['Renta variable','#/orders/variable-income']],
 cat:[
  [['Visor de portafolio','#/dashboard/graphics'],['Configuración de límites','#/parametrizacion/limits']],
  [['Visor de portafolio','#/dashboard/graphics'],['Configuración de límites','#/parametrizacion/limits']],
  [['Renta fija','#/orders/fixed-income'],['Flujos futuros','#/dashboard/future-flows'],['Visor de portafolio','#/dashboard/graphics']],
  [['Configuración de límites','#/parametrizacion/limits'],['Evaluación de límites','#/limit-control/limit-evaluation']]
 ]
};
const apoyaHTML=a=>'<div class="mk-apoya"><span>Apoya a:</span>'+a.map(x=>'<a class="mk-chip" data-go="'+x[1]+'" href="'+x[1]+'">'+esc(x[0])+'</a>').join('')+'</div>';
/* --- Renta fija --- */
PAGES_INIT();
function PAGES_INIT(){}
const PAGES={};
PAGES.fixed=crudPage({title:'Renta fija',help:'Opera y administra inversiones en instrumentos de deuda.',entity:'orden de renta fija',entityArt:'La orden',fileName:'renta-fija',defaultSort:'Creado',defaultDir:-1,searchPh:'Portafolio o instrumento...',noun:'órdenes',
 filters:[{id:'port',label:'Portafolio',opts:()=>PNAMES.slice(0,9),get:r=>r.port}].concat(filtOrd),kpis:kpiOrd,
 cols:[{h:'Portafolio',k:'port'},{h:'Tipo',k:'tipo',html:r=>side(r.tipo),txt:r=>r.tipo},{h:'Instrumento',k:'instr'},{h:'Cantidad',k:'cant',fmt:f2},{h:'Tasa',k:'tasa',fmt:v=>pc2(v*100)},{h:'Valor',k:'valor',fmt:money},{h:'Creado',k:'fecha',fmt:dstr,sortable:true}],
 rows:()=>FI_ORDERS,acts:actsOrd,estado:estOrd,toggle:togOrd('la orden'),
 detail:r=>[['Portafolio',esc(r.port)],['Tipo',r.tipo],['Instrumento',esc(r.instr)],['Cantidad',f2(r.cant)],['Tasa de negociación',pc2(r.tasa*100)],['Valor giro',money(r.valor)],['Creada',dstr(r.fecha)],['Estado',ESTADO_ORD[r.estatus][0]]],badges:r=>side(r.tipo)+' '+estOrd(r),detailTitle:r=>'Orden · '+r.instr,
 form:row=>({html:'<div class="mk-formgrid">'+radiosF('tipo','Tipo de orden',['COMPRA','VENTA'],row?row.tipo:'COMPRA',{req:true})+selF('port','Portafolio',PNAMES,row&&row.port,{req:true})+acF('instr','Instrumento','Escribe para buscar...',row&&row.instr,{req:true})+inpF('quantity','Cantidad',row?row.cant.toFixed(2):'0.00',{req:true})+inpF('rate','Tasa de negociación',row?(row.tasa*100).toFixed(2)+'%':'0.00%')+inpF('value','Valor giro',row?'$'+row.valor.toFixed(2):'$0.00')+'</div>',
  bind:f=>{bindAC(f,'instr',INSTR_NAMES.concat(INSTRUMENTS.slice(0,8).map(i=>i.mnem)));bindMask(f,'quantity',mask.qty);bindMask(f,'rate',mask.rate);bindMask(f,'value',mask.money)},
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[];if(!g('port'))errs.push(['port','Selecciona un portafolio','Portafolio']);if(!g('instr'))errs.push(['instr','Indica el instrumento','Instrumento']);if(!okNum(g('quantity')))errs.push(['quantity','La cantidad debe ser mayor a 0','Cantidad']);if(errs.length)return {ok:false,errs};return {ok:true,data:{estatus:row?row.estatus:'R',port:g('port'),tipo:rv(f,'tipo'),instr:g('instr'),cant:okNum(g('quantity')),tasa:okNum(g('rate'))/100,valor:okNum(g('value')),fecha:row?row.fecha:Date.now()}}}}),
 review:d=>[['Tipo',d.tipo],['Portafolio',d.port],['Instrumento',d.instr],['Cantidad',f2(d.cant)],['Tasa',pc2(d.tasa*100)],['Valor giro',money(d.valor)]],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else FI_ORDERS.unshift(o)}
});
/* --- Renta variable --- */
PAGES.variable=crudPage({title:'Renta variable',help:'Opera y administra inversiones en acciones.',entity:'orden de renta variable',entityArt:'La orden',fileName:'renta-variable',defaultSort:'Creado',defaultDir:-1,searchPh:'Portafolio o instrumento...',noun:'órdenes',
 filters:[{id:'port',label:'Portafolio',opts:()=>PNAMES.slice(0,9),get:r=>r.port},{id:'ord',label:'Tipo orden',opts:()=>['MERCADO','LIMITE'],get:r=>r.orden}].concat(filtOrd),kpis:kpiOrd,
 cols:[{h:'Portafolio',k:'port'},{h:'Tipo',k:'tipo',html:r=>side(r.tipo),txt:r=>r.tipo},{h:'Instrumento',k:'instr'},{h:'Tipo orden',k:'orden',html:r=>badge(r.orden,r.orden==='LIMITE'?'warning':'neutral'),txt:r=>r.orden},{h:'Cantidad',k:'cant',fmt:f2},{h:'Precio límite',k:'pl',fmt:f2},{h:'Valor',k:'valor',fmt:money},{h:'Creado',k:'fecha',fmt:dstr,sortable:true}],
 rows:()=>VI_ORDERS,acts:actsOrd,estado:estOrd,toggle:togOrd('la orden'),
 detail:r=>[['Portafolio',esc(r.port)],['Tipo',r.tipo],['Instrumento',esc(r.instr)],['Tipo de orden',r.orden],['Cantidad',f2(r.cant)],['Precio límite',r.orden==='LIMITE'?f2(r.pl):'—'],['Valor',money(r.valor)],['Creada',dstr(r.fecha)]],badges:r=>side(r.tipo)+' '+estOrd(r),detailTitle:r=>'Orden · '+r.instr,
 form:row=>({html:'<div class="mk-formgrid">'+radiosF('tipo','Tipo de orden',['COMPRA','VENTA'],row?row.tipo:'COMPRA',{req:true})+radiosF('ord','Modalidad',['MERCADO','LIMITE'],row?row.orden:'MERCADO',{req:true,tip:'Mercado: se ejecuta al precio vigente. Límite: solo al precio indicado o mejor.'})+selF('port','Portafolio',PNAMES,row&&row.port,{req:true})+acF('instr','Instrumento','Escribe para buscar...',row&&row.instr,{req:true})+inpF('quantity','Cantidad',row?row.cant.toFixed(2):'0.00',{req:true})+'<div id="plw">'+(row&&row.orden==='LIMITE'?inpF('limit','Precio límite',row.pl.toFixed(2),{req:true}):'')+'</div></div>',
  bind:f=>{bindAC(f,'instr',['ECOPETROL','CELSIA','CEMARGOS','BOGOTA','BVC','BSANTANDER','FALABELLA','SURA','GRUPOSURA','NUTRESA']);bindMask(f,'quantity',mask.qty);const up=()=>{$('#plw',f).innerHTML=rv(f,'ord')==='LIMITE'?($('[name=limit]',f)?$('#plw',f).innerHTML:inpF('limit','Precio límite','0.00',{req:true})):'';bindMask(f,'limit',mask.qty)};$$('[name=ord]',f).forEach(r=>r.addEventListener('change',up));bindMask(f,'limit',mask.qty)},
  read:f=>{const g=n=>($('[name="'+n+'"]',f)||{value:''}).value.trim(),errs=[],lim=rv(f,'ord')==='LIMITE';if(!g('port'))errs.push(['port','Selecciona un portafolio','Portafolio']);if(!g('instr'))errs.push(['instr','Indica el instrumento','Instrumento']);if(!okNum(g('quantity')))errs.push(['quantity','La cantidad debe ser mayor a 0','Cantidad']);if(lim&&!okNum(g('limit')))errs.push(['limit','Ingresa el precio límite','Precio límite']);if(errs.length)return {ok:false,errs};const q=okNum(g('quantity')),pl=lim?okNum(g('limit')):0;return {ok:true,data:{estatus:row?row.estatus:'R',port:g('port'),tipo:rv(f,'tipo'),instr:g('instr'),orden:lim?'LIMITE':'MERCADO',cant:q,pl,valor:q*pl,fecha:row?row.fecha:Date.now()}}}}),
 review:d=>[['Tipo',d.tipo],['Portafolio',d.port],['Instrumento',d.instr],['Modalidad',d.orden],['Cantidad',f2(d.cant)],['Precio límite',d.orden==='LIMITE'?f2(d.pl):'—']],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else VI_ORDERS.unshift(o)}
});
/* --- Instrumentos --- */
INSTRUMENTS.forEach((r,i)=>{if(r.activo===undefined)r.activo=(i%9!==4)});
PAGES.instruments=crudPage({title:'Instrumentos',help:'Consulta, registra y administra los instrumentos financieros disponibles para negociación.',apoya:APO.instr,entity:'instrumento',entityArt:'El instrumento',fileName:'instrumentos',defaultSort:'Nemotécnico',searchPh:'Nemotécnico, ISIN o emisor...',noun:'instrumentos',
 filters:[{id:'t',label:'Tipo',opts:()=>TIPOS(),get:r=>r.tipo},{id:'m',label:'Moneda',opts:()=>MONEDAS(),get:r=>r.moneda},{id:'e',label:'Estado',opts:()=>['Activo','Inactivo'],get:r=>r.activo?'Activo':'Inactivo'}],
 kpis:rows=>[['Instrumentos',rows.length,'p'],['Activos',rows.filter(r=>r.activo).length,'g'],['Inactivos',rows.filter(r=>!r.activo).length,'r'],['Vencen en 12 meses',rows.filter(r=>r.ven>Date.now()&&r.ven<Date.now()+365*864e5).length,'y']],
 cols:[{h:'Nemotécnico',k:'mnem',sortable:true},{h:'Tipo',k:'tipo'},{h:'ISIN',k:'isin',tip:'Código internacional de identificación de valores'},{h:'Moneda',k:'moneda'},{h:'Tasa facial',k:'tasa'},{h:'Periodicidad',k:'period'},{h:'Fecha emisión',k:'emi',fmt:fmtD},{h:'Fecha vencimiento',k:'ven',fmt:fmtD},{h:'Emisor',k:'emisor'},{h:'Calificación',k:'calif'}],
 rows:()=>INSTRUMENTS,estado:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral',true),
 acts:r=>[['ver'],['edit'],r.activo?['off']:['on']],
 toggle:r=>r.activo?{title:'Inactivar instrumento',danger:true,message:'Vas a inactivar <b>'+esc(r.mnem)+'</b>. No podrá seleccionarse en nuevas órdenes; las órdenes vigentes no se modifican.',confirm:'Inactivar',done:'Instrumento inactivado.',apply:()=>{r.activo=false}}:{title:'Activar instrumento',message:'¿Deseas activar <b>'+esc(r.mnem)+'</b> para negociación?',confirm:'Activar',done:'Instrumento activado.',apply:()=>{r.activo=true}},
 detail:r=>[['Nemotécnico',esc(r.mnem)],['Tipo',r.tipo],['ISIN',esc(r.isin)],['Moneda',r.moneda],['Tasa facial',r.tasa],['Periodicidad',r.period],['Fecha emisión',fmtD(r.emi)],['Fecha vencimiento',fmtD(r.ven)],['Emisor',esc(r.emisor)],['Calificación',r.calif]],detailTitle:r=>r.mnem,badges:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral'),
 extra:pg=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class="mk-accordion__head"><span class="mk-accordion__ico">'+ic('upload')+'</span><span><span class="mk-accordion__t">Carga masiva de instrumentos</span><span class="mk-accordion__d">Sube un archivo CSV o Excel con la plantilla de instrumentos</span></span><span class="mk-accordion__chev">&#9662;</span></div><div class="mk-accordion__body">'+fileUp('inst-up')+'</div>';pg.appendChild(x);bindAcc(x);bindFile(x)},
 form:row=>({html:'<div class="mk-formgrid">'+selF('tipo','Tipo de instrumento',TIPOS(),row&&row.tipo,{req:true})+inpF('mnemonic','Nemotécnico',row&&row.mnem,{req:true})+inpF('isin','ISIN',row&&row.isin)+selF('currency','Moneda',MONEDAS(),row&&row.moneda,{req:true})+inpF('rate','Tasa facial',row&&row.tasa)+inpF('freq','Periodicidad',row&&row.period)+dateF('emi','Fecha emisión',row&&row.emi,{req:true})+dateF('ven','Fecha vencimiento',row&&row.ven,{req:true})+inpF('issuer','Emisor',row&&row.emisor)+inpF('rating','Calificación',row&&row.calif)+'</div>',
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[];if(!g('tipo'))errs.push(['tipo','Selecciona el tipo','Tipo']);if(!g('mnemonic'))errs.push(['mnemonic','Indica el nemotécnico','Nemotécnico']);if(!g('currency'))errs.push(['currency','Selecciona la moneda','Moneda']);const e=fromIso(g('emi')),v=fromIso(g('ven'));if(!e)errs.push(['emi','Indica la fecha de emisión','Emisión']);if(!v)errs.push(['ven','Indica la fecha de vencimiento','Vencimiento']);if(e&&v&&v<=e)errs.push(['ven','El vencimiento debe ser posterior a la emisión','Vencimiento']);if(errs.length)return {ok:false,errs};return {ok:true,data:{mnem:g('mnemonic'),tipo:g('tipo'),isin:g('isin'),moneda:g('currency'),tasa:g('rate'),period:g('freq'),emi:e,ven:v,emisor:g('issuer'),calif:g('rating'),activo:row?row.activo:true}}}}),
 review:d=>[['Nemotécnico',d.mnem],['Tipo',d.tipo],['Moneda',d.moneda],['Emisión',fmtD(d.emi)],['Vencimiento',fmtD(d.ven)],['Emisor',d.emisor]],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else INSTRUMENTS.unshift(o)}
});
/* --- Control de límites --- */
LIMITS.forEach((r,i)=>{if(r.activo===undefined)r.activo=(i!==11)});
function limitsPage(title,help){return crudPage({title:title,help:help,apoya:APO.limits,entity:'límite',entityArt:'El límite',fileName:'limites',defaultSort:'Tipo de límite',searchPh:'Tipo, sublímite o portafolio...',noun:'límites',
 filters:[{id:'t',label:'Tipo de límite',opts:()=>Object.keys(SUBLIMITS),get:r=>r.tipo},{id:'e',label:'Evaluación',opts:()=>['MAX','MIN'],get:r=>r.eval},{id:'p',label:'Portafolio',opts:()=>PNAMES.slice(0,9),get:r=>r.port},{id:'s',label:'Estado',opts:()=>['Activo','Inactivo'],get:r=>r.activo?'Activo':'Inactivo'}],
 kpis:rows=>[['Límites',rows.length,'p'],['Activos',rows.filter(r=>r.activo).length,'g'],['Topes (MAX)',rows.filter(r=>r.eval==='MAX').length,'r'],['Pisos (MIN)',rows.filter(r=>r.eval==='MIN').length,'b']],
 cols:[{h:'Tipo de límite',k:'tipo',sortable:true},{h:'Evaluación',k:'eval',html:r=>badge(r.eval,r.eval==='MAX'?'danger':'info'),txt:r=>r.eval,tip:'MAX: tope que no se puede superar · MIN: piso mínimo a mantener'},{h:'Porcentaje',k:'pct',fmt:v=>pc2(v*100)},{h:'Sublímite',k:'sub'},{h:'Denominador',k:'denom'},{h:'Portafolio',k:'port'},{h:'Creado',k:'fecha',fmt:dstr}],
 rows:()=>LIMITS,estado:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral',true),
 acts:r=>[['ver'],['edit'],r.activo?['off']:['on']],
 toggle:r=>r.activo?{title:'Inactivar límite',danger:true,message:'Vas a inactivar el límite <b>'+esc(r.tipo)+' · '+esc(r.sub)+'</b> de <b>'+esc(r.port)+'</b>. Dejará de evaluarse hasta que lo actives de nuevo.',confirm:'Inactivar',done:'Límite inactivado.',apply:()=>{r.activo=false}}:{title:'Activar límite',message:'¿Deseas activar el límite <b>'+esc(r.tipo)+' · '+esc(r.sub)+'</b>?',confirm:'Activar',done:'Límite activado.',apply:()=>{r.activo=true}},
 detail:r=>[['Tipo de límite',r.tipo],['Valor límite',esc(r.sub)],['Evaluación',r.eval==='MAX'?'MAX (tope)':'MIN (piso)'],['Porcentaje',pc2(r.pct*100)],['Denominador',r.denom],['Portafolio',esc(r.port)],['Creado',dstr(r.fecha)]],detailTitle:r=>'Límite · '+r.tipo,badges:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral'),
 form:row=>({html:'<div class="mk-formgrid">'+selF('tipo','Tipo de límite',Object.keys(SUBLIMITS),row&&row.tipo,{req:true})+selF('sub','Valor límite',row?SUBLIMITS[row.tipo]:[],row&&row.sub,{req:true})+radiosF('eval','Evaluación límite',['MAX','MIN'],row?row.eval:'MAX',{req:true,tip:'MAX: el portafolio no puede superar el porcentaje. MIN: debe mantener al menos ese porcentaje.'})+inpF('pct','Porcentaje',row?(row.pct*100).toString():'',{req:true,ph:'Ej: 30'})+selF('den','Denominador',DENOMS,row&&row.denom,{req:true})+selF('port','Portafolio',PNAMES,row&&row.port,{req:true})+'</div>',
  bind:f=>{$('[name=tipo]',f).addEventListener('change',e=>{const s=$('[name=sub]',f);s.innerHTML='<option value="">Seleccionar</option>'+(SUBLIMITS[e.target.value]||[]).map(x=>'<option>'+esc(x)+'</option>').join('')})},
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[],p=okNum(g('pct'));[['tipo','Tipo de límite'],['sub','Valor límite'],['den','Denominador'],['port','Portafolio']].forEach(x=>{if(!g(x[0]))errs.push([x[0],'Selecciona una opción',x[1]])});if(!p||p>100)errs.push(['pct','Ingresa un porcentaje entre 0 y 100','Porcentaje']);if(errs.length)return {ok:false,errs};return {ok:true,data:{tipo:g('tipo'),sub:g('sub'),eval:rv(f,'eval'),pct:p/100,denom:g('den'),port:g('port'),fecha:row?row.fecha:Date.now(),activo:row?row.activo:true}}}}),
 review:d=>[['Tipo',d.tipo],['Valor límite',d.sub],['Evaluación',d.eval],['Porcentaje',pc2(d.pct*100)],['Denominador',d.denom],['Portafolio',d.port]],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else LIMITS.unshift(o)}
})}
PAGES.limitcfg=limitsPage('Configuración de límites','Define los límites por emisor, calificación, moneda, plazo y otros criterios.');
function evalRows(){return LIMITS.filter(l=>l.activo).map(l=>{const r=rng(hash(l.port+l.tipo+l.sub+l.eval)),demo=(l.port===PNAMES[0]&&l.tipo==='EMISOR'&&l.eval==='MAX'&&Math.abs(l.pct-0.2)<1e-9);let actual,uso,estado;
 if(l.eval==='MAX'){uso=demo?0.92:(hash(l.sub+l.port)%11===0?1.06:0.35+r()*0.5);actual=l.pct*uso;estado=uso>=1?'Incumple':uso>=0.9?'Alerta':'Cumple'}
 else{uso=(hash(l.sub+l.port)%7===0)?0.85:1.08+r()*0.4;actual=l.pct*uso;estado=uso<1?'Incumple':'Cumple'}
 return {port:l.port,tipo:l.tipo,sub:l.sub,eval:l.eval,pct:l.pct,actual,uso,estado}})}
const EST_EV={Cumple:'success',Alerta:'warning',Incumple:'danger'};
PAGES.limiteval=crudPage({title:'Evaluación de límites',help:'Seguimiento del cumplimiento de los límites definidos en Parametrización.',noNew:true,fileName:'evaluacion-limites',defaultSort:'Utilización',defaultDir:-1,searchPh:'Portafolio, tipo o sublímite...',noun:'límites',
 filters:[{id:'p',label:'Portafolio',opts:()=>PNAMES.slice(0,9),get:r=>r.port},{id:'e',label:'Evaluación',opts:()=>['MAX','MIN'],get:r=>r.eval},{id:'s',label:'Estado',opts:()=>['Cumple','Alerta','Incumple'],get:r=>r.estado}],
 kpis:rows=>[['Límites evaluados',rows.length,'p'],['Cumplen',rows.filter(r=>r.estado==='Cumple').length,'g'],['En alerta',rows.filter(r=>r.estado==='Alerta').length,'y'],['Incumplen',rows.filter(r=>r.estado==='Incumple').length,'r']],
 cols:[{h:'Portafolio',k:'port'},{h:'Tipo de límite',k:'tipo'},{h:'Sublímite',k:'sub'},{h:'Evaluación',k:'eval',html:r=>badge(r.eval,r.eval==='MAX'?'danger':'info'),txt:r=>r.eval,tip:'MAX: tope que no se puede superar · MIN: piso mínimo a mantener'},{h:'Límite',k:'pct',fmt:v=>pc2(v*100)},{h:'Posición actual',k:'actual',fmt:v=>pc2(v*100)},{h:'Utilización',k:'uso',sortable:true,tip:'Posición actual dividida por el límite. En alerta desde 90%; incumple al superar el 100% de un tope.',html:r=>'<div style="min-width:110px">'+pc2(r.uso*100)+'<div class="mk-util"><div class="mk-util__b'+(r.estado==='Incumple'?' hi':'')+'" style="width:'+Math.min(100,r.uso*100)+'%"></div></div></div>',txt:r=>pc2(r.uso*100)}],
 rows:evalRows,estado:r=>badge(r.estado,EST_EV[r.estado],true),acts:()=>[['ver']],
 detail:r=>[['Portafolio',esc(r.port)],['Tipo de límite',r.tipo],['Sublímite',esc(r.sub)],['Evaluación',r.eval==='MAX'?'MAX (tope)':'MIN (piso)'],['Límite',pc2(r.pct*100)],['Posición actual',pc2(r.actual*100)],['Utilización',pc2(r.uso*100)],['Estado',r.estado]],detailTitle:r=>'Límite · '+r.tipo,badges:r=>badge(r.estado,EST_EV[r.estado]),
 form:()=>({html:'',read:()=>({ok:false})}),review:()=>[],onSave:()=>{},entity:'',entityArt:'',toggle:()=>({})
});

/* --- Carga de archivos --- */
function fileUp(id){return '<div class="mk-fileupload" data-up="'+id+'" tabindex="0" role="button"><strong>Arrastra los archivos aquí</strong> o haz clic para seleccionarlos<div class="mk-help">CSV o XLSX</div><input type="file" multiple hidden></div><div data-files="'+id+'" class="mk-mt"></div>'}
function bindFile(root){$$('[data-up]',root).forEach(z=>{const inp=$('input',z),list=$('[data-files="'+z.dataset.up+'"]',root);const show=fs=>{if(!fs.length)return;list.innerHTML=[].slice.call(fs).map(f=>'<div class="mk-tagsoft">'+esc(f.name)+' · '+Math.max(1,Math.round(f.size/1024))+' KB</div>').join('');toast(fs.length+' archivo(s) listo(s) para procesar.','success','Archivo cargado')};z.addEventListener('click',()=>inp.click());z.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inp.click()}});inp.addEventListener('change',()=>show(inp.files));['dragover','dragenter'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.add('is-over')}));['dragleave','drop'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.remove('is-over')}));z.addEventListener('drop',e=>show(e.dataTransfer.files))})}
function bindAcc(a){$('.mk-accordion__head',a).addEventListener('click',()=>a.classList.toggle('collapsed'))}

/* =============== Páginas de consulta (Consultar / Limpiar) =============== */
function queryBar(fieldsHTML,canClear){return '<div class="mk-tplfilters mk-filters">'+fieldsHTML+'<button class="mk-btn" data-consult>'+ic('search')+'Consultar</button><button class="mk-btn mk-btn--secondary" data-clear>Limpiar</button></div>'}
function multiSel(id,label,opts,sel,max){return '<div class="mk-field" data-ms="'+id+'"><label class="mk-label"><span>'+label+'</span>'+info('Elige hasta '+max+' métricas para graficar.')+'</label><div class="mk-multiselect"><button type="button" class="mk-msbtn"><span>'+(sel.length?sel.map(k=>opts.find(o=>o[0]===k)[1]).join(', '):'Seleccionar...')+'</span>'+ic('chevron')+'</button><div class="mk-mspanel">'+opts.map(o=>{const on=sel.includes(o[0]);return '<label class="mk-msopt"><input type="checkbox" value="'+o[0]+'"'+(on?' checked':'')+(!on&&sel.length>=max?' disabled':'')+'><span><span class="mk-msopt__n">'+o[1]+'</span></span></label>'}).join('')+'</div></div></div>'}
const GRAPHS=[['macro','Macroactivo'],['sub','Subactivo'],['moneda','Moneda'],['plazo','Plazo'],['clase','Clase de inversión'],['calif','Calificación'],['emisor','Emisor']];
PAGES.graphics=function(view,meta){
 const pg=mountPage(view,meta,'Visor de portafolio','Consulta gráficas interactivas por portafolio.');
 const st={port:FUNDS[1],sel:['calif','emisor','moneda'],done:true};
 const draw=()=>{
  pg.innerHTML=queryBar(fld('Portafolio',  '<div class="mk-combobox"><select class="mk-select" name="port"><option value="">Seleccionar</option>'+PNAMES.map(n=>'<option'+(n===st.port?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select></div>',{req:true,name:'port'})+multiSel('g','Gráficos',GRAPHS,st.sel,3))+'<div id="res"></div>';
  const sel=$('[name=port]',pg);sel.addEventListener('change',()=>{st.port=sel.value;clearErr(sel)});
  const ms=$('[data-ms] .mk-multiselect',pg);$('.mk-msbtn',ms).addEventListener('click',e=>{e.stopPropagation();ms.classList.toggle('open')});$('.mk-mspanel',ms).addEventListener('click',e=>e.stopPropagation());
  $$('input',ms).forEach(c=>c.addEventListener('change',()=>{st.sel=$$('input:checked',ms).map(x=>x.value);const open=true;draw();$('.mk-multiselect',pg).classList.add('open')}));
  $('[data-clear]',pg).addEventListener('click',()=>{st.port='';st.sel=[];st.done=false;draw()});
  $('[data-consult]',pg).addEventListener('click',()=>{if(!st.port){errOn(pg,'port','Selecciona un portafolio para consultar');toast('Selecciona un portafolio.','warning','Falta un dato');return}st.done=true;const r=$('#res',pg);r.innerHTML='<div class="mk-loading"><div class="mk-spinner"></div></div>';setTimeout(result,350)});
  if(st.done)result();else $('#res',pg).innerHTML='<div class="mk-card"><div class="mk-emptybig"><div class="mk-emptybig__ico">'+ic('pie','xl')+'</div><div class="mk-emptybig__t">Aún no hay resultados</div><div class="mk-emptybig__d">Selecciona un portafolio y pulsa Consultar.</div></div></div>';
 };
 function result(){
  const data=holdingsFor(st.port),r=$('#res',pg);
  r.innerHTML='<div class="mk-grid cols-3 mk-mb" id="gc"></div><div id="gt"></div>';
  $('#gc',r).innerHTML=[0,1,2].map(i=>{const k=st.sel[i];if(!k)return '<div class="mk-card" style="border-style:dashed;display:flex;align-items:center;justify-content:center;min-height:200px;box-shadow:none"><span class="mk-help">Selecciona la '+['1ª','2ª','3ª'][i]+' métrica</span></div>';const name=GRAPHS.find(g=>g[0]===k)[1],agg={};data.forEach(h=>{agg[h[k]]=(agg[h[k]]||0)+h.val});const d=Object.keys(agg).map(n=>({name:n,value:agg[n]}));return '<div class="mk-card"><h3 style="margin:0 0 6px;font-size:14px">'+name+'</h3>'+pieSVG(d)+'<div class="mk-accordion collapsed mk-mt"><div class="mk-accordion__head"><span class="mk-accordion__t">Leyendas</span><span class="mk-accordion__chev">&#9662;</span></div><div class="mk-accordion__body" style="max-height:160px;overflow:auto">'+d.map((x,j)=>'<div style="display:flex;gap:8px;margin-bottom:8px"><span style="width:11px;height:11px;border-radius:50%;background:'+PALETTE[j%PALETTE.length]+';margin-top:4px;flex:none"></span><div><div>'+esc(x.name)+'</div><div class="mk-help">'+f0(x.value)+'</div></div></div>').join('')+'</div></div></div>'}).join('');
  $$('.mk-accordion',r).forEach(bindAcc);
  DataTable($('#gt',r),{cols:[{h:'Macroactivo',k:'macro',sortable:true},{h:'Subactivo',k:'sub',sortable:true},{h:'Moneda',k:'moneda',sortable:true},{h:'Plazo',k:'plazo',sortable:true},{h:'Clase de inversión',k:'clase',sortable:true},{h:'Calificación',k:'calif',sortable:true},{h:'Emisor',k:'emisor',sortable:true},{h:'Valoración moneda local',k:'val',fmt:f2,sortable:true}],rows:()=>data,noPage:true,fileName:'visor-portafolio',searchPh:'Filtrar posiciones...',defaultSort:'Macroactivo'});
  const tb=$('#gt',r);const bar=document.createElement('div');bar.className='mk-tplfilters mk-filters';bar.innerHTML='<div class="mk-field mk-field--search"><label class="mk-label">Buscar</label><input class="mk-input" placeholder="Filtrar posiciones..."></div>';
 }
 draw();
};
PAGES.flows=function(view,meta){
 const pg=mountPage(view,meta,'Flujos futuros','Revisa los flujos proyectados por instrumento.');
 const st={port:FUNDS[1],year:'2026',done:true};
 const draw=()=>{
  pg.innerHTML=queryBar(selF('port','Portafolio',FUNDS,st.port,{req:true})+selF('year','Año',['2026','2027','2028','2029','2030'],st.year,{req:true}))+'<div id="res"></div>';
  $('[name=port]',pg).addEventListener('change',e=>st.port=e.target.value);$('[name=year]',pg).addEventListener('change',e=>st.year=e.target.value);bindClear(pg);
  $('[data-clear]',pg).addEventListener('click',()=>{st.port='';st.year='';st.done=false;draw()});
  $('[data-consult]',pg).addEventListener('click',()=>{const errs=[];if(!st.port){errOn(pg,'port');errs.push('Portafolio')}if(!st.year){errOn(pg,'year');errs.push('Año')}if(errs.length){toast('Completa: '+errs.join(', ')+'.','warning','Faltan datos');return}st.done=true;result()});
  if(st.done)result();else $('#res',pg).innerHTML='<div class="mk-card"><div class="mk-emptybig"><div class="mk-emptybig__ico">'+ic('flows','xl')+'</div><div class="mk-emptybig__t">Aún no hay resultados</div><div class="mk-emptybig__d">Elige portafolio y año, y pulsa Consultar.</div></div></div>';
 };
 function result(){const rows=flowsFor(st.port,st.year);DataTable($('#res',pg),{cols:[{h:'Mes',k:'mes'},{h:'Año',k:'anio'},{h:'DESCUENTO',k:'desc',fmt:f2},{h:loc('IBR'),k:'ibr',fmt:f2},{h:'IPC',k:'ipc',fmt:f2},{h:'TASA FIJA',k:'tf',fmt:f2},{h:loc('UVR'),k:'uvr',fmt:f2},{h:loc('DTF'),k:'uf',fmt:f2},{h:'Total Mes',k:'total',fmt:f2},{h:'Acumulado',k:'acum',fmt:f2,tip:'Suma de los flujos desde enero'}],rows:()=>rows,noPage:true,noFilters:true,fileName:'flujos-futuros',noun:'meses'})}
 draw();
};
PAGES.sens=crudPage({title:'Medidas de sensibilidad',help:'Analiza duración, convexidad y DV01.',noNew:true,fileName:'medidas-sensibilidad',searchPh:'Portafolio...',noun:'portafolios',defaultSort:'Portafolio',
 cols:[{h:'Portafolio',k:'port',sortable:true},{h:'Valoración moneda local',k:'val',fmt:f2},{h:'Duración',k:'dur',fmt:f3,tip:'Plazo promedio ponderado de los flujos, en años'},{h:'Duración modificada',k:'mdur',fmt:f3,tip:'Sensibilidad del precio a un cambio de 1% en la tasa'},{h:'Convexidad',k:'conv',fmt:f3,tip:'Curvatura de la relación precio-tasa'},{h:'DV01',k:'dv01',fmt:f3,tip:'Cambio en valor por +1 punto básico de tasa'}],
 rows:()=>SENS,acts:()=>[['ver']],filters:[],kpis:rows=>[['Portafolios',rows.length,'p'],['Duración promedio',f2(rows.reduce((a,r)=>a+r.dur,0)/rows.length),'b'],['DV01 total',f0(rows.reduce((a,r)=>a+r.dv01,0)),'g']],
 detail:r=>[['Portafolio',esc(r.port)],['Valoración moneda local',f2(r.val)],['Duración',f3(r.dur)+' años'],['Duración modificada',f3(r.mdur)],['Convexidad',f3(r.conv)],['DV01',f3(r.dv01)]],detailTitle:r=>r.port,
 form:()=>({html:'',read:()=>({ok:false})}),review:()=>[],onSave:()=>{},entity:'',entityArt:''
});

/* =============== PERFORMANCE ATTRIBUTION =============== */
const MES_TXT=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function paPage(title,help,build,opts){
 opts=opts||{};
 return function(view,meta){
  const pg=mountPage(view,meta,title,help);
  const def=()=>({port:opts.port||FUNDS[1],per:'YTD',mes:'2026-09',lvl:'Macroactivo',tab:opts.tab||0});
  let st=def(),done=true;
  const draw=()=>{
   pg.innerHTML=queryBar(selF('port','Portafolio',FUNDS,st.port,{req:true})+selF('per','Periodo',Object.keys(PERIODS).map(k=>({value:k,label:PERIODS[k].label})),st.per)+(opts.month?fld('Mes de corte','<div class="mk-datepicker"><input class="mk-input" type="month" name="mes" value="'+st.mes+'"></div>',{name:'mes'}):'')+(opts.level?radiosF('lvl','Nivel de análisis',Object.keys(LEVELS),st.lvl):''))+'<div id="res"></div>';
   $('[name=port]',pg).addEventListener('change',e=>{st.port=e.target.value;clearErr(e.target)});$('[name=per]',pg).addEventListener('change',e=>st.per=e.target.value);
   const me=$('[name=mes]',pg);if(me)me.addEventListener('change',()=>st.mes=me.value||st.mes);
   $$('[name=lvl]',pg).forEach(r=>r.addEventListener('change',()=>st.lvl=r.value));
   $('[data-clear]',pg).addEventListener('click',()=>{st=def();st.port='';done=false;draw()});
   $('[data-consult]',pg).addEventListener('click',()=>{if(!st.port){errOn(pg,'port','Selecciona un portafolio para consultar');toast('Selecciona un portafolio.','warning','Falta un dato');return}done=true;const r=$('#res',pg);r.innerHTML='<div class="mk-loading"><div class="mk-spinner"></div></div>';setTimeout(out,300)});
   if(done)out();else $('#res',pg).innerHTML='<div class="mk-card"><div class="mk-emptybig"><div class="mk-emptybig__ico">'+ic('pa','xl')+'</div><div class="mk-emptybig__t">Aún no hay resultados</div><div class="mk-emptybig__d">Elige un portafolio y pulsa Consultar.</div></div></div>';
  };
  const out=()=>build($('#res',pg),st,()=>out());
  draw();
 };
}
function tabsUI(root,tabs,st,render){root.innerHTML='<div class="mk-tabs" role="tablist">'+tabs.map((t,i)=>'<button class="mk-tab'+(i===st.tab?' active':'')+'" data-t="'+i+'" role="tab">'+t+'</button>').join('')+'</div><div class="mk-tabpanel" id="tp"></div>';const show=()=>render(st.tab,$('#tp',root));$$('[data-t]',root).forEach(b=>b.addEventListener('click',()=>{st.tab=+b.dataset.t;$$('[data-t]',root).forEach(x=>x.classList.toggle('active',x===b));show()}));show()}
const endOf=mes=>{const[y,m]=mes.split('-');return new Date(+y,+m,0)};

PAGES.pasummary=paPage('Resumen de desempeño','Rentabilidad, riesgo y comparación contra el benchmark del portafolio.',(r,st)=>{
 const s=perfStats(st.port,st.per,endOf(st.mes)),bn=(BENCH_DEF.filter(b=>b.port===st.port)[0]||{bench:'Benchmark compuesto'}).bench;
 r.innerHTML='<div class="mk-kpis">'+kpiBox('Rentabilidad portafolio','<span class="'+sgnCls(s.rp)+'">'+pcs(s.rp)+'</span>','p')+kpiBox('Rentabilidad benchmark','<span class="'+sgnCls(s.rb)+'">'+pcs(s.rb)+'</span>','b')+kpiBox('Exceso (alpha)','<span class="'+sgnCls(s.ex)+'">'+bps(s.ex)+'</span>','g','Diferencia entre la rentabilidad del portafolio y la de su benchmark')+kpiBox('Tracking error',pct(s.te,2),'','Qué tanto se aleja el portafolio de su benchmark')+kpiBox('Information ratio',f2(s.ir),'y','Exceso de retorno por cada unidad de riesgo activo')+kpiBox('Volatilidad',pct(s.vol,2),'','Variabilidad de los retornos del portafolio')+kpiBox('Sharpe',f2(s.sharpe),'','Retorno sobre la tasa libre de riesgo por unidad de volatilidad')+kpiBox('Máx. drawdown','<span class="neg">'+pct(s.dd,2)+'</span>','r','Mayor caída acumulada desde un máximo')+'</div>'+alertB('info','Datos de ejemplo','Las cifras son ilustrativas y no corresponden a portafolios reales.',true)+'<div class="mk-mt" id="tabs"></div>';
 tabsUI($('#tabs',r),['Evolución','Horizontes'],st,(i,p)=>{if(i===0)p.innerHTML='<div class="mk-card">'+lineSVG(s.series,[{k:'p',n:st.port,c:'#6A1B9A'},{k:'b',n:bn,c:'#64748B'}])+'</div>';else{p.innerHTML='<div id="h"></div>';DataTable($('#h',p),{cols:[{h:'Horizonte',k:'h'},{h:'Portafolio',k:'rp',html:x=>valC(x.rp,pcs(x.rp)),txt:x=>pct(x.rp,2)},{h:'Benchmark',k:'rb',html:x=>valC(x.rb,pcs(x.rb)),txt:x=>pct(x.rb,2)},{h:'Exceso (pb)',k:'ex',html:x=>valC(x.ex,bps(x.ex)),txt:x=>bps(x.ex)}],rows:()=>horizons(st.port),noPage:true,noFilters:true,fileName:'rentabilidad-horizontes'})}});
},{month:true});

PAGES.pabrinson=paPage('Atribución de retorno (Brinson-Fachler)','Explica el exceso de retorno con asignación, selección e interacción.',(r,st)=>{
 const b=brinson(st.port,st.per,st.lvl),sum=k=>b.rows.reduce((a,x)=>a+x[k],0);
 r.innerHTML='<div class="mk-kpis">'+kpiBox('Retorno portafolio',pcs(b.RP),'p')+kpiBox('Retorno benchmark',pcs(b.RB),'b')+kpiBox('Exceso de retorno',valC(b.exc,bps(b.exc)),'g')+kpiBox('Asignación',valC(sum('alloc'),bps(sum('alloc'))),'','Efecto de pesar cada categoría distinto al benchmark')+kpiBox('Selección',valC(sum('sel'),bps(sum('sel'))),'','Efecto de elegir activos que rinden más o menos que el benchmark de la categoría')+kpiBox('Interacción',valC(sum('inter'),bps(sum('inter'))),'','Efecto conjunto de asignación y selección')+'</div><div id="tabs"></div>';
 tabsUI($('#tabs',r),['Efectos','Detalle'],st,(i,p)=>{if(i===0)p.innerHTML='<div class="mk-card"><h3 style="margin:0 0 8px;font-size:14px">Efectos por '+st.lvl.toLowerCase()+'</h3>'+hbarSVG(b.rows,['alloc','sel','inter'],['#6A1B9A','#15803D','#D97706'],['Asignación','Selección','Interacción'])+'</div>';else{const ef=v=>valC(v,bps(v)),col=(h,k,f,tip)=>({h,k,html:x=>f(x[k]),txt:x=>f(x[k]).replace(/<[^>]+>/g,''),tip});p.innerHTML='<div id="d"></div><p class="mk-help mk-mt">Asignación = (Wp − Wb)·(Rb,i − Rb) · Selección = Wb·(Rp,i − Rb,i) · Interacción = (Wp − Wb)·(Rp,i − Rb,i).</p>';DataTable($('#d',p),{cols:[{h:'Categoría',k:'cat'},col('Peso portafolio','wp',v=>pct(v,2)),col('Peso benchmark','wb',v=>pct(v,2)),col('Retorno portafolio','rp',v=>pct(v,2)),col('Retorno benchmark','rb',v=>pct(v,2)),col('Asignación','alloc',ef,'Efecto de sobre/subponderar la categoría'),col('Selección','sel',ef,'Efecto de elegir mejores o peores activos'),col('Interacción','inter',ef),col('Efecto total','tot',ef)],rows:()=>b.rows,noPage:true,noFilters:true,fileName:'atribucion-brinson',totals:rows=>['Total',pct(rows.reduce((a,x)=>a+x.wp,0),2),pct(rows.reduce((a,x)=>a+x.wb,0),2),pct(b.RP,2),pct(b.RB,2),ef(sum('alloc')),ef(sum('sel')),ef(sum('inter')),ef(sum('tot'))]})}});
},{level:true,port:FUNDS[5]});

PAGES.pacontrib=paPage('Contribución por activo','Qué posiciones suman o restan al retorno del portafolio.',(r,st)=>{
 const c=contributions(st.port,st.per),so=c.rows.slice().sort((a,b)=>b.c-a.c),top=so.slice(0,5),bot=so.slice(-5).reverse();
 const bars=(arr,pos)=>hbarSVG(arr.map(x=>({cat:x.instr.length>26?x.instr.slice(0,25)+'…':x.instr,c:x.c})),['c'],[pos?'#15803D':'#DC2626'],[pos?'Contribución positiva':'Contribución negativa']);
 r.innerHTML='<div class="mk-kpis">'+kpiBox('Retorno total',pcs(c.T),'p')+kpiBox('Posiciones',c.rows.length,'b')+kpiBox('Mayor contribuyente','<span class="pos">'+bps(top[0].c)+'</span>','g','Contribución = peso promedio × retorno de la posición')+kpiBox('Mayor detractor',valC(bot[0].c,bps(bot[0].c)),'r')+'</div><div class="mk-cols2 mk-mb"><div class="mk-card"><h3 style="margin:0 0 6px;font-size:14px">Top 5 contribuyentes</h3>'+bars(top,true)+'</div><div class="mk-card"><h3 style="margin:0 0 6px;font-size:14px">Top 5 detractores</h3>'+bars(bot,false)+'</div></div><div id="t"></div>';
 const det=x=>{const m=openModal({title:'Detalle de la posición',body:'<div class="mk-formgrid">'+fdRow('Posición',esc(x.instr))+fdRow('Emisor',esc(x.emisor))+fdRow('Macroactivo',x.macro)+fdRow('Peso promedio',pct(x.w,2))+fdRow('Retorno',pcs(x.ret))+fdRow('Contribución',bps(x.c))+fdRow('% del retorno total',pct(x.share,1))+'</div>',foot:'<button class="mk-btn mk-btn--secondary" data-c>Cerrar</button>'});$('[data-c]',m.el).addEventListener('click',m.close)};
 DataTable($('#t',r),{cols:[{h:'Posición',k:'instr',sortable:true},{h:'Emisor',k:'emisor'},{h:'Macroactivo',k:'macro',html:x=>badge(x.macro,x.macro==='RENTA FIJA'?'success':'warning'),txt:x=>x.macro},{h:'Peso promedio',k:'w',fmt:v=>pct(v,2),sortable:true},{h:'Retorno',k:'ret',html:x=>valC(x.ret,pcs(x.ret)),txt:x=>pct(x.ret,2),sortable:true},{h:'Contribución',k:'c',html:x=>valC(x.c,bps(x.c)),txt:x=>bps(x.c),sortable:true,tip:'Peso × retorno, en puntos básicos'},{h:'% del retorno total',k:'share',fmt:v=>pct(v,1),sortable:true}],rows:()=>c.rows,acts:()=>[['ver']],onAct:(a,x)=>det(x),searchPh:'Posición o emisor...',pageSize:10,fileName:'contribucion-activos',defaultSort:'Contribución',defaultDir:-1,noun:'posiciones'});
},{port:FUNDS[0]});

PAGES.pafixed=paPage('Atribución de renta fija','Descompone el exceso de retorno de la cartera de renta fija.',(r,st)=>{
 const a=fiAttr(st.port,st.per),ef=v=>valC(v,bps(v));
 r.innerHTML='<div class="mk-kpis">'+kpiBox('Retorno renta fija',pcs(a.rp),'p')+kpiBox('Retorno benchmark',pcs(a.rb),'b')+kpiBox('Exceso de retorno',ef(a.exc),'g')+kpiBox('Duración (años)',f2(a.dur[0])+' vs '+f2(a.dur[1]),'','Portafolio frente a su benchmark')+'</div><div class="mk-card mk-mb"><h3 style="margin:0 0 6px;font-size:14px">Descomposición del exceso de retorno</h3>'+waterfallSVG(a.comps,a.exc,'Exceso total')+'</div><div class="mk-cols2"><div class="mk-card"><h3 style="margin:0 0 8px;font-size:14px">Efectos por factor</h3><div id="f"></div></div><div class="mk-card"><h3 style="margin:0 0 8px;font-size:14px">Posicionamiento vs. benchmark</h3><div id="p"></div></div></div>';
 DataTable($('#f',r),{cols:[{h:'Factor',k:'n'},{h:'Efecto',k:'v',html:x=>ef(x.v),txt:x=>bps(x.v)}],rows:()=>a.comps,noPage:true,noFilters:true,noTools:true,noFoot:true,totals:()=>['Exceso total',ef(a.exc)]});
 DataTable($('#p',r),{cols:[{h:'Métrica',k:'m'},{h:'Portafolio',k:'p'},{h:'Benchmark',k:'b'},{h:'Diferencia',k:'d'}],rows:()=>[{m:'Duración modificada (años)',p:f2(a.dur[0]),b:f2(a.dur[1]),d:(a.dur[0]-a.dur[1]>=0?'+':'')+f2(a.dur[0]-a.dur[1])},{m:'Spread promedio (pb)',p:f1(a.spr[0]),b:f1(a.spr[1]),d:(a.spr[0]-a.spr[1]>=0?'+':'')+f1(a.spr[0]-a.spr[1])},{m:'Yield to maturity',p:pct(a.ytm[0],2),b:pct(a.ytm[1],2),d:(a.ytm[0]-a.ytm[1]>=0?'+':'')+pct(a.ytm[0]-a.ytm[1],2)}],noPage:true,noFilters:true,noTools:true,noFoot:true});
});

/* --- Benchmarks (Crear / Ver / Editar / Inactivar) --- */
BENCH_DEF.forEach((b,i)=>{if(b.activo===undefined)b.activo=(i!==6)});
PAGES.pabench=crudPage({title:'Benchmarks',help:'Composición del benchmark de cada portafolio.',apoya:APO.bench,entity:'componente de benchmark',entityArt:'El componente',fileName:'benchmarks',defaultSort:'Portafolio',searchPh:'Portafolio, benchmark o índice...',noun:'componentes',
 filters:[{id:'p',label:'Portafolio',opts:()=>FUNDS,get:r=>r.port},{id:'e',label:'Estado',opts:()=>['Vigente','Inactivo'],get:r=>r.activo?'Vigente':'Inactivo'}],
 kpis:rows=>[['Componentes',rows.length,'p'],['Vigentes',rows.filter(r=>r.activo).length,'g'],['Portafolios con benchmark',new Set(rows.map(r=>r.port)).size,'b']],
 cols:[{h:'Portafolio',k:'port',sortable:true},{h:'Benchmark',k:'bench'},{h:'Componente (índice)',k:'comp'},{h:'Peso',k:'peso',fmt:v=>pct(v,0)},{h:'Vigente desde',k:'desde',fmt:fmtD}],
 rows:()=>BENCH_DEF,estado:r=>badge(r.activo?'Vigente':'Inactivo',r.activo?'success':'neutral',true),acts:r=>[['ver'],['edit'],r.activo?['off']:['on']],
 toggle:r=>r.activo?{title:'Inactivar componente',danger:true,message:'Vas a inactivar <b>'+esc(r.comp)+'</b> del benchmark <b>'+esc(r.bench)+'</b>. Dejará de usarse en el cálculo del desempeño.',confirm:'Inactivar',done:'Componente inactivado.',apply:()=>{r.activo=false}}:{title:'Activar componente',message:'¿Deseas activar <b>'+esc(r.comp)+'</b> en el benchmark <b>'+esc(r.bench)+'</b>?',confirm:'Activar',done:'Componente activado.',apply:()=>{r.activo=true}},
 detail:r=>[['Portafolio',esc(r.port)],['Benchmark',esc(r.bench)],['Componente',esc(r.comp)],['Peso',pct(r.peso,0)],['Vigente desde',fmtD(r.desde)]],detailTitle:r=>r.bench,badges:r=>badge(r.activo?'Vigente':'Inactivo',r.activo?'success':'neutral'),
 extra:pg=>{const x=document.createElement('div');x.className='mk-accordion collapsed mk-mt';x.innerHTML='<div class="mk-accordion__head"><span class="mk-accordion__ico">'+ic('upload')+'</span><span><span class="mk-accordion__t">Importar composición de benchmarks</span><span class="mk-accordion__d">Archivo con portafolio, índice, peso y fecha de vigencia</span></span><span class="mk-accordion__chev">&#9662;</span></div><div class="mk-accordion__body">'+fileUp('bench-up')+'</div>';pg.appendChild(x);bindAcc(x);bindFile(x)},
 form:row=>({html:'<div class="mk-formgrid">'+selF('port','Portafolio',FUNDS,row&&row.port,{req:true})+inpF('bench','Nombre del benchmark',row&&row.bench,{req:true})+selF('comp','Componente (índice)',BENCH_COMPS,row&&row.comp,{req:true})+inpF('peso','Peso (%)',row?row.peso*100:'',{req:true,ph:'Ej: 40',tip:'Los pesos de un mismo benchmark deben sumar 100%.'})+dateF('desde','Vigente desde',row&&row.desde,{req:true})+'</div>',
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[],pw=okNum(g('peso'));if(!g('port'))errs.push(['port','Selecciona un portafolio','Portafolio']);if(!g('bench'))errs.push(['bench','Indica el nombre','Benchmark']);if(!g('comp'))errs.push(['comp','Selecciona el índice','Componente']);if(!pw||pw>100)errs.push(['peso','Ingresa un peso entre 0 y 100','Peso']);const d=fromIso(g('desde'));if(!d)errs.push(['desde','Indica la fecha de vigencia','Vigencia']);if(errs.length)return {ok:false,errs};return {ok:true,data:{port:g('port'),bench:g('bench'),comp:g('comp'),peso:pw/100,desde:d,activo:row?row.activo:true}}}}),
 review:d=>[['Portafolio',d.port],['Benchmark',d.bench],['Componente',d.comp],['Peso',pct(d.peso,0)],['Vigente desde',fmtD(d.desde)]],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else BENCH_DEF.unshift(o)}
});

/* --- Reportes --- */
PAGES.pareports=crudPage({title:'Reportes de desempeño',help:'Genera y descarga los informes de desempeño.',noNew:true,fileName:'reportes-performance',searchPh:'Nombre del reporte...',noun:'reportes',defaultSort:'Reporte',
 filters:[{id:'per',label:'Periodicidad',opts:()=>['Mensual','Trimestral'],get:r=>r.per}],
 cols:[{h:'Reporte',k:'n',sortable:true},{h:'Periodicidad',k:'per'},{h:'Último generado',k:'ult',fmt:dstr}],
 rows:()=>REPORTS,acts:()=>[['ver'],['gen','Generar reporte']],estado:r=>badge(r.est,r.est==='Generado'?'success':r.est==='Pendiente'?'warning':'info',true),
 kpis:rows=>[['Reportes',rows.length,'p'],['Generados',rows.filter(r=>r.est==='Generado').length,'g'],['Pendientes',rows.filter(r=>r.est==='Pendiente').length,'y'],['En revisión',rows.filter(r=>r.est==='En revisión').length,'b']],
 detail:r=>[['Reporte',esc(r.n)],['Periodicidad',r.per],['Último generado',dstr(r.ult)],['Estado',r.est]],detailTitle:r=>r.n,
 onAct:(a,r)=>{if(a==='gen')wizard(r.n)},
 form:()=>({html:'',read:()=>({ok:false})}),review:()=>[],onSave:()=>{},entity:'',entityArt:'',toggle:()=>({})
});
function wizard(name){
 const st={step:0,port:FUNDS[1],per:'YTD',mes:'2026-09',fmt:'Excel',p:0},steps=[['Parámetros','Portafolio y periodo'],['Revisión','Confirma los datos'],['Generación','Preparando el archivo']];
 const m=openModal({title:'Generar reporte',cls:'mk-modal--wizard',sticky:true,sub:esc(name),body:'',foot:''});
 const wiz=()=>'<div class="mk-wizsteps">'+steps.map((s,i)=>(i?'<div class="mk-wizline'+(i<=st.step?' done':'')+'"></div>':'')+'<div class="mk-wizstep'+(i===st.step?' on':i<st.step?' done':'')+'"><div class="mk-wizstep__n">'+(i<st.step?'✓':i+1)+'</div><div class="mk-wizstep__t">'+s[0]+'</div><div class="mk-wizstep__d">'+s[1]+'</div></div>').join('')+'</div>';
 const render=()=>{let b='',ft='';
  if(st.step===0){b=wiz()+'<div class="mk-wizpanel"><div class="mk-formgrid">'+selF('w-port','Portafolio',FUNDS,st.port,{req:true})+selF('w-per','Periodo',Object.keys(PERIODS).map(k=>({value:k,label:PERIODS[k].label})),st.per)+fld('Mes de corte','<input class="mk-input" type="month" name="w-mes" value="'+st.mes+'">')+radiosF('w-fmt','Formato',['Excel','CSV'],st.fmt)+'</div></div>';ft='<div class="mk-wizfoot" style="width:100%;padding:0"><button class="mk-btn mk-btn--secondary" data-c>Cancelar</button><button class="mk-btn" data-n>Siguiente</button></div>'}
  else if(st.step===1){b=wiz()+'<div class="mk-wizpanel"><div class="mk-formgrid">'+fdRow('Reporte',esc(name))+fdRow('Portafolio',esc(st.port))+fdRow('Periodo',PERIODS[st.per].label)+fdRow('Mes de corte',MES_TXT[+st.mes.split('-')[1]-1]+' '+st.mes.split('-')[0])+fdRow('Formato',st.fmt)+'</div></div><div class="mk-mt">'+alertB('info','','Revisa los parámetros. El archivo se descargará en tu equipo.')+'</div>';ft='<div class="mk-wizfoot" style="width:100%;padding:0"><button class="mk-btn mk-btn--secondary" data-b>Atrás</button><button class="mk-btn" data-n>Generar</button></div>'}
  else{b=wiz()+'<div class="mk-wizpanel"><div class="mk-progress"><div class="mk-progress__bar" style="width:'+st.p+'%"></div></div><p class="mk-help mk-mt">'+(st.p<100?'Generando el reporte… '+st.p+'%':'Reporte listo para descargar.')+'</p></div>';ft=st.p<100?'<button class="mk-btn" disabled>Generando…</button>':'<button class="mk-btn mk-btn--secondary" data-c>Cerrar</button><button class="mk-btn" data-d>'+ic('download')+'Descargar</button>'}
  m.body.innerHTML=b;m.foot.innerHTML=ft;
  $$('[name="w-port"]',m.el).forEach(s=>s.addEventListener('change',()=>st.port=s.value));$$('[name="w-per"]',m.el).forEach(s=>s.addEventListener('change',()=>st.per=s.value));$$('[name="w-mes"]',m.el).forEach(s=>s.addEventListener('change',()=>st.mes=s.value||st.mes));$$('[name="w-fmt"]',m.el).forEach(s=>s.addEventListener('change',()=>st.fmt=s.value));
 };
 m.el.addEventListener('click',e=>{
  if(e.target.closest('[data-c]')){m.close();return}
  if(e.target.closest('[data-b]')){st.step--;render();return}
  if(e.target.closest('[data-n]')){if(st.step===0&&!st.port){toast('Selecciona un portafolio.','warning');return}st.step++;if(st.step===2){st.p=0;render();const t=setInterval(()=>{st.p=Math.min(100,st.p+20);if(!m.el.isConnected){clearInterval(t);return}render();if(st.p>=100)clearInterval(t)},350)}else render();return}
  if(e.target.closest('[data-d]')){const cols=[{h:'Portafolio',k:'p'},{h:'Rentabilidad',k:'r'},{h:'Benchmark',k:'b'},{h:'Exceso (pb)',k:'e'}];const rows=FUNDS.map(p=>{const s=perfStats(p,st.per,endOf(st.mes));return {p,r:pct(s.rp,2),b:pct(s.rb,2),e:bps(s.ex)}});const base=name.replace(/[^\w]+/g,'-').toLowerCase();download(base+(st.fmt==='Excel'?'.xls':'.csv'),st.fmt==='Excel'?toXLS(cols,rows):toCSV(cols,rows),st.fmt==='Excel'?'application/vnd.ms-excel':'text/csv;charset=utf-8');toast(esc(name),'success','Reporte descargado');m.close()}
 });
 render();
}


/* =============== PARAMETRIZACIÓN =============== */
const PORTS=PORTFOLIOS.map((p,i)=>({name:p.name,tipo:(i>=9?'Cliente':(i>=2&&i<=4)?'Mandato delegado':'FIC'),moneda:'COP',inicio:mkDate(2019+(i%5),(i*3)%12,1+(i*2)%25).getTime(),activo:i!==12}));
const isFund=r=>r.tipo==='FIC'||r.tipo==='Fondo mutuo'||r.tipo==='Fondo abierto';
function benchOf(n){const b=BENCH_DEF.find(x=>x.port===n);return b?b.bench:'—'}
PAGES.pport=crudPage({title:'Portafolios',help:'Fondos, mandatos y clientes sobre los que se opera.',apoya:APO.port,entity:'portafolio',entityArt:'El portafolio',fileName:'portafolios',defaultSort:'Portafolio',searchPh:'Nombre del portafolio...',noun:'portafolios',
 filters:[{id:'t',label:'Tipo',opts:()=>LOCL(['FIC','Mandato delegado','Cliente']),get:r=>r.tipo},{id:'e',label:'Estado',opts:()=>['Activo','Inactivo'],get:r=>r.activo?'Activo':'Inactivo'}],
 kpis:rows=>[['Portafolios',rows.length,'p'],[loc('FIC'),rows.filter(isFund).length,'b'],['Mandatos delegados',rows.filter(r=>r.tipo==='Mandato delegado').length,'y'],['Clientes',rows.filter(r=>r.tipo==='Cliente').length,'g']],
 cols:[{h:'Portafolio',k:'name',sortable:true},{h:'Tipo',k:'tipo',html:r=>badge(r.tipo,isFund(r)?'info':r.tipo==='Cliente'?'success':'warning'),txt:r=>r.tipo},{h:'Moneda base',k:'moneda'},{h:'Fecha de inicio',k:'inicio',fmt:fmtD},{h:'Benchmark',html:r=>esc(benchOf(r.name)),txt:r=>benchOf(r.name)}],
 rows:()=>PORTS,estado:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral',true),acts:r=>[['ver'],['edit'],r.activo?['off']:['on']],
 toggle:r=>r.activo?{title:'Inactivar portafolio',danger:true,message:'Vas a inactivar <b>'+esc(r.name)+'</b>. No podrá seleccionarse en nuevas órdenes; las posiciones y órdenes vigentes no se modifican.',confirm:'Inactivar',done:'Portafolio inactivado.',apply:()=>{r.activo=false}}:{title:'Activar portafolio',message:'¿Deseas activar <b>'+esc(r.name)+'</b> para operar?',confirm:'Activar',done:'Portafolio activado.',apply:()=>{r.activo=true}},
 detail:r=>[['Portafolio',esc(r.name)],['Tipo',r.tipo],['Moneda base',r.moneda],['Fecha de inicio',fmtD(r.inicio)],['Benchmark',esc(benchOf(r.name))]],detailTitle:r=>r.name,badges:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral'),
 form:row=>({html:'<div class="mk-formgrid">'+inpF('name','Nombre del portafolio',row&&row.name,{req:true})+selF('tipo','Tipo',LOCL(['FIC','Mandato delegado','Cliente']),row&&row.tipo,{req:true})+selF('moneda','Moneda base',['COP','USD'],row?row.moneda:'COP',{req:true})+dateF('inicio','Fecha de inicio',row&&row.inicio,{req:true})+'</div>',
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[];if(!g('name'))errs.push(['name','Indica el nombre','Nombre']);if(!g('tipo'))errs.push(['tipo','Selecciona el tipo','Tipo']);if(!g('moneda'))errs.push(['moneda','Selecciona la moneda','Moneda']);const d=fromIso(g('inicio'));if(!d)errs.push(['inicio','Indica la fecha de inicio','Fecha de inicio']);if(errs.length)return {ok:false,errs};return {ok:true,data:{name:g('name'),tipo:g('tipo'),moneda:g('moneda'),inicio:d,activo:row?row.activo:true}}}}),
 review:d=>[['Portafolio',d.name],['Tipo',d.tipo],['Moneda base',d.moneda],['Fecha de inicio',fmtD(d.inicio)]],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else{PORTS.unshift(o);if(!PNAMES.includes(o.name))PNAMES.push(o.name)}}
});
const INDICES=[['IBR 1M','Indicador Bancario de Referencia a 1 mes','Tasa','Banco de la República'],['IBR 3M','Indicador Bancario de Referencia a 3 meses','Tasa','Banco de la República'],['DTF 90D','Depósito a Término Fijo a 90 días','Tasa','Banco de la República'],['Índice TES Corto','Índice de TES de corto plazo','Renta fija','Bolsa de Valores de Colombia'],['Índice TES Largo','Índice de TES de largo plazo','Renta fija','Bolsa de Valores de Colombia'],['Índice Corporativos AAA','Bonos corporativos con calificación AAA','Renta fija','Bolsa de Valores de Colombia'],['COLCAP','Índice de capitalización bursátil','Renta variable','Bolsa de Valores de Colombia'],['MSCI ACWI','Acciones globales, mercados desarrollados y emergentes','Renta variable','MSCI'],['Bloomberg Global Aggregate','Renta fija global grado de inversión','Renta fija','Bloomberg'],['IPC + 3%','Inflación más 3 puntos porcentuales','Tasa','DANE']].map((a,i)=>({code:a[0],nombre:a[1],tipo:a[2],fuente:a[3],activo:i!==8}));
PAGES.pindex=crudPage({title:'Índices de referencia',help:'Índices que componen los benchmarks de los portafolios.',apoya:APO.index,entity:'índice',entityArt:'El índice',fileName:'indices',defaultSort:'Código',searchPh:'Código, nombre o fuente...',noun:'índices',
 filters:[{id:'t',label:'Tipo',opts:()=>['Tasa','Renta fija','Renta variable'],get:r=>r.tipo},{id:'e',label:'Estado',opts:()=>['Activo','Inactivo'],get:r=>r.activo?'Activo':'Inactivo'}],
 kpis:rows=>[['Índices',rows.length,'p'],['Activos',rows.filter(r=>r.activo).length,'g'],['De tasa',rows.filter(r=>r.tipo==='Tasa').length,'b'],['De mercado',rows.filter(r=>r.tipo!=='Tasa').length,'y']],
 cols:[{h:'Código',k:'code',sortable:true},{h:'Nombre',k:'nombre'},{h:'Tipo',k:'tipo'},{h:'Fuente',k:'fuente'}],
 rows:()=>INDICES,estado:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral',true),acts:r=>[['ver'],['edit'],r.activo?['off']:['on']],
 toggle:r=>r.activo?{title:'Inactivar índice',danger:true,message:'Vas a inactivar <b>'+esc(r.code)+'</b>. No podrá elegirse en nuevos benchmarks; los benchmarks que ya lo usan no cambian.',confirm:'Inactivar',done:'Índice inactivado.',apply:()=>{r.activo=false}}:{title:'Activar índice',message:'¿Deseas activar <b>'+esc(r.code)+'</b>?',confirm:'Activar',done:'Índice activado.',apply:()=>{r.activo=true}},
 detail:r=>[['Código',esc(r.code)],['Nombre',esc(r.nombre)],['Tipo',r.tipo],['Fuente',esc(r.fuente)]],detailTitle:r=>r.code,badges:r=>badge(r.activo?'Activo':'Inactivo',r.activo?'success':'neutral'),
 form:row=>({html:'<div class="mk-formgrid">'+inpF('code','Código',row&&row.code,{req:true})+selF('tipo','Tipo',['Tasa','Renta fija','Renta variable'],row&&row.tipo,{req:true})+inpF('nombre','Nombre',row&&row.nombre,{req:true,cls:'span2'})+inpF('fuente','Fuente',row&&row.fuente)+'</div>',
  read:f=>{const g=n=>$('[name="'+n+'"]',f).value.trim(),errs=[];if(!g('code'))errs.push(['code','Indica el código','Código']);if(!g('nombre'))errs.push(['nombre','Indica el nombre','Nombre']);if(!g('tipo'))errs.push(['tipo','Selecciona el tipo','Tipo']);if(errs.length)return {ok:false,errs};return {ok:true,data:{code:g('code'),nombre:g('nombre'),tipo:g('tipo'),fuente:g('fuente'),activo:row?row.activo:true}}}}),
 review:d=>[['Código',d.code],['Nombre',d.nombre],['Tipo',d.tipo],['Fuente',d.fuente||'—']],
 onSave:(o,row)=>{if(row)Object.assign(row,o);else{INDICES.unshift(o);if(!BENCH_COMPS.includes(o.code))BENCH_COMPS.push(o.code)}}
});
PAGES.pcat=function(view,meta){
 const pg=mountPage(view,meta,'Catálogos','Emisores, calificaciones, monedas y tipos de límite.');
 const st={tab:0};
 const CATS=[
  ['Emisores',[{h:'Emisor',k:'n'},{h:'Sector',k:'s'},{h:'Calificación',k:'c'},{h:'País',k:'p'}],[['ECOPETROL S.A.','Energía','AAA','Colombia'],['BANCOLOMBIA S.A.','Financiero','AAA','Colombia'],['BANCO DAVIVIENDA','Financiero','AAA','Colombia'],['BANCO DE BOGOTÁ','Financiero','AAA','Colombia'],['GRUPO SURA','Holding','AA+','Colombia'],['ISA S.A. E.S.P.','Energía','AAA','Colombia'],['FINDETER','Fomento','AAA','Colombia'],['TITULARIZADORA COLOMBIANA','Financiero','AAA','Colombia'],['COLPENSIONES','Seguridad social','AAA','Colombia'],['CEMENTOS ARGOS','Industrial','AA+','Colombia'],['MINISTERIO DE HACIENDA (TES)','Gobierno','AAA','Colombia']].map(a=>({n:a[0],s:a[1],c:a[2],p:a[3]}))],
  ['Calificaciones',[{h:'Calificación',k:'c'},{h:'Grado',k:'g'},{h:'Descripción',k:'d'}],[['AAA','Grado de inversión','Capacidad de pago excepcional'],['AA+','Grado de inversión','Capacidad de pago muy alta'],['AA','Grado de inversión','Capacidad de pago muy alta'],['AA-','Grado de inversión','Capacidad de pago muy alta'],['A','Grado de inversión','Capacidad de pago alta'],['A-','Grado de inversión','Capacidad de pago alta'],['BBB','Grado de inversión','Capacidad de pago adecuada']].map(a=>({c:a[0],g:a[1],d:a[2]}))],
  ['Monedas',[{h:'Código',k:'c'},{h:'Moneda',k:'n'},{h:'Uso',k:'u'}],[['COP','Peso colombiano','Moneda base'],['USD','Dólar estadounidense','Inversiones internacionales'],['EUR','Euro','Inversiones internacionales'],['UVR','Unidad de Valor Real','Títulos indexados a la inflación']].map(a=>({c:a[0],n:a[1],u:a[2]}))],
  ['Tipos de límite',[{h:'Tipo de límite',k:'t'},{h:'Valores posibles',k:'v'}],Object.keys(SUBLIMITS).map(k=>({t:k,v:SUBLIMITS[k].join(', ')})).concat(DENOMS.map(d=>({t:'Denominador',v:d})))]
 ];
 CATS[0][2].forEach(o=>{Object.keys(o).forEach(k=>{o[k]=loc(o[k])})});CATS[2][2]=CURR[S.pais].map(a=>({c:a[0],n:a[1],u:a[2]}));
 pg.innerHTML=alertB('info','Catálogos de consulta','Estos catálogos se administran en los módulos transversales de la plataforma (Emisores, Precios). Aquí solo se consultan para evitar duplicar la información.',true)+'<div class="mk-tabs mk-mt" role="tablist">'+CATS.map((c,i)=>'<button class="mk-tab'+(i===0?' active':'')+'" data-t="'+i+'" role="tab">'+c[0]+'</button>').join('')+'</div><div class="mk-tabpanel" id="cp"></div>';
 const show=()=>{const c=CATS[st.tab];$('#cp',pg).innerHTML=apoyaHTML(APO.cat[st.tab])+'<div id="ct"></div>';DataTable($('#ct',pg),{cols:c[1],rows:()=>c[2],noPage:true,fileName:'catalogo-'+c[0].toLowerCase().replace(/\s+/g,'-'),searchPh:'Buscar...',noun:'registros'})};
 $$('[data-t]',pg).forEach(b=>b.addEventListener('click',()=>{st.tab=+b.dataset.t;$$('[data-t]',pg).forEach(x=>x.classList.toggle('active',x===b));show()}));
 show();
};
PAGES.pflow=function(view,meta){
 const pg=mountPage(view,meta,'Flujo de órdenes','Estados de una orden y las acciones permitidas en cada uno.');
 pg.insertAdjacentHTML('beforebegin',apoyaHTML(APO.flow));
 const ST=[['R','Registrada','info','La orden se captura y queda pendiente de completar.'],['C','Complementación','warning','Se completa la información faltante (tasa, valor giro, contraparte).'],['F','Finalizada','success','La orden queda cerrada; solo se consulta.'],['A','Anulada','danger','La orden se cancela antes de finalizar; no se puede deshacer.']];
 const box=(s,w)=>'<div style="flex:1;min-width:'+(w||170)+'px;border:1px solid var(--mk-border);border-radius:10px;padding:14px;background:#fff;text-align:center"><div>'+badge(s[1],s[2],true)+'</div><div class="mk-help" style="margin-top:8px">'+s[3]+'</div></div>';
 const arrow=c=>'<div style="display:flex;align-items:center;color:var(--mk-primary);font-size:24px;font-weight:700">'+c+'</div>';
 pg.innerHTML='<div class="mk-subhead">'+ic('flows')+'Ciclo de vida de una orden</div><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:stretch">'+box(ST[0])+arrow('→')+box(ST[1])+arrow('→')+box(ST[2])+'</div><div style="display:flex;gap:12px;margin-top:12px;align-items:center;flex-wrap:wrap"><span class="mk-help">Desde Registrada o Complementación también se puede anular:</span>'+arrow('→')+'<div style="width:260px">'+box(ST[3],200)+'</div></div><div class="mk-subhead mk-mt">'+ic('check')+'Acciones permitidas por estado</div><div id="ft"></div>'+alertB('warning','Supuestos del prototipo','Los estados y las transiciones son una propuesta para validar con el área de inversiones. Finalizada y Anulada son estados terminales y solo admiten consulta.',false);
 const Y='<span class="pos">Sí</span>',N='<span class="mk-na">No</span>';
 const rows=[['Registrada',Y,Y,Y,'Complementación, Anulada'],['Complementación',Y,Y,Y,'Finalizada, Anulada'],['Finalizada',Y,N,N,'—'],['Anulada',Y,N,N,'—']].map(a=>({e:a[0],v:a[1],ed:a[2],an:a[3],sig:a[4]}));
 const strip=h=>h.replace(/<[^>]+>/g,'');
 DataTable($('#ft',pg),{cols:[{h:'Estado',k:'e',html:r=>badge(r.e,r.e==='Registrada'?'info':r.e==='Complementación'?'warning':r.e==='Finalizada'?'success':'danger',true),txt:r=>r.e},{h:'Ver detalle',k:'v',html:r=>r.v,txt:r=>strip(r.v)},{h:'Editar',k:'ed',html:r=>r.ed,txt:r=>strip(r.ed)},{h:'Anular',k:'an',html:r=>r.an,txt:r=>strip(r.an)},{h:'Siguiente estado',k:'sig'}],rows:()=>rows,noPage:true,noFilters:true,noTools:true,noFoot:true});
};


/* =============== País: datos de ejemplo por país =============== */
const CURR={
 'Colombia':[['COP','Peso colombiano','Moneda base'],['USD','Dólar estadounidense','Inversiones internacionales'],['EUR','Euro','Inversiones internacionales'],['UVR','Unidad de Valor Real','Títulos indexados a la inflación']],
 'Chile':[['CLP','Peso chileno','Moneda base'],['USD','Dólar estadounidense','Inversiones internacionales'],['EUR','Euro','Inversiones internacionales'],['UF','Unidad de Fomento','Títulos indexados a la inflación']],
 'República Dominicana':[['DOP','Peso dominicano','Moneda base'],['USD','Dólar estadounidense','Inversiones internacionales'],['EUR','Euro','Inversiones internacionales']]
};
const TIPOS_P={'Colombia':['DESCUENTO','IBR','IPC','TASA FIJA','UVR','DTF'],'Chile':['DESCUENTO','TAB','IPC','TASA FIJA','UF','TPM'],'República Dominicana':['DESCUENTO','TASA REFERENCIA','IPC','TASA FIJA','TASA VARIABLE','TPM']};
const MON_P={'Colombia':['COP','UVR','USD','EUR'],'Chile':['CLP','UF','USD','EUR'],'República Dominicana':['DOP','USD','EUR']};
const TIPOS=()=>TIPOS_P[S.pais].slice(),MONEDAS=()=>MON_P[S.pais].slice();
const CTRY={
 'Chile':{
  m:[['MINISTERIO DE HACIENDA (TES)','TESORERÍA GENERAL DE LA REPÚBLICA'],['BANCO DE LA REPÚBLICA','BANCO CENTRAL DE CHILE'],['FIDUCIARIA BANCOLOMBIA','ADMINISTRADORA GENERAL DE FONDOS SURA'],['BANCOLOMBIA S.A.','BANCO SANTANDER CHILE'],['BANCO DAVIVIENDA','BANCO DE CHILE'],['BANCO DE BOGOTÁ','BANCO BCI'],['ECOPETROL S.A.','EMPRESAS COPEC S.A.'],['ISA S.A. E.S.P.','ENEL CHILE S.A.'],['GRUPO SURA','FALABELLA S.A.'],['TITULARIZADORA COLOMBIANA','BANCOESTADO'],['FINDETER','CORFO'],['COLPENSIONES','AFP HABITAT'],['CEMENTOS ARGOS','CMPC S.A.'],['Bolsa de Valores de Colombia','Bolsa de Comercio de Santiago'],['Banco de la República','Banco Central de Chile'],['DANE','INE'],['Índice de TES de corto plazo','Índice de bonos del Gobierno de corto plazo'],['Índice de TES de largo plazo','Índice de bonos del Gobierno de largo plazo'],['Índice TES Corto','Índice Bonos Gobierno Corto'],['Índice TES Largo','Índice Bonos Gobierno Largo'],['de TES','de bonos del Gobierno'],['Índice de capitalización bursátil','Índice de precios selectivo de acciones'],['COLCAP','IPSA'],['Indicador Bancario de Referencia a 1 mes','Tasa Activa Bancaria a 30 días'],['Indicador Bancario de Referencia a 3 meses','Tasa Activa Bancaria a 90 días'],['Depósito a Término Fijo a 90 días','Tasa de Política Monetaria'],['IBR 1M','TAB 30D'],['IBR 3M','TAB 90D'],['DTF 90D','TPM'],['Benchmark FIC','Benchmark Fondo Mutuo'],['FIC ','FONDO MUTUO '],['"FIC"','"Fondo mutuo"'],['"IBR"','"TAB"'],['"DTF"','"TPM"'],['"UVR"','"UF"'],['"COP"','"CLP"'],['TFIT','BTU'],['CDT','DPF'],['ECOPETROL','COPEC'],['CELSIA','ENELCHILE'],['CEMARGOS','CMPC'],['BOGOTA','BCHILE'],['BSANTANDER','SANTANDER'],['BVC','CENCOSUD'],['Colombia','Chile']],
  ex:{FIC:'Fondo mutuo',IBR:'TAB',UVR:'UF',DTF:'TPM',COP:'CLP','Cédula de Ciudadanía':'RUT persona natural',NIT:'RUT empresa','Cédula de Extranjería':'RUT extranjero'}
 },
 'República Dominicana':{
  m:[['MINISTERIO DE HACIENDA (TES)','MINISTERIO DE HACIENDA (BONOS SOBERANOS)'],['BANCO DE LA REPÚBLICA','BANCO CENTRAL DE LA REPÚBLICA DOMINICANA'],['FIDUCIARIA BANCOLOMBIA','ADMINISTRADORA DE FONDOS POPULAR'],['BANCOLOMBIA S.A.','BANCO POPULAR DOMINICANO'],['BANCO DAVIVIENDA','BANCO DE RESERVAS'],['BANCO DE BOGOTÁ','BANCO BHD'],['ECOPETROL S.A.','EGE HAINA'],['ISA S.A. E.S.P.','EDESUR DOMINICANA'],['GRUPO SURA','GRUPO POPULAR'],['TITULARIZADORA COLOMBIANA','ASOCIACIÓN CIBAO'],['FINDETER','BANCO ADEMI'],['COLPENSIONES','AFP SIEMBRA'],['CEMENTOS ARGOS','CEMENTOS COSMOS'],['Bolsa de Valores de Colombia','Bolsa de Valores de la República Dominicana'],['Banco de la República','Banco Central de la República Dominicana'],['DANE','Banco Central'],['Índice de TES de corto plazo','Índice de bonos soberanos de corto plazo'],['Índice de TES de largo plazo','Índice de bonos soberanos de largo plazo'],['Índice TES Corto','Índice Bonos Soberanos Corto'],['Índice TES Largo','Índice Bonos Soberanos Largo'],['de TES','de bonos soberanos'],['Índice de capitalización bursátil','Índice bursátil de la BVRD'],['COLCAP','Índice BVRD'],['Indicador Bancario de Referencia a 1 mes','Tasa pasiva promedio a 30 días'],['Indicador Bancario de Referencia a 3 meses','Tasa pasiva promedio a 90 días'],['Depósito a Término Fijo a 90 días','Tasa de política monetaria'],['IBR 1M','Tasa pasiva 30D'],['IBR 3M','Tasa pasiva 90D'],['DTF 90D','TPM'],['Benchmark FIC','Benchmark Fondo'],['FIC ','FONDO ABIERTO '],['"FIC"','"Fondo abierto"'],['"IBR"','"TASA REFERENCIA"'],['"DTF"','"TPM"'],['"UVR"','"USD"'],['"COP"','"DOP"'],['TFIT','BSRD'],['CDT','CDP'],['ECOPETROL','EGEHAINA'],['CELSIA','EDESUR'],['CEMARGOS','CEMCOSMOS'],['BOGOTA','BHD'],['BSANTANDER','POPULAR'],['BVC','BVRD'],['Colombia','República Dominicana']],
  ex:{FIC:'Fondo abierto',IBR:'TASA REFERENCIA',UVR:'USD',DTF:'TPM',COP:'DOP','Cédula de Ciudadanía':'Cédula de identidad',NIT:'RNC','Cédula de Extranjería':'Cédula de residencia'},
  fix:()=>{const ok=TIPOS_P['República Dominicana'];INSTRUMENTS.forEach(r=>{if(!ok.includes(r.tipo))r.tipo='TASA FIJA'});LEVELS.Moneda=['DOP','USD','EUR'];SUBLIMITS.MONEDA=['DOP','USD','EUR'];HOLDINGS_BASE.forEach(h=>{if(/LOCAL/.test(h[1])&&h[2]==='USD')h[2]='DOP'})}
 }
};
function mapStr(str,c){const cfg=CTRY[c];if(!cfg)return str;let r=str;cfg.m.forEach(p=>{r=r.split(p[0]).join(p[1])});return r}
function loc(x){const cfg=CTRY[S.pais];if(!cfg||typeof x!=='string')return x;if(cfg.ex[x]!==undefined)return cfg.ex[x];return mapStr(x,S.pais)}
const LOCL=a=>{const o=a.map(loc);return o.filter((v,i)=>o.indexOf(v)===i)};
const DS={FI_ORDERS,VI_ORDERS,INSTRUMENTS,LIMITS,BENCH_DEF,PORTS,INDICES,SENS,PNAMES,FUNDS,PORTFOLIOS,HOLDINGS_BASE,SUBLIMITS,DENOMS,LEVELS,BENCH_COMPS,INSTR_NAMES,ISSUERS};
const SNAP={};Object.keys(DS).forEach(k=>SNAP[k]=JSON.stringify(DS[k]));
function applyCountry(c){
 S.pais=c;
 Object.keys(DS).forEach(k=>{const v=JSON.parse(CTRY[c]?mapStr(SNAP[k],c):SNAP[k]),t=DS[k];if(Array.isArray(t)){t.length=0;v.forEach(x=>t.push(x))}else{Object.keys(t).forEach(x=>delete t[x]);Object.assign(t,v)}});
 const f=CTRY[c]&&CTRY[c].fix;if(f)f();
 const sel=$('#pais');if(sel)sel.value=c;
 toast('Se cargaron los datos de ejemplo de '+c+' ('+MON_P[c][0]+'). Las ediciones hechas antes del cambio se reinician.','info','País: '+c);
 route();
}

/* =============== Shell: navbar, sidebar, breadcrumb, notificaciones =============== */
const NAV=[
 {key:'param',label:'Parametrización',icon:'sliders',desc:'Flujo de órdenes, maestros, benchmarks y límites que alimentan el Front de inversiones.',home:'#/m/param',items:[['#/parametrizacion/flow','Flujo de órdenes','flows','pflow','Estados de una orden y las acciones permitidas en cada uno.'],['#/parametrizacion/portfolios','Portafolios','pie','pport','Fondos, mandatos y clientes sobre los que se opera.'],['#/parametrizacion/instruments','Instrumentos','coins','instruments','Consulta, registra y administra los instrumentos disponibles.'],['#/parametrizacion/indices','Índices de referencia','network','pindex','Índices que componen los benchmarks.'],['#/parametrizacion/benchmarks','Benchmarks','sliders','pabench','Composición del benchmark de cada portafolio.'],['#/parametrizacion/limits','Configuración de límites','limits','limitcfg','Límites por emisor, calificación, moneda y plazo.'],['#/parametrizacion/catalogs','Catálogos','doc','pcat','Emisores, calificaciones, monedas y tipos de límite.']]},
 {key:'dashboard',label:'Dashboard',icon:'dashboard',desc:'Consulta de portafolios, flujos y sensibilidades.',home:'#/m/dashboard',items:[['#/dashboard/graphics','Visor de portafolio','pie','graphics','Consulta gráficas interactivas por portafolio.'],['#/dashboard/future-flows','Flujos futuros','flows','flows','Revisa los flujos proyectados por instrumento.'],['#/dashboard/sensitivity-measures','Medidas de sensibilidad','network','sens','Analiza duración, convexidad y DV01.']]},
 {key:'orders',label:'Ordenes',icon:'orders',desc:'Captura y gestión de órdenes de renta fija y renta variable.',home:'#/m/orders',items:[['#/orders/fixed-income','Renta fija','colinc','fixed','Opera y administra inversiones en instrumentos de deuda.'],['#/orders/variable-income','Renta variable','col','variable','Opera y administra inversiones en acciones.']]},
 {key:'limits',label:'Control de límites',icon:'limits',desc:'Seguimiento del cumplimiento de los límites definidos en Parametrización.',home:'#/m/limits',items:[['#/limit-control/limit-evaluation','Evaluación','badge','limiteval','Evalúa el cumplimiento de los límites.']]},
 {key:'pa',label:'Performance attribution',icon:'pa',desc:'Mide, explica y reporta el desempeño de portafolios y mandatos frente a su benchmark.',home:'#/m/pa',items:[['#/performance-attribution/summary','Resumen de desempeño','pa','pasummary','Rentabilidad, riesgo y comparación contra el benchmark.'],['#/performance-attribution/brinson','Atribución de retorno','scale','pabrinson','Asignación, selección e interacción (Brinson-Fachler).'],['#/performance-attribution/contribution','Contribución por activo','layers','pacontrib','Qué posiciones suman o restan al retorno.'],['#/performance-attribution/fixed-income','Atribución renta fija','colinc','pafixed','Curva, spread y selección en renta fija.'],['#/performance-attribution/reports','Reportes','doc','pareports','Genera y descarga los informes de desempeño.']]},

];
const S={hash:'',pais:'Colombia',token:0,open:{}};
function current(){const h=S.hash||location.hash||'#/';let grp=null,it=null,land=null;NAV.forEach(g=>{if(g.home===h)land=g;g.items.forEach(i=>{if(i[0]===h){grp=g;it=i}})});return {h,grp,it,land,home:h==='#/'||h===''||h==='#'}}
function go(h){S.hash=h;try{history.replaceState(null,'',h)}catch(e){}route()}
window.__go=go;
function crumbHTML(r){const parts=[];parts.push('<a class="crumb" data-go="#/">'+MODULE_NAME+'</a>');if(r.grp||r.land){const g=r.grp||r.land;parts.push(r.it?'<a class="crumb" data-go="'+g.home+'">'+g.label+'</a>':'<span class="current">'+g.label+'</span>')}if(r.it)parts.push('<span class="current">'+r.it[1]+'</span>');if(r.home)return '<span class="current">'+MODULE_NAME+'</span>';return parts.join('<span class="sep">›</span>')}
function sidebarNav(r){return '<a class="mk-navitem'+(r.home?' active':'')+'" data-go="#/" href="#/">'+ic('home')+' '+MODULE_NAME+'</a><div class="mk-navgroup">Módulos del dominio</div>'+NAV.map(g=>{const open=S.open[g.key]!==undefined?S.open[g.key]:(r.grp===g||r.land===g),cls=(r.land===g?' active':r.grp===g?' mk-navitem--parent':'')+(open?' open':'');return '<a class="mk-navitem'+cls+'" data-go="'+g.home+'" href="'+g.home+'" aria-expanded="'+open+'">'+ic(g.icon)+' '+g.label+'<span class="mk-tree__chev" data-tg="'+g.key+'" role="button" tabindex="0" aria-label="Mostrar u ocultar '+g.label+'">'+ic('chevron')+'</span></a>'+(open?'<div class="mk-subnav">'+g.items.map(i=>'<a class="mk-navitem mk-navitem--sub'+(r.h===i[0]?' active':'')+'" data-go="'+i[0]+'" href="'+i[0]+'">'+ic(i[2])+' '+i[1]+'</a>').join('')+'</div>':'')}).join('')}
const NOTIFS=[['warn','Límite de emisor al 92%','FIC LIQUIDEZ se acerca al tope del 20% definido para FINDETER.','Límites','Advertencia','lim-014',1],['info','Orden pendiente de complementación','Orden de compra de TES sobre FIC RENTA FIJA requiere completar la tasa.','Órdenes','Informativo','ord-231',1],['ok','Reporte mensual generado','El informe de rentabilidad de septiembre está listo para descargar.','Reportes','Exitoso','rep-001',1],['err','Falló la carga de instrumentos','El archivo tiene 3 filas con ISIN inválido.','Importación','Error','imp-008',0],['ok','Benchmark actualizado','Se actualizó la composición del benchmark de FIC RENTA FIJA.','Performance','Exitoso','bch-003',0]];
function ntfRender(){const t=$('#ntfTipo').value,e=$('#ntfEstado').value,list=NOTIFS.filter(n=>(!t||n[3]===t)&&(!e||n[4]===e));$('#ntfList').innerHTML=list.length?list.map(n=>'<div class="mk-ncard'+(n[6]?' unread':'')+'"><div class="mk-ncard__top"><span class="mk-ncard__ico mk-ncard__ico--'+n[0]+'">'+ic(n[0]==='err'?'alert':n[0]==='ok'?'check':'info')+'</span><div><div class="mk-ncard__t">'+loc(n[1])+'</div><div class="mk-ncard__d">'+loc(n[2])+'</div></div></div><div class="mk-ncard__meta"><span class="mk-ncard__tag">'+n[3]+'</span><span>'+n[5]+'</span></div>'+(n[6]?'<span class="mk-ncard__unread"></span>':'')+'</div>').join(''):'<div class="mk-empty">Sin notificaciones</div>';const d=$('#ntfDot');const c=NOTIFS.filter(n=>n[6]).length;d.textContent=c;d.style.display=c?'':'none'}
function ntfToggle(open){$('#ntfPanel').classList.toggle('open',open);$('#ntfOverlay').classList.toggle('open',open)}
function sbToggle(open){$('#mkSidebar').classList.toggle('open',open);$('#mkOverlay').classList.toggle('open',open)}
function shell(){
 $('#root').innerHTML='<header class="mk-navbar"><button class="mk-navbar__burger" id="burger"'+TIP('Abrir el menú de módulos')+' aria-label="Menú">'+ic('menu')+'</button><div class="mk-brand"><b>makers</b> Platform | '+MODULE_NAME+'</div><span style="margin-left:auto;position:relative"><button class="mk-bell" id="bell" style="margin-left:0"'+TIP('Centro de Notificaciones')+' aria-label="Centro de Notificaciones">'+ic('bell')+'<span class="mk-bell__dot" id="ntfDot">3</span></button></span><span class="mk-country" style="margin-left:12px"><span class="mk-country__lb">País</span><span style="position:relative;display:inline-flex;align-items:center"><select id="pais" aria-label="País en el que opera la Plataforma"><option>Colombia</option><option>Chile</option><option>República Dominicana</option></select><span class="mk-country__chev">'+ic('chevron')+'</span></span></span><button class="mk-bell" id="theme" type="button" style="margin-left:12px"></button></header>'
 +'<div class="mk-overlay" id="ntfOverlay"></div><aside class="mk-notif mk-drawer" id="ntfPanel" aria-label="Centro de Notificaciones"><div class="mk-notif__head"><h2>Centro de Notificaciones</h2><div class="mk-notif__mail">'+esc(USER.email)+'</div><button class="mk-notif__close" id="ntfClose" aria-label="Cerrar">&times;</button></div><div class="mk-notif__filtros"><div class="mk-field"><label class="mk-label"><span>Tipo</span>'+info('Proceso de la Plataforma que originó el aviso.')+'</label><div class="mk-combobox"><select class="mk-select" id="ntfTipo"><option value="">Todos</option><option>Reportes</option><option>Límites</option><option>Órdenes</option><option>Importación</option><option>Performance</option></select></div></div><div class="mk-field"><label class="mk-label"><span>Estado</span>'+info('Resultado del proceso: exitoso, informativo, advertencia o error.')+'</label><div class="mk-combobox"><select class="mk-select" id="ntfEstado"><option value="">Todos</option><option>Exitoso</option><option>Informativo</option><option>Advertencia</option><option>Error</option></select></div></div><button class="mk-btn" id="ntfGo">Consultar</button></div><div class="mk-notif__list" id="ntfList"></div></aside>'
 +'<nav class="mk-breadcrumb" id="mkBreadcrumb"></nav><div class="mk-overlay" id="mkOverlay"></div><aside class="mk-sidebar" id="mkSidebar"><div class="mk-sidebar__head"><div class="mk-sidebar__name">'+esc(USER.name)+'</div><div class="mk-sidebar__mail">'+esc(USER.email)+'</div><button class="mk-sidebar__close" id="sbClose" aria-label="Cerrar menú">&times;</button></div><nav class="mk-sidebar__nav" id="sbNav"></nav><div class="mk-sidebar__foot"><a href="#" id="logout">Cerrar sesión</a></div></aside><main class="mk-page" id="mkMain"><section class="mk-view active" id="view"></section></main><div class="mk-sonner" id="mkSonner" aria-live="polite"></div><div id="mkTip" role="tooltip"></div>';
 $('#burger').addEventListener('click',()=>sbToggle(true));$('#mkOverlay').addEventListener('click',()=>sbToggle(false));$('#sbClose').addEventListener('click',()=>sbToggle(false));
 $('#bell').addEventListener('click',()=>{ntfRender();ntfToggle(true)});$('#ntfOverlay').addEventListener('click',()=>ntfToggle(false));$('#ntfClose').addEventListener('click',()=>ntfToggle(false));$('#ntfGo').addEventListener('click',ntfRender);ntfRender();
 $('#pais').addEventListener('change',e=>applyCountry(e.target.value));
 $('#theme').addEventListener('click',()=>{const d=document.documentElement.classList.toggle('dark');try{localStorage.setItem('mkTheme',d?'dark':'light')}catch(x){}themeIcon()});themeIcon();
 $('#logout').addEventListener('click',e=>{e.preventDefault();sbToggle(false);toast('Esta es una sesión de demostración.','info')});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){sbToggle(false);ntfToggle(false)}});
}
function themeIcon(){const d=document.documentElement.classList.contains('dark'),b=$('#theme');if(!b)return;b.innerHTML=ic(d?'sun':'moon');b.setAttribute('data-tip',d?'Cambiar a tema claro':'Cambiar a tema oscuro');b.setAttribute('aria-label',d?'Cambiar a tema claro':'Cambiar a tema oscuro')}
function landing(view,g){
 view.innerHTML='<div class="mk-section"><div class="mk-headerpage"><div><h1>'+g.label+'</h1><div class="mk-help">'+g.desc+'</div></div><div><button class="mk-iconbtn mk-iconbtn--dark" data-back'+TIP('Volver a '+MODULE_NAME)+' aria-label="Volver">'+ic('back')+'</button></div></div><div class="mk-grid cols-4">'+g.items.map(i=>'<a class="mk-linkcard" href="'+i[0]+'" data-go="'+i[0]+'"><span class="mk-linkcard__icon">'+ic(i[2],'lg')+'</span><span class="mk-linkcard__title">'+i[1]+'</span><span class="mk-linkcard__sub">'+i[4]+'</span></a>').join('')+'</div></div>';
 $('[data-back]',view).addEventListener('click',()=>go('#/'));
}
function homePage(view){
 view.innerHTML='<div class="mk-section"><div class="mk-headerpage"><h1>'+MODULE_NAME+'</h1></div><p class="mk-help mk-mb">Consulta de portafolios, operación de órdenes de inversión, control de límites y análisis de desempeño (Performance attribution).</p>'+NAV.map((g,k)=>'<div class="mk-accordion collapsed" id="acc-'+g.key+'"><div class="mk-accordion__head"><span class="mk-accordion__ico">'+ic(g.icon,'lg')+'</span><span><span class="mk-accordion__t">'+g.label+'</span><span class="mk-accordion__d">'+g.desc+'</span></span><span class="mk-accordion__chev">&#9662;</span></div><div class="mk-accordion__body"><div class="mk-grid cols-4">'+g.items.map(i=>'<a class="mk-linkcard" href="'+i[0]+'" data-go="'+i[0]+'"><span class="mk-linkcard__icon">'+ic(i[2],'lg')+'</span><span class="mk-linkcard__title">'+i[1]+'</span><span class="mk-linkcard__sub">'+i[4]+'</span></a>').join('')+'</div></div></div>').join('')+'</div>';
 $$('.mk-accordion',view).forEach(bindAcc);
}
function notFound(view){view.innerHTML='<div class="mk-section"><div class="mk-notfound"><h2>404</h2><h3 style="color:var(--mk-primary)">Página no encontrada</h3><p>No pudimos encontrar la página que estás buscando. Verifica la URL o vuelve al inicio.</p><button class="mk-btn" data-go="#/">Volver al inicio</button></div></div>'}
function route(){
 if(!$('#view'))shell();
 const r=current();$('#mkBreadcrumb').innerHTML=crumbHTML(r);$('#sbNav').innerHTML=sidebarNav(r);sbToggle(false);
 $$('.mk-modal-overlay').forEach(m=>m.remove());const v=$('#view'),tk=++S.token;window.scrollTo(0,0);v.innerHTML='<div class="mk-loading"><div class="mk-spinner"></div></div>';
 setTimeout(()=>{if(tk!==S.token)return;if(r.it)PAGES[r.it[3]](v,r);else if(r.land)landing(v,r.land);else if(r.home)homePage(v);else notFound(v);v.classList.remove('active');void v.offsetWidth;v.classList.add('active')},180);
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-tg]');if(t){e.preventDefault();e.stopPropagation();const k=t.dataset.tg,r=current(),auto=(r.grp&&r.grp.key===k)||(r.land&&r.land.key===k),cur=S.open[k]!==undefined?S.open[k]:auto;S.open[k]=!cur;document.getElementById('sbNav').innerHTML=sidebarNav(r);return}const a=e.target.closest('[data-go]');if(a){e.preventDefault();go(a.dataset.go)}});
window.addEventListener('hashchange',()=>{S.hash='';route()});
try{if(localStorage.getItem('mkTheme')==='dark')document.documentElement.classList.add('dark')}catch(e){}
route();
})();
