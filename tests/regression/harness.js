// Arnés que se ejecuta DENTRO de la página (lo inyecta flows.mjs). Recorre rutas, exportes, cargas masivas, reportes y el flujo de mercado monetario.
window.__reg = async (cfg) => {
  const w = ms => new Promise(r => setTimeout(r, ms)); const R = []; const ok = (n, c, d) => R.push({ ok: !!c, test: n, detalle: d || '' });
  const errs = []; const eh = e => errs.push(e.message); window.addEventListener('error', eh);
  try {
    const M = window.__mk, X = cfg.exp;
    const sel = document.querySelector('#pais'); sel.value = cfg.pais; sel.dispatchEvent(new Event('change')); await w(500);
    const routes = M.NAV.flatMap(g => g.items.map(i => i[0]));
    const caps = []; const oc = URL.createObjectURL; URL.createObjectURL = b => { caps.push(b); return oc.call(URL, b); };
    const rowsOf = async (blob, kind) => kind === 'csv' ? M.parseCSV(await blob.text()) : await M.readXlsx(new File([blob], 'x.xlsx'));
    let nExp = 0;
    for (const r of routes) {
      window.__go(r); await w(550);
      const bx = document.querySelector('#view [data-x="csv"]'), bxl = document.querySelector('#view [data-x="xls"]');
      if (bx && bxl && bx.offsetParent) {
        const th = [...document.querySelector('#view table.mk-table thead tr').children].map(c => c.textContent.trim().toLowerCase()).filter(x => x !== 'acciones');
        const info = document.querySelector('#view .mk-rowinfo'), n = info ? +(info.textContent.match(/de (\d+)/) || [0, 0])[1] : -1;
        caps.length = 0; bx.click(); await w(250); bxl.click(); await w(300); nExp++;
        if (caps.length < 2) { ok('Exportes ' + r, false, 'no se generaron los archivos'); continue; }
        try {
          const c = await rowsOf(caps[0], 'csv'), x = await rowsOf(caps[1], 'xlsx'), flat = JSON.stringify(c) + JSON.stringify(x);
          const head = x[0].map(s => String(s).toLowerCase()), headOk = head.length === th.length && head.every((s, i) => th[i].startsWith(s));
          const bad = /undefined|NaN|\[object|\b1[67]\d{11}\b/.test(flat);
          ok('CSV y Excel · ' + r, c.length === x.length && x.length === n + 1 && headOk && !bad, 'filas ' + (x.length - 1) + ' de ' + n + (headOk ? '' : ' | encabezados: ' + head.join('|') + ' vs ' + th.join('|')) + (bad ? ' | valores inválidos' : ''));
        } catch (e) { ok('CSV y Excel · ' + r, false, String(e && e.message)); }
      }
    }
    ok('Exportes CSV/Excel verificados en ' + nExp + ' pantallas', nExp >= 18, String(nExp));
    const mass = [['fixed', '#/orders/fixed-income', 1, 6], ['variable', '#/orders/variable-income', 1, 6], ['mm', '#/orders/money-market', 1, 6], ['instr', '#/parametrizacion/instruments', 0, 5], ['bench', '#/parametrizacion/benchmarks', 0, 4], ['cp', '#/parametrizacion/counterparties', 0, 4]];
    for (const [id, r, tab, nrows] of mass) {
      try {
        window.__go(r); await w(600); let root;
        if (tab) { document.querySelector('[data-rt="1"]').click(); await w(250); root = document.querySelector('#mass'); }
        else { const a = [...document.querySelectorAll('.mk-accordion__head')].find(x => /masiv|import/i.test(x.innerText)); a.click(); await w(250); root = a.closest('.mk-accordion'); }
        const inp = root.querySelector('input[type=file]'), res = () => root.querySelector('[data-result]'), setF = async f => { const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; inp.dispatchEvent(new Event('change')); await w(100); };
        const cnt = () => { const i = document.querySelector('#view .mk-rowinfo'); return i ? +(i.textContent.match(/de (\d+)/) || [0, 0])[1] : -1; };
        const dls = [...root.querySelectorAll('[data-dl]')].reduce((o, b) => { o[b.dataset.dl] = b; return o; }, {});
        ok('Masiva ' + id + ': botones estructura, manual y ejemplos', ['estructura', 'manual', 'ejemplo', 'ejemplocsv'].every(k => dls[k]));
        caps.length = 0; for (const k of ['estructura', 'manual', 'ejemplo', 'ejemplocsv']) { dls[k].click(); await w(250); }
        ok('Masiva ' + id + ': descargas generadas', caps.length === 4 && caps.every(b => b.size > 200), caps.map(b => b.size).join('/'));
        const st = await rowsOf(caps[0], 'xlsx'), ex = await rowsOf(caps[2], 'xlsx'), exc = await rowsOf(caps[3], 'csv');
        ok('Masiva ' + id + ': ejemplo Excel con ' + nrows + ' filas y los encabezados de la estructura', ex.length === nrows + 1 && JSON.stringify(ex[0]) === JSON.stringify(st[0]));
        ok('Masiva ' + id + ': ejemplo CSV coincide con el Excel', exc.length === ex.length && exc[0].join() === ex[0].join());
        const flat = JSON.stringify(st) + JSON.stringify(ex);
        ok('Masiva ' + id + ': plantilla sin términos de otros países', !(cfg.bad || []).some(b => flat.includes(b)), (cfg.bad || []).filter(b => flat.includes(b)).join(','));
        const c0 = cnt(); await setF(new File([caps[2]], 'ejemplo.xlsx')); root.querySelector('[data-proc]').click(); await w(1600);
        const tx = res().innerText.replace(/\s+/g, ' ');
        ok('Masiva ' + id + ': banda VERDE al procesar el ejemplo', !!res().querySelector('.mk-alert--success') && new RegExp(nrows + ' registros cargados\\s*·\\s*0 con errores', 'i').test(tx), tx.slice(0, 100));
        ok('Masiva ' + id + ': las filas aparecen en la tabla', cnt() === c0 + nrows, c0 + ' → ' + cnt());
        await setF(new File([caps[3]], 'ejemplo.csv')); root.querySelector('[data-proc]').click(); await w(1400);
        const t2 = res().innerText.replace(/\s+/g, ' '), dup = (id === 'instr' || id === 'cp');
        ok('Masiva ' + id + ': ejemplo CSV' + (dup ? ' repetido: rechazo con "Fila N"' : ': banda verde'), dup ? (!!res().querySelector('.mk-alert--danger,.mk-alert--warning') && /Fila \d/.test(t2)) : !!res().querySelector('.mk-alert--success'), t2.slice(0, 90));
        await setF(new File(['a,b,c\n1,2,3'], 'mal.csv')); root.querySelector('[data-proc]').click(); await w(1100); ok('Masiva ' + id + ': encabezados erróneos rechazados', /encabezados/i.test(res().innerText));
        await setF(new File(['x'], 'nota.txt')); ok('Masiva ' + id + ': .txt rechazado', /Formato no permitido/i.test(res().innerText));
        if (!dup) { const m = M.MASS[id], rows = m.demo(), bad = rows[0].slice(); bad[0] = 'NO EXISTE'; const q = v => '"' + v + '"'; const csv = [m.cols.map(c => q(c[0])).join(';'), rows[0].map(q).join(';'), bad.map(q).join(';'), rows[1].map(q).join(';')].join('\n'); const c1 = cnt(); await setF(new File([csv], 'mixto.csv')); root.querySelector('[data-proc]').click(); await w(1300); const t3 = res().innerText.replace(/\s+/g, ' '); ok('Masiva ' + id + ': CSV mixto, 2 válidas y la fila 3 con error', !!res().querySelector('.mk-alert--warning') && /2 registros cargados/.test(t3) && /Fila 3/.test(t3) && cnt() === c1 + 2, t3.slice(0, 110)); }
      } catch (e) { ok('Masiva ' + id + ' (excepción)', false, String(e && e.message)); }
    }
    URL.createObjectURL = oc;
    window.__go('#/performance-attribution/reports'); await w(700);
    const names = [...document.querySelectorAll('#pg tbody tr')].map(tr => tr.children[1].innerText.trim());
    for (let i = 0; i < names.length; i++) {
      try {
        window.__go('#/performance-attribution/reports'); await w(650); const tr = [...document.querySelectorAll('#pg tbody tr')][i]; tr.querySelector('[data-act="gen"]').click(); await w(300); const m = document.querySelector('.mk-modal-overlay');
        if (i === 1) { const rd = m.querySelector('[name="w-fmt"][value="CSV"]'); rd.click(); rd.dispatchEvent(new Event('change', { bubbles: true })); }
        m.querySelector('[data-n]').click(); await w(250); m.querySelector('[data-n]').click(); await w(2500);
        const URLc = URL.createObjectURL; let got = null; URL.createObjectURL = b => { got = b; return URLc.call(URL, b); };
        const d = m.querySelector('[data-d]'); if (!d) { ok('Reporte ' + names[i], false, 'sin botón Descargar'); URL.createObjectURL = URLc; continue; } d.click(); await w(300); URL.createObjectURL = URLc;
        const rows = await rowsOf(got, i === 1 ? 'csv' : 'xlsx'), flat = JSON.stringify(rows);
        ok('Reporte "' + names[i] + '" (' + (i === 1 ? 'CSV' : 'Excel') + ')', rows.length >= 2 && !/undefined|NaN|\[object/.test(flat) && !(cfg.bad || []).some(b => flat.includes(b)), (rows.length - 1) + ' filas · ' + rows[0].length + ' columnas');
      } catch (e) { ok('Reporte ' + i + ' (excepción)', false, String(e && e.message)); }
    }
    window.__go('#/orders/money-market'); await w(650); document.querySelector('[data-new]').click(); await w(400);
    const f = document.querySelector('.mk-modal--form form'); const set = (n, v) => { const e = f.querySelector('[name="' + n + '"]'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('blur')); };
    set('op', f.querySelector('[name="op"] option:nth-child(2)').value); set('port', cfg.fondo2); set('cp', cfg.cp); set('nominal', '1000000000'); set('rate', '10.5'); set('plazo', '30'); await w(150);
    const info = f.querySelector('#cpinfo').innerText; ok('MM: muestra el cupo disponible de ' + cfg.cp, /480\.000\.000/.test(info), info.slice(0, 120));
    document.querySelector('.mk-modal--form [data-s]').click(); await w(300); ok('MM: bloquea por cupo (1.000 M > 480 M)', /Supera el cupo disponible/.test(f.innerText) && !!document.querySelector('.mk-modal--form'));
    const n0 = +(document.querySelector('#view .mk-rowinfo').textContent.match(/de (\d+)/)[1]); set('nominal', '400000000'); document.querySelector('.mk-modal--form [data-s]').click(); await w(400);
    const rev = /revisa la operación/i.test(document.body.innerText); ok('MM: con 400 M abre "Revisa la operación"', rev);
    if (rev) { const ov = [...document.querySelectorAll('.mk-modal-overlay')].pop(), mo = ov.querySelector('[name="d-motivo"]'); if (mo) { mo.value = 'Renovación de una operación que vence mañana.'; ov.querySelector('[name="d-aprob"]').selectedIndex = 1; } [...document.querySelectorAll('[data-ok]')].pop().click(); await w(900); }
    const n1 = +(document.querySelector('#view .mk-rowinfo').textContent.match(/de (\d+)/)[1]); ok('MM: la operación queda registrada', n1 === n0 + 1, n0 + ' → ' + n1);
    window.__go('#/dashboard/money-market'); await w(700); const pt = document.body.innerText;
    ok('Posición monetaria: saldo 15.420.000.000, plazo ≈ 49,8, vence 7 días 4.920.000.000, tasa 10,65 %', /15\.420\.000\.000/.test(pt) && /49,8 días/.test(pt) && /4\.920\.000\.000/.test(pt) && /10,65\s?%/.test(pt));
    document.querySelector('[data-t="1"]').click(); await w(300); ok('Escalera de vencimientos con gráfica', !!document.querySelector('#view svg[aria-label="Escalera de vencimientos"]'));
    document.querySelector('[data-t="2"]').click(); await w(300); ok('Devengo y rentabilidad con totales', /Devengo del día/.test(document.querySelector('#view').innerText) && /Total/.test(document.querySelector('#view tbody').innerText));
    window.__go('#/limit-control/limit-evaluation'); await w(650);
    { const fs0 = document.querySelector('#view select[data-fl="p"]'); fs0.value = cfg.fondo2; fs0.dispatchEvent(new Event('change')); await w(300); }
    const rowsL = [...document.querySelectorAll('#view tbody tr')];
    const l1 = rowsL.find(tr => tr.innerText.includes(cfg.fondo2) && tr.innerText.includes(cfg.emisor) && /Alerta/i.test(tr.innerText)), l2 = rowsL.find(tr => tr.innerText.includes(cfg.fondo2) && tr.innerText.includes(cfg.cp) && /Alerta/i.test(tr.innerText) && /94,00/.test(tr.innerText));
    ok('Límites: emisor ' + cfg.emisor + ' al 92 % en Alerta', !!l1 && /92,00\s?%/.test(l1.innerText), l1 ? l1.innerText.replace(/\s+/g, ' ').slice(0, 100) : 'no encontrado');
    ok('Límites: contraparte ' + cfg.cp + ' al 94 % en Alerta', !!l2, l2 ? l2.innerText.replace(/\s+/g, ' ').slice(0, 100) : 'no encontrado');
    window.__go('#/parametrizacion/counterparties'); await w(650); const cr = [...document.querySelectorAll('#pg tbody tr')].find(tr => tr.innerText.includes(cfg.cp)); ok('Contrapartes: ' + cfg.cp + ' con cupo y utilización', !!cr && /%/.test(cr.innerText), cr ? cr.innerText.replace(/\s+/g, ' ').slice(0, 110) : '');
    for (const [id, n] of Object.entries(X.informes)) { window.__go('#/orders/reports'); await w(600); document.querySelector('[data-r="' + id + '"]').click(); await w(300); document.querySelector('[data-gen]').click(); await w(900);
      const rt = (document.querySelector('#out .mk-rowinfo') || { textContent: '' }).textContent; ok('Informe ' + id + ': ' + n + ' registros tras las pruebas', new RegExp('de ' + n + '\\b').test(rt), rt.replace(/\s+/g, ' ')); }
    document.querySelector('#bell').click(); await w(300); const nt = document.querySelector('#ntfList').innerText; ok('Campana: cupo de contraparte y vencimiento', /Cupo de contraparte al 93%/.test(nt) && /CDT|DPF|CDP/.test(nt)); document.querySelector('#ntfClose').click();
    ok('Sin errores JS durante los flujos', errs.length === 0, errs.join(';'));
  } catch (e) { ok('EXCEPCIÓN en la prueba', false, String(e && e.message)); }
  window.removeEventListener('error', eh);
  return R;
};
