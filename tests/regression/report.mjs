// Genera docs/REGRESION-DEMO.md a partir de out/resultado.json y expected-changes.json
import fs from 'node:fs';
import path from 'node:path';
import { here, COUNTRIES } from './lib.mjs';

const ROOT = path.resolve(here, '..', '..');
const res = JSON.parse(fs.readFileSync(path.join(here, 'out', 'resultado.json'), 'utf8'));
const exp = JSON.parse(fs.readFileSync(path.join(here, 'expected-changes.json'), 'utf8'));
const ALL = ['Colombia', 'Chile', 'República Dominicana', 'Panamá'];
const temas = [...new Set(res.filas.map(r => r.tema))];
const grupo = t => /^rutas/.test(t) ? 'Rutas (' + t.split('/')[1] + ')' : t[0].toUpperCase() + t.slice(1);
const grupos = [...new Set(res.filas.map(r => grupo(r.tema)))];
let md = `# Regresión de la demo · Front de inversiones\n\nGenerado el ${new Date(res.fecha).toLocaleString('es-ES')} con \`node tests/regression/run.mjs\` (Playwright + Chromium, abre el HTML por \`file://\`).\n\n**Resultado global: ${res.total - res.fallas} aprobadas, ${res.fallas} falladas de ${res.total} verificaciones.**\n\n## 1. Resultado por país y por prueba\n\n| Prueba | ${ALL.join(' | ')} |\n| --- | ${ALL.map(() => '---').join(' | ')} |\n`;
for (const g of grupos) {
  const cells = ALL.map(p => { const f = res.filas.filter(r => r.pais === p && grupo(r.tema) === g); if (!f.length) return '—'; const ok = f.filter(r => r.ok).length; return (ok === f.length ? 'Aprobada' : 'FALLÓ') + ` (${ok}/${f.length})`; });
  md += `| ${g} | ${cells.join(' | ')} |\n`;
}
const fails = res.filas.filter(r => !r.ok);
md += fails.length ? '\n### Pruebas que fallaron\n\n' + fails.map(f => `- [${f.pais}] ${f.tema} · ${f.test}${f.detalle ? ' → ' + f.detalle : ''}`).join('\n') + '\n' : '\nNinguna prueba falló.\n';
md += `\n## 2. Cambios intencionales respecto de la línea base (Fase 0)\n\nLa línea base se tomó antes de tocar el prototipo (texto visible por país y ruta, y cifras invariantes). Estas rutas cambian a propósito:\n\n| Ruta | Países | Motivo |\n| --- | --- | --- |\n` + exp.cambios.map(c => `| \`${c.ruta}\` | ${c.paises === '*' ? 'Todos' : c.paises.join(', ')} | ${c.motivo} |`).join('\n') + `\n\nCifras que cambian a propósito: ${Object.keys(exp.cifras).map(k => `**${k}** (${exp.cifras[k]})`).join('; ')}.\n\nCambios menores no planeados en el texto de la propuesta: el grupo del menú pasó de «Ordenes» a «Órdenes» (etiqueta, breadcrumbs y textos).\n`;
md += fs.readFileSync(path.join(here, 'REGRESION-DEMO.parte2.md'), 'utf8');
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'REGRESION-DEMO.md'), md);
console.log('docs/REGRESION-DEMO.md generado');
