// Flujos de la propuesta multiproducto (F1–F8, F12, F13): derivados, evidencia, límites, precarga y cambio de país
import { openApp, go, settle, viewText, forbiddenFor, leaks, BAD_TEXT, setCountry } from './lib.mjs';

const W = '.mk-modal--wizard';
async function wizOpen(page) { await go(page, '#/orders/derivatives'); await page.click('[data-new]'); await page.waitForSelector(W); }
async function step0(page, { port, inst, noc, plazo, prop }) {
  await page.selectOption(`${W} [name="d-port"]`, { label: port });
  await page.selectOption(`${W} [name="d-inst"]`, { label: inst });
  await page.fill(`${W} [name="d-noc"]`, String(noc));
  await page.fill(`${W} [name="d-plazo"]`, String(plazo));
  if (prop) await page.check(`${W} [name="d-prop"][value="${prop}"]`);
  await page.click(`${W} [data-n]`);
}
const next = page => page.click(`${W} [data-n]`);
const txt = page => page.evaluate(() => document.querySelector('.mk-modal--wizard').innerText.replace(/\s+/g, ' '));
const closeModals = page => page.evaluate(() => document.querySelectorAll('.mk-modal-overlay').forEach(m => m.remove()));

export async function runFlows2(browser, html, R, pais) {
  const T = 'flujos propuesta';
  const errors = [], net = [];
  const { ctx, page } = await openApp(browser, html, { pais, errors, net });
  const D = await page.evaluate(() => ({ F: window.__mk.DS.FUNDS.slice(), cps: window.__mk.DS.MM_CP.map(c => c.name) }));
  const BG = D.F[6], B1 = D.F[5], bk = D.cps[0];
  const ok = (n, c, d) => R.add(pais, T, n, c, d);
  const evCount = () => page.evaluate(() => window.__mk.DS.DERIV_EVID.length);
  const lastOrder = () => page.evaluate(() => window.__mk.DS.DERIV_ORDERS[0]);

  /* F1 · orden completa con 3 cotizaciones y la mejor */
  const ev0 = await evCount();
  await wizOpen(page);
  await step0(page, { port: BG, inst: 'Forward de divisas OTC', noc: 2000000000, plazo: 90 });
  await page.waitForSelector(`${W} .mk-srcchip`);
  ok('F1 · paso 2 muestra el valor indicativo con la fuente Derivados', /Fuente:\s*Derivados/.test(await txt(page)) && /Valor indicativo/.test(await txt(page)));
  await next(page);
  await page.click(`${W} [data-demo]`);
  ok('F1 · cotizaciones de 3 contrapartes distintas, la mejor primero', (await page.locator(`${W} tbody tr`).count()) === 3 && /Mejor/.test(await txt(page)));
  await next(page);
  ok('F1 · elegir la mejor no exige justificación', /no requiere justificación/.test(await txt(page)));
  await next(page);
  await page.click(`${W} [data-reg]`);
  await page.waitForSelector(`${W} [data-ev]`);
  const done = await txt(page), o1 = await lastOrder();
  ok('F1 · orden Registrada con evidencia EV- ligada al ID de la orden', o1.estado === 'Registrada' && /EV-\d{4}/.test(done) && (await evCount()) === ev0 + 1 && (await page.evaluate(id => window.__mk.DS.DERIV_EVID.some(e => e.ord === id && e.id === window.__mk.DS.DERIV_ORDERS[0].evId), o1.id)), o1.id + ' ' + o1.evId);
  await page.click(`${W} [data-ev]`);
  await page.waitForSelector('.mk-modal--form');
  const evTxt = await page.evaluate(() => document.querySelector('.mk-modal--form').innerText.replace(/\s+/g, ' '));
  ok('F1 · la evidencia muestra contraparte, precio, hora, indicativo y cotizaciones', /Contraparte elegida/i.test(evTxt) && /Valor indicativo/i.test(evTxt) && /Cotizaciones recibidas/i.test(evTxt) && /Inmutable/i.test(evTxt));
  /* F5 · inmutable, “Corregir” crea la versión 2 */
  const edit = await page.locator('.mk-modal--form button', { hasText: /^Editar$/ }).count();
  ok('F5 · la evidencia no tiene opción de edición', edit === 0);
  const idOrd = o1.id, p1 = await page.evaluate(id => window.__mk.DS.DERIV_EVID.find(e => e.ord === id).precio, idOrd);
  await page.click('.mk-modal--form [data-fix]');
  await page.selectOption('[name="fx-cp"]', { index: 1 });
  await page.fill('[name="fx-j"]', 'Corrección por error de digitación en la hora de la cotización.');
  await page.click('.mk-modal-overlay:last-of-type [data-ok]');
  await page.waitForTimeout(300);
  const vers = await page.evaluate(id => window.__mk.DS.DERIV_EVID.filter(e => e.ord === id).map(e => [e.ver, e.precio, e.just]), idOrd);
  ok('F5 · “Corregir” crea la versión 2 y conserva la 1 sin cambios', vers.length === 2 && vers.some(v => v[0] === 1 && v[1] === p1 && v[2] === '') && vers.some(v => v[0] === 2 && /Corrección/.test(v[2])), JSON.stringify(vers).slice(0, 150));
  const exports = await page.evaluate(() => [...document.querySelectorAll('.mk-modal--form [data-xc],.mk-modal--form [data-xx],.mk-modal--form [data-pr]')].length);
  ok('F5 · la evidencia se puede imprimir y exportar (CSV y Excel)', exports === 3);
  await closeModals(page);

  /* F2 · cotización que no es la mejor: bloquea sin justificación */
  await wizOpen(page);
  await step0(page, { port: BG, inst: 'Forward de divisas OTC', noc: 1000000000, plazo: 60 });
  await next(page); await page.click(`${W} [data-demo]`); await next(page);
  await page.check(`${W} [name="d-ch"] >> nth=1`);
  await page.waitForSelector(`${W} [name="d-just"]`);
  await next(page);
  ok('F2 · sin justificación no continúa', /Justificación obligatoria/.test(await txt(page)) && /Elegir/.test(await txt(page)) && !(await page.locator(`${W} [data-reg]`).count()));
  await page.fill(`${W} [name="d-just"]`, 'Mejor liquidación en la fecha de cumplimiento y menor riesgo operativo.');
  await next(page);
  await page.click(`${W} [data-reg]`);
  await page.waitForSelector(`${W} [data-ev]`);
  const o2 = await lastOrder(), e2 = await page.evaluate(id => window.__mk.DS.DERIV_EVID.find(e => e.ord === id), o2.id);
  ok('F2 · con justificación continúa y la evidencia la guarda', o2.estado === 'Registrada' && /Mejor liquidación/.test(e2.just) && e2.cp !== e2.mejor, e2.just.slice(0, 40));
  await closeModals(page);

  /* F3 · menos cotizaciones que el mínimo */
  await wizOpen(page);
  await step0(page, { port: BG, inst: 'Forward de divisas OTC', noc: 500000000, plazo: 30 });
  await next(page);
  for (let i = 1; i <= 2; i++) { await page.selectOption(`${W} [name="q-cp"]`, { index: i }); await page.fill(`${W} [name="q-precio"]`, String(3900 + i)); await page.click(`${W} [data-add]`); }
  await next(page);
  const t3 = await txt(page);
  ok('F3 · con 2 cotizaciones bloquea con un mensaje claro', /al menos 3 cotizaciones de contrapartes distintas \(hay 2\)/.test(t3) && /Cotizaciones/.test(t3));
  /* guardar para después → En cotización, y continuar luego */
  await page.click(`${W} [data-draft]`);
  await page.waitForTimeout(300);
  const o3 = await lastOrder();
  ok('F3 · “Guardar y continuar después” deja la orden En cotización', o3.estado === 'En cotización' && o3.quotes.length === 2, o3.id + ' ' + o3.estado);
  await closeModals(page);

  /* F4 · cupo de contraparte excedido: límite interno permite con aprobación registrada */
  await wizOpen(page);
  await step0(page, { port: BG, inst: 'Forward de divisas OTC', noc: 4200000000, plazo: 365 });
  await next(page); await page.click(`${W} [data-demo]`); await next(page); await next(page);
  const t4 = await txt(page);
  ok('F4 · el cupo excedido es un límite interno (Interno · Excedido)', /Cupo de contraparte/.test(t4) && /Interno/.test(t4) && /Excedido/.test(t4) && /Límite interno excedido/.test(t4));
  await page.click(`${W} [data-reg]`);
  await page.waitForTimeout(250);
  ok('F4 · interno sin aprobación: no registra', !(await page.locator(`${W} [data-ev]`).count()) && /Falta la aprobación|Motivo/.test(await txt(page) + (await page.evaluate(() => document.querySelector('#mkSonner').innerText))));
  const evL0 = await page.evaluate(() => window.__mk.EVENTS.length);
  await page.fill(`${W} [name="d-motivo"]`, 'Se necesita completar la cobertura antes del cierre de mes.');
  await page.selectOption(`${W} [name="d-aprob"]`, { index: 1 });
  await page.click(`${W} [data-reg]`);
  await page.waitForSelector(`${W} [data-ev]`);
  const o4 = await lastOrder(), evL1 = await page.evaluate(() => window.__mk.EVENTS.filter(e => e.tipo === 'Límite excedido').length);
  ok('F4 · interno con aprobación: registra y guarda motivo y aprobador', o4.estado === 'Registrada' && !!o4.apr && /cobertura/.test(o4.apr.motivo) && o4.apr.aprobador !== 'Ramiro Giraldo Colorado', JSON.stringify(o4.apr).slice(0, 100));
  ok('F4 · la evaluación publica el evento “Límite excedido”', evL1 >= 1 && (await page.evaluate(() => window.__mk.EVENTS[0].tipo)) === 'Límite excedido');
  await closeModals(page);
  /* F4 · límite normativo (sobrecobertura) bloquea */
  await wizOpen(page);
  await step0(page, { port: B1, inst: 'Forward de divisas OTC', noc: 2000000000, plazo: 90, prop: 'Cobertura' });
  const t4b = await txt(page);
  ok('F4 · límite normativo excedido (cobertura mayor a la exposición) bloquea la orden', /Límite normativo excedido/.test(t4b) && /Normativo/.test(t4b) && /Iniciar/.test(t4b) && !(await page.locator(`${W} .mk-srcchip`).count()));
  /* F8 · portafolio solo cobertura intenta una operación de inversión */
  await page.check(`${W} [name="d-prop"][value="Inversión"]`);
  await page.fill(`${W} [name="d-noc"]`, '500000000');
  await next(page);
  const t8 = await txt(page);
  ok('F8 · un portafolio solo cobertura no puede abrir operaciones de inversión (bloqueado)', /solo admite operaciones de cobertura/.test(t8) && /Límite normativo excedido/.test(t8));
  await closeModals(page);

  /* confirmar: segregación de funciones */
  await go(page, '#/orders/derivatives');
  const regRow = page.locator('#pg tbody tr', { hasText: 'Registrada' }).first();
  await regRow.locator('[data-act="conf"]').click();
  await page.waitForSelector('[name=uc]');
  const opts = await page.locator('[name=uc] option').allTextContents();
  const regUser = await page.evaluate(() => window.__mk.DS.DERIV_ORDERS.find(o => o.estado === 'Registrada').uReg);
  ok('Segregación · quien registra no aparece entre quienes pueden confirmar', !opts.includes(regUser) && opts.length >= 2, regUser + ' / ' + opts.join(','));
  await page.selectOption('[name=uc]', { index: 1 });
  await page.click('.mk-modal-overlay:last-of-type [data-ok]');
  await page.waitForTimeout(400);
  ok('Confirmar publica el evento “Orden ejecutada”', (await page.evaluate(() => window.__mk.EVENTS[0].tipo)) === 'Orden ejecutada');
  await closeModals(page);

  /* F7 · precarga: chip, advertencia y Refrescar */
  await go(page, '#/dashboard/future-flows');
  const chip = page.locator('#fx [data-srcchip="adminfondo"]');
  const c0 = await chip.innerText();
  ok('F7 · Flujos futuros muestra el chip “Fuente: Administración del fondo · actualizado” con advertencia', /Fuente: Administración del fondo · actualizado \d\d\/\d\d\/\d{4}/.test(c0) && /desactualizado/.test(c0));
  await chip.locator('[data-refresh]').click();
  await page.waitForTimeout(200);
  const c1 = await page.locator('#fx [data-srcchip="adminfondo"]').innerText();
  ok('F7 · “Refrescar” actualiza la fecha y quita la advertencia', !/desactualizado/.test(c1) && c1 !== c0, c1.slice(0, 80));
  for (const [route, label] of [['#/dashboard/graphics', 'New Inversiones'], ['#/dashboard/exposure', 'Derivados'], ['#/dashboard/future-flows', 'New Inversiones']]) {
    await go(page, route);
    ok(`F7 · ${route} muestra el chip de ${label}`, (await page.locator('#view .mk-srcchip', { hasText: label }).count()) > 0);
  }
  for (const [route, btn] of [['#/orders/fixed-income', '[data-new]'], ['#/orders/variable-income', '[data-new]'], ['#/orders/money-market', '[data-new]']]) {
    await go(page, route); await page.click(btn); await page.waitForSelector('.mk-modal--form');
    ok(`F7 · el formulario de ${route.split('/').pop()} muestra el chip de New Inversiones`, (await page.locator('.mk-modal--form .mk-srcchip', { hasText: 'New Inversiones' }).count()) > 0);
    if (route.includes('fixed')) {
      await page.fill('.mk-modal--form [name="instr"]', 'TFIT11090233'); await page.press('.mk-modal--form [name="instr"]', 'Tab');
      const pre = await page.evaluate(() => ['pre-emisor', 'pre-mon', 'pre-val'].map(n => document.querySelector('.mk-modal--form [name="' + n + '"]').value));
      ok('F7 · al elegir el instrumento se autocompletan emisor, moneda y valor indicativo', pre.every(v => v && v.length > 0), pre.join(' | '));
    }
    await closeModals(page);
  }
  await go(page, '#/orders/derivatives'); await page.locator('[data-new]').click(); await page.waitForSelector(W); await closeModals(page);
  /* eventos publicados desde la campana */
  await page.click('#bell'); await page.click('#evBtn'); await page.waitForSelector('.mk-modal--form');
  const evt = await page.evaluate(() => document.querySelector('.mk-modal--form').innerText);
  ok('Eventos publicados: lista orden ejecutada, límite excedido y módulo destino', /Orden ejecutada/.test(evt) && /Límite excedido/.test(evt) && /Contabilidad/.test(evt) && /Riesgos/.test(evt));
  await closeModals(page);

  /* F12 · cambio de país a mitad de sesión */
  const others = ['Colombia', 'Chile', 'República Dominicana', 'Panamá'].filter(c => c !== pais);
  for (const dest of others.slice(0, 2)) {
    for (const route of ['#/orders/derivatives', '#/dashboard/exposure', '#/limit-control/limit-evaluation']) {
      await go(page, route);
      await setCountry(page, dest);
      const t = await viewText(page);
      const terms = dest === 'Colombia' ? null : await forbiddenFor(page, dest);
      const lk = terms ? leaks(t, terms) : [];
      ok(`F12 · ${pais} → ${dest} desde ${route}: se vuelve a dibujar sin errores ni datos mezclados`, !BAD_TEXT.test(t) && lk.length === 0 && t.length > 200, lk.join(', '));
      await setCountry(page, pais);
    }
  }
  ok('Consola sin errores en los flujos de la propuesta', errors.length === 0, errors.slice(0, 3).join(' | '));
  ok('Sin peticiones de red en los flujos de la propuesta', net.length === 0, net.slice(0, 3).join(' | '));
  await ctx.close();
}
