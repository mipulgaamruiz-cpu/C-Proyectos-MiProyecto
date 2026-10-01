# Regresión de la demo · Front de inversiones

Pruebas automáticas que abren `front-inversiones-performance-attribution.html` por `file://` (sin servidor ni red) con Playwright y Chromium.

```bash
cd tests
npm install
npx playwright install chromium
npm run regression                       # suite completa: 4 países, tema claro y oscuro
npm run regression:baseline              # regenera la línea base (solo si el cambio es intencional)
node regression/run.mjs --only rutas,flujos,propuesta,numeros,libretos
node regression/run.mjs --paises Colombia,Panamá --no-screens
node regression/report.mjs               # genera docs/REGRESION-DEMO.md
```

| Carpeta o archivo | Qué contiene |
| --- | --- |
| `regression/routes.mjs` | Rutas, breadcrumb, menú activo, tarjetas, tablas, KPIs, gráficos, contraste, desbordes, fuga de localización y comparación con la línea base |
| `regression/flows.mjs` + `harness.js` | Exportes CSV/Excel, cargas masivas, reportes y mercado monetario |
| `regression/flows2.mjs` | Derivados: cotizaciones, justificación, evidencia, límites, precarga, eventos y cambio de país |
| `regression/flows3.mjs` | Decisiones de inversión, activos no listados, valoración, flujos, atribución por vehículo y FVP |
| `regression/numbers.mjs` | Invariantes numéricos |
| `regression/libretos.mjs` + `libretos/*.json` | Pasos verificables de cada libreto |
| `regression/baseline/` | Línea base (texto visible y capturas) tomada antes de la propuesta |
| `regression/expected-changes.json` | Cambios intencionales respecto de la línea base |
| `regression/out/` | Capturas y resultado de la última corrida |
