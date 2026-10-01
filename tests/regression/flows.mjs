// Flujos funcionales (9.3) por país. Parte del arnés en página (harness.js) y de los flujos de la propuesta (flows2.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { here, openApp, COUNTRIES } from './lib.mjs';

export const CFG = {
  'Colombia': { fondo: 'FIC RENTA FIJA', fondo2: 'FIC LIQUIDEZ', emisor: 'FINDETER', cp: 'BANCOLOMBIA S.A.', bad: ['CLP', 'DOP', 'CORFO', 'BANCO ADEMI', 'FONDO MUTUO', 'FONDO ABIERTO', 'Efecto moneda / UF', 'Apoya a', 'DPF', 'PACTO DE RETRO', 'REPORTO', 'BANCO GENERAL'] },
  'Chile': { fondo: 'FONDO MUTUO RENTA FIJA', fondo2: 'FONDO MUTUO LIQUIDEZ', emisor: 'CORFO', cp: 'BANCO SANTANDER CHILE', bad: ['FINDETER', 'FIC ', 'DOP', 'BANCO ADEMI', 'FONDO ABIERTO', 'Apoya a', 'BANCOLOMBIA', 'CDT', 'SIMULTÁNEA', 'REPORTO', 'BANCO GENERAL'] },
  'República Dominicana': { fondo: 'FONDO ABIERTO RENTA FIJA', fondo2: 'FONDO ABIERTO LIQUIDEZ', emisor: 'BANCO ADEMI', cp: 'BANCO POPULAR DOMINICANO', bad: ['FINDETER', 'FIC ', 'CLP', 'CORFO', 'FONDO MUTUO', 'Apoya a', 'BANCOLOMBIA', 'CDT', 'SIMULTÁNEA', 'PACTO DE RETRO', 'BANCO GENERAL'] },
  'Panamá': { fondo: 'FONDO DE INVERSIÓN RENTA FIJA', fondo2: 'FONDO DE INVERSIÓN LIQUIDEZ', emisor: 'BANCO HIPOTECARIO NACIONAL', cp: 'BANCO GENERAL', bad: ['FINDETER', 'FIC ', 'CLP', 'DOP', 'CORFO', 'BANCO ADEMI', 'FONDO MUTUO', 'FONDO ABIERTO', 'Apoya a', 'BANCOLOMBIA', 'CDT', 'SIMULTÁNEA', 'PACTO DE RETRO', 'REPORTO'] }
};
/* cifras esperadas del Libro de órdenes al final de la secuencia de pruebas (se actualizan por fase) */
export const EXPECT = { libro: 109, kpis: [['Renta fija', 40], ['Renta variable', 28], ['Mercado monetario', 33], ['Derivados', 8]] };

export async function runFlows(browser, html, R) {
  const harness = fs.readFileSync(path.join(here, 'harness.js'), 'utf8');
  for (const pais of COUNTRIES) {
    const errors = [], net = [];
    const { ctx, page } = await openApp(browser, html, { pais: 'Colombia', errors, net });
    await page.evaluate(harness);
    const res = await page.evaluate(cfg => window.__reg(cfg), Object.assign({ pais, exp: EXPECT }, CFG[pais]));
    res.forEach(r => R.add(pais, 'flujos', r.test, r.ok, r.detalle));
    R.add(pais, 'flujos', 'Consola sin errores durante los flujos', errors.length === 0, errors.slice(0, 3).join(' | '));
    R.add(pais, 'flujos', 'Sin peticiones de red durante los flujos', net.length === 0, net.slice(0, 3).join(' | '));
    await ctx.close();
  }
}
