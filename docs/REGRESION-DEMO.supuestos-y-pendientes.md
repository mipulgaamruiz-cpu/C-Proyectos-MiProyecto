
## 3. Lista de `SUPUESTO` (todo lo que se inventó y debe validar el negocio)

Cada uno está marcado en el código con `/* SUPUESTO: ... */`.

| Tema | Valor ilustrativo | Quién valida |
| --- | --- | --- |
| Mínimo de cotizaciones de contrapartes distintas | 3 (editable en Parametrización › Flujo de órdenes) | Compliance |
| Tolerancia frente al valor indicativo | 0,50 % (editable) | Compliance |
| Umbral para marcar un dato precargado como desactualizado | 2 días (editable) | Negocio y tecnología |
| Frecuencia de avalúo antes de marcar «valoración vencida» | 12 meses (editable) | Negocio |
| Edad de los datos de cada módulo externo | Administración del fondo llega con 3 días (para mostrar la advertencia); los demás, al día | Demo |
| Valor indicativo de derivados | Forward = spot × (1 + tasa local × t) / (1 + tasa USD × t); swap = tasa de referencia + spread; opción = prima como % del nocional | Ramiro |
| Spot y tasa en USD | 4.000 COP/USD, 950 CLP/USD, 60 DOP/USD, 1,08 USD por EUR (Panamá); tasa USD 4,3 %; tasa local = IBR 3M (Tasas de referencia) | Ramiro |
| Exposición potencial futura | Factor por instrumento (forward 15 %, swap 8 %, opción 12 %, futuro 5 %) × raíz del plazo en años | Riesgos |
| Mejor cotización | La de menor precio, tasa fija o prima (menor costo para el fondo) | Ramiro |
| Instrumentos de derivados por país | La plataforma opera forward de divisas y de tasas (OTC y novado), swap de divisas y de tasas (OTC), swap novado y futuros; **no opera opciones**. Colombia: los ocho. Chile: sin futuros. República Dominicana y Panamá: solo OTC (forward y swap, de divisas y de tasas). «Swap novado» se asume de tasas; confirmar si debe separarse en divisas y tasas | Ramiro |
| Panamá | Par EUR/USD: el balboa circula a la par con el dólar, no hay riesgo USD/PAB | Ramiro |
| Naturaleza de los límites | **Internos** (permiten continuar con motivo y aprobador): cupo de contraparte, concentración por inmueble, arrendatario, ciudad, originador, proyecto y sector, y tope por etapa. **Normativos** (bloquean): propósito, sobrecobertura, emisor, calificación, macroactivo, moneda, plazo, endeudamiento, tope a activos en desarrollo y régimen del FVP | Compliance |
| Posiciones, MTM, delta y vega de derivados | Cifras inventadas (ver `DERIV_POS`) | Ramiro |
| Efecto de la cobertura en la atribución | Peso de la exposición cubierta × costo o ganancia por puntos forward, con cifras inventadas | Ramiro |
| Estados de derivados en los informes de órdenes | Se muestran con la escala común (En cotización y Por justificar = Complementación) | Producto |
| Activos no listados | Inmuebles, proyectos, TCC y cartera, con avalúos, covenants, comprometido y desembolsado inventados | Administración de activos y crédito |
| Régimen de inversión del FVP | Topes por perfil (renta variable, renta fija, exterior, emisor) y nombres de perfil (Conservador, Moderado, Agresivo) | Ramiro |
| Usuarios, actas y aprobadores | Usuarios simulados (Ramiro Giraldo Colorado, Laura Medina, Camilo Ortega y Paula Rincón) | Demo |
| Nombres de bancos, instrumentos y tasas por país (incluido Panamá) | Ilustrativos | Negocio |
| Módulos externos (New Inversiones, Derivados, Administración del fondo, Administración de activos y crédito, Contabilidad y Cumplimiento) | Simulados con datos locales; el contrato entre módulos se muestra con chips de fuente y el panel «Eventos publicados» | Tecnología |

## 4. Diferencias con el documento de diseño

- **Contrapartes y cupos**: se reutilizó el maestro existente (Parametrización › Contrapartes y cupos) y se extendió con la exposición potencial de derivados y la utilización total; no se duplicaron contrapartes ni cupos en Catálogos o Configuración de límites.
- **Exposición y cobertura** es un ítem propio del Dashboard, distinto de **Mercado monetario**.
- **Efecto de cobertura**: dentro de **Atribución de retorno**; **Atribución mercado monetario** no cambia.
- **Valor indicativo**: se calcula con las tasas de **Tasas de referencia**; no hay otra fuente de tasas.
- **Órdenes › Mercado monetario** ya existía; solo recibió la regla de precarga (chip de New Inversiones) y el cupo compartido con derivados.
- **Parámetros de mejor ejecución**: viven en Parametrización › Flujo de órdenes, marcados «por definir con Compliance».
- **Informes de órdenes por producto** (reemplazan al Libro de órdenes, a pedido del negocio): renta fija, renta variable, mercado monetario, derivados, inmobiliario, inversiones alternativas (TCC y proyectos) y Lending, cada uno filtrable por tipo de vehículo **FIC, FCP y FVP**. Los tres últimos salen de Decisiones de inversión. **SUPUESTO:** FCP agrupa los fondos inmobiliarios y alternativos; el nombre del vehículo por país lo valida el negocio.
- **Atribución por producto** (nueva pantalla de Performance attribution): renta fija, renta variable, mercado monetario, derivados, inmobiliario, alternativas y Lending. Dos reportes nuevos en Reportes de desempeño: «Informe de atribución por producto» y «Informe de Lending».
- **Catálogos nuevos**: Clases de activo, Instrumentos de derivados (disponibilidad por país), Sectores de cartera y Originadores de cartera.
- **Módulos conectados**: ahora también en Renta fija, Renta variable y Derivados (en Derivados faltaba por un orden de carga).
- **Derivados**: el propósito de una operación es Cobertura, Inversión o ambos (en «Cobertura e inversión» el 50 % del nocional cuenta como cobertura; SUPUESTO). Instrumentos: forward y swap (OTC y novado) y futuros; sin opciones.
- **Pantallas**: «Módulos conectados» en todas; Flujo de órdenes y Catálogos con Editar e Inactivar; un solo botón «Nuevo» en Instrumentos; filtro por tipo de activo en Contribución, Evaluación de límites y Flujos futuros; Visor con mercado monetario y derivados; sin personas naturales en los portafolios; tarjetas del home y de los grupos en filas balanceadas.
- **Decisión de diseño**: Derivados y Decisiones de inversión no tienen carga masiva a propósito (cotizador y evidencia de mejor ejecución; comité y acta).
- **Cuatro países**: se agregó Panamá (además de Colombia, Chile y República Dominicana) y todo se probó en los cuatro.
- **KPIs de las listas**: ahora reflejan los filtros aplicados (antes mostraban siempre el total); es lo que pide el invariante «totales de KPIs = suma de las filas visibles».
- **Deuda previa corregida** (commit aparte en la Fase 0): la descripción de la tarjeta de mercado monetario mencionaba «CDT» en Chile y República Dominicana; el portafolio por defecto de las pantallas de atribución usaba el nombre de Colombia en otros países.
- **Proceso**: el proyecto no es un repositorio git, así que no hay rama ni commits por fase. Las copias de cada fase quedaron en el directorio de trabajo (`mk.before_fase0.js`, `mk.before_f1.js`, …) y la línea base en `tests/regression/baseline/`.
- **Arnés**: Playwright con Chromium (`file://`). El arnés en página (`tests/regression/harness.js`) reutiliza las verificaciones previas de exportes, cargas masivas, reportes y mercado monetario.

## 5. Pendientes

- **Fase 4 · Lending: implementada (confirmada por el responsable de negocio: el fondo *invierte* en cartera; no la origina ni la cobra).** Visor de portafolio › pestaña **Cartera** (composición por deudor, calificación, sector, originador, plazo, tasa y mora); **Flujos futuros** con supuesto de prepago (CPR anual editable, por defecto 8 %, también en Parametrización › Flujo de órdenes); límites internos de **concentración de cartera** por deudor, originador y sector (medidos sobre el saldo de cartera, con la posición real en Evaluación de límites); y **compra de cartera** por Decisiones de inversión con validación previa de concentración por originador. **SUPUESTO:** los deudores, calificaciones, plazos, tasas, mora, el lote CAR-002 y los topes (12 % deudor, 70 % y 50 % originador, 45 % y 40 % sector) son ilustrativos; Administración de activos y crédito es el módulo dueño de los datos.
- Umbrales por definir con Compliance: cotizaciones mínimas, tolerancia, frecuencia de avalúo y umbral de dato desactualizado.
- Validaciones de Ramiro antes de la demo: convenciones de mercado por país (base de días, calendario, fixing e instrumentos disponibles) y los datos de Panamá.
- Qué datos entrega New Inversiones y con qué frecuencia (hoy simulado).
- Mejor ejecución para renta fija y renta variable: fuera de esta entrega (solo derivados).
- Lo que **nunca** debe aparecer en el Front (llamados de capital, distribuciones a inversionistas, vinculación de afiliados, cobro de canon y gestión del inmueble, originación y cobranza de crédito) no está en el prototipo ni en los libretos; los libretos lo mencionan solo como fuera de alcance.

## 6. Orden de módulos y tarjetas

El menú, la home y las tarjetas de cada landing salen de la misma lista (`NAV`); la regresión comprueba que las tarjetas llevan a su ruta y siguen el orden del menú.

1. **Parametrización**: Flujo de órdenes, Portafolios, Instrumentos, Índices de referencia, Benchmarks, Contrapartes y cupos, Tasas de referencia, Configuración de límites, Catálogos.
2. **Dashboard**: Visor de portafolio, Flujos futuros, Medidas de sensibilidad, Mercado monetario, Exposición y cobertura.
3. **Órdenes**: Renta fija, Renta variable, Mercado monetario, Derivados, Decisiones de inversión, Reportes.
4. **Control de límites**: Evaluación.
5. **Performance attribution**: Resumen de desempeño, Atribución de retorno, Contribución por activo, Atribución renta fija, Atribución mercado monetario, Reportes.

## 7. Cómo ejecutar

```bash
cd tests
npm install            # solo la primera vez (instala Playwright)
npx playwright install chromium
npm run regression     # suite completa
node regression/run.mjs --only rutas,numeros --paises Colombia,Chile
node regression/report.mjs   # regenera este documento
```
