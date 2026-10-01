// Utilidades compartidas del arnés de regresión (Playwright + Chromium, abre el HTML por file://)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const here = path.dirname(fileURLToPath(import.meta.url));
const ALL_COUNTRIES = ['Colombia', 'Chile', 'República Dominicana', 'Panamá'];
const _pi = process.argv.indexOf('--paises');
export const COUNTRIES = _pi >= 0 ? process.argv[_pi + 1].split(',') : ALL_COUNTRIES;
export const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'inicio';
export const FIXED_NOW = new Date('2026-09-30T10:00:00');

export class Results {
  constructor() { this.rows = []; }
  add(pais, tema, test, ok, detalle = '') { this.rows.push({ pais, tema, test, ok: !!ok, detalle: String(detalle).slice(0, 400) }); }
  get fails() { return this.rows.filter(r => !r.ok); }
}

export async function launch() { return chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}); }

export async function openApp(browser, html, { pais = 'Colombia', tema = 'light', width = 1440, height = 900, errors, net } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(FIXED_NOW);
  await page.addInitScript(t => { try { localStorage.setItem('mkTheme', t); } catch (e) { } }, tema);
  const errs = errors || [];
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push('[' + m.type() + '] ' + m.text()); });
  page.on('pageerror', e => errs.push('[pageerror] ' + e.message));
  const netl = net || [];
  page.on('request', r => { const u = r.url(); if (!/^(file|data|blob|about):/.test(u)) netl.push(u); });
  const t0 = Date.now();
  await page.goto(pathToFileURL(html).href);
  await page.waitForSelector('#view.active .mk-section', { timeout: 10000 });
  const loadMs = Date.now() - t0;
  if (pais !== 'Colombia') { await setCountry(page, pais); }
  return { ctx, page, errs, net: netl, loadMs };
}

export async function setCountry(page, pais) {
  await page.selectOption('#pais', pais);
  await settle(page);
}

export async function settle(page) {
  await page.waitForFunction(() => { const v = document.querySelector('#view'); return v && v.classList.contains('active') && !v.querySelector('.mk-spinner'); }, null, { timeout: 8000 });
  await page.waitForTimeout(120);
}

export async function go(page, route) {
  const t0 = Date.now();
  await page.evaluate(r => window.__go(r), route);
  await page.waitForTimeout(40);
  await settle(page);
  return Date.now() - t0;
}

export const viewText = page => page.evaluate(() => document.querySelector('#view').innerText.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim());

export async function routesOf(page) {
  return page.evaluate(() => {
    const NAV = window.__mk.NAV, out = [{ route: '#/', kind: 'home', label: 'Front de inversiones' }];
    NAV.forEach(g => { out.push({ route: g.home, kind: 'landing', label: g.label, group: g.label }); g.items.forEach(i => out.push({ route: i[0], kind: 'item', label: i[1], group: g.label })); });
    return out;
  });
}

export function readJSON(p, def) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return def; } }
export function writeFile(p, data) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); }

/* términos de Colombia que no pueden aparecer en Chile/RD (9.2) */
export async function forbiddenFor(page, pais) {
  const o = await page.evaluate(c => { const cfg = window.__mk.CTRY[c]; return { m: cfg.m.map(p => p[0]), ex: Object.keys(cfg.ex) }; }, pais);
  const set = new Set(['COP', 'IBR', 'DTF', 'UVR', 'TES', 'FIC', 'Bancolombia', 'BANCOLOMBIA', 'Colombia']);
  o.m.concat(o.ex).forEach(t => { const x = t.replace(/"/g, '').trim(); if (x.length >= 3) set.add(x); });
  return [...set];
}
export function leaks(text, terms) {
  const L = '[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]', hits = [];
  terms.forEach(t => {
    const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = t.length <= 4 || /^[A-ZÁÉÍÓÚÑ0-9.\s]+$/.test(t) && t.length <= 6 ? new RegExp('(?<!' + L + ')' + esc + '(?!' + L + ')') : new RegExp(esc);
    if (re.test(text)) hits.push(t);
  });
  return hits;
}
export const BAD_TEXT = /\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b|\blorem\b|\bTODO\b|\bXXX\b/i;
