// Ejecuta de principio a fin los pasos verificables de cada libreto (tests/libretos/<país>.json) con el mismo arnés.
import fs from 'node:fs';
import path from 'node:path';
import { here, openApp, go, settle, COUNTRIES, setCountry } from './lib.mjs';

const FILES = { 'Colombia': 'colombia', 'Chile': 'chile', 'República Dominicana': 'republica_dominicana', 'Panamá': 'panama' };
const ROOT = path.resolve(here, '..', '..');
const norm = t => t.replace(/\s+/g, ' ').toLowerCase();
const matcher = e => { const m = /^\/(.*)\/([a-z]*)$/.exec(e); return m ? (t => new RegExp(m[1], 'i').test(t)) : (t => t.includes(norm(e))); };

async function act(page, a) {
  if (a.t === 'click') await page.locator(a.sel).first().click();
  else if (a.t === 'elegir') await page.locator(a.sel).first().selectOption({ label: a.valor });
  else if (a.t === 'escribir') await page.locator(a.sel).first().fill(a.valor);
  else if (a.t === 'tecla') await page.locator(a.sel).first().press(a.valor);
  else if (a.t === 'marcar') await page.locator(a.sel).first().check();
  else if (a.t === 'subir') await page.locator(a.sel).first().setInputFiles(path.join(ROOT, a.archivo));
  else if (a.t === 'esperar') await page.waitForTimeout(a.ms);
  else throw new Error('acción desconocida: ' + a.t);
  await page.waitForTimeout(120);
}

export async function runLibretos(browser, html, R) {
  for (const pais of COUNTRIES) {
    const f = path.join(ROOT, 'tests', 'libretos', FILES[pais] + '.json');
    if (!fs.existsSync(f)) { R.add(pais, 'libretos', 'Existe tests/libretos/' + FILES[pais] + '.json', false); continue; }
    const L = JSON.parse(fs.readFileSync(f, 'utf8'));
    const errors = [], net = [];
    const { ctx, page } = await openApp(browser, html, { pais, errors, net });
    for (const esc of L.escenas) {
      let i = 0;
      for (const p of esc.pasos) {
        i++;
        const name = `Libreto · escena ${esc.escena} (${esc.pantalla.slice(0, 48)}) · paso ${i}`;
        try {
          if (p.ruta) await go(page, p.ruta);
          for (const a of p.acciones) await act(page, a);
          await page.waitForTimeout(150);
          const text = norm(await page.evaluate(() => document.body.innerText));
          const miss = p.textoEsperado.filter(e => !matcher(e)(text));
          const bad = p.textoNoEsperado.filter(e => matcher(e)(text));
          R.add(pais, 'libretos', name, miss.length === 0 && bad.length === 0, (miss.length ? 'falta: ' + miss.join(' | ') : '') + (bad.length ? ' sobra: ' + bad.join(' | ') : ''));
        } catch (e) { R.add(pais, 'libretos', name, false, String(e.message).split('\n')[0]); }
        await page.evaluate(() => document.querySelectorAll('.mk-modal-overlay').forEach(m => { if (!m.querySelector('.mk-modal--wizard')) m.remove(); }));
      }
      await page.evaluate(() => document.querySelectorAll('.mk-modal-overlay').forEach(m => m.remove()));
    }
    R.add(pais, 'libretos', 'Libreto sin errores de consola ni red', errors.length === 0 && net.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
}
