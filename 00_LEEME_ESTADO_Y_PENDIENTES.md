# Front de inversiones · Estado de la entrega (para continuar en otra conversación)

Este paquete reúne todo lo construido hasta ahora, **tal como está**. La implementación del archivo `01_instruccion-claude-code-front-inversiones.md` está **avanzada pero no cerrada**.

## Qué contiene

| Carpeta o archivo | Contenido |
| --- | --- |
| `01_instruccion-claude-code-front-inversiones.md` | La instrucción original (sin cambios) |
| `02_prototipo/front-inversiones-performance-attribution.html` | Prototipo (un solo HTML, sin red). 4 países: Colombia, Chile, República Dominicana y **Panamá** |
| `03_libretos/*.html` | Libretos de demo de los 4 países (HTML) |
| `03_libretos/pasos_verificables/*.json` | Pasos verificables de cada libreto (`tests/libretos`) |
| `04_plantillas_carga_masiva/<País>/` | Excel y CSV de ejemplo con datos de demo, y estructuras, por pantalla |
| `05_pruebas/` | Arnés de regresión (Playwright): `tests/` con `regression/`, línea base en texto y `expected-changes.json`; `docs/REGRESION-DEMO.md` generado en la última corrida completa |
| `06_fuentes/` | Fuentes para seguir construyendo (ver «Cómo reconstruir») |

## Avance frente a la instrucción

| Fase | Estado |
| --- | --- |
| Fase 0 · línea base y arnés de regresión | **Hecha.** Línea base limpia (0 fallas) en 3 países; Panamá se agregó después y tiene su propia línea base de rutas |
| Fase 1 · Derivados (órdenes con cotizaciones, valor indicativo, justificación, evidencia inmutable, límites normativos e internos, segregación, exposición y cobertura, efecto de cobertura en atribución, precarga con chips de fuente, eventos publicados, parámetros editables) | **Hecha.** Regresión completa de la fase: 3.188 aprobadas y 0 falladas (4 países, tema claro y oscuro) |
| Fase 2 · Decisiones de inversión, inmobiliarios y alternativos (clases de activo, avalúos, valoración vencida, seguimiento, flujos, límites nuevos, TIR y MOIC, renta y valorización, catálogos) | **Hecha** en el prototipo |
| Fase 3 · FVP (portafolios por perfil, régimen de inversión versionado, comparación entre perfiles) | **Hecha** en el prototipo |
| Fase 4 · Lending | **No implementada, por decisión pendiente** (como pide la instrucción) |
| Libretos con escenas nuevas y pasos verificables | **Hechos** (4 países; 31 pasos por país pasan: 124 aprobadas, 0 falladas) |
| Regresión completa (4 países, tema claro y oscuro, rutas, flujos, propuesta, invariantes y libretos) | **Hecha: 3.862 aprobadas y 0 falladas.** Informe en `05_pruebas/docs/REGRESION-DEMO.md` |

## Lo que falta cerrar

1. **Revisión visual humana** de las pantallas nuevas (las capturas se generan en `tests/regression/out/` al correr la suite; aquí no van para reducir el tamaño).
2. Validaciones de negocio (Ramiro): convenciones de mercado por país, naturaleza de cada límite, parámetros de mejor ejecución, datos de Panamá y nombres de bancos, instrumentos y tasas.
3. Fase 4 (Lending), solo si se confirma que el fondo invierte en cartera.
4. El proyecto de origen **no es un repositorio git**: no hay rama ni commits por fase; las copias por fase están en `06_fuentes/` (`mk.before_*.js`).

## Cómo reconstruir el prototipo desde las fuentes

Las fuentes están en `06_fuentes/`. El HTML se arma con Node:

```bash
cd 06_fuentes
npm install            # solo para jsdom y exceljs (generación y validación de plantillas)
node patch37.js && node patch38.js && node patch39.js   # parten de mk.before_f1.js y generan mk.js
node build2.js         # escribe el HTML (ajusta la ruta de salida al inicio del archivo)
node libreto.js        # libretos HTML y JSON
node gen_templates.js  # plantillas de carga masiva
```

- `mk.js`: aplicación; `data.part.js`, `icons.part.js`, `charts.part.js`: datos, iconos y gráficas; `blk0.css`, `blk1.css`, `extras.css`: estilos.
- `ins_*.js`: bloques de código que insertan los parches (`ins_pages` = mercado monetario y Libro de órdenes; `ins_f1*` = Fase 1; `ins_f2*` = Fases 2 y 3).
- `patch26`…`patch39`: parches sucesivos (Panamá es `patch36b`).
- Las rutas de `build2.js`, `libreto.js` y `gen_templates.js` apuntan a `C:/Derivados AF/`; cámbialas si trabajas en otro lugar.

## Notas importantes para quien continúe

- Todo dato de mercado es **ilustrativo** y está marcado con `/* SUPUESTO: ... */` en el código; la lista completa está en `05_pruebas/docs/REGRESION-DEMO.md` (sección 3) o en `tests/regression/REGRESION-DEMO.parte2.md`.
- Reglas de oro del prototipo: un solo HTML, sin red, sin persistencia (solo el tema), español, y localización por país con `CTRY[pais].m / ex / fix`. Lo que se inventa en Colombia se reemplaza en Chile, República Dominicana y Panamá.
- Trampas conocidas del código: las `const` de flecha usadas al crear páginas (`filters`, `cols`) deben ser `function` declaradas (ver `natOf`, `claseOf`); `S` (estado de país) se declara antes de los datos; el texto visible de las pruebas debe compararse sin distinguir mayúsculas porque el CSS pone en mayúsculas algunos rótulos.
- Libro de órdenes: 66 órdenes en los datos originales (26 renta fija, 14 renta variable, 18 mercado monetario y 8 derivados).
