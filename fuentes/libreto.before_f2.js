const fs=require('fs');

const COUNTRIES=[
 {file:'Colombia',pais:'Colombia',mon:'COP',fondo:'FIC RENTA FIJA',fondo2:'FIC LIQUIDEZ',fondoMM:'FIC MONETARIO',emisor:'FINDETER',instr:'TFIT…',bonos:'TES',op:'CDT',repo:'simultáneas',cp:'BANCOLOMBIA S.A.',ref:'IBR y DTF',
  aud:'Fiduciarias, sociedades administradoras de FIC y áreas de inversiones: gerente de inversiones, riesgos y operaciones.',
  extra:'Moneda base COP; títulos indexados en UVR; índices IBR, DTF y COLCAP; mercado monetario con CDT, simultáneas, interbancarios, overnight y TES de corto plazo.',
  multi:'Cambiar País a Chile, República Dominicana o Panamá para mostrar que emisores, monedas, índices y operaciones monetarias cambian.'},
 {file:'Chile',pais:'Chile',mon:'CLP',fondo:'FONDO MUTUO RENTA FIJA',fondo2:'FONDO MUTUO LIQUIDEZ',fondoMM:'FONDO MUTUO MONETARIO',emisor:'CORFO',instr:'BTU…',bonos:'bonos del Gobierno',op:'DPF',repo:'pactos de retrocompra',cp:'BANCO SANTANDER CHILE',ref:'TAB y TPM',
  aud:'Administradoras generales de fondos (AGF), corredoras y áreas de inversiones: gerente de inversiones, riesgos y operaciones.',
  extra:'Moneda base CLP; instrumentos indexados en UF; índices TAB, TPM e IPSA; mercado monetario con DPF, pactos de retrocompra, interbancarios, overnight y bonos de corto plazo.',
  multi:'Cambiar País a Colombia, República Dominicana o Panamá para mostrar que emisores, monedas, índices y operaciones monetarias cambian.'},
 {file:'Republica_Dominicana',pais:'República Dominicana',mon:'DOP',fondo:'FONDO ABIERTO RENTA FIJA',fondo2:'FONDO ABIERTO LIQUIDEZ',fondoMM:'FONDO ABIERTO MONETARIO',emisor:'BANCO ADEMI',instr:'BSRD…',bonos:'bonos soberanos',op:'CDP',repo:'reportos',cp:'BANCO POPULAR DOMINICANO',ref:'tasa pasiva y TPM',
  aud:'Sociedades administradoras de fondos de inversión, puestos de bolsa y áreas de inversiones: gerente de inversiones, riesgos y operaciones.',
  extra:'Moneda base DOP con inversiones en USD; tasa pasiva y TPM como referencias; índice de la BVRD; mercado monetario con CDP, reportos, interbancarios, overnight y bonos soberanos de corto plazo.',
  multi:'Cambiar País a Colombia, Chile o Panamá para mostrar que emisores, monedas, índices y operaciones monetarias cambian.'} ,
 {file:'Panama',pais:'Panamá',mon:'PAB',fondo:'FONDO DE INVERSIÓN RENTA FIJA',fondo2:'FONDO DE INVERSIÓN LIQUIDEZ',fondoMM:'FONDO DE INVERSIÓN MONETARIO',emisor:'BANCO HIPOTECARIO NACIONAL',instr:'LTES…',bonos:'letras y bonos del Tesoro',op:'DPF',repo:'repos',cp:'BANCO GENERAL',ref:'SOFR y tasa de depósitos a plazo fijo',
  aud:'Administradoras de fondos de inversión, casas de valores y áreas de inversiones: gerente de inversiones, riesgos y operaciones.',
  extra:'Moneda base PAB (balboa, a la par con el dólar) con circulación en USD; sin indexación (no hay UF ni UVR); tasas SOFR y de depósitos a plazo fijo; índice de la Bolsa de Valores de Panamá; mercado monetario con DPF, repos, interbancarios, overnight y letras del Tesoro de corto plazo.',
  multi:'Cambiar País a Colombia, Chile o República Dominicana para mostrar que emisores, monedas, índices y operaciones monetarias cambian.'}
];

/* ====== CONTENIDO ====== */
function content(c){
 const T=s=>s.split('{FONDO}').join(c.fondo).split('{FONDO2}').join(c.fondo2).split('{FONDOMM}').join(c.fondoMM).split('{EMISOR}').join(c.emisor).split('{INSTR}').join(c.instr).split('{BONOS}').join(c.bonos).split('{MON}').join(c.mon).split('{PAIS}').join(c.pais).split('{OP}').join(c.op).split('{REPO}').join(c.repo).split('{CP}').join(c.cp).split('{REF}').join(c.ref).split('{CARPETA}').join('Plantillas_carga_masiva/'+c.file);
 const scenes=[
  ['1','0:00–1:00','Apertura · Home y menú lateral',
   ['Mostrar las tarjetas de módulos: Parametrización, Dashboard, Órdenes, Control de límites y Performance attribution.','Abrir el menú (tres rayas) y desplegar el árbol de Dashboard y Órdenes.','Señalar País = {PAIS}, la campana y el cambio de tema claro/oscuro.'],
   '“Todo el ciclo de inversión en un solo lugar: ver, operar, controlar, reportar y explicar. Sin hojas de Excel intermedias y con una sola versión de la verdad.”',
   '¿Cuántas herramientas y archivos usa hoy su equipo entre que se decide una inversión y se le reporta al comité?'],
  ['2','1:00–4:00','VER · Dashboard › Visor de portafolio y Medidas de sensibilidad',
   ['El Visor abre cargado con **{FONDO}**: tres gráficas (calificación, emisor, moneda). Abrir “Leyendas” y filtrar la tabla con Buscar.','Señalar la **Fecha operativa** (viene con el día en curso y no se deja en blanco) y cambiarla para ver otro día.','Ir a Medidas de sensibilidad y abrir el ojo de {FONDO}: duración, convexidad y DV01.'],
   '“En segundos ve dónde está concentrado el portafolio y cuánto perdería si las tasas suben un punto básico, sin armar tablas dinámicas.”',
   '¿Cuánto tarda hoy su equipo en responder “¿cómo estamos concentrados por emisor?” un lunes a las 8 a. m.?'],
  ['3','4:00–8:30','OPERAR · Órdenes › Renta fija (Registro Individual y Carga Masiva)',
   ['En Registro Individual: **Nuevo** y **Guardar** vacío (se marcan los obligatorios). Completar: Compra, {FONDO}, instrumento {INSTR}, cantidad. **Guardar** → “Revisa la orden” → **Confirmar y guardar**.','Ver detalle de una orden y **Anular** otra (confirmación). Filtrar por **Fecha inicial** y **Fecha final**.','Abrir la pestaña **Carga Masiva**: descargar la **Estructura** (Excel con listas desplegables) y el **Manual**.','Elegir el archivo **Ejemplo_Cargue_Masivo_Ordenes_de_Renta_Fija.xlsx** (carpeta {CARPETA}) → **Procesar**: aparece la **banda verde** “6 registros cargados · 0 con errores”.','Volver a Registro Individual: las 6 órdenes nuevas están arriba, en estado Registrada.'],
   '“El sistema no deja pasar órdenes incompletas, pide revisar antes de confirmar y deja el estado visible. Y lo que hoy se digita una a una, aquí entra por archivo, validado fila por fila.”',
   '¿Cuántas órdenes se cargan manualmente cada día y cuántas veces se corrigen errores de digitación?'],
  ['4','8:30–13:30','OPERAR · Órdenes › Mercado monetario y Dashboard › Mercado monetario (lo nuevo)',
   ['En **Órdenes › Mercado monetario**: mostrar las operaciones (**{OP}**, {REPO}, interbancario, overnight y títulos de corto plazo), los KPI por estado y el filtro **Fecha inicial / Fecha final**.','**Nuevo**: Inversión, operación {OP}, portafolio **{FONDO2}**, contraparte **{CP}**. Debajo aparece el cupo: **disponible $480.000.000,00**.','Digitar valor nominal **1.000.000.000** y **Guardar**: la plataforma **bloquea** (“Supera el cupo disponible”). Bajar el valor a 400.000.000 → “Revisa la operación” → **Confirmar y guardar**.','Pestaña **Carga Masiva**: cargar **Ejemplo_Cargue_Masivo_Ordenes_de_Mercado_Monetario.xlsx** → banda verde con 6 registros.','Ir a **Dashboard › Mercado monetario** con {FONDO2}: saldo **15.420.000.000**, plazo promedio ponderado ≈ **49,8 días** (tope 90), tasa promedio ≈ **10,65 % E.A.**, vence en 7 días **4.920.000.000 · 4 op.**','Pestañas **Escalera de vencimientos** (cuánta liquidez se libera y cuándo) y **Devengo y rentabilidad** (devengo del día por operación).'],
   '“La tesorería del fondo deja de vivir en hojas aparte: registra la operación con control de cupo por contraparte en el momento, y ve su escalera de vencimientos, su liquidez y su devengo en la misma plataforma.”',
   '¿Cómo controlan hoy el cupo por contraparte antes de cerrar una operación? ¿Y la escalera de vencimientos?'],
  ['5','13:30–16:00','CONTROLAR · Control de límites › Evaluación',
   ['Filtrar por portafolio **{FONDO2}**.','Localizar el límite MAX por emisor de **{EMISOR}** (20 %): utilización **92 %**, estado **Alerta**. Localizar el límite MAX por contraparte de **{CP}** (25 %): utilización **94 %**, **Alerta**. La **Fecha operativa** permite ver otro día.','Abrir el ojo para ver el detalle y luego la campana: “Límite de emisor al 92%” y “Cupo de contraparte al 93%”.'],
   '“La plataforma mide cada límite contra la posición real y avisa antes de que se incumpla; incluye los de mercado monetario. Los límites se definen una sola vez, en Parametrización.”',
   '¿Cuándo se enteran hoy de que un límite está por romperse: antes, o cuando ya pasó?'],
  ['6','16:00–18:00','REPORTAR · Órdenes › Reportes (Libro de órdenes)',
   ['Abrir la tarjeta **Reportes** dentro de Órdenes: aparece el catálogo **Informes** (buscador, categorías y tarjetas). Abrir **Libro de órdenes**.','En **Filtros del informe**: Portafolio = Todos los portafolios, Mercado = Todos, **Fecha inicial / Fecha final** (o **Rango sugerido**) y **Generar informe**: reúne renta fija, renta variable y mercado monetario (**58 órdenes** en los datos originales).','Señalar los KPI por mercado, filtrar **Mercado = Mercado monetario** y abrir el ojo de una orden.','Pulsar **Excel** y abrir el archivo: encabezados, filtros y columnas numéricas listas para usar. Repetir con **CSV**.'],
   '“Un solo libro con todas las órdenes de todos los mercados, filtrable y descargable en un clic: auditoría y conciliación sin pegar archivos de tres sistemas.”',
   '¿Cuánto tiempo toma hoy armar el libro de órdenes para auditoría o para el cierre del día?'],
  ['7','18:00–23:00','EXPLICAR · Performance attribution (el diferenciador: dedicarle más tiempo)',
   ['**Resumen de desempeño**: {FONDO}, año corrido. Rentabilidad vs benchmark, exceso (alpha), tracking error e information ratio. Definir el período con **Fecha inicial** y **Fecha final**. Pasar el cursor por los íconos “i”. Pestaña Horizontes.','**Atribución de retorno**: cambiar el nivel a Macroactivo y luego a Moneda. Mostrar asignación vs selección.','**Contribución por activo** (mayores contribuyentes y detractores) y **Atribución renta fija** (cascada de carry, curva, spread y selección).','**Atribución mercado monetario** con {FONDO2}: devengo, efecto plazo, spread de contraparte y liquidez frente a su benchmark.','**Reportes**: en “Informe de rentabilidad mensual por portafolio” pulsar **Generar**, recorrer el asistente y **Descargar** el Excel con los datos de todos los portafolios.'],
   '“No solo cuánto rentó el portafolio, sino por qué: asignación, selección, curva, crédito, plazo o contraparte. Este es el análisis que hoy se arma a mano para el comité de inversiones.”',
   '¿Cómo le explican hoy al comité (o al cliente) de dónde vino el exceso de retorno?'],
  ['8','23:00–25:00','ADAPTAR y cierre · Parametrización',
   ['Abrir **Flujo de órdenes** (estados y acciones permitidas, también para mercado monetario).','Mostrar **Contrapartes y cupos** (cupo, utilizado y utilización: {CP} al **93,33 %**) y **Tasas de referencia** ({REF}). Rápido: **Portafolios**, **Instrumentos**, **Índices**, **Benchmarks** y **Configuración de límites** (Ver, Editar, Inactivar).','Señalar la línea **Módulos conectados** de cada maestro: qué pantallas alimenta y qué se afecta si se inactiva.','Opcional (30 s): '+c.multi,'Volver al Home.'],
   '“Esto se ajusta a su operación: los estados, portafolios, contrapartes, cupos, tasas y límites los define su equipo. Proponemos empezar con un piloto de uno o dos portafolios.”',
   '¿Qué portafolio y qué proceso les gustaría ver primero con sus propios datos?']
 ].map(s=>({n:s[0],min:s[1],pantalla:T(s[2]),hacer:s[3].map(T),decir:T(s[4]),preg:T(s[5])}));
 const cifras=[
  ['Saldo monetario de {FONDO2}','15.420.000.000','Dashboard › Mercado monetario'],
  ['Plazo promedio ponderado (tope 90 días)','≈ 49,8 días','Dashboard › Mercado monetario'],
  ['Tasa promedio E.A.','≈ 10,65 %','Dashboard › Mercado monetario'],
  ['Vence en 7 días','4.920.000.000 · 4 operaciones','Dashboard › Mercado monetario'],
  ['Cupo de {CP}','$7.200 M autorizado · $6.720 M utilizado (93,33 %) · $480 M disponible','Parametrización › Contrapartes y cupos'],
  ['Límite por emisor {EMISOR} (MAX 20 %)','92 % · Alerta','Control de límites › Evaluación'],
  ['Límite por contraparte {CP} (MAX 25 %)','94 % · Alerta','Control de límites › Evaluación'],
  ['Libro de órdenes (sin cargas previas)','58 órdenes: 26 renta fija, 14 renta variable y 18 mercado monetario','Órdenes › Reportes'],
  ['Archivos de ejemplo para Carga Masiva','Renta fija 6 · Renta variable 6 · Mercado monetario 6 · Instrumentos 5 · Benchmarks 4 · Contrapartes 4 filas (todas válidas: banda verde)','{CARPETA}']
 ].map(r=>r.map(T));
 const roles=[
  ['Gerente de inversiones','Ve posición, vencimientos, desempeño y su explicación en una sola plataforma; decide con datos del día.'],
  ['Riesgos y cumplimiento','Límites y cupos con alerta temprana; trazabilidad de cada orden y de cada cambio de estado.'],
  ['Operaciones y tesorería','Registro con validaciones, carga masiva por archivo, control de cupo al momento y libro de órdenes descargable.'],
  ['Comité y dirección','Informes de desempeño y atribución listos para descargar, con el mismo dato que ve el equipo.']
 ];
 const faq=[
  ['¿Estos son datos reales?','No. Son datos de ejemplo de {PAIS} ({MON}). En una implementación se conectan a la valoración y a las órdenes de su operación; el alcance se define en el levantamiento.'],
  ['¿Qué operaciones de mercado monetario cubre?','La demo muestra {OP}, {REPO}, interbancarios, overnight y títulos de deuda pública de corto plazo, con control de cupo por contraparte, escalera de vencimientos y devengo. Las definiciones finales (tipos de operación, cálculos y reglas) se validan con su área de tesorería en el levantamiento.'],
  ['¿Cómo controlan el cupo de las contrapartes?','Cada contraparte tiene un cupo en Parametrización. Al registrar una inversión, la plataforma muestra el cupo disponible y bloquea la operación si lo supera. La utilización se ve en Contrapartes y cupos y en Control de límites.'],
  ['¿Se integra con nuestros sistemas actuales?','Es la siguiente conversación: la demo muestra la experiencia. Las integraciones se definen con su área de tecnología. No prometer plazos ni interfaces concretas.'],
  ['¿Podemos cambiar los estados de las órdenes, los límites o los cupos?','Sí, por eso existe Parametrización: portafolios, contrapartes y cupos, tasas, índices, benchmarks y configuración de límites. El flujo mostrado es una propuesta para validar con su área de inversiones.'],
  ['¿Los reportes se pueden personalizar?','Los reportes de la demo (Libro de órdenes e informes de desempeño) se descargan en Excel y CSV. Los formatos propios del cliente se definen en el alcance.'],
  ['¿Y si operamos en otro país?','El selector de País está en la barra y cambia los datos de ejemplo entre Colombia, Chile, República Dominicana y Panamá, incluidas las operaciones monetarias. Cada país entra con su propia parametrización.'],
  ['¿Cumple con la normatividad / reportes regulatorios?','No afirmar cobertura normativa. Responder: los informes regulatorios se definen en el alcance con su área de cumplimiento.'],
  ['¿Dónde se ve el riesgo de mercado?','Medidas de sensibilidad (duración, convexidad, DV01), el plazo promedio ponderado del mercado monetario y el Resumen de desempeño (volatilidad, tracking error, máximo drawdown).']
 ].map(f=>[f[0],T(f[1])]);
 return {
  titulo:'Libreto de demo · Front de inversiones',
  sub:'Versión '+c.pais+' · clientes potenciales',
  ficha:[['Audiencia',c.aud],['Duración','25 minutos de demo + 10 de preguntas. Versión corta de 12 minutos más abajo.'],['Archivo','front-inversiones-performance-attribution.html (se abre con doble clic; no requiere internet).'],['Datos','De ejemplo para '+c.pais+'. '+c.extra+' Hilo conductor: **'+c.fondo+'** (renta fija) y **'+c.fondo2+'** (liquidez y mercado monetario).'],['Archivos de Carga Masiva',T('Carpeta {CARPETA}: un Excel y un CSV de ejemplo por pantalla, con datos de demostración. También se descargan desde cada Carga Masiva con “Descargar ejemplo con datos”.')]],
  mensaje:'**Una sola plataforma para ver, operar, controlar, reportar y explicar el desempeño de sus portafolios —renta fija, renta variable y mercado monetario—, sin hojas de Excel intermedias.**',
  pilares:['**Ver:** Visor de portafolio, flujos futuros, sensibilidades y posición monetaria.','**Operar:** órdenes de renta fija, renta variable y mercado monetario, con carga masiva validada y control de cupo por contraparte.','**Controlar y reportar:** límites que avisan antes de incumplirse y un libro de órdenes descargable.','**Explicar:** Performance attribution, el análisis que responde “¿por qué rentó lo que rentó?”.'],
  antes:['Abrir el HTML en Chrome o Edge y pasar a pantalla completa (F11).','Recargar con F5 para partir de los datos originales (las cargas masivas agregan filas de verdad).','Elegir **País = '+c.pais+'** (arriba a la derecha) y cerrar el menú lateral. Cambiar de país reinicia las ediciones hechas.','Dejar el **tema claro** (botón luna/sol, a la derecha de País). El tema oscuro se puede mostrar al final como detalle opcional.','Tener a mano la carpeta **'+T('{CARPETA}')+'** con los archivos de ejemplo (renta fija y mercado monetario son los dos que se cargan en la demo).','Tener claro el hilo: renta fija con **'+c.fondo+'**; liquidez y monetario con **'+c.fondo2+'**.'],
  escenas:scenes,cifras,roles,
  corta:'Escena **1** (Home, 1 min) → escena **3** solo la Carga Masiva con la banda verde (2 min) → escena **4** con el bloqueo por cupo y la escalera de vencimientos (4 min) → escena **5** (Límites, 1 min) → escena **7** limitada a Resumen y Atribución de retorno (3 min) → cierre de la escena **8** (1 min).',
  faq,
  nohacer:['Las Cargas Masivas cargan de verdad las filas válidas en el prototipo: recargar con F5 antes de la demo y no subir dos veces el mismo archivo (los instrumentos y las contrapartes repetidos se rechazan: sirve para mostrar el control de errores: la banda roja indica la fila y el motivo).','Los demás límites del módulo de evaluación se calculan con datos de ejemplo: comentar solo los de {EMISOR} y {CP}.','Si se cambia la Fecha operativa, las cifras del Dashboard varían unos puntos porcentuales: las de la tabla “Cifras para citar” son las del día en curso.','No afirmar integraciones, cumplimiento normativo ni fechas de entrega.','Las cifras son ilustrativas: no compararlas con portafolios reales del cliente.','Los nombres de bancos, instrumentos y tasas de cada país son ilustrativos: validarlos con el negocio antes de la demo.'].map(T),
  cierre:'“Si le hace sentido, el siguiente paso es un **piloto con uno o dos portafolios** para verlo con sus propios datos. Agendamos el levantamiento con su equipo de inversiones, tesorería y tecnología.”'
 };
}

/* ====== RENDER HTML ====== */
function buildHtml(c){
 const C=content(c);
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const rich=s=>esc(s).split('**').map((p,i)=>i%2?'<b>'+p+'</b>':p).join('');
 const ul=a=>'<ul>'+a.map(x=>'<li>'+rich(x)+'</li>').join('')+'</ul>';
 const tbl=(head,rows,cls)=>'<table'+(cls?' class="'+cls+'"':'')+'><thead><tr>'+head.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((x,i)=>'<td'+(i===0?' class="k"':'')+'>'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 const css=':root{--p:#6A1B9A;--soft:#F4ECF8;--line:#EADBF7;--mut:#6B7280}*{box-sizing:border-box}body{margin:0;background:#FDFAFF;color:#1F2937;font:15px/1.5 Inter,"Segoe UI",system-ui,sans-serif}.wrap{max-width:1180px;margin:0 auto;padding:28px 20px 60px}h1{font-size:30px;margin:0 0 4px;color:var(--p)}.sub{color:var(--mut);font-size:17px;margin:0 0 18px}h2{font-size:20px;color:var(--p);margin:30px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--line)}table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);font-size:14px}th{background:var(--p);color:#fff;text-align:left;padding:10px 12px}td{padding:10px 12px;border-top:1px solid #E5E7EB;vertical-align:top}td.k{background:var(--soft);font-weight:700}.msg{background:var(--soft);border-left:4px solid var(--p);border-radius:8px;padding:12px 16px;font-size:17px}ul{margin:8px 0;padding-left:22px}li{margin:4px 0}.esc td ul{padding-left:18px;margin:0}.dec{font-style:italic;color:#374151}.q{color:#0F766E}.tag{display:inline-block;background:var(--p);color:#fff;border-radius:999px;padding:1px 10px;font-weight:700;font-size:12px}.min{color:var(--mut);font-size:12px;white-space:nowrap}@media print{body{background:#fff}.wrap{padding:0}h2{break-after:avoid}tr{break-inside:avoid}}@media(max-width:760px){td,th{padding:8px}table{font-size:13px}}';
 const esc2=C.escenas.map(s=>['<span class="tag">'+s.n+'</span><div class="min">'+esc(s.min)+'</div>',esc(s.pantalla),'<ul>'+s.hacer.map(x=>'<li>'+rich(x)+'</li>').join('')+'</ul>','<span class="dec">'+rich(s.decir)+'</span>','<span class="q">'+esc(s.preg)+'</span>']);
 return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(C.titulo)+' · '+esc(c.pais)+'</title><style>'+css+'</style></head><body><div class="wrap"><h1>'+esc(C.titulo)+'</h1><p class="sub">'+esc(C.sub)+'</p>'
  +tbl(['Ficha','Detalle'],C.ficha.map(f=>[esc(f[0]),rich(f[1])]))
  +'<h2>Mensaje central</h2><div class="msg">'+rich(C.mensaje)+'</div>'+ul(C.pilares)
  +'<h2>Valor por rol</h2>'+tbl(['Rol','Qué gana'],C.roles.map(r=>[esc(r[0]),esc(r[1])]))
  +'<h2>Antes de empezar (2 minutos)</h2>'+ul(C.antes)
  +'<h2>Guion por escenas</h2>'+tbl(['Min','Pantalla','Qué hacer','Qué decir','Pregunta para el cliente'],esc2,'esc')
  +'<h2>Cifras para citar</h2>'+tbl(['Dato','Valor en la demo','Dónde se ve'],C.cifras.map(r=>[esc(r[0]),esc(r[1]),esc(r[2])]))
  +'<h2>Versión corta (12 minutos)</h2><p>'+rich(C.corta)+'</p>'
  +'<h2>Preguntas probables y cómo responder</h2>'+tbl(['Pregunta','Respuesta sugerida'],C.faq.map(f=>[esc(f[0]),esc(f[1])]))
  +'<h2>Qué NO hacer en la demo</h2>'+ul(C.nohacer)
  +'<h2>Cierre y siguiente paso</h2><div class="msg">'+rich(C.cierre)+'</div></div></body></html>';
}

if(require.main===module){for(const c of COUNTRIES){fs.writeFileSync('C:/Derivados AF/Libreto_demo_Front_de_inversiones_'+c.file+'.html',buildHtml(c),'utf8');console.log('ok',c.file)}}
module.exports={COUNTRIES,content};
