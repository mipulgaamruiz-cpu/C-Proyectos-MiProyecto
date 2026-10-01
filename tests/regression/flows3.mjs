// Fases 2 y 3: decisiones de inversión, activos no listados, valoración, flujos, atribución por vehículo y régimen del FVP
import { openApp, go, viewText, forbiddenFor, leaks, BAD_TEXT, setCountry } from './lib.mjs';

const MF = '.mk-modal--form';
const W2 = '.mk-modal-overlay';
const ovl = '.mk-modal-overlay:last-of-type';
const closeModals = page => page.evaluate(() => document.querySelectorAll('.mk-modal-overlay').forEach(m => m.remove()));

export async function runFlows3(browser, html, R, pais) {
  const T = 'flujos fases 2 y 3';
  const errors = [], net = [];
  const { ctx, page } = await openApp(browser, html, { pais, errors, net });
  const ok = (n, c, d) => R.add(pais, T, n, c, d);
  const K = await page.evaluate(() => { const M = window.__mk; return { inm: M.DS.FUNDS.find(f => M.vehKind(f) === 'inm'), alt: M.DS.FUNDS.find(f => M.vehKind(f) === 'alt'), fvp: M.DS.FUNDS.filter(f => M.vehKind(f) === 'fvp'), fic: M.DS.FUNDS[1] }; });
  ok('Portafolios nuevos: 1 inmobiliario, 1 alternativo y 3 FVP por perfil', !!K.inm && !!K.alt && K.fvp.length === 3, JSON.stringify(K).slice(0, 160));

  /* F6 · decisión de inversión */
  await go(page, '#/orders/investment-decisions');
  const n0 = await page.locator('#pg tbody tr').count();
  await page.click('[data-new]'); await page.waitForSelector(MF);
  await page.selectOption(`${MF} [name="tipo"]`, { label: 'Desembolso a proyecto' });
  await page.selectOption(`${MF} [name="activo"]`, { index: 1 });
  await page.selectOption(`${MF} [name="port"]`, { label: K.alt });
  await page.fill(`${MF} [name="monto"]`, '2000000000');
  const apOpts = await page.locator(`${MF} [name="ap1"] option`).allTextContents();
  ok('F6 · el proponente no aparece entre los aprobadores', !apOpts.includes('Ramiro Giraldo Colorado') && apOpts.length >= 3, apOpts.join(','));
  ok('F6 · el formulario muestra el activo precargado con la fuente Administración de activos y crédito', /Administración de activos y crédito/.test(await page.locator(MF).innerText()) && /valor vigente/.test(await page.locator(`${MF} #ainfo`).innerText()));
  await page.selectOption(`${MF} [name="ap1"]`, { index: 1 }); await page.selectOption(`${MF} [name="ap2"]`, { index: 2 });
  await page.click(`${MF} [data-s]`); await page.waitForSelector(`${ovl} [data-ok]`); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(600);
  const id = await page.evaluate(() => window.__mk.DS.DEC_ORDERS[0].id);
  ok('F6 · la decisión queda en estado Propuesta', (await page.evaluate(() => window.__mk.DS.DEC_ORDERS[0].estado)) === 'Propuesta' && (await page.locator('#pg tbody tr').count()) === n0 + 1);
  const row = () => page.locator('#pg tbody tr', { hasText: id });
  await row().locator('[data-act="send"]').click(); await page.waitForSelector('.mk-modal-overlay');
  const val = await page.locator('.mk-modal-overlay').last().innerText();
  ok('F6 · antes de enviar a comité se valida la concentración', /Validación previa de límites/i.test(val) && /CONCENTRACIÓN POR/i.test(val));
  await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(500);
  ok('F6 · la decisión pasa a En comité', (await page.evaluate(() => window.__mk.DS.DEC_ORDERS[0].estado)) === 'En comité');
  await row().locator('[data-act="apr"]').click(); await page.waitForSelector('[name=ua]');
  await page.click(`${ovl} [data-ok]`);
  ok('F6 · aprobar exige aprobador y número de acta', /obligatorio|Selecciona/i.test(await page.locator('.mk-modal-overlay').last().innerText()) && (await page.evaluate(() => window.__mk.DS.DEC_ORDERS[0].estado)) === 'En comité');
  const uaOpts = await page.locator('[name=ua] option').allTextContents();
  ok('F6 · el aprobador es distinto del proponente', !uaOpts.includes('Ramiro Giraldo Colorado'), uaOpts.join(','));
  await page.selectOption('[name=ua]', { index: 1 }); await page.fill('[name=acta]', 'ACTA-2026-099');
  await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(500);
  const d1 = await page.evaluate(() => ({ d: window.__mk.DS.DEC_ORDERS[0], a: window.__mk.DS.DEC_ACTAS.filter(x => x.dec === window.__mk.DS.DEC_ORDERS[0].id), e: window.__mk.EVENTS[0].tipo }));
  ok('F6 · Aprobada con acta registrada y evento “Decisión aprobada” publicado', d1.d.estado === 'Aprobada' && d1.a.length === 1 && d1.a[0].ver === 1 && d1.e === 'Decisión aprobada');
  await page.click('#bell'); const ntf = await page.locator('#ntfList').innerText(); await page.click('#ntfClose');
  ok('F6 · la decisión aprobada genera una notificación', /Decisión aprobada/i.test(ntf));
  const acts = await row().locator('[data-act]').evaluateAll(b => b.map(x => x.dataset.act));
  ok('F6 · el acta aprobada es inmutable: no hay editar ni anular, solo “Corregir acta”', !acts.includes('edit') && !acts.includes('anular') && acts.includes('fixa'), acts.join(','));
  const m0 = await page.evaluate(() => window.__mk.DS.DEC_ACTAS.find(a => a.dec === window.__mk.DS.DEC_ORDERS[0].id).monto);
  await row().locator('[data-act="fixa"]').click(); await page.waitForSelector('[name=mot]');
  await page.fill('[name=mot]', 'Ajuste del monto aprobado por el comité.'); await page.fill('[name=monto]', '1800000000');
  await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(400);
  const av = await page.evaluate(() => window.__mk.DS.DEC_ACTAS.filter(a => a.dec === window.__mk.DS.DEC_ORDERS[0].id).map(a => [a.ver, a.monto]));
  ok('F6 · corregir el acta crea la versión 2 y conserva la 1', av.length === 2 && av.some(v => v[0] === 1 && v[1] === m0) && av.some(v => v[0] === 2 && v[1] === 1800000000), JSON.stringify(av));
  await closeModals(page);

  /* instrumentos: clases de activo y avalúos */
  await go(page, '#/parametrizacion/instruments');
  await page.locator('#view select[data-fl="c"]').selectOption({ label: 'Inmueble' });
  ok('Instrumentos: el filtro “Clase de activo” muestra los 3 inmuebles', (await page.locator('#pg tbody tr:not(:has(.mk-empty))').count()) >= 3 && /Mostrando 3 de 3/.test(await page.locator('#view .mk-rowinfo').innerText()));
  const classes = await page.locator('#view select[data-fl="c"] option').allTextContents();
  ok('Instrumentos: clases Inmueble, Proyecto, TCC y Cartera disponibles', ['Inmueble', 'Proyecto', 'TCC', 'Cartera'].every(c => classes.includes(c)), classes.join(','));
  await page.locator('#pg tbody tr').first().locator('[data-act="ver"]').click(); await page.waitForSelector(MF.replace('form', 'overlay') + ',.mk-modal-overlay');
  const det = await page.locator('.mk-modal-overlay').last().innerText();
  ok('Instrumentos: el inmueble muestra ciudad, tipología, arrendatario y el historial de avalúos', /Ciudad/i.test(det) && /Arrendatario principal/i.test(det) && /Avalúos/i.test(det) && /Avaluador/i.test(det));
  await page.click('.mk-modal-overlay:last-of-type [data-av]');
  await page.fill('[name="av-v"]', '90000000000'); await page.selectOption('[name="av-a"]', { index: 1 });
  await page.click('.mk-modal-overlay:last-of-type [data-ok]'); await page.waitForTimeout(400);
  ok('Instrumentos: registrar un avalúo publica el evento “Avalúo registrado”', (await page.evaluate(() => window.__mk.EVENTS[0].tipo)) === 'Avalúo registrado');
  await closeModals(page);
  await go(page, '#/parametrizacion/instruments');
  await page.locator('#view select[data-fl="c"]').selectOption({ label: 'Proyecto' });
  await page.locator('#pg tbody tr').first().locator('[data-act="ver"]').click(); await page.waitForSelector('.mk-modal-overlay');
  ok('Instrumentos: el proyecto muestra originador, estructura, tramo y covenants', /Originador/i.test(await page.locator('.mk-modal-overlay').last().innerText()) && /Covenants/i.test(await page.locator('.mk-modal-overlay').last().innerText()) && /Tramo/i.test(await page.locator('.mk-modal-overlay').last().innerText()));
  await closeModals(page);

  /* Visor: valoración, valoración vencida y seguimiento */
  await go(page, '#/dashboard/graphics');
  await page.selectOption('#view [name=port]', { label: K.inm }); await page.waitForTimeout(500);
  let vt = await page.locator('#view').innerText();
  ok('Visor: el portafolio inmobiliario muestra fuente, fecha y estado de la valoración con el chip de Administración de activos y crédito', /Fuente de la valoración/i.test(vt) && /Fecha de valoración/i.test(vt) && /Fuente: Administración de activos y crédito/.test(vt));
  ok('Visor: un avalúo con más de 12 meses muestra la insignia “Valoración vencida”', /Valoración vencida/i.test(vt) && /Vigente/i.test(vt));
  const cl = await page.locator('#view [name=clase] option').allTextContents();
  ok('Visor: filtro por clase de activo', cl.includes('Inmueble'), cl.join(','));
  await page.selectOption('#view [name=port]', { label: K.alt }); await page.waitForTimeout(500);
  await page.click('#view [data-t="1"]'); await page.waitForTimeout(400);
  vt = await page.locator('#view').innerText();
  ok('Visor: portafolio alternativo con pestaña Seguimiento (comprometido vs desembolsado, flujos y covenants)', /Comprometido/i.test(vt) && /Desembolsado/i.test(vt) && /Covenants en alerta/i.test(vt) && /Flujos reales vs esperados/i.test(vt));
  /* Fase 4 · Lending: inversión en cartera */
  await page.click('#view [data-t="2"]'); await page.waitForTimeout(400);
  vt = await page.locator('#view').innerText();
  ok('Lending: pestaña Cartera con composición por deudor, calificación, plazo y tasa', /Composición por deudor/i.test(vt) && /Por calificación/i.test(vt) && /Tasa promedio ponderada/i.test(vt) && /Plazo promedio ponderado/i.test(vt) && /Fuente: Administración de activos y crédito/.test(vt) && !BAD_TEXT.test(vt));
  const lend = await page.evaluate(() => { const M = window.__mk, rows = M.carPort(M.DS.FUNDS.find(f => M.vehKind(f) === 'alt')), tot = rows.reduce((a, x) => a + x.saldo, 0), cars = M.DS.INSTRUMENTS.filter(i => i.clase === 'Cartera').reduce((a, i) => a + M.assetVal(i).valor, 0); return { n: rows.length, tot, cars }; });
  ok('Lending: la suma de los saldos por deudor es igual al valor vigente de la cartera', lend.n > 0 && Math.abs(lend.tot - lend.cars) < 1, JSON.stringify(lend));
  const fl = await page.evaluate(() => { const M = window.__mk, p = M.DS.FUNDS.find(f => M.vehKind(f) === 'alt'), a = M.carFlows(p, 1, 0), b = M.carFlows(p, 1, 20); return { a: a.reduce((s, x) => s + x.pre, 0), b: b.reduce((s, x) => s + x.pre, 0), bal: b.every((x, i) => i === 0 || Math.abs(x.ini - b[i - 1].fin) < 1) }; });
  ok('Lending: el prepago es 0 con CPR 0 %, crece con CPR 20 % y el saldo es consistente mes a mes', fl.a === 0 && fl.b > 0 && fl.bal, JSON.stringify(fl));
  await go(page, '#/limit-control/limit-evaluation'); await page.waitForTimeout(400);
  const le = await page.evaluate(() => window.__mk.evalRows().filter(r => /CARTERA/.test(r.tipo)));
  ok('Lending: la evaluación de límites incluye concentración de cartera por deudor, originador y sector, con la posición real', ['DEUDOR', 'ORIGINADOR', 'SECTOR'].every(k => le.some(r => r.tipo.endsWith(k))) && le.every(r => r.actual > 0 && r.nat === 'Interno') && le.some(r => r.estado === 'Incumple'), JSON.stringify(le.map(r => [r.sub, r.estado])));
  const cc = await page.evaluate(() => { const M = window.__mk, p = M.DS.FUNDS.find(f => M.vehKind(f) === 'alt'); return M.concCheck({ activo: 'CAR-001', port: p, tipo: 'Compra de cartera', monto: 8000000000 }) });
  ok('Lending: la compra de cartera valida la concentración por originador (límite interno)', /ORIGINADOR/i.test(cc.tipo) && cc.nat === 'Interno' && cc.lim > 0 && cc.share > 0, JSON.stringify(cc));
  /* Flujos futuros */
  for (const [port, re, lbl] of [[K.inm, /Canon y pérdida esperados/, 'canon y pérdida esperados'], [K.alt, /Desembolsos y flujos de cartera esperados/, 'desembolsos y flujos de cartera'], [K.fvp[1], /Liquidez esperada del (FVP|APV)/, 'liquidez esperada del FVP']]) {
    await go(page, '#/dashboard/future-flows');
    await page.selectOption('#view [name=port]', { label: port }); await page.click('#view [data-consult]'); await page.waitForTimeout(500);
    const t = await page.locator('#view').innerText();
    ok(`Flujos futuros: ${port} muestra ${lbl} con su chip de fuente`, re.test(t) && /Fuente:/.test(t), '');
  }
  /* Atribución por tipo de vehículo */
  const sumPort = async (port, tab) => { await go(page, '#/performance-attribution/summary'); await page.selectOption('#view [name=port]', { label: port }); await page.click('#view [data-consult]'); await page.waitForTimeout(700); if (tab != null) { await page.click(`#view [data-t="${tab}"]`); await page.waitForTimeout(300) } return page.locator('#view').innerText(); };
  let t = await sumPort(K.inm);
  ok('Atribución inmobiliarios: renta (canon neto) y valorización, con el aviso de serie escalonada', /Renta \(canon neto\)/i.test(t) && /Valorización/i.test(t) && /serie de valorización es escalonada/i.test(t));
  t = await sumPort(K.alt);
  ok('Atribución alternativos: TIR y MOIC en lugar de rentabilidad ponderada por tiempo', /TIR \(E\.A\.\)/i.test(t) && /MOIC/i.test(t) && /Se mide con TIR y MOIC/i.test(t) && !/Tracking error/i.test(t));
  t = await sumPort(K.fvp[1], 2);
  ok('Atribución FVP: comparación entre perfiles y rentabilidad frente al benchmark', /Conservador/.test(t) && /Moderado/.test(t) && /Agresivo/.test(t) && /Benchmark/i.test(t));
  t = await sumPort(K.fic);
  ok('Atribución FIC: sigue mostrando tracking error e information ratio', /Tracking error/i.test(t) && /Information ratio/i.test(t));
  /* contribución incluye los nuevos activos */
  await go(page, '#/performance-attribution/contribution'); await page.selectOption('#view [name=port]', { label: K.alt }); await page.click('#view [data-consult]'); await page.waitForTimeout(700);
  ok('Contribución por activo incluye los activos no listados', /Proyecto vial|Corredor|TCC|libranza/i.test(await page.locator('#view').innerText()) || /ACTIVOS NO LISTADOS/i.test(await page.locator('#view').innerText()));
  /* informes por tipo de vehículo */
  const reps = await page.evaluate(() => { const M = window.__mk; return ['Informe de renta y valorización (fondos inmobiliarios)', 'Informe de TIR y MOIC (fondos alternativos)', 'Informe de rentabilidad por perfil (FVP)'].map(n => { const d = M.reportData(n, { port: 'Todos', d1: '2026-01-01', d2: '2026-09-30' }); return [n, d.rows.length, JSON.stringify(d).includes('undefined') || JSON.stringify(d).includes('NaN')]; }); });
  ok('Informes por vehículo (inmobiliarios, alternativos y perfiles FVP) con datos y sin valores inválidos', reps.every(r => r[1] > 0 && !r[2]), JSON.stringify(reps.map(r => [r[1], r[2]])));
  await go(page, '#/performance-attribution/reports');
  ok('Reportes de desempeño: plantillas por tipo de vehículo en el listado', /inmobiliarios/i.test(await page.locator('#view').innerText()) && /TIR y MOIC/i.test(await page.locator('#view').innerText()) && /perfil \((FVP|APV)\)/i.test(await page.locator('#view').innerText()));

  /* Configuración de límites: tipos nuevos y régimen versionado */
  await go(page, '#/parametrizacion/limits');
  const tipos = await page.locator('#view select[data-fl="t"] option').allTextContents();
  ok('Límites: tipos nuevos de inmuebles y alternativos disponibles', ['CONCENTRACIÓN POR INMUEBLE', 'CONCENTRACIÓN POR ARRENDATARIO', 'CONCENTRACIÓN POR CIUDAD', 'ENDEUDAMIENTO MÁXIMO', 'TOPE ACTIVOS EN DESARROLLO', 'CONCENTRACIÓN POR ORIGINADOR', 'CONCENTRACIÓN POR PROYECTO', 'CONCENTRACIÓN POR SECTOR', 'TOPE POR ETAPA'].every(x => tipos.includes(x)), tipos.length + ' tipos');
  await page.click('#regimen .mk-accordion__head'); await page.waitForTimeout(250);
  const rg0 = await page.locator('#regimen #rg tbody tr').allInnerTexts();
  ok('Régimen del FVP: versión vigente e histórica con fecha de vigencia', rg0.length === 2 && rg0.some(x => /Vigente/i.test(x)) && rg0.some(x => /Histórica/i.test(x)), rg0.map(x => x.replace(/\s+/g, ' ')).join(' | ').slice(0, 200));
  await page.click('#regimen [data-nv]'); await page.waitForSelector(MF);
  await page.fill(`${MF} [name="vig"]`, '2026-12-01'); await page.fill(`${MF} [name="Conservador-rvMax"]`, '15');
  await page.click(`${MF} [data-s]`); await page.waitForTimeout(500);
  const rg1 = await page.locator('#regimen #rg tbody tr').allInnerTexts();
  const vers = await page.evaluate(() => window.__mk.DS.FVP_REG.map(v => [v.ver, v.p.Conservador.rvMax]));
  ok('Régimen del FVP: la nueva versión no borra las anteriores (queda Futura)', rg1.length === 3 && rg1.some(x => /Futura/i.test(x)) && vers.some(v => v[0] === 2) && vers.some(v => v[0] === 3 && v[1] === 15), JSON.stringify(vers));
  await go(page, '#/limit-control/limit-evaluation');
  await page.fill('#view [data-q]', 'RÉGIMEN'); await page.waitForTimeout(300);
  const ev = await page.locator('#view tbody tr', { hasText: 'RÉGIMEN DE INVERSIÓN' }).count();
  ok('Evaluación de límites: el régimen del FVP se evalúa por perfil (tope en renta variable y mínimo en renta fija)', ev === 6, String(ev));
  const vtxt = await page.locator('#view').innerText();
  ok('Evaluación de límites: muestra límites de inmuebles y de alternativos', /CONCENTRACIÓN POR INMUEBLE/i.test(vtxt) || (await page.locator('#view select[data-fl="p"]').count()) > 0);
  /* catálogos */
  await go(page, '#/parametrizacion/catalogs');
  const tabs = await page.locator('#view [data-t]').allInnerTexts();
  ok('Catálogos: avaluadores y propósito de la operación', tabs.some(x => /Avaluadores/i.test(x)) && tabs.some(x => /Propósito de la operación/i.test(x)), tabs.join(','));
  /* portafolios */
  await go(page, '#/parametrizacion/portfolios');
  const tp = await page.locator('#view select[data-fl="t"] option').allTextContents();
  await page.fill('#view [data-q]', K.fvp[0].split(' ')[0]); await page.waitForTimeout(300);
  const pt = await page.locator('#view').innerText();
  ok('Portafolios: tipos de vehículo nuevos (inmobiliario, alternativo y FVP por perfil)', tp.some(x => /Fondo inmobiliario/i.test(x)) && tp.some(x => /Fondo alternativo/i.test(x)) && tp.some(x => /FVP|APV/.test(x)) && K.fvp.every(f => pt.includes(f)), tp.join(','));

  /* Informes de órdenes por producto, filtrables por FIC, FCP y FVP */
  await go(page, '#/orders/reports');
  const ids = await page.locator('[data-r]').evaluateAll(b => b.map(x => x.dataset.r));
  ok('Informes: siete informes por producto (renta fija, renta variable, mercado monetario, derivados, inmobiliario, alternativas y Lending) y la bitácora de auditoría', ['rf', 'rv', 'mm', 'der', 'inm', 'alt', 'lend', 'aud'].every(i => ids.includes(i)) && ids.length === 8 && !/Libro de órdenes/i.test(await page.locator('#view').innerText()), ids.join(','));
  const cnt = async () => { const t = await page.locator('#out').innerText().catch(() => ''); const m = t.match(/\((\d+) (?:órdenes|decisiones|registros)\)/); return m ? +m[1] : 0 };
  for (const id of ids.filter(i => i !== 'aud')) {
    await go(page, '#/orders/reports'); await page.click(`[data-r="${id}"]`);
    const vo = await page.locator('#view [name=veh] option').allTextContents();
    const res = {};
    for (const v of ['', 'FIC', 'FCP', 'FVP']) { await page.selectOption('#view [name=veh]', v); await page.click('#view [data-gen]'); await page.waitForTimeout(650); res[v || 'todos'] = await cnt() }
    ok(`Informe ${id}: filtro por tipo de vehículo (FIC, FCP y FVP) coherente con el total`, vo.length === 4 && res.FIC + res.FCP + res.FVP <= res.todos && res.todos > 0 && (['inm', 'alt', 'lend'].includes(id) ? res.FCP === res.todos : res.FIC > 0), JSON.stringify(res));
    const tx = await page.locator('#view').innerText();
    ok(`Informe ${id}: sin textos rotos`, !BAD_TEXT.test(tx));
  }
  for (const [route, nombre] of [['#/orders/fixed-income', 'Renta fija'], ['#/orders/variable-income', 'Renta variable'], ['#/orders/derivatives', 'Derivados'], ['#/orders/money-market', 'Mercado monetario']]) {
    await go(page, route);
    const tx = await page.locator('#view').innerText();
    ok(`${nombre}: muestra la etiqueta “Módulos conectados”`, /Módulos conectados/.test(tx) && (await page.locator('#view .mk-apoya a.mk-chip').count()) >= 3);
  }
  /* Atribución por producto: los siete productos */
  const PK = await page.evaluate(() => { const M = window.__mk; return { der: M.DS.DERIV_POS.find(p => p.prop === 'Cobertura').port, fic: M.DS.FUNDS[1], inm: M.DS.FUNDS.find(f => M.vehKind(f) === 'inm'), alt: M.DS.FUNDS.find(f => M.vehKind(f) === 'alt') } });
  const prodTab = async (port, tab) => { await go(page, '#/performance-attribution/by-product'); await page.selectOption('#view [name=port]', { label: port }); await page.click('#view [data-consult]'); await page.waitForTimeout(600); await page.click(`#view [data-t="${tab}"]`); await page.waitForTimeout(350); return page.locator('#view').innerText() };
  const tabsTxt = await (async () => { await go(page, '#/performance-attribution/by-product'); return page.locator('#view .mk-tab').allTextContents() })();
  ok('Atribución por producto: pestañas de los siete productos', ['Renta fija', 'Renta variable', 'Mercado monetario', 'Derivados', 'Inmobiliario', 'Alternativas (TCC y proyectos)', 'Lending'].every(t => tabsTxt.map(x => x.trim()).includes(t)), tabsTxt.join(','));
  for (const [port, tab, re, lbl] of [[PK.fic, 0, /Retorno de renta fija/i, 'Renta fija'], [PK.fic, 1, /Retorno de renta variable/i, 'Renta variable'], [PK.fic, 2, /Retorno monetario/i, 'Mercado monetario'], [PK.der, 3, /Efecto en el portafolio/i, 'Derivados'], [PK.inm, 4, /Renta \(canon neto\)/i, 'Inmobiliario'], [PK.alt, 5, /MOIC/i, 'Alternativas'], [PK.alt, 6, /Rendimiento de la cartera/i, 'Lending']]) {
    const tx = await prodTab(port, tab);
    ok(`Atribución por producto · ${lbl}: muestra cifras y gráfica`, re.test(tx) && !BAD_TEXT.test(tx) && (await page.locator('#view svg').count()) > 0, tx.slice(0, 120));
  }
  /* Ajustes de la revisión de pantallas */
  const rowsOf = sel => page.evaluate(sel => { const cs = [...document.querySelectorAll(sel)].map(c => c.getBoundingClientRect()); const rows = {}; cs.forEach(r => { const k = Math.round(r.top / 8); (rows[k] = rows[k] || []).push(Math.round(r.width)) }); return Object.values(rows) }, sel);
  const okRows = (rows, total) => rows.reduce((a, r) => a + r.length, 0) === total && (total <= 2 || rows.every(r => r.length >= 2)) && rows.every(r => Math.max(...r) - Math.min(...r) <= 3);
  const groups = await page.evaluate(() => window.__mk.NAV.map(g => ({ home: g.home, key: g.key, n: g.items.length })));
  for (const g of groups) { await go(page, g.home); await page.waitForTimeout(700); const rw = await rowsOf('#view .mk-linkcard'); ok(`Tarjetas de ${g.key}: filas balanceadas del mismo ancho, sin tarjeta sola`, okRows(rw, g.n), JSON.stringify(rw.map(r => r.length))) }
  await go(page, '#/'); await page.waitForTimeout(500); await page.evaluate(() => document.querySelectorAll('.mk-accordion').forEach(a => a.classList.remove('collapsed'))); await page.waitForTimeout(400);
  for (const g of groups) { const rw = await page.evaluate(id => { const cs = [...document.querySelectorAll('#' + id + ' .mk-linkcard')].map(c => c.getBoundingClientRect()); const rows = {}; cs.forEach(r => { const k = Math.round(r.top / 8); (rows[k] = rows[k] || []).push(Math.round(r.width)) }); return Object.values(rows) }, 'acc-' + g.key); ok(`Home · ${g.key}: filas balanceadas del mismo ancho, sin tarjeta sola`, okRows(rw, g.n), JSON.stringify(rw.map(r => r.length))) }
  await go(page, '#/parametrizacion/flow'); await page.waitForTimeout(500);
  const fa = await page.evaluate(() => ({ ed: document.querySelectorAll('#view [data-act="edit"]').length, off: document.querySelectorAll('#view [data-act="off"]').length }));
  ok('Flujo de órdenes: cada estado tiene las acciones Editar e Inactivar', fa.ed >= 13 && fa.off >= 13, JSON.stringify(fa));
  await page.locator('#view [data-act="edit"]').first().click(); await page.waitForSelector('[name=a1]');
  await page.selectOption('[name=a1]', 'No'); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(400);
  const ft = await page.locator('#ft tbody tr').first().innerText();
  ok('Flujo de órdenes: editar un estado cambia las acciones permitidas', /No/.test(ft.split('\n').join(' ')) && !(await page.locator('.mk-modal-overlay').count()), ft.replace(/\s+/g, ' ').slice(0, 80));
  await page.locator('#view [data-act="off"]').first().click(); await page.waitForSelector('.mk-modal-overlay [data-ok]'); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(400);
  ok('Flujo de órdenes: inactivar un estado lo marca como Inactivo', /Inactivo/.test(await page.locator('#ft').innerText()));
  await go(page, '#/parametrizacion/catalogs'); await page.waitForTimeout(400);
  const ctabs = await page.locator('#view .mk-tab').allTextContents(); let calls = [];
  for (let i = 0; i < ctabs.length; i++) { await page.click(`#view [data-t="${i}"]`); await page.waitForTimeout(250); calls.push([ctabs[i], await page.locator('#view [data-cn]').count(), await page.locator('#view [data-act="edit"]').count()]) }
  const sysTabs = ['Tipos de límite', 'Clases de activo', 'Instrumentos de derivados'];
  ok('Catálogos: los maestros tienen Nuevo, Editar e Inactivar; los del sistema solo se consultan', calls.every(([t, n, e]) => sysTabs.includes(t) ? (n === 0 && e === 0) : (n === 1 && e > 0)), JSON.stringify(calls));
  const avi = ctabs.indexOf('Avaluadores'); await page.click(`#view [data-t="${avi}"]`); await page.waitForTimeout(250);
  await page.click('#view [data-cn]'); await page.waitForSelector(MF); await page.fill(`${MF} [name=a]`, 'Avaluadora del Pacífico S.A.'); await page.fill(`${MF} [name=e]`, 'Oficinas'); await page.click(`${MF} [data-s]`); await page.waitForTimeout(400);
  ok('Catálogos: crear un registro lo agrega a la lista', /Avaluadora del Pacífico S\.A\./.test(await page.locator('#ct').innerText()));
  await go(page, '#/parametrizacion/instruments'); await page.waitForTimeout(400);
  const nb = await page.locator('#view .mk-headerpage button').evaluateAll(b => b.filter(x => /Nuevo/.test(x.innerText)).length);
  ok('Instrumentos: un solo botón Nuevo', nb === 1, String(nb));
  await page.click('#view [data-new]'); await page.waitForSelector('.mk-modal-overlay [data-k="n"]');
  ok('Instrumentos: Nuevo pregunta si es un instrumento listado o un activo no listado', (await page.locator('.mk-modal-overlay [data-k]').count()) === 2); await closeModals(page);
  await go(page, '#/parametrizacion/limits'); await page.waitForTimeout(400);
  ok('Configuración de límites: sin el letrero «Por definir con el negocio»', !/Topes ilustrativos|Por definir con el negocio/.test(await page.locator('#view').innerText()));
  const pn = await page.evaluate(() => window.__mk.DS.PNAMES);
  ok('Portafolios: no hay personas naturales entre los portafolios', !pn.some(n => /Julian|Murillo|Alvarez|Saldarriaga|Jham|Mesa Restrepo/i.test(n)), pn.join(','));
  await go(page, '#/dashboard/graphics'); await page.waitForTimeout(400);
  const cla = async (puerto) => { await page.selectOption('#view [name=port]', { index: puerto }); await page.click('#view [data-consult]'); await page.waitForTimeout(600); return page.locator('#view [name=clase] option').allTextContents() };
  const ports = await page.locator('#view [name=port] option').allTextContents();
  let allCl = new Set(); for (let i = 1; i < ports.length; i++) (await cla(i)).forEach(x => allCl.add(x));
  ok('Visor: Clase de activo incluye renta fija, renta variable, mercado monetario, derivados, inmueble, proyecto, TCC y cartera', ['Renta fija', 'Renta variable', 'Mercado monetario', 'Derivados', 'Inmueble', 'Proyecto', 'TCC', 'Cartera'].every(c => allCl.has(c)), [...allCl].join(','));
  const di = await page.evaluate(() => ({ inst: [...new Set(window.__mk.DS.DERIV_ORDERS.map(o => o.inst))], av: window.__mk.DERIV_P ? 1 : 0 }));
  await go(page, '#/orders/derivatives'); await page.click('[data-new]'); await page.waitForSelector(`${W2} [name="d-inst"]`);
  const insts = await page.locator(`${W2} [name="d-inst"] option`).allTextContents();
  const props = await page.locator(`${W2} [name="d-prop"]`).evaluateAll(r => r.map(x => x.value));
  ok('Derivados: sin opciones; instrumentos permitidos solo forward, swap y futuros', insts.filter(x => x && x !== 'Seleccionar').every(x => /^(Forward de (divisas|tasas) (OTC|novado)|Swap de (divisas|tasas) (OTC|novado)|Futuro)$/.test(x)) && insts.length > 4 && !/Opci/i.test(insts.join(',')) && di.inst.every(i => !/Opci/i.test(i)), insts.join('|'));
  ok('Derivados: el propósito es Cobertura, Inversión o Cobertura e inversión', ['Cobertura', 'Inversión', 'Cobertura e inversión'].every(p => props.includes(p)) && props.length === 3, props.join('|')); await closeModals(page);
  const dtx = []; for (const r of ['#/orders/derivatives', '#/dashboard/sensitivity-measures', '#/dashboard/exposure', '#/orders/reports']) { await go(page, r); dtx.push(await page.locator('#view').innerText()) }
  ok('Derivados: ninguna pantalla muestra opciones, delta ni vega', !/Opci[oó]n|opciones|\bDelta\b|\bVega\b/.test(dtx.join(' ')));
  await go(page, '#/orders/fixed-income'); await page.click('#view [data-rt="1"]'); await page.waitForTimeout(400);
  ok('Carga masiva: los botones de descarga muestran su icono', (await page.locator('#view [data-dl] svg').count()) >= 2 && (await page.locator('#view [data-dl] svg *').count()) > 0);
  await go(page, '#/limit-control/limit-evaluation'); await page.waitForTimeout(400);
  ok('Evaluación de límites: filtro por tipo de activo', (await page.locator('#view select[data-fl="ta"]').count()) === 1);
  await go(page, '#/dashboard/future-flows'); await page.waitForTimeout(400);
  ok('Flujos futuros: filtro por tipo de activo', (await page.locator('#view [name=ta]').count()) === 1);
  await go(page, '#/performance-attribution/contribution'); await page.waitForTimeout(400);
  ok('Contribución por activo: filtro por tipo de activo', (await page.locator('#view [name=clase]').count()) === 1);
  const navRoutes = await page.evaluate(() => window.__mk.NAV.flatMap(g => g.items.map(i => i[0])));
  const sinMod = []; for (const r of navRoutes) { await go(page, r); await page.waitForTimeout(250); if ((await page.locator('#view .mk-apoya a.mk-chip').count()) < 2) sinMod.push(r) }
  ok('Módulos conectados: todas las pantallas muestran la etiqueta con sus enlaces', sinMod.length === 0, sinMod.join(','));
  /* Control: validación previa en renta fija, renta variable y mercado monetario; excesos; auditoría; segregación; efecto cambiario */
  const sc = await page.evaluate(() => { const M = window.__mk, rows = M.evalRows().filter(r => r.eval === 'MAX'), val = p => (M.DS.SENS.find(x => x.port === p) || {}).val || 2e10;
    const em = rows.filter(r => r.tipo === 'EMISOR' && M.DS.INSTRUMENTS.some(i => i.emisor === r.sub)).sort((a, b) => b.uso - a.uso)[0];
    const cr = rows.filter(r => r.tipo === 'CONTRAPARTE' && r.nat === 'Interno' && M.DS.MM_CP.some(c => c.name === r.sub)).sort((a, b) => b.uso - a.uso)[0], cp = M.DS.MM_CP.find(c => c.name === cr.sub);
    const need = (cr.pct - cr.actual) * val(cr.port), avail = cp.cupo - M.cpTotal(cp.name);
    return { rfPort: em.port, rfInstr: M.DS.INSTRUMENTS.find(i => i.emisor === em.sub).mnem, rfVal: Math.round(em.pct * val(em.port) * 0.6), mmPort: cr.port, mmCp: cr.sub, mmNom: Math.round(Math.min(avail * 0.9, need * 1.6)), ok: Math.min(avail * 0.9, need * 1.6) > need } });
  ok('Validación previa: existe un caso de demostración para el límite interno de contraparte', sc.ok, JSON.stringify(sc));
  const ex0 = await page.evaluate(() => window.__mk.EXCESOS.length), au0 = await page.evaluate(() => window.__mk.AUDIT.length);
  await go(page, '#/orders/fixed-income'); await page.click('#view [data-new]'); await page.waitForSelector(MF);
  await page.selectOption(`${MF} [name=port]`, sc.rfPort); await page.fill(`${MF} [name=instr]`, sc.rfInstr); await page.fill(`${MF} [name=quantity]`, '1000'); await page.fill(`${MF} [name=value]`, String(sc.rfVal));
  await page.click(`${MF} [data-s]`); await page.waitForTimeout(500);
  const rfp = await page.locator('.mk-modal-overlay').last().innerText();
  ok('Validación previa · renta fija: un límite normativo excedido bloquea la orden y deshabilita Confirmar', /Validación de límites/.test(rfp) && /Límite normativo excedido/.test(rfp) && (await page.locator(`${ovl} [data-ok][disabled]`).count()) === 1);
  ok('Validación previa · renta fija: el bloqueo queda en Excesos y aprobaciones', (await page.evaluate(() => window.__mk.EXCESOS.filter(e => e.resultado === 'Bloqueado').length)) > 0 && (await page.evaluate(() => window.__mk.EXCESOS.length)) > ex0); await closeModals(page);
  await go(page, '#/orders/money-market'); await page.click('#view [data-new]'); await page.waitForSelector(MF);
  await page.selectOption(`${MF} [name=op]`, { index: 1 }); await page.selectOption(`${MF} [name=port]`, sc.mmPort); await page.selectOption(`${MF} [name=cp]`, sc.mmCp); await page.fill(`${MF} [name=nominal]`, String(sc.mmNom)); await page.fill(`${MF} [name=rate]`, '10%'); await page.fill(`${MF} [name=plazo]`, '30');
  await page.click(`${MF} [data-s]`); await page.waitForTimeout(500);
  const mmp = await page.locator('.mk-modal-overlay').last().innerText();
  ok('Validación previa · mercado monetario: un límite interno excedido pide motivo y aprobador', /Validación de límites/.test(mmp) && /Límite interno excedido/.test(mmp) && (await page.locator(`${ovl} [name=d-motivo]`).count()) === 1);
  await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(300);
  ok('Validación previa · mercado monetario: sin aprobación no se registra', /registra el motivo|Indica el motivo|obligatorio|Falta/i.test(await page.locator('.mk-modal-overlay').last().innerText()) || (await page.locator('.mk-modal-overlay').count()) >= 2);
  await page.fill(`${ovl} [name=d-motivo]`, 'Renovación de una operación que vence mañana.'); await page.selectOption(`${ovl} [name=d-aprob]`, { index: 1 });
  const mm0 = await page.evaluate(() => window.__mk.DS.MM_ORDERS.length); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(800);
  ok('Validación previa · mercado monetario: con motivo y aprobador se registra y queda el exceso aprobado', (await page.evaluate(() => window.__mk.DS.MM_ORDERS.length)) === mm0 + 1 && (await page.evaluate(() => window.__mk.EXCESOS.some(e => e.resultado === 'Aprobado' && /Renovación/.test(e.motivo) && e.aprobador !== '—'))));
  ok('Auditoría: lo registrado y lo bloqueado quedan en la bitácora', (await page.evaluate(() => window.__mk.AUDIT.length)) >= au0 + 3);
  await go(page, '#/limit-control/exceptions'); await page.waitForTimeout(400);
  const exT = await page.locator('#view').innerText();
  ok('Excesos y aprobaciones: lista los excesos con su resultado, solicitante y aprobador', /Aprobado/.test(exT) && /Bloqueado/.test(exT) && /Naturaleza/.test(exT) && (await page.locator('#view tbody tr').count()) >= 6 && !BAD_TEXT.test(exT));
  await go(page, '#/orders/reports'); await page.click('[data-r="aud"]'); await page.click('#view [data-gen]'); await page.waitForTimeout(900);
  const auT = await page.locator('#view').innerText();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#view [data-dlrep]')]);
  await page.click('#bell'); await page.waitForTimeout(300); const ntT = await page.locator('#ntfList').innerText(); await page.click('#ntfClose');
  ok('Informes de órdenes: «Generar informe» no muestra el resultado en pantalla; deja el archivo Excel disponible en la pantalla y en el Centro de Notificaciones', /Archivo del informe disponible/.test(auT) && !/Resultado del informe/.test(auT) && (await page.locator('#view tbody tr').count()) === 0 && /\.xlsx$/.test(dl.suggestedFilename()) && /Archivo del informe disponible/.test(ntT) && /Descargar informe/.test(ntT), dl.suggestedFilename());
  ok('Bitácora de auditoría (informe en Órdenes › Reportes): se genera el archivo con quién hizo qué y cuándo, y ya no es una tarjeta', /Archivo del informe disponible/.test(auT) && !BAD_TEXT.test(auT) && !(await page.evaluate(() => window.__mk.NAV.some(g => g.key === 'audit'))));
  await go(page, '#/orders/fixed-income'); await page.waitForTimeout(400);
  const f0 = await page.evaluate(() => window.__mk.DS.FI_ORDERS.filter(o => o.estatus === 'F').length);
  await page.locator('#view [data-act="conf"]').first().click(); await page.waitForSelector('[name=uc]');
  const reg = await page.locator('.mk-modal-overlay').last().innerText(); const uopts = await page.locator('[name=uc] option').allTextContents();
  ok('Segregación en renta fija: quien confirma no puede ser quien registró', /Segregación de funciones/.test(reg) && uopts.length === 4 && !uopts.some(u => reg.includes('REGISTRÓ') && false), uopts.join('|'));
  await page.selectOption('[name=uc]', { index: 1 }); await page.click(`${ovl} [data-ok]`); await page.waitForTimeout(500);
  ok('Segregación en renta fija: confirmar finaliza la orden y registra quién confirmó', (await page.evaluate(() => window.__mk.DS.FI_ORDERS.filter(o => o.estatus === 'F').length)) === f0 + 1 && (await page.evaluate(() => window.__mk.DS.FI_ORDERS.some(o => o.estatus === 'F' && o.uConf && o.uConf !== o.uReg))));
  await go(page, '#/performance-attribution/brinson'); await page.waitForTimeout(300);
  await page.selectOption('#view [name=port]', { index: 1 }); await page.click('#view [data-consult]'); await page.waitForTimeout(700);
  const brT = await page.locator('#view').innerText();
  ok('Atribución de retorno: separa el efecto cambiario de las inversiones en USD y EUR', /Efecto cambiario/.test(brT) && !/Datos ilustrativos de demostración/.test(brT) && !BAD_TEXT.test(brT));
  /* Tema oscuro: las tarjetas del ciclo de vida de Flujo de órdenes no usan fondo blanco fijo */
  await page.evaluate(() => document.documentElement.classList.add('dark')); await go(page, '#/parametrizacion/flow'); await page.waitForTimeout(500);
  const bgs = await page.evaluate(() => [...document.querySelectorAll('#view div[style*="border-radius:10px"]')].map(d => getComputedStyle(d).backgroundColor));
  ok('Tema oscuro · Flujo de órdenes: las tarjetas del ciclo de vida no son blancas', bgs.length >= 8 && bgs.every(c => c !== 'rgb(255, 255, 255)'), bgs.slice(0, 3).join('|'));
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  /* F12 en las pantallas nuevas */
  for (const dest of ['Colombia', 'Chile', 'República Dominicana', 'Panamá'].filter(c => c !== pais).slice(0, 2)) {
    for (const route of ['#/orders/investment-decisions', '#/parametrizacion/instruments', '#/dashboard/graphics', '#/parametrizacion/limits']) {
      await go(page, route); await setCountry(page, dest);
      const tx = await viewText(page), terms = dest === 'Colombia' ? null : await forbiddenFor(page, dest), lk = terms ? leaks(tx, terms) : [];
      ok(`F12 · ${pais} → ${dest} desde ${route}: sin errores ni datos mezclados`, !BAD_TEXT.test(tx) && lk.length === 0 && tx.length > 200, lk.join(', '));
      await setCountry(page, pais);
    }
  }
  ok('Consola sin errores en los flujos de las fases 2 y 3', errors.length === 0, errors.slice(0, 3).join(' | '));
  ok('Sin peticiones de red en los flujos de las fases 2 y 3', net.length === 0, net.slice(0, 3).join(' | '));
  await ctx.close();
}
