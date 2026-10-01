const fs=require('fs');let s=fs.readFileSync('libreto.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,100));s=s.replace(a,()=>b)};
// --- solo HTML ---
rep("const d=require('docx');\nconst {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,AlignmentType,PageOrientation,LevelFormat,HeadingLevel}=d;\n","");
{const a=s.indexOf('/* ====== RENDER WORD ====== */'),b=s.indexOf('/* ====== RENDER HTML ====== */');if(a<0||b<0)throw new Error('render word');s=s.slice(0,a)+s.slice(b)}
{const a=s.indexOf('(async()=>{for(const c of COUNTRIES)');if(a<0)throw new Error('loop');s=s.slice(0,a)+"for(const c of COUNTRIES){fs.writeFileSync('C:/Derivados AF/Libreto_demo_Front_de_inversiones_'+c.file+'.html',buildHtml(c),'utf8');console.log('ok',c.file)}\n"}
// --- contenido ---
rep("'Abrir “Leyendas” y filtrar la tabla con Buscar.',","'Abrir “Leyendas” y filtrar la tabla con Buscar.','Señalar la **Fecha operativa** (viene con el día en curso y no se deja en blanco) y cambiarla para ver otro día.',");
rep("'Órdenes › Renta fija',","'Órdenes › Renta fija (Registro Individual y Carga Masiva)',");
rep("'Ver detalle de una orden y **Anular** otra, mostrando la confirmación.'],","'Ver detalle de una orden y **Anular** otra, mostrando la confirmación.','Filtrar por **Fecha inicial** y **Fecha final** y abrir la pestaña **Carga Masiva**: descargar la **Estructura** y el **Manual**, elegir un archivo y **Procesar**.'],");
rep("'Localizar el límite MAX por emisor de {EMISOR} (20%): utilización del 92 %, estado **Alerta**.',","'Localizar el límite MAX por emisor de {EMISOR} (20%): utilización del 92 %, estado **Alerta**. La **Fecha operativa** permite ver otro día.',");
rep("Pasar el cursor por los íconos “i”. Pestaña Horizontes.'","Definir el período con **Fecha inicial** y **Fecha final**. Pasar el cursor por los íconos “i”. Pestaña Horizontes.'");
rep("nohacer:['No usar “Carga masiva” ni “Importar”: en el prototipo no procesan el archivo.',","nohacer:['En Carga Masiva, **Procesar** valida la estructura de un CSV y muestra el resultado, pero no agrega las filas a las tablas del prototipo: mostrarlo como flujo.',");
fs.writeFileSync('libreto.js',s);console.log('libreto.js ok');
