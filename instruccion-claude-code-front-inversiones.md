# Instrucción para Claude Code: implementar la propuesta en el prototipo Front de Inversiones

**Archivo del prototipo:** `front-inversiones-performance-attribution.html` (un solo HTML autocontenido, sin backend).
**Objetivo:** extender el prototipo con la propuesta de diseño multiproducto, actualizar los libretos de demo de Colombia, Chile y República Dominicana (RD), y ejecutar una regresión completa para que la demo con clientes potenciales no falle.
**Documento de diseño de referencia:** "Front de Inversiones — Diseño multiproducto sobre monolito modular" (Claude Docs). Este archivo resume todo lo necesario; no dependas del enlace.
**Responsable de negocio:** Ramiro (experto de dominio en derivados). Todo dato de mercado que inventes es ilustrativo y debe quedar marcado para su validación.

---

## 0. Cómo trabajar

1. Lee este archivo completo antes de tocar código.
2. Trabaja en una rama `feat/front-inversiones-multiproducto` y haz un commit por fase.
3. Ejecuta la regresión (sección 9) **al terminar cada fase**, no solo al final. Si una fase rompe algo que antes funcionaba, corrígelo antes de seguir.
4. Cuando una decisión de negocio no esté definida, usa el valor por defecto indicado, márcalo en el código con `/* SUPUESTO: ... */` y lístalo en el reporte final.
5. No inventes reglas regulatorias. Los umbrales (mínimo de cotizaciones, tolerancia, frecuencia de avalúo) son **parámetros ilustrativos** y editables, no normas.
6. Al final entrega los productos de la sección 11.

## 1. Restricciones del prototipo (no negociables)

- **Un solo archivo HTML**, sin dependencias externas ni peticiones de red. Debe funcionar sin conexión.
- **Reutiliza el sistema de diseño** existente (variables `--mk-*`, componentes `mountPage`, `crudPage`, `DataTable`, `tabsUI`, `TIP`, `info`, `toast`, tema oscuro). No introduzcas estilos ni librerías nuevas.
- **Sin persistencia nueva.** Solo se mantiene `localStorage` para el tema (`mkTheme`). Al recargar, los datos vuelven al estado inicial.
- **Español** en toda la interfaz, con tildes y la ortografía del prototipo.
- **No rompas lo existente:** renta fija, renta variable, mercado monetario, límites, performance attribution, carga masiva (`MASS`), reportes y exportaciones deben seguir funcionando igual en los tres países.
- **Patrón de referencia:** el módulo de **mercado monetario** (`mm`, `mmpos`, `pcp`, `prates`, `pamm`, `MM_*`, `mmCalc`) es el más reciente y el mejor ejemplo de cómo se construye un módulo nuevo aquí. Clona su patrón (datos → `DS`/`SNAP` → página en `PAGES` → entrada en `NAV` → carga masiva → reportes).
- Mantén la convención de rutas por hash (`#/grupo/item`) y la función `route()`.

## 2. Estado actual verificado del prototipo

Verifícalo en el archivo antes de empezar; si difiere, manda lo que encuentres y reporta la diferencia.

- **Menú (`NAV`):** Parametrización, Dashboard, Ordenes, Control de límites, Performance attribution.
  - Parametrización: Flujo de órdenes, Portafolios, Instrumentos, Índices de referencia, Benchmarks, **Contrapartes y cupos**, **Tasas de referencia**, Configuración de límites, Catálogos.
  - Dashboard: Visor de portafolio, Flujos futuros, Medidas de sensibilidad, **Mercado monetario**.
  - Ordenes: Renta fija, Renta variable, **Mercado monetario**, Reportes.
  - Control de límites: Evaluación.
  - Performance attribution: Resumen de desempeño, Atribución de retorno, Contribución por activo, Atribución renta fija, **Atribución mercado monetario**, Reportes.
- **Páginas (`PAGES`):** `fixed, variable, instruments, limitcfg, limiteval, mm, oreports, mmpos, pcp, prates, graphics, flows, sens, pasummary, pabrinson, pacontrib, pafixed, pamm, pabench, pareports, pport, pindex, pcat, pflow`.
- **Datos (`DS`):** `FI_ORDERS, VI_ORDERS, INSTRUMENTS, LIMITS, BENCH_DEF, PORTS, INDICES, SENS, PNAMES, FUNDS, PORTFOLIOS, HOLDINGS_BASE, SUBLIMITS, DENOMS, LEVELS, BENCH_COMPS, INSTR_NAMES, ISSUERS, MM_ORDERS, MM_POS, MM_CP, MM_RATES`.
- **Localización por país:** `S.pais` (Colombia, Chile, República Dominicana), selector `#pais`, `applyCountry(c)`, `CTRY[c].m` (reemplazos de cadenas desde Colombia), `CTRY[c].ex` (excepciones exactas), `CTRY[c].fix` (ajustes finales), `TIPOS_P`, `MON_P`, `loc()`, `LOCL()`, `mapStr()`. Los datasets de `DS` se guardan en `SNAP` y se re-localizan al cambiar de país.
- **Utilidades expuestas:** `window.__go`, `window.__mk` (`MASS, buildXlsx, buildBook, exportTable, readXlsx, parseCSV, demoCsv, zipStore, applyCountry, reportData, mmCalc, cpUsed, bookRows, files`).
- **Otros:** `NOTIFS` (notificaciones), `landing()` y `homePage()` generan tarjetas desde `NAV`, `route()` renderiza con un retardo de 180 ms.
- **Detalle menor a corregir:** el grupo del menú se llama `Ordenes` sin tilde; cámbialo a `Órdenes` (etiqueta, breadcrumbs, textos) y repórtalo.

### Reconciliaciones con lo ya construido (importante)

El documento de diseño se escribió antes de ver estos módulos. Resuélvelo así:

| Diseño original | Ya existe en el prototipo | Qué hacer |
| --- | --- | --- |
| Contrapartes en Catálogos y cupos en Configuración de límites | **Contrapartes y cupos** (`pcp`) | **Reutilízalo y extiéndelo** para derivados (exposición potencial, ver 5.4). No dupliques contrapartes ni cupos. |
| Dashboard > Exposición y cobertura (nuevo) | Dashboard > Mercado monetario (`mmpos`) | Son distintos. Crea **Exposición y cobertura** como ítem propio; no mezcles. |
| Efecto de cobertura dentro de Atribución de retorno | Atribución mercado monetario (`pamm`) | Agrega el efecto de cobertura a **Atribución de retorno** (`pabrinson`). `pamm` no cambia. |
| Curvas y tasas para valor indicativo | **Tasas de referencia** (`prates`) | Calcula el valor indicativo de derivados a partir de `MM_RATES`/`prates`; no crees otra fuente de tasas. |
| Ítem nuevo Órdenes > Mercado monetario | Ya existe (`mm`) | No lo crees; solo aplícale la regla de precarga (sección 3). |

## 3. Regla transversal: precarga desde el módulo dueño

El Front es parte de un monolito modular. **Todo dato que el Front necesite de otro módulo se trae precargado del módulo que lo tiene; el gestor no lo digita.** El módulo dueño es la fuente de verdad. En el prototipo se simula así:

1. Crea un objeto `MODS` con los módulos externos y su nombre visible:
   `derivados` ("Derivados"), `newinv` ("New Inversiones": renta fija, renta variable y mercado monetario), `adminfondo` ("Administración del fondo"), `adminactivos` ("Administración de activos y crédito"), `contabilidad` ("Contabilidad"), `cumplimiento` ("Cumplimiento").
2. Crea `preload(modKey, clave)` que devuelve `{data, mod, asOf}` leyendo de los datasets simulados, y `srcChip(modKey, asOf)` que dibuja una etiqueta discreta: **"Fuente: <Módulo> · actualizado <fecha>"**.
3. Muestra el chip en cada pantalla o formulario con datos precargados (ver tabla). Si `asOf` supera un umbral (por defecto 2 días, parámetro), el chip cambia a estado de advertencia ("desactualizado") y aparece el botón **Refrescar**, que simula una nueva lectura y actualiza `asOf`.
4. Los formularios deben **autocompletar** desde el módulo dueño (por ejemplo, al elegir un instrumento se llenan emisor, moneda y valor indicativo; el usuario no los escribe).
5. Los cambios de datos simulados deben pasar por `DS`/`SNAP` para que `applyCountry` los localice.

| Dato precargado | Módulo dueño | Dónde se muestra |
| --- | --- | --- |
| Instrumentos, posiciones y valoración de RF, RV y mercado monetario | New Inversiones | Formularios de órdenes RF/RV/MM, Visor de portafolio, Flujos futuros |
| Valor indicativo, curva y fecha; cotizaciones; evidencia | Derivados | Orden de derivado, Exposición y cobertura |
| Aportes y retiros esperados | Administración del fondo | Flujos futuros (liquidez esperada del FVP) |
| Canon esperado y pérdida esperada | Administración de activos y crédito | Flujos futuros, Visor de inmobiliarios |
| Orden ejecutada y decisión aprobada (eventos que el Front **publica**) | Contabilidad | Notificación y registro de eventos |
| Evaluación de límite (evento publicado) | Cumplimiento | Registro de eventos |

Agrega un panel mínimo **"Eventos publicados"** (lista de solo lectura, accesible desde la campana de notificaciones o desde el Visor) con: orden ejecutada, decisión aprobada, límite excedido y avalúo registrado. Sirve para mostrar el contrato entre módulos en la demo.

## 4. Fase 0: línea base y arnés de regresión (antes de cambiar código)

1. Crea `tests/regression/` con Playwright (Node) que abra el HTML por `file://`. Si Playwright no está instalado, instálalo como dependencia de desarrollo; no lo incluyas en el HTML.
2. Expón para pruebas, sin cambiar comportamiento: `window.__mk.NAV`, `window.__mk.PAGES` y `window.__mk.S` (solo lectura).
3. Escribe el recorrido automático descrito en la sección 9 y **guárdalo contra el estado actual** (línea base): por país (3) y por ruta (todas las del `NAV` actual más inicio y landings de grupo), guarda el texto visible de `#view` y una captura (1440×900, tema claro y oscuro) en `tests/regression/baseline/`.
4. Verifica que la línea base pase limpia. Si ya hay errores de consola o textos rotos, **repórtalos** y arréglalos primero como "deuda previa", en un commit aparte.
5. Anota las cifras invariantes actuales (sección 9.4) para compararlas después.

## 5. Fase 1: Derivados (prioridad máxima)

### 5.1 Datos
Crea `DERIV_ORDERS`, `DERIV_QUOTES`, `DERIV_EVID`, `DERIV_POS` y regístralos en `DS`. Cada país tiene su moneda local, su par de divisas y su tasa de referencia (sección 10). Instrumentos: Forward, Swap, Opción, Futuro. Cada orden tiene: portafolio, instrumento, subyacente, nocional, plazo, **propósito (Cobertura / Posición propia)**, contraparte, estado, fecha, usuario que registra y usuario que confirma. Carga ~8 órdenes por país con estados variados y 2 con justificación.

### 5.2 Órdenes > Derivados (`#/orders/derivatives`, clave `deriv`)
Lista con filtros y KPIs al estilo de `mm`. Botón **Nueva orden** abre el flujo:

1. **Iniciar la orden:** portafolio, instrumento, subyacente, nocional, plazo, propósito. Al continuar corre la **validación previa de límites** (5.4).
2. **Valor indicativo:** función determinista `derivIndicative(req)` calculada con las tasas de `prates` del país. Muestra valor, curva utilizada y fecha, con chip "Fuente: Derivados".
3. **Registrar cotizaciones:** el gestor ingresa cotización por contraparte (contraparte, precio, hora; permite captura manual, indicando fuente: teléfono/chat/plataforma). Muestra **ranking frente al valor indicativo**.
4. **Elegir cotización:** si no es la mejor, o queda fuera de la tolerancia frente al indicativo, **exige justificación escrita** (campo obligatorio).
5. **Registrar la orden:** evalúa límites de nuevo y crea la orden.
6. **Evidencia de mejor ejecución:** se genera un registro `EV-####` **ligado al ID de la orden** con contraparte, precio, hora, valor indicativo, cotización elegida, justificación y usuario.

Reglas implementables (parámetros editables en Parametrización > Flujo de órdenes, con la etiqueta "por definir con Compliance"):

| Regla | Valor por defecto ilustrativo |
| --- | --- |
| Mínimo de cotizaciones de contrapartes distintas | 3 |
| Tolerancia frente al valor indicativo | 0,50 % (parámetro) |
| Justificación obligatoria | Si no es la mejor o excede la tolerancia |
| Segregación | Quien registra la orden no la confirma (dos campos de usuario distintos; usuarios simulados) |
| Inmutabilidad | La evidencia no se edita. Existe **"Corregir"**, que crea la versión 2 y conserva la 1 |

La vista de la evidencia permite imprimir (`window.print`) y exportar (reutiliza `exportTable`).

### 5.3 Flujo de órdenes (`pflow`)
Agrega los estados de derivados (En cotización, Por justificar, Registrada, Confirmada) y los de decisiones de inversión (Propuesta, En comité, Aprobada, Rechazada), con sus acciones permitidas, igual que los estados actuales.

### 5.4 Contrapartes y cupos (`pcp`) y Control de límites
- Extiende `pcp`: columnas **Exposición potencial de derivados** y utilización total (mercado monetario + derivados). El KPI de alerta (90 % o más) debe considerar ambos.
- **Evaluación (`limiteval`)** incorpora: cupo de contraparte sobre exposición potencial futura (no solo MTM) y **restricción por propósito** (un portafolio "solo cobertura" no puede abrir posición propia; agrega ese atributo a Portafolios).
- Regla de resultado: límite **normativo** excedido = **bloquea** la orden; límite **interno** excedido = permite continuar con **aprobación registrada** (campo de motivo + aprobador). Documenta qué límites del prototipo son normativos y cuáles internos en un comentario `SUPUESTO`.
- Cada evaluación emite el evento "límite excedido" cuando aplica.

### 5.5 Dashboard
- **Nuevo: Exposición y cobertura** (`#/dashboard/exposure`, clave `exposure`): KPIs de exposición neta, MTM, % cubierto y vencimientos próximos; tabla por subyacente; gráfico de cubierto frente a descubierto (reutiliza `columnSVG` u otro helper existente); filtros de portafolio y fecha.
- **Medidas de sensibilidad (`sens`):** agrega delta y vega junto a DV01 para las opciones.

### 5.6 Performance attribution
- **Atribución de retorno (`pabrinson`):** agrega el **efecto de cobertura** (retorno del activo, costo o ganancia de la cobertura por puntos forward, retorno neto cubierto) dentro de la cascada existente.
- **Resumen de desempeño (`pasummary`):** muestra retorno cubierto frente a sin cubrir para portafolios con derivados.

## 6. Fase 2: Decisiones de inversión, inmobiliarios y alternativos

### 6.1 Órdenes > Decisiones de inversión (`#/orders/investment-decisions`, clave `idec`)
Para activos sin orden de mercado: compra y venta de inmuebles, desembolsos a proyectos y compra de cartera. Lista con filtros; formulario: tipo, activo (precargado), portafolio, monto, proponente, aprobadores, número de acta. Flujo: Propuesta → En comité → Aprobada/Rechazada.
- **Segregación:** el aprobador no puede ser el proponente (el selector excluye al proponente).
- **Validación previa de límites** (concentración) antes de enviar a comité.
- **Acta aprobada inmutable** (versión nueva si se corrige).
- Al aprobar se publica el evento "decisión aprobada" (aparece en "Eventos publicados" y en notificaciones).

### 6.2 Extensiones de módulos existentes
- **Portafolios (`pport`):** atributo **tipo de vehículo** (FIC, Fondo inmobiliario, Fondo alternativo, FVP por perfil) y atributo "solo cobertura". Agrega 1 portafolio mock de cada tipo nuevo.
- **Instrumentos (`instruments`):** nuevas clases de activo **Inmueble, Proyecto, TCC** (títulos de contenido crediticio) y **Cartera**, con filtro por clase de activo y campos propios:
  - Inmueble: ciudad, tipología, arrendatario principal, y pestaña **Avalúos** (valor, fecha, avaluador).
  - Proyecto/TCC: originador, estructura, tramo, vencimiento, covenants.
- **Catálogos (`pcat`):** agrega avaluadores, propósito de la operación y tipos de límite nuevos.
- **Visor de portafolio (`graphics`):** filtro por clase de activo; toda cifra de activos sin mercado muestra **fuente y fecha de valoración**, y una insignia **"valoración vencida"** si el avalúo o modelo supera la frecuencia parametrizada (por defecto 12 meses, `SUPUESTO`). Para portafolios alternativos, pestaña **Seguimiento**: comprometido frente a desembolsado, flujos esperados frente a reales y covenants en alerta.
- **Flujos futuros (`flows`):** agrega canon esperado, desembolsos, flujos de cartera y liquidez esperada del FVP, cada uno con su chip de fuente.
- **Configuración de límites (`limitcfg`) y Evaluación:** nuevos tipos de límite: concentración por inmueble, arrendatario y ciudad; endeudamiento máximo; tope a activos en desarrollo; concentración por originador, proyecto y sector; tope por etapa (preoperativa/operativa).
- **Performance attribution:**
  - Inmobiliarios: rentabilidad separada en **renta** (canon neto) y **valorización**, con aviso visible de que la serie es escalonada por avalúo.
  - Alternativos: **TIR y MOIC** en lugar de rentabilidad ponderada por tiempo (la vista elige según el tipo de vehículo).
  - `pacontrib`: incluye los nuevos activos.
  - `pareports`: plantillas por tipo de vehículo.

## 7. Fase 3: FVP

- Portafolios por **perfil de riesgo** (nombres ilustrativos, como Conservador, Moderado y Agresivo; Ramiro los ajusta).
- **Régimen de inversión** cargado en Configuración de límites como conjunto de parámetros **versionado con fecha de vigencia**.
- **Flujos futuros:** liquidez esperada (aportes y retiros netos proyectados, fuente "Administración del fondo").
- **Performance attribution:** rentabilidad por perfil frente a su benchmark y comparación entre perfiles.
- Órdenes: reutiliza RF, RV y MM; sin ítem nuevo.
- **Fuera de alcance del Front (no lo construyas):** vinculación de afiliados, aportes y retiros individuales.

## 8. Fase 4 (condicional): Lending

**No implementar por defecto.** Depende de confirmar que el fondo *invierte* en cartera (si la origina, es otro dominio). Déjalo documentado como "no implementado: pendiente de decisión" en el reporte. Si el usuario lo confirma: clase de activo Cartera (ya prevista en Instrumentos), composición por deudor, calificación, plazo y tasa en el Visor, flujos futuros con supuesto de prepago, límites de concentración por deudor/sector/originador, y compra de cartera por Decisiones de inversión.

### Lo que NUNCA debe aparecer en el Front
Llamados de capital y distribuciones a inversionistas, vinculación de afiliados, cobro de canon y gestión del inmueble, originación y cobranza de crédito. Si algún libreto o pantalla los muestra, quítalo o preséntalo como dato recibido de otro módulo.

## 9. Regresión completa para la demo

Ejecuta la suite completa **en los tres países** (Colombia, Chile, RD) y en tema claro y oscuro. Implementa todo como script reproducible: `npm run regression` (o `node tests/regression/run.mjs`).

### 9.1 Cobertura de rutas
Para cada ruta de `NAV` (existente y nueva), cada landing de grupo y el inicio: navegar, esperar `#view.active` sin `.mk-spinner`, y comprobar:
- **Cero** errores o advertencias en consola y cero excepciones de página.
- **Cero** peticiones de red (todo local).
- Sin las cadenas `undefined`, `NaN`, `[object Object]`, `null` visibles en `#view`.
- Breadcrumb y entrada activa del menú correctos; la tarjeta de la landing y de la home lleva a la ruta correcta.
- Tablas con filas, KPIs con valores, gráficos renderizados (sin SVG vacío).
- Sin desbordes horizontales a 1366×768 y 1920×1080.

### 9.2 Prueba de fuga de localización
Para Chile y RD, ninguna pantalla puede mostrar términos de Colombia. Construye la lista de prohibidos a partir del **lado origen** de `CTRY[c].m` y `CTRY[c].ex` más: `COP`, `IBR`, `DTF`, `UVR`, `TES`, `FIC`, `Bancolombia`, `Colombia` (excepto en el selector de país y en datos que sean explícitamente de Colombia). Falla si aparece alguno en `#view`, en exportaciones o en plantillas de carga masiva. Todo texto nuevo que introduzcas con nombres de Colombia debe tener su reemplazo en `CTRY.Chile.m` y `CTRY['República Dominicana'].m`, o usar nombres neutros. Verifica también moneda y tasa de referencia correctas por país en todas las pantallas nuevas.

### 9.3 Flujos funcionales (E2E)
Ejecuta cada uno en los tres países:

| Id | Flujo | Resultado esperado |
| --- | --- | --- |
| F1 | Orden de derivado completa con 3 cotizaciones y elige la mejor | Orden Registrada; evidencia `EV-` creada y ligada al ID de la orden |
| F2 | Elegir una cotización que no es la mejor, sin justificación | Bloquea; con justificación, continúa y la evidencia la guarda |
| F3 | Menos cotizaciones que el mínimo | Bloquea con mensaje claro |
| F4 | Cupo de contraparte excedido | Límite interno: permite con aprobación registrada. Límite normativo: bloquea |
| F5 | Evidencia inmutable | No existe edición; "Corregir" crea versión 2 y conserva la 1 |
| F6 | Decisión de inversión | Aprobador distinto del proponente; acta aprobada inmutable; evento "decisión aprobada" publicado |
| F7 | Precarga | Chip "Fuente · actualizado" visible en las pantallas de la sección 3; "Refrescar" actualiza la fecha; dato viejo muestra advertencia |
| F8 | Portafolio "solo cobertura" intenta posición propia | Bloqueado por la evaluación de límites |
| F9 | Mercado monetario, RF y RV: crear, editar, inactivar | Igual que en la línea base |
| F10 | Carga masiva: descargar plantillas (`window.__mk.files`) y cargar un archivo válido y uno con errores | Igual que en la línea base; plantillas nuevas coherentes con el país |
| F11 | Exportar a Excel/CSV desde listados y reportes | Archivo abre, encabezados y cifras correctos, sin términos de otros países |
| F12 | Cambio de país a mitad de sesión desde cualquier pantalla | Se re-renderiza en el país nuevo sin errores ni datos mezclados |
| F13 | Tema claro/oscuro en pantallas nuevas | Legibles, sin colores fijos fuera de las variables |

### 9.4 Invariantes numéricos
Compáralos contra la línea base de la Fase 0 para lo que no debió cambiar, y verifica en lo nuevo:
- En Contribución por activo, la suma de contribuciones es igual al retorno del portafolio.
- En Atribución de retorno, la suma de efectos (asignación, selección, interacción y cobertura) es igual al retorno activo.
- En mercado monetario, los totales por bucket son iguales a la suma de posiciones; `mmCalc` sin cambios en sus resultados.
- Utilización de cupos igual a la suma de exposiciones (mercado monetario + derivados) sobre el cupo autorizado.
- El % cubierto de Exposición y cobertura es igual a nocional de cobertura sobre exposición bruta.
- Totales de KPIs iguales a la suma de las filas visibles tras aplicar filtros.

### 9.5 Comparación contra la línea base
- Para las rutas que **no** debían cambiar, el texto visible debe ser idéntico a la línea base (en los tres países). Cualquier diferencia debe estar en una lista explícita de cambios intencionales (`tests/regression/expected-changes.json`) con su motivo.
- Las capturas se generan para revisión humana en `tests/regression/out/`; no se usan como criterio automático salvo diferencias grandes inexplicadas en rutas sin cambios.

### 9.6 Preparación para la demo
- Carga inicial: sin errores, menos de 2 s hasta ver la home.
- Cada navegación entre pantallas: menos de 1 s.
- Funciona abriendo el HTML directamente (sin servidor) y sin conexión.
- Recargar la página restablece los datos de demo al estado inicial.
- Sin textos de relleno ("lorem", "TODO", "XXX", "prueba").

## 10. Localización por país (Colombia, Chile, RD)

Aplica la misma mecánica que ya usa el prototipo: datos base en Colombia y reemplazo por `CTRY[c].m`, `ex` y `fix`. Para derivados, define `DERIV_P[c]` (como `TIPOS_P` y `MON_P`):

| | Colombia | Chile | República Dominicana |
| --- | --- | --- | --- |
| Moneda local | COP | CLP | DOP |
| Par de divisas | USD/COP | USD/CLP | USD/DOP |
| Tasa de referencia | IBR | TAB | TASA REFERENCIA |
| Unidad de reajuste | UVR | UF | no aplica |
| Contrapartes | Las ya localizadas en `MM_CP` | Las ya localizadas (Banco Santander Chile, Banco de Chile, etc.) | Las ya localizadas (Banco Popular Dominicano, Banco de Reservas, etc.) |

- Usa los mismos tipos de tasa de `TIPOS_P` para mantener coherencia con el prototipo.
- **Validación pendiente de Ramiro antes de la demo:** convenciones de mercado por país (base de días, calendario, fixing, instrumentos disponibles). Si un instrumento no aplica en un país, ocúltalo con `DERIV_P[c].instrumentos` en lugar de mostrar datos que un cliente pueda cuestionar.
- Marca con `SUPUESTO` y lista en el reporte todo dato de mercado ilustrativo (precios, puntos forward, curvas).

## 11. Libretos de demo (Colombia, Chile y RD)

1. **Ubícalos.** Busca en el repositorio (`libreto`, `guion`, `guión`, `script`, `demo`, carpetas `docs/` o `demo/`). En el HTML del prototipo no hay referencias a libretos.
   - Si no los encuentras o hay ambigüedad, **detente en este punto y reporta** la ruta que necesitas; no los crees desde cero.
2. **Conserva el formato, el tono y la duración objetivo** de cada libreto existente. Solo agrega o modifica lo necesario.
3. **Escenas nuevas por libreto** (marca como opcionales las que excedan la duración original):
   - Derivados: cotizar, comparar con el valor indicativo, ejecutar y mostrar la evidencia de mejor ejecución (incluye el caso con justificación).
   - Exposición y cobertura, y efecto de la cobertura en la atribución de retorno.
   - Mercado monetario (si el libreto aún no lo cubre) con cupos de contraparte compartidos con derivados.
   - Decisiones de inversión con comité (inmuebles/proyectos) y valoración por avalúo con su aviso.
   - Idea fuerza: "el gestor no digita lo que otro módulo ya tiene"; muestra los chips de fuente y el botón Refrescar.
4. **Datos por país:** cada paso del libreto debe usar los nombres, monedas, tasas y cifras que realmente muestra el prototipo en ese país (no copies cifras de Colombia en Chile o RD).
5. **Hazlos verificables:** convierte cada libreto en `tests/libretos/<pais>.json` con pasos `{ ruta, acción, textoEsperado }` y ejecútalos con el mismo arnés. Si un paso del libreto no se puede ejecutar en el prototipo, corrige el libreto o el prototipo.
6. **Preguntas probables de clientes potenciales:** agrega al final de cada libreto una sección con respuestas cortas sobre: de dónde salen los datos precargados, cómo se garantiza la evidencia de mejor ejecución, qué queda fuera del Front y cómo se segregan funciones.

## 12. Entregables y definición de terminado

**Entregables:**
- Prototipo actualizado (mismo nombre de archivo) más la rama con un commit por fase.
- Libretos actualizados de Colombia, Chile y RD, y `tests/libretos/*.json`.
- `tests/regression/` con el script, la línea base y `expected-changes.json`.
- `docs/REGRESION-DEMO.md` con: resultado por país y por prueba (aprobada/falló), lista de cambios intencionales, lista de `SUPUESTO`, diferencias con el documento de diseño, y pendientes (Lending y los umbrales por definir).

**Terminado cuando:**
- La suite de la sección 9 pasa al 100 % en Colombia, Chile y RD, en tema claro y oscuro.
- Los tres libretos se ejecutan de principio a fin con sus pasos verificados.
- No hay errores de consola ni peticiones de red.
- Ninguna capacidad prohibida (sección 8) aparece en el Front.
- Toda decisión no definida está marcada y listada.

## 13. Decisiones abiertas (usa los valores por defecto y repórtalas)

| Decisión | Valor por defecto en el prototipo |
| --- | --- |
| Mínimo de cotizaciones y tolerancia de mejor ejecución | 3 cotizaciones y 0,50 %, editables |
| Frecuencia de avalúo antes de marcar "vencida" | 12 meses, editable |
| Umbral de dato precargado "desactualizado" | 2 días, editable |
| Lending (si el fondo invierte en cartera o la origina) | No implementado |
| Qué datos entrega New Inversiones y con qué frecuencia | Simulado; contenido ilustrativo |
| Qué límites son normativos y cuáles internos | Marcado con `SUPUESTO` en el código |
| Mejor ejecución para renta fija y variable | Solo derivados en esta entrega |
