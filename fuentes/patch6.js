const fs=require('fs');let s=fs.readFileSync('mk.js','utf8');
const rep=(a,b,all)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,80));s=all?s.split(a).join(b):s.replace(a,()=>b)};
// --- defaults sin literales de país ---
rep("const st={port:'FIC RENTA FIJA',sel:['calif','emisor','moneda'],done:true};","const st={port:FUNDS[1],sel:['calif','emisor','moneda'],done:true};");
rep("const st={port:'FIC RENTA FIJA',year:'2026',done:true};","const st={port:FUNDS[1],year:'2026',done:true};");
// --- listas dependientes del país ---
rep("['DESCUENTO','IBR','IPC','TASA FIJA','UVR','DTF']","TIPOS()",true);
rep("['COP','UVR','USD','EUR']","MONEDAS()",true);
rep("['Cédula de Ciudadanía','NIT','Cédula de Extranjería','Pasaporte']","LOCL(['Cédula de Ciudadanía','NIT','Cédula de Extranjería','Pasaporte'])",true);
rep("'Cédula de Ciudadanía',{req:true}","LOCL(['Cédula de Ciudadanía'])[0],{req:true}");
rep("{h:'IBR',k:'ibr',fmt:f2}","{h:loc('IBR'),k:'ibr',fmt:f2}");
rep("{h:'UVR',k:'uvr',fmt:f2}","{h:loc('UVR'),k:'uvr',fmt:f2}");
rep("{h:'DTF',k:'uf',fmt:f2}","{h:loc('DTF'),k:'uf',fmt:f2}");
rep("['FIC','Mandato delegado','Cliente']","LOCL(['FIC','Mandato delegado','Cliente'])",true);
rep("['FIC',rows.filter(r=>r.tipo==='FIC').length,'b']","[loc('FIC'),rows.filter(isFund).length,'b']");
rep("r.tipo==='FIC'?'info':","isFund(r)?'info':");
rep("function benchOf(n)","const isFund=r=>r.tipo==='FIC'||r.tipo==='Fondo mutuo'||r.tipo==='Fondo abierto';\nfunction benchOf(n)");
// --- catálogos por país ---
rep("pg.innerHTML=alertB('info','Catálogos de consulta'","CATS[0][2].forEach(o=>{Object.keys(o).forEach(k=>{o[k]=loc(o[k])})});CATS[2][2]=CURR[S.pais].map(a=>({c:a[0],n:a[1],u:a[2]}));\n pg.innerHTML=alertB('info','Catálogos de consulta'");
// --- notificaciones localizadas ---
rep(`<div class="mk-ncard__t">'+n[1]+'</div><div class="mk-ncard__d">'+n[2]+'</div>`,`<div class="mk-ncard__t">'+loc(n[1])+'</div><div class="mk-ncard__d">'+loc(n[2])+'</div>`);
// --- selector de país ---
rep("<option>Colombia</option><option>Chile</option>","<option>Colombia</option><option>Chile</option><option>República Dominicana</option>");
const a=s.indexOf("$('#pais').addEventListener('change'");const b=s.indexOf("\n",a);
s=s.slice(0,a)+"$('#pais').addEventListener('change',e=>applyCountry(e.target.value));"+s.slice(b);
// --- marco de países ---
const fw=`
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
  fix:()=>{const ok=TIPOS_P['República Dominicana'];INSTRUMENTS.forEach(r=>{if(!ok.includes(r.tipo))r.tipo='TASA FIJA'});LEVELS.Moneda=['DOP','USD','EUR'];SUBLIMITS.MONEDA=['DOP','USD','EUR']}
 }
};
function mapStr(str,c){const cfg=CTRY[c];if(!cfg)return str;let r=str;cfg.m.forEach(p=>{r=r.split(p[0]).join(p[1])});return r}
function loc(x){const cfg=CTRY[S.pais];if(!cfg||typeof x!=='string')return x;if(cfg.ex[x]!==undefined)return cfg.ex[x];return mapStr(x,S.pais)}
const LOCL=a=>{const o=a.map(loc);return o.filter((v,i)=>o.indexOf(v)===i)};
const DS={FI_ORDERS,VI_ORDERS,INSTRUMENTS,CLIENT_ORDERS,LIMITS,BENCH_DEF,PORTS,INDICES,SENS,PNAMES,FUNDS,PORTFOLIOS,HOLDINGS_BASE,SUBLIMITS,DENOMS,LEVELS,BENCH_COMPS,INSTR_NAMES,ISSUERS};
const SNAP={};Object.keys(DS).forEach(k=>SNAP[k]=JSON.stringify(DS[k]));
function applyCountry(c){
 S.pais=c;
 Object.keys(DS).forEach(k=>{const v=JSON.parse(CTRY[c]?mapStr(SNAP[k],c):SNAP[k]),t=DS[k];if(Array.isArray(t)){t.length=0;v.forEach(x=>t.push(x))}else{Object.keys(t).forEach(x=>delete t[x]);Object.assign(t,v)}});
 const f=CTRY[c]&&CTRY[c].fix;if(f)f();
 const sel=$('#pais');if(sel)sel.value=c;
 toast('Se cargaron los datos de ejemplo de '+c+' ('+MON_P[c][0]+'). Las ediciones hechas antes del cambio se reinician.','info','País: '+c);
 route();
}
`;
rep("/* =============== Shell: navbar",fw+"\n/* =============== Shell: navbar");
fs.writeFileSync('mk.js',s);console.log('mk.js patched');
