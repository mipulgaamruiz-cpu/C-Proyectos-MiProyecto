// 9.1 cobertura de rutas, 9.2 fuga de localización, 9.5 comparación con la línea base, 9.6 tiempos
import path from 'node:path';
import fs from 'node:fs';
import { here, slug, go, viewText, routesOf, forbiddenFor, leaks, BAD_TEXT, readJSON, writeFile, openApp, COUNTRIES } from './lib.mjs';

const BASE = path.join(here, 'baseline'), OUT = path.join(here, 'out');
const norm = t => t.replace(/\s+/g, ' ').trim();

export async function runRoutes(browser, html, R, { update = false, screens = true } = {}) {
  const expected = readJSON(path.join(here, 'expected-changes.json'), { cambios: [] });
  const changed = (route, pais) => expected.cambios.find(c => (c.ruta === '*' || c.ruta === route) && (!c.paises || c.paises === '*' || c.paises.includes(pais)));
  for (const pais of COUNTRIES) {
    for (const tema of ['light', 'dark']) {
      const errors = [], net = [];
      const { ctx, page, loadMs } = await openApp(browser, html, { pais, tema, errors, net });
      const T = `rutas/${tema}`;
      if (tema === 'light') R.add(pais, 'preparación', 'Carga inicial < 2 s', loadMs < 2000, loadMs + ' ms');
      const routes = await routesOf(page);
      const terms = pais === 'Colombia' ? null : await forbiddenFor(page, pais);
      for (const r of routes) {
        const ms = await go(page, r.route);
        const text = await viewText(page);
        const id = `${pais} · ${r.route}`;
        /* 9.1 */
        const bad = text.match(BAD_TEXT);
        R.add(pais, T, `${r.route} sin textos rotos`, !bad, bad ? bad[0] : '');
        const info = await page.evaluate(({ route, kind }) => {
          const q = s => [...document.querySelectorAll(s)];
          const v = document.querySelector('#view');
          const bc = document.querySelector('#mkBreadcrumb').innerText.replace(/\s+/g, ' ').trim();
          const active = q('#sbNav a.active').map(a => a.dataset.go);
          const tables = q('#view table.mk-table').filter(t => t.offsetParent).map(t => ({ rows: t.querySelectorAll('tbody tr:not(:has(.mk-empty))').length, empty: !!t.querySelector('.mk-empty') }));
          const kpis = q('#view .mk-kpi__v').map(k => k.innerText.trim());
          const svgs = q('#view svg[role=img]').map(s => s.querySelectorAll('rect,path,polyline,circle').length);
          const cards = q('#view a.mk-linkcard').map(a => ({ go: a.dataset.go, t: a.querySelector('.mk-linkcard__title').innerText.trim() }));
          const spin = !!v.querySelector('.mk-spinner');
          return { bc, active, tables, kpis, svgs, cards, spin, hs: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        }, r);
        R.add(pais, T, `${r.route} renderiza sin spinner`, !info.spin);
        const expBc = r.kind === 'home' ? 'Front de inversiones' : r.kind === 'landing' ? `Front de inversiones › ${r.label}` : `Front de inversiones › ${r.group} › ${r.label}`;
        R.add(pais, T, `${r.route} breadcrumb`, info.bc.replace(/\s*›\s*/g, ' › ') === expBc, info.bc);
        const wantActive = r.kind === 'home' ? '#/' : r.route;
        R.add(pais, T, `${r.route} menú activo`, info.active.includes(wantActive), info.active.join(','));
        if (r.kind !== 'item') {
          const nav = await page.evaluate(() => window.__mk.NAV);
          const groups = r.kind === 'home' ? nav : nav.filter(g => g.home === r.route);
          const expCards = groups.flatMap(g => g.items.map(i => ({ go: i[0], t: i[1] })));
          R.add(pais, T, `${r.route} tarjetas llevan a su ruta, en el orden del menú`, JSON.stringify(info.cards) === JSON.stringify(expCards), info.cards.length + ' de ' + expCards.length);
        }
        info.tables.forEach((t, i) => R.add(pais, T, `${r.route} tabla ${i + 1} con filas`, t.rows > 0 || !!(await_ok(r.route))));
        const low = await page.evaluate(() => {
          const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
          const parse = s => { const m = s.match(/rgba?(([^)]+))/); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
          const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0.6) return c; } return parse(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1]; };
          const bad = []; const walker = document.createTreeWalker(document.querySelector('#view'), NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) { const n = walker.currentNode, t = n.textContent.trim(); if (!t) continue; const el = n.parentElement; if (!el || !el.offsetParent || el.closest('svg')) continue; const st = getComputedStyle(el); if (st.visibility === 'hidden' || parseFloat(st.opacity) < 0.4) continue; const fg = parse(st.color), bg = bgOf(el); if (!fg) continue; const L1 = lum(fg), L2 = lum(bg), cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); if (cr < 2.6) bad.push(t.slice(0, 24) + ' (' + cr.toFixed(1) + ')'); }
          return bad.slice(0, 4);
        });
        R.add(pais, T, `${r.route} texto legible (contraste mínimo)`, low.length === 0, low.join(' | '));
        R.add(pais, T, `${r.route} KPIs con valor`, info.kpis.every(k => k && !/^(—|-)?$/.test(k)), info.kpis.join(' | '));
        R.add(pais, T, `${r.route} gráficos con contenido`, info.svgs.every(n => n > 1), info.svgs.join(','));
        if (tema === 'light') R.add(pais, 'rendimiento', `${r.route} navega < 1 s`, ms < 1000, ms + ' ms');
        /* 9.2 */
        if (terms) { const h = leaks(text, terms); R.add(pais, 'localización', `${r.route} sin términos de Colombia`, h.length === 0, h.join(', ')); }
        /* 9.5 */
        const f = path.join(BASE, slug(pais), slug(r.route) + '.txt');
        if (tema === 'light') {
          if (update) writeFile(f, norm(text));
          else if (fs.existsSync(f)) {
            const same = fs.readFileSync(f, 'utf8') === norm(text), ch = changed(r.route, pais);
            R.add(pais, 'línea base', `${r.route} igual a la línea base${ch ? ' (cambio intencional: ' + ch.motivo + ')' : ''}`, same || !!ch, same ? '' : 'texto distinto');
          } else R.add(pais, 'línea base', `${r.route} ruta nueva (sin línea base)`, true, 'nueva');
        }
        if (screens) {
          const shot = path.join(update ? BASE : OUT, slug(pais), tema, slug(r.route) + '.jpg');
          fs.mkdirSync(path.dirname(shot), { recursive: true });
          await page.screenshot({ path: shot, type: 'jpeg', quality: 55 });
        }
      }
      /* desbordes horizontales */
      if (tema === 'light') {
        for (const [w, h] of [[1366, 768], [1920, 1080]]) {
          await page.setViewportSize({ width: w, height: h });
          for (const r of routes) {
            await go(page, r.route);
            const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            R.add(pais, 'diseño', `${r.route} sin desborde horizontal a ${w}×${h}`, o <= 1, o + ' px');
          }
        }
        await page.setViewportSize({ width: 1440, height: 900 });
      }
      R.add(pais, T, 'Consola sin errores ni advertencias', errors.length === 0, errors.slice(0, 3).join(' | '));
      R.add(pais, T, 'Sin peticiones de red', net.length === 0, net.slice(0, 3).join(' | '));
      await ctx.close();
    }
  }
}
const await_ok = route => false;
