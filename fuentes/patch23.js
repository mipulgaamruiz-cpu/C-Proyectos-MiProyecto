const fs=require('fs');let s=fs.readFileSync('libreto.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,100));s=s.replace(a,()=>b)};
rep("abrir la pestaña **Carga Masiva**: descargar la **Estructura** y el **Manual**, elegir un archivo y **Procesar**.","abrir la pestaña **Carga Masiva**: descargar la **Estructura** (Excel con listas desplegables) y el **Manual**, elegir el archivo diligenciado y **Procesar**. Las filas válidas aparecen en Registro Individual; las inválidas se informan con su número de fila.");
rep("nohacer:['En Carga Masiva, **Procesar** valida la estructura de un CSV y muestra el resultado, pero no agrega las filas a las tablas del prototipo: mostrarlo como flujo.',","nohacer:['La Carga Masiva carga de verdad las filas válidas en el prototipo: si se prueba antes de la demo, recargar con F5 para volver a los datos originales.',");
fs.writeFileSync('libreto.js',s);console.log('ok');
