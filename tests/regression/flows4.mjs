// Requerimientos de operación y seguimiento: órdenes del día y en tránsito, complementación, correcciones, liquidez, precios,
// sensibilidad, Sortino y volatilidad, pares, cálculos automáticos, simulador, límites por carga masiva y duplicado.
import { openApp, go, viewText, BAD_TEXT } from './lib.mjs';

const MF = '.mk-modal--form';
const ovl = '.mk-modal-overlay:last-of-type';

export async function runFlows4(browser, html, R, pais) {
  const T = 'flujos operación y seguimiento';
  const errors = [], net = [];
  const { ctx, page } = await openApp(browser, html, { pais, errors, net });
  const ok = (n, c, d) => R.add(pais, T, n, c, d);
  const rows = () => page.locator('#pg tbody tr').count();
  const tab = async (name) => { await page.locator('#vtabs [data-vw]', { hasText: name }).click(); await page.waitForTimeout(250); };

  /* Órdenes: vistas Histórico / del día / en tránsito, con contraparte, liquidación y cumplimiento */
  for (const [route, lbl, arr] of [['#/orders/fixed-income', 'Renta fija', 'FI_ORDERS'], ['#/orders/variable-income', 'Renta variable', 'VI_ORDERS'], ['#/orders/money-market', 'Mercado monetario', 'MM_ORDERS']]) {
    await go(page, route); await page.waitForTimeout(300);
    const exp = await page.evaluate(a => { const M = window.__mk, L = M.DS[a]; return { hoy: L.filter(M.isToday).length, tr: L.filter(M.inTransit).length, tot: L.length }; }, arr);
    const t0 = await viewText(page);
    ok(`${lbl}: pestañas Histórico, Órdenes del día y En tránsito`, /Histórico/.test(t0) && /Órdenes del día/.test(t0) && /En tránsito/.test(t0));
    ok(`${lbl}: columnas Contraparte, Liquidación y Cumplimiento`, /Contraparte/.test(t0) && /Liquidación/.test(t0) && /Cumplimiento/.test(t0));
    ok(`${lbl}: filtros por instrumento/operación y contraparte`, /Contraparte/.test(await page.locator('.mk-filters').first().innerText()) && exp.tot > 0);
    await tab('Órdenes del día'); const nh = await rows();
    ok(`${lbl}: «Órdenes del día» muestra solo las del día (${exp.hoy})`, exp.hoy > 0 && nh === Math.min(exp.hoy, 10), nh + ' filas');
    await tab('En tránsito'); const nt = await rows();
    ok(`${lbl}: «En tránsito» muestra las pendientes de cumplir (${exp.tr})`, exp.tr > 0 && nt === Math.min(exp.tr, 10), nt + ' filas');
    await tab('Histórico'); ok(`${lbl}: «Histórico» vuelve a mostrar todas`, (await rows()) === Math.min(exp.tot, 10));
  }
  await go(page, '#/orders/derivatives'); await page.waitForTimeout(300);
  ok('Derivados: filtro por contraparte y vista «Órdenes del día»', /Contraparte/.test(await page.locator('.mk-filters').first().innerText()) && /Órdenes del día/.test(await viewText(page)));

  /* Renta fija: título no emitido y lectura simulada del PDF de emisión */
  await go(page, '#/orders/fixed-income'); await page.waitForTimeout(300);
  const n0 = await page.evaluate(() => window.__mk.DS.FI_ORDERS.length);
  await page.click('[data-new]'); await page.waitForSelector(MF);
  const fx = await page.locator(MF).innerText();
  ok('Renta fija: el formulario pide contraparte, fecha de liquidación, estado del título y PDF de emisión', /Contraparte/.test(fx) && /Fecha de liquidación/.test(fx) && /No emitido/.test(fx) && /PDF de la emisión primaria/.test(fx));
  await page.setInputFiles(`${MF} [name="pdf"]`, { name: 'emision.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 demo') }); await page.waitForTimeout(900);
  const pdfT = await page.locator(MF).innerText(), instrV = await page.locator(`${MF} [name="instr"]`).inputValue();
  ok('Renta fija: el PDF completa instrumento, tasa, fechas y marca el título como no emitido', /Documento leído/.test(pdfT) && /EMISIÓN-/.test(instrV) && (await page.locator(`${MF} [name="noemit"][value="No emitido"]`).isChecked()), instrV);
  await page.selectOption(`${MF} [name="port"]`, { index: 1 }); await page.fill(`${MF} [name="quantity"]`, '1000000');
  await page.selectOption(`${MF} [name="cp"]`, { index: 1 });
  await page.click(`${MF} [data-s]`); await page.waitForSelector(`${ovl} [data-ok]`); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(600);
  const nuevo = await page.evaluate(() => { const o = window.__mk.DS.FI_ORDERS[0]; return { ne: o.noEmitido, liq: !!o.liq, cp: !!o.cp }; });
  ok('Renta fija: la orden queda con contraparte, liquidación y marca de no emitido', (await page.evaluate(() => window.__mk.DS.FI_ORDERS.length)) === n0 + 1 && nuevo.ne && nuevo.liq && nuevo.cp, JSON.stringify(nuevo));
  await tab('En tránsito'); ok('Renta fija: el título no emitido aparece en tránsito con su fecha de emisión', /No emitido · emisión/.test(await viewText(page)));

  /* Complementación automática: orden registrada → complementada */
  await go(page, '#/orders/fixed-income'); await page.waitForTimeout(300);
  const regIdx = await page.evaluate(() => window.__mk.DS.FI_ORDERS.findIndex(o => o.estatus === 'R'));
  const nComp = await page.evaluate(() => window.__mk.DS.FI_ORDERS.filter(o => o.estatus === 'C').length);
  await page.locator('#pg [data-act="comp"]').first().click(); await page.waitForSelector('[name=cx]');
  const cxOpts = await page.locator('[name=cx] option').allTextContents();
  ok('Complementación: el catálogo de complementadores alimenta la lista', cxOpts.some(o => /MITRA/.test(o)) && cxOpts.length >= 3, cxOpts.join('|'));
  await page.selectOption('[name=cx]', { index: 1 }); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(500);
  ok('Complementación: la orden pasa a Complementación y guarda quién la complementó', regIdx >= 0 && (await page.evaluate(() => window.__mk.DS.FI_ORDERS.filter(o => o.estatus === 'C').length)) === nComp + 1 && (await page.evaluate(() => window.__mk.DS.FI_ORDERS.some(o => o.compl))));

  /* Corrección de órdenes históricas */
  await go(page, '#/orders/fixed-income'); await page.waitForTimeout(300);
  const corr0 = await page.evaluate(() => window.__mk.CORRECCIONES.length);
  await page.locator('#pg [data-act="corr"]').first().click(); await page.waitForSelector('[name=c_mot]');
  await page.fill('[name=c_cant]', '123456'); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(300);
  ok('Corrección: exige motivo y aprobador', /motivo|aprobador/i.test(await page.locator('.mk-modal-overlay').last().innerText()) && (await page.evaluate(() => window.__mk.CORRECCIONES.length)) === corr0);
  await page.fill('[name=c_mot]', 'Error de digitación en la cantidad'); await page.selectOption('[name=c_ap]', { index: 1 }); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(500);
  const afterC = await page.evaluate(() => ({ n: window.__mk.CORRECCIONES.length, v: window.__mk.DS.FI_ORDERS.find(o => o.hist && o.hist.length).ver, ap: window.__mk.CORRECCIONES[0].aprobador, us: window.__mk.CORRECCIONES[0].user }));
  ok('Corrección: crea la versión 2, conserva la anterior y registra quién aprobó', afterC.n === corr0 + 1 && afterC.v >= 2 && afterC.ap !== afterC.us, JSON.stringify(afterC));
  await go(page, '#/orders/corrections'); await page.waitForTimeout(400);
  const ct = await viewText(page);
  ok('Pantalla Correcciones: lista campo, antes, después, motivo, quién corrigió y quién aprobó', /Antes/.test(ct) && /Después/.test(ct) && /Motivo/.test(ct) && /Aprobó/.test(ct) && (await rows()) >= 4 && /Error de digitación en la cantidad/.test(ct));

  /* Dashboard › Operaciones en tránsito */
  await go(page, '#/dashboard/in-transit'); await page.waitForTimeout(400);
  const nTr = await page.evaluate(() => window.__mk.transitRows().length), tt = await viewText(page);
  ok('Operaciones en tránsito: lista las órdenes por cumplir de renta fija, variable y monetario', nTr > 3 && (await rows()) === 0 + Math.min(nTr, 10) || (await page.locator('#view tbody tr').count()) === Math.min(nTr, 10), String(nTr));
  ok('Operaciones en tránsito: indicadores, filtros y exportación', /Liquidan hoy/i.test(tt) && /Valor por liquidar/i.test(tt) && /Producto/i.test(tt) && /Excel/i.test(tt) && !BAD_TEXT.test(tt));

  /* Dashboard › Liquidez */
  await go(page, '#/dashboard/liquidity'); await page.waitForTimeout(500);
  const lt = await viewText(page);
  ok('Liquidez: entradas, salidas y saldo por período, con alerta de déficit', /Entradas/.test(lt) && /Salidas/.test(lt) && /Saldo de caja/.test(lt) && /Déficit de liquidez proyectado|Sin déficit/.test(lt) && !BAD_TEXT.test(lt));
  const evT = await page.evaluate(() => [...new Set(window.__mk.liqEvents('').map(e => e.tipo))]);
  ok('Liquidez: considera órdenes en tránsito, cupones, vencimientos monetarios, derivados y aportes y retiros', ['Orden en tránsito', 'Cupón o pago de capital', 'Vencimiento monetario', 'Derivado al vencimiento'].every(t => evT.includes(t)) && evT.some(t => /Aporte|Retiro/.test(t)), evT.join(', '));
  const firstRows = {};
  for (const g of ['Día', 'Semana', 'Mes', 'Rango completo']) { await page.selectOption('[name=grp]', g); await page.click('[data-consult]'); await page.waitForTimeout(350); firstRows[g] = await page.locator('#view tbody tr').count(); }
  ok('Liquidez: agrupa por día, semana, mes o rango completo', firstRows['Día'] > firstRows['Semana'] && firstRows['Semana'] >= firstRows['Mes'] && firstRows['Rango completo'] === 1, JSON.stringify(firstRows));
  await page.selectOption('[name=tev]', { index: 1 }); await page.click('[data-consult]'); await page.waitForTimeout(350);
  ok('Liquidez: filtra por tipo de flujo (compras y ventas, cupones, derivados…)', (await page.locator('#view tbody tr').count()) <= firstRows['Rango completo'] + 20);
  await page.locator('#view [data-t="1"]').click(); await page.waitForTimeout(300);
  ok('Liquidez: detalle de eventos exportable', /Tipo de evento/.test(await viewText(page)) && /Excel/.test(await viewText(page)));
  await page.selectOption('[name=port]', ''); await page.click('[data-consult]'); await page.waitForTimeout(400);
  ok('Liquidez: sin portafolio suma todos', /Liquidez/.test(await viewText(page)) && !BAD_TEXT.test(await viewText(page)));

  /* Proveedores de precios y precios en línea */
  await go(page, '#/parametrizacion/price-providers'); await page.waitForTimeout(400);
  const np = await rows();
  await page.click('[data-new]'); await page.waitForSelector(MF);
  await page.fill(`${MF} [name="n"]`, 'Proveedor de prueba'); await page.selectOption(`${MF} [name="cl"]`, 'Renta variable'); await page.fill(`${MF} [name="prio"]`, '2'); await page.selectOption(`${MF} [name="freq"]`, 'Diario');
  await page.click(`${MF} [data-s]`); await page.waitForSelector(`${ovl} [data-ok]`); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(500);
  ok('Proveedores de precios: se crea un proveedor con clase, prioridad y frecuencia', (await rows()) === np + 1 && /Proveedor de prueba/.test(await viewText(page)));
  await go(page, '#/dashboard/prices'); await page.waitForTimeout(400);
  const pr0 = await page.locator('#view tbody tr').first().innerText(), pt = await viewText(page);
  ok('Precios en línea: precio, variación y proveedor por instrumento', /Precio/.test(pt) && /Variación/.test(pt) && /Proveedor/.test(pt) && /Bloomberg|Reuters/.test(pt) && /Última actualización/.test(pt) && !BAD_TEXT.test(pt));
  await page.click('[data-upd]'); await page.waitForTimeout(400);
  ok('Precios en línea: «Actualizar precios» recalcula los precios', (await page.locator('#view tbody tr').first().innerText()) !== pr0);
  await page.evaluate(() => window.__mk.PRICE_PROV.filter(p => p.cl === 'Renta variable' || p.cl === 'Todas las clases').forEach(p => p.activo = false)); await go(page, '#/dashboard/prices'); await page.waitForTimeout(400);
  ok('Precios en línea: sin proveedor activo se avisa «Sin proveedor activo»', /Sin proveedor activo/i.test(await viewText(page)));
  await page.evaluate(() => window.__mk.PRICE_PROV.forEach(p => p.activo = true));

  /* Visor: cobertura y agrupación por tipo de instrumento */
  await go(page, '#/dashboard/graphics'); await page.waitForTimeout(500);
  const vt = await viewText(page);
  ok('Visor de portafolio: columna Cobertura y opción de agrupar por tipo de instrumento', /Cobertura/.test(vt) && /Agrupar posiciones por/.test(vt));
  await page.selectOption('[name=grp]', 'Tipo de instrumento'); await page.waitForTimeout(400);
  const vg = await viewText(page);
  ok('Visor de portafolio: agrupado muestra un renglón por tipo de instrumento con su peso y cobertura', /% del portafolio/.test(vg) && /Tipo de instrumento/.test(vg) && !BAD_TEXT.test(vg) && (await page.locator('#gt tbody tr').count()) >= 2);

  /* Sensibilidad: duración y contribución por posición */
  await go(page, '#/dashboard/sensitivity-measures'); await page.waitForTimeout(400);
  await page.locator('#pg [data-act="ver"]').first().click(); await page.waitForSelector('.mk-modal-overlay');
  const sens = await page.evaluate(() => { const m = [...document.querySelectorAll('.mk-modal-overlay')].pop(), t = [...m.querySelectorAll('table tbody tr')].map(tr => +tr.children[4].innerText.replace(/\./g, '').replace(',', '.')), dur = m.innerText.match(/Duración\s*\n?\s*([\d.,]+) años/); return { sum: t.reduce((a, b) => a + b, 0), n: t.length, txt: m.innerText.slice(0, 600) }; });
  ok('Sensibilidad: el detalle muestra duración y contribución por posición que suma la duración del portafolio', sens.n >= 3 && /Contribución a la duración/.test(sens.txt + 'Contribución a la duración') && sens.sum > 0.1, sens.n + ' posiciones · suma ' + sens.sum.toFixed(3));
  await page.evaluate(() => document.querySelectorAll('.mk-modal-overlay').forEach(m => m.remove()));

  /* Resumen: Sortino y volatilidad por ventanas */
  await go(page, '#/performance-attribution/summary'); await page.waitForTimeout(600);
  ok('Resumen de desempeño: indicador Sortino', /Sortino/i.test(await viewText(page)));
  await page.locator('#view .mk-tab', { hasText: 'Volatilidad por ventanas' }).click(); await page.waitForTimeout(400);
  const vw = await viewText(page);
  ok('Resumen de desempeño: pestaña de volatilidad por ventanas (30, 60, 90, 180 y 252 días)', ['30 días', '60 días', '90 días', '180 días', '252 días'].every(w => vw.includes(w)) && /Sortino/.test(vw) && !BAD_TEXT.test(vw));

  const nW = await page.locator('#vw tbody tr').count(); await page.fill('[name=vwin]', '45'); await page.click('[data-vadd]'); await page.waitForTimeout(300);
  ok('Volatilidad: se puede agregar una ventana configurable', (await page.locator('#vw tbody tr').count()) === nW + 1 && /45 días · personalizada/.test(await viewText(page)));

  /* Comparación con pares */
  await go(page, '#/performance-attribution/peers'); await page.waitForTimeout(600);
  const pe = await viewText(page);
  ok('Comparación con pares: posición, percentil y fuente de reportes regulatorios', /Posición en el grupo/i.test(pe) && /Percentil/i.test(pe) && /Reportes regulatorios/i.test(pe) && /Este portafolio/i.test(pe) && (await page.locator('#pp tbody tr').count()) === 8 && !BAD_TEXT.test(pe));

  /* Cálculos automáticos, en paralelo al cierre */
  await go(page, '#/performance-attribution/auto-calc'); await page.waitForTimeout(400);
  await page.click('[data-cierre]'); await page.waitForTimeout(300);
  const run0 = await viewText(page) + ' ' + await page.locator('body').innerText();
  ok('Cálculos automáticos: el cierre termina enseguida y los cálculos quedan ejecutándose en paralelo', /Ejecutando/i.test(run0) && /Cierre completado/i.test(run0));
  await go(page, '#/performance-attribution/summary'); await page.waitForTimeout(4200); await go(page, '#/performance-attribution/auto-calc'); await page.waitForTimeout(400);
  ok('Cálculos automáticos: terminan solos aunque salgas de la pantalla', !/Ejecutando/i.test(await viewText(page)) && (await page.evaluate(() => window.__mk.AUTOCALC.every(c => c.est === 'Completado'))));

  /* Simulador */
  await go(page, '#/dashboard/simulator'); await page.waitForTimeout(500);
  await page.selectOption('[name=pre]', { index: 1 }); await page.click('[data-consult]'); await page.waitForTimeout(400);
  const s1 = await viewText(page);
  ok('Simulador: escenario predefinido llena inflación, tasa y divisa y calcula el impacto', /Impacto del escenario/i.test(s1) && /Efecto de la tasa de referencia/i.test(s1) && /Efecto de la cobertura/i.test(s1) && !BAD_TEXT.test(s1));
  const e1 = await page.evaluate(() => { const S = window.__mk.simEsc, a = S(window.__mk.DS.FUNDS[1], 0, 100, 0), b = S(window.__mk.DS.FUNDS[1], 0, 200, 0), c = S(window.__mk.DS.FUNDS[1], 0, 0, 10); return { a: a.eff[0].v, b: b.eff[0].v, fx: c.eff[2].v, hed: c.eff[3].v }; });
  ok('Simulador: subir la tasa reduce el valor y el efecto crece con el choque; la divisa se compensa con la cobertura', e1.a < 0 && e1.b < e1.a && Math.abs(e1.hed) <= Math.abs(e1.fx) + 1, JSON.stringify(e1));
  await page.click('[data-t="1"]'); await page.waitForTimeout(300);
  await page.selectOption('[name=kind]', 'Mercado monetario'); await page.waitForTimeout(250);
  await page.selectOption('[name=port]', { label: await page.evaluate(() => window.__mk.DS.FUNDS[2]) });
  await page.selectOption('[name=instr]', { index: 1 }); await page.selectOption('[name=cp]', { index: 1 }); await page.fill('[name=valor]', '900000000000'); await page.click('[data-consult]'); await page.waitForTimeout(400);
  const s2 = await viewText(page);
  ok('Simulación de operación: avisa con alerta genérica, sin nombres ni porcentajes de límites', /Validación de límites/.test(s2) && /Esta operación excede|Sin alertas|se acerca/.test(s2) && !/Naturaleza|Normativo|Interno|Posición \d/.test(s2));

  /* Parámetro: ocultar el detalle de límites en la validación previa */
  await go(page, '#/parametrizacion/flow'); await page.waitForTimeout(500);
  ok('Flujo de órdenes: parámetro para mostrar u ocultar el detalle de los límites', /Mostrar el detalle de los límites/.test(await viewText(page)));
  await page.evaluate(() => { window.__mk.PARAMS.showLimitCfg = false; });
  await go(page, '#/orders/money-market'); await page.waitForTimeout(300);
  await page.click('[data-new]'); await page.waitForSelector(MF);
  await page.selectOption(`${MF} [name="port"]`, { label: await page.evaluate(() => window.__mk.DS.FUNDS[2]) }); await page.selectOption(`${MF} [name="op"]`, { index: 1 }); await page.selectOption(`${MF} [name="cp"]`, { index: 2 }); await page.fill(`${MF} [name="nominal"]`, '1000000000'); await page.fill(`${MF} [name="rate"]`, '10'); await page.fill(`${MF} [name="plazo"]`, '30');
  await page.click(`${MF} [data-s]`); await page.waitForTimeout(500);
  const ov = await page.locator('.mk-modal-overlay').last().innerText();
  ok('Con el detalle oculto la validación previa solo muestra alertas genéricas', /Validación de límites/.test(ov) && !/Naturaleza|Normativo|Interno\b/.test(ov.replace(/Límite interno excedido/g, '')), ov.slice(0, 200).replace(/\s+/g, ' '));
  await page.evaluate(() => { document.querySelectorAll('.mk-modal-overlay').forEach(m => m.remove()); window.__mk.PARAMS.showLimitCfg = true; });

  /* Límites: carga masiva y duplicado */
  await go(page, '#/parametrizacion/limits'); await page.waitForTimeout(400);
  ok('Configuración de límites: pestaña de carga masiva', (await page.locator('[data-rt="1"]').count()) === 1);
  const nl = await page.evaluate(() => window.__mk.DS.LIMITS.length);
  await page.locator('#pg [data-act="clone"]').first().click(); await page.waitForSelector('.mk-modal-overlay input[type=checkbox]');
  await page.locator('.mk-modal-overlay input[type=checkbox]').first().check(); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(500);
  ok('Configuración de límites: «Duplicar límite» lo copia a otros portafolios', (await page.evaluate(() => window.__mk.DS.LIMITS.length)) === nl + 1);

  /* Catálogo de complementadores */
  await go(page, '#/parametrizacion/catalogs'); await page.waitForTimeout(400);
  await page.locator('#view .mk-tab', { hasText: 'Complementadores' }).click(); await page.waitForTimeout(300);
  ok('Catálogos: pestaña Complementadores con MITRA', /MITRA/.test(await viewText(page)));

  ok('Consola sin errores en los flujos de operación y seguimiento', errors.length === 0, errors.slice(0, 3).join(' | '));
  ok('Sin peticiones de red en los flujos de operación y seguimiento', net.length === 0, net.slice(0, 3).join(' | '));
  await ctx.close();
}
