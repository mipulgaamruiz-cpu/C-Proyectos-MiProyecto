/* ===== Exportes y libros de Excel (.xlsx real, con estilos) ===== */
const colName=i=>{let s='';i++;while(i>0){const r=(i-1)%26;s=String.fromCharCode(65+r)+s;i=Math.floor((i-1)/26)}return s};
const colL=colName;
const xe=v=>String(v==null?'':v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const XL_HEAD='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const XL_STYLES=XL_HEAD+'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="165" formatCode="dd/mm/yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF6A1B9A"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="10" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
const xlSerial=ts=>{const d=new Date(ts);return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5+25569};
const cellPlain=c=>c&&typeof c==='object'?(c.d!=null?fmtD(c.d):(c.s===4?pct(c.n,2):f2(c.n))):String(c==null?'':c);
function sheetXml2(sh){
 const rows=sh.rows,nc=rows.reduce((a,r)=>Math.max(a,r.length),1);
 const widths=[];for(let c=0;c<nc;c++){let w=8;rows.slice(0,200).forEach(r=>{const t=r[c]==null?'':cellPlain(r[c]);w=Math.max(w,Math.min(54,String(t).length+3))});widths.push(w)}
 const cols='<cols>'+widths.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('')+'</cols>';
 const cell=(v,ri,ci)=>{const ref=colName(ci)+(ri+1);
  if(v!==null&&typeof v==='object'){if(v.d!=null)return '<c r="'+ref+'" s="3"><v>'+xlSerial(v.d)+'</v></c>';if(isFinite(v.n))return '<c r="'+ref+'" s="'+(v.s||2)+'"><v>'+v.n+'</v></c>';v=''}
  return '<c r="'+ref+'" t="inlineStr"'+(sh.header&&ri===0?' s="1"':'')+'><is><t xml:space="preserve">'+xe(v)+'</t></is></c>'};
 const data=rows.map((row,ri)=>'<row r="'+(ri+1)+'">'+row.map((v,ci)=>cell(v,ri,ci)).join('')+'</row>').join('');
 const view=sh.header?'<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/></sheetView></sheetViews>':'<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
 return XL_HEAD+'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+view+'<sheetFormatPr defaultRowHeight="15"/>'+cols+'<sheetData>'+data+'</sheetData>'+(sh.filter&&rows.length>1?'<autoFilter ref="A1:'+colName(nc-1)+rows.length+'"/>':'')+(sh.dv||'')+'</worksheet>';
}
function buildBook(sheets){
 const n=sheets.length,REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
 const nm=s=>String(s).replace(/[\[\]:*?\/\\]/g,' ').slice(0,31)||'Hoja';
 return zipStore([
  {name:'[Content_Types].xml',data:XL_HEAD+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+sheets.map((s,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')+'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'},
  {name:'_rels/.rels',data:XL_HEAD+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
  {name:'xl/workbook.xml',data:XL_HEAD+'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="'+REL+'"><sheets>'+sheets.map((s,i)=>'<sheet name="'+xe(nm(s.name))+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join('')+'</sheets></workbook>'},
  {name:'xl/_rels/workbook.xml.rels',data:XL_HEAD+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheets.map((s,i)=>'<Relationship Id="rId'+(i+1)+'" Type="'+REL+'/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join('')+'<Relationship Id="rId'+(n+1)+'" Type="'+REL+'/styles" Target="styles.xml"/></Relationships>'},
  {name:'xl/styles.xml',data:XL_STYLES}
 ].concat(sheets.map((s,i)=>({name:'xl/worksheets/sheet'+(i+1)+'.xml',data:sheetXml2(s)}))));
}
const XLSX_MIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
function exportTable(base,fmt,headers,rows,sheet){
 if(fmt==='csv'){const q=v=>'"'+String(v).replace(/"/g,'""')+'"',tx=c=>cellPlain(c).replace(/^\+(?=\d)/,'');
  download(base+'.csv','﻿'+[headers.map(q).join(';')].concat(rows.map(r=>r.map(c=>q(tx(c))).join(';'))).join('\r\n'),'text/csv;charset=utf-8')}
 else download(base+'.xlsx',buildBook([{name:sheet||'Datos',rows:[headers].concat(rows),header:true,filter:true}]),XLSX_MIME);
}
const htmlTxt=v=>String(v==null?'':v).replace(/<[^>]*>/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
function cellTxt(c,r){if(c.txt)return c.txt(r);if(c.fmt)return c.fmt(r[c.k]);if(c.html)return c.html(r);return r[c.k]}
function xvCell(c,r){
 if(c.num)return {n:c.num(r),s:2};
 const raw=c.k!==undefined?r[c.k]:undefined;
 if(!c.txt&&typeof raw==='number'&&isFinite(raw)){if(c.fmt===f0||c.fmt===f1||c.fmt===f2||c.fmt===f3||c.fmt===money)return {n:raw,s:2};if(c.fmt===dstr||c.fmt===fmtD)return {d:raw}}
 return htmlTxt(cellTxt(c,r));
}
function buildXlsx(m,rows){
 const head=m.cols.map(c=>c[0]),ej=rows||[m.ej()],lists=[];
 m.lists.forEach((fn,ci)=>{if(fn)lists.push({ci,name:head[ci],vals:fn()})});
 const dv=lists.length?'<dataValidations count="'+lists.length+'">'+lists.map((l,k)=>'<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="'+colName(l.ci)+'2:'+colName(l.ci)+'1000"><formula1>Listas!$'+colName(k)+'$2:$'+colName(k)+'$'+(l.vals.length+1)+'</formula1></dataValidation>').join('')+'</dataValidations>':'';
 const maxL=lists.reduce((a,l)=>Math.max(a,l.vals.length),0),listRows=[lists.map(l=>l.name)];for(let i=0;i<maxL;i++)listRows.push(lists.map(l=>l.vals[i]==null?'':l.vals[i]));
 const inst=[['Campo','Obligatorio','Valores permitidos','Ejemplo']].concat(m.cols.map(c=>[c[0],c[1]?'Sí':'No',c[2],c[3]]));
 return buildBook([{name:'Estructura',rows:[head].concat(ej),header:true,dv},{name:'Instrucciones',rows:inst,header:true},{name:'Listas',rows:listRows,header:true}]);
}
function demoCsv(m){const q=v=>'"'+String(v).replace(/"/g,'""')+'"';return '﻿'+[m.cols.map(c=>q(c[0])).join(';')].concat(m.demo().map(r=>r.map(q).join(';'))).join('\r\n')}
