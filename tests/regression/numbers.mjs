// 9.4 invariantes numéricos
import path from 'node:path';
import { here, openApp, go, COUNTRIES, readJSON, writeFile } from './lib.mjs';

const BASEFILE = path.join(here, 'baseline', 'invariantes.json');
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));

export async function runNumbers(browser, html, R, { update = false } = {}) {
  const base = readJSON(BASEFILE, null), now = {};
  for (const pais of COUNTRIES) {
    const { ctx, page } = await openApp(browser, html, { pais });
    const m = await page.evaluate(() => {
      const M = window.__mk, out = { contrib: [], brinson: [], mm: [], metrics: {} };
      const per = ['MTD', 'YTD', '12M', 'SI'], FUNDS = M.DS.FUNDS;
      FUNDS.forEach(p => per.forEach(k => {
        const c = M.contributions(p, k), s = c.rows.reduce((a, x) => a + x.c, 0);
        out.contrib.push({ p, k, d: Math.abs(s - c.T) });
        ['Macroactivo', 'Subactivo', 'Clase de inversión', 'Moneda'].forEach(l => {
          const b = M.brinson(p, k, l), sum = b.rows.reduce((a, x) => a + x.tot, 0) + (b.hedge ? b.hedge.net : 0) + (b.fx ? b.fx.net : 0);
          out.brinson.push({ p, k, l, d: Math.abs(sum - b.exc), hedge: b.hedge ? b.hedge.net : 0 });
        });
      }));
      [FUNDS[0], FUNDS[8], FUNDS[1]].forEach(p => {
        const dt = new Date().toISOString().slice(0, 10), c = M.mmCalc(p, dt);
        const sumRows = c.rows.reduce((a, x) => a + x.nominal, 0);
        const buckets = [[0, 1], [2, 7], [8, 30], [31, 90], [91, 1e9]].map(b => c.rows.filter(x => x.rest >= b[0] && x.rest <= b[1]).reduce((a, x) => a + x.nominal, 0));
        out.mm.push({ p, d: Math.abs(buckets.reduce((a, b) => a + b, 0) - c.tot), tot: Math.round(c.tot), wam: +c.wam.toFixed(4), tasa: +c.tasa.toFixed(6), v7: Math.round(c.v7) });
      });
      /* cifras que no deben cambiar entre fases */
      const lim = M.evalRows({ op: new Date().toISOString().slice(0, 10) });
      out.metrics.limitesEvaluados = lim.length;
      out.metrics.alertas = lim.filter(r => r.estado === 'Alerta').length;
      out.metrics.cupoBancolombia = M.cpUsed(M.DS.MM_CP[0].name);
      out.metrics.contrapartes = M.DS.MM_CP.length;
      out.metrics.ordenesRF = M.DS.FI_ORDERS.length; out.metrics.ordenesRV = M.DS.VI_ORDERS.length; out.metrics.ordenesMM = M.DS.MM_ORDERS.length;
      out.metrics.brinsonBalanceado1YTD = M.brinson(FUNDS[5], 'YTD', 'Macroactivo').exc;
      return out;
    });
    const T = 'invariantes';
    R.add(pais, T, 'Contribución por activo: suma de contribuciones = retorno del portafolio', m.contrib.every(x => x.d < 1e-12), 'máx ' + Math.max(...m.contrib.map(x => x.d)));
    R.add(pais, T, 'Atribución de retorno: asignación + selección + interacción (+ cobertura) = exceso', m.brinson.every(x => x.d < 1e-12), 'máx ' + Math.max(...m.brinson.map(x => x.d)));
    R.add(pais, T, 'Mercado monetario: totales por bucket = suma de posiciones', m.mm.every(x => x.d < 1), 'máx ' + Math.max(...m.mm.map(x => x.d)));
    /* KPIs de las listas = filas con los filtros aplicados */
    for (const [route, kpiSel] of [['#/orders/fixed-income', 'Portafolio'], ['#/orders/money-market', 'Portafolio']]) {
      await go(page, route);
      const sel = page.locator('#view select[data-fl="port"]');
      const first = await sel.locator('option').nth(1).textContent();
      await sel.selectOption({ label: first });
      const r = await page.evaluate(() => {
        const nums = [...document.querySelectorAll('#view .mk-kpi__v')].map(k => parseInt(k.innerText.replace(/\D/g, ''), 10) || 0);
        const info = document.querySelector('#view .mk-rowinfo').innerText.match(/de (\d+)/);
        return { sum: nums.slice(0, 4).reduce((a, b) => a + b, 0), total: +info[1] };
      });
      R.add(pais, T, `${route}: suma de KPIs = filas visibles tras filtrar`, r.sum === r.total, `${r.sum} vs ${r.total}`);
    }
    /* cupos: utilizado + exposición de derivados + disponible = cupo */
    await go(page, '#/parametrizacion/counterparties');
    const cup = await page.evaluate(() => { const num = t => parseInt(t.replace(/\./g, '').replace(/[^0-9-]/g, ''), 10) || 0; return [...document.querySelectorAll('#pg tbody tr')].filter(tr => tr.children.length >= 8).map(tr => { const c = [...tr.children].map(x => x.innerText.trim()); return { n: c[1], cupo: num(c[4]), mm: num(c[5]), dv: num(c[6]), disp: num(c[7]), util: c[8] }; }); });
    R.add(pais, T, 'Cupos: utilizado (mercado monetario) + exposición de derivados + disponible = cupo autorizado', cup.length > 0 && cup.every(x => Math.abs(x.mm + x.dv + x.disp - x.cupo) <= 1), JSON.stringify(cup.filter(x => Math.abs(x.mm + x.dv + x.disp - x.cupo) > 1)).slice(0, 200));
    R.add(pais, T, 'Cupos: la utilización total es (mercado monetario + derivados) sobre el cupo', cup.every(x => { const u = parseFloat(x.util.replace(/\./g, '').replace(',', '.')); return Math.abs(u - (x.mm + x.dv) / x.cupo * 100) < 0.06; }));
    /* % cubierto = nocional de cobertura / exposición bruta */
    await go(page, '#/dashboard/exposure');
    const ex = await page.evaluate(() => { const num = t => parseInt(t.replace(/\./g, '').replace(/[^0-9-]/g, ''), 10) || 0; const k = [...document.querySelectorAll('#view .mk-kpi')].map(x => x.innerText.replace(/\s+/g, ' ')); const rows = [...document.querySelectorAll('#t tbody tr')].filter(tr => tr.children.length === 8); const br = rows.reduce((a, tr) => a + num(tr.children[2].innerText), 0), cb = rows.reduce((a, tr) => a + num(tr.children[3].innerText), 0); return { k, br, cb }; });
    const pk = parseFloat((ex.k.find(x => /% cubierto/i.test(x)).match(/(\d+,\d+) %/) || [0, 0])[1].toString().replace(',', '.'));
    R.add(pais, T, 'Exposición y cobertura: % cubierto = nocional de cobertura / exposición bruta', ex.br > 0 && Math.abs(pk - ex.cb / ex.br * 100) < 0.06, pk + ' vs ' + (ex.cb / ex.br * 100).toFixed(2));
    /* KPIs = filas visibles tras filtrar (derivados y libro de órdenes) */
    await go(page, '#/orders/derivatives');
    await page.locator('#view select[data-fl="inst"]').selectOption({ index: 1 });
    const kd = await page.evaluate(() => { const nums = [...document.querySelectorAll('#view .mk-kpi__v')].map(k => parseInt(k.innerText.replace(/\D/g, ''), 10) || 0); return { sum: nums.reduce((a, b) => a + b, 0), total: +document.querySelector('#view .mk-rowinfo').innerText.match(/de (\d+)/)[1] }; });
    R.add(pais, T, '#/orders/derivatives: suma de KPIs = filas visibles tras filtrar', kd.sum === kd.total, kd.sum + ' vs ' + kd.total);
    await go(page, '#/orders/reports'); await page.click('[data-r="der"]'); await page.click('[data-gen]'); await page.waitForSelector('#out .mk-rowinfo');
    const kl = await page.evaluate(() => { const v = [...document.querySelectorAll('#out .mk-kpi')].map(k => [k.querySelector('.mk-kpi__l').innerText.trim().toLowerCase(), parseInt(k.querySelector('.mk-kpi__v').innerText.replace(/\D/g, ''), 10) || 0]); return { o: v[0][1], cob: (v.find(x => /cobertura/.test(x[0])) || [0, 0])[1], prop: (v.find(x => /^inversión$/.test(x[0])) || [0, 0])[1], amb: (v.find(x => /cobertura e inversión/.test(x[0])) || [0, 0])[1], total: +document.querySelector('#out .mk-rowinfo').innerText.match(/de (\d+)/)[1] }; });
    R.add(pais, T, 'Informe de derivados: KPI de órdenes = filas visibles y cobertura + inversión + ambas = órdenes', kl.o === kl.total && kl.cob + kl.prop + kl.amb === kl.total, JSON.stringify(kl));
    now[pais] = m.metrics; now[pais + '_mm'] = m.mm.map(x => ({ p: x.p, tot: x.tot, wam: x.wam, tasa: x.tasa, v7: x.v7 }));
    await ctx.close();
  }
  if (update || !base) { writeFile(BASEFILE, JSON.stringify(now, null, 1)); }
  else {
    for (const pais of COUNTRIES) {
      const a = base[pais], b = now[pais];
      if (!a) { R.add(pais, 'invariantes', 'Cifras de referencia nuevas para este país (sin línea base)', true, 'nuevo'); continue; }
      const exp = readJSON(path.join(here, 'expected-changes.json'), {}).cifras || {};
      Object.keys(a).forEach(k => { const ch = exp[k]; R.add(pais, 'invariantes', `Cifra estable: ${k}${ch ? ' (cambio intencional: ' + ch + ')' : ''}`, near(a[k], b[k], 1e-12) || !!ch, `${a[k]} → ${b[k]}`); });
      R.add(pais, 'invariantes', 'Cifras de mercado monetario (mmCalc) sin cambios', JSON.stringify(base[pais + '_mm']) === JSON.stringify(now[pais + '_mm']));
    }
  }
}
