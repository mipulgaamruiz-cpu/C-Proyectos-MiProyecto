// Uso:  node tests/regression/run.mjs [--html ruta.html] [--update-baseline] [--only rutas,flujos,numeros,libretos] [--no-screens]
//       npm run regression  (desde la carpeta tests)
import path from 'node:path';
import fs from 'node:fs';
import { here, launch, Results, writeFile } from './lib.mjs';
import { runRoutes } from './routes.mjs';

const args = process.argv.slice(2);
const flag = n => args.includes('--' + n);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const HTML = path.resolve(opt('html', path.join(here, '..', '..', 'front-inversiones-performance-attribution.html')));
const only = (opt('only', '') || '').split(',').filter(Boolean);
const want = k => !only.length || only.includes(k);
const R = new Results();
const browser = await launch();
const t0 = Date.now();
try {
  if (want('rutas')) await runRoutes(browser, HTML, R, { update: flag('update-baseline'), screens: !flag('no-screens') });
  if (want('flujos')) { try { const m = await import('./flows.mjs'); await m.runFlows(browser, HTML, R); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; } }
  if (want('propuesta')) { const { COUNTRIES } = await import('./lib.mjs'); const m = await import('./flows2.mjs'); const m3 = await import('./flows3.mjs'); const m4 = await import('./flows4.mjs'); for (const p of COUNTRIES) { await m.runFlows2(browser, HTML, R, p); await m3.runFlows3(browser, HTML, R, p); await m4.runFlows4(browser, HTML, R, p); } }
  if (want('numeros')) { try { const m = await import('./numbers.mjs'); await m.runNumbers(browser, HTML, R, { update: flag('update-baseline') }); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; } }
  if (want('libretos')) { try { const m = await import('./libretos.mjs'); await m.runLibretos(browser, HTML, R); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; } }
} finally { await browser.close(); }

/* resumen */
const by = {};
R.rows.forEach(r => { const k = r.pais + ' · ' + r.tema; by[k] = by[k] || { ok: 0, fail: 0 }; r.ok ? by[k].ok++ : by[k].fail++; });
console.log('\nResumen (aprobadas / falladas) —', ((Date.now() - t0) / 1000).toFixed(0) + ' s');
Object.keys(by).forEach(k => console.log('  ' + k.padEnd(48) + by[k].ok + ' / ' + by[k].fail));
const fails = R.fails;
console.log('\nTotal: ' + (R.rows.length - fails.length) + ' aprobadas, ' + fails.length + ' falladas');
fails.slice(0, 60).forEach(f => console.log('  FALLA [' + f.pais + '] ' + f.tema + ' · ' + f.test + (f.detalle ? ' → ' + f.detalle : '')));
writeFile(path.join(here, 'out', 'resultado.json'), JSON.stringify({ fecha: new Date().toISOString(), html: HTML, total: R.rows.length, fallas: fails.length, filas: R.rows }, null, 1));
process.exit(fails.length ? 1 : 0);
