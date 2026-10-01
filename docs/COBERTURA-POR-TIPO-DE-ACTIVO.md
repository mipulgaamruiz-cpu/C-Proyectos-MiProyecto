# Cobertura del Front de inversiones por tipo de activo

Revisión de qué tiene el prototipo para cada tipo de activo, módulo por módulo. Los datos son ilustrativos (ver `REGRESION-DEMO.supuestos-y-pendientes.md`).

| Tipo de activo | Parametrización | Dashboard | Órdenes | Control de límites | Performance attribution | Informes de órdenes |
| --- | --- | --- | --- | --- | --- | --- |
| **Renta fija** | Instrumentos, Emisores y Calificaciones (Catálogos), Índices y Benchmarks, Flujo de órdenes | Visor de portafolio, Flujos futuros, Medidas de sensibilidad (DV01) | Pantalla propia + **carga masiva** | Emisor, calificación, plazo y demás | Resumen, Atribución de retorno, Contribución, **Atribución renta fija**, **Atribución por producto** | Renta fija |
| **Renta variable** | Instrumentos, Índices y Benchmarks, Flujo de órdenes | Visor de portafolio | Pantalla propia + **carga masiva** | Emisor, sector y demás | Resumen, Atribución de retorno, Contribución, **Atribución por producto** | Renta variable |
| **Mercado monetario** | Contrapartes y cupos, Tasas de referencia, Operaciones monetarias (Catálogos) | **Mercado monetario** (posición, vencimientos y devengo) | Pantalla propia + **carga masiva** | Cupo de contraparte | **Atribución mercado monetario**, **Atribución por producto** | Mercado monetario |
| **Derivados** | Instrumentos de derivados y Propósito (Catálogos), Contrapartes (exposición potencial), parámetros de mejor ejecución (Flujo de órdenes), «Solo cobertura» (Portafolios) | **Exposición y cobertura**, Medidas de sensibilidad (duración y DV01) | Pantalla propia con cotizador y evidencia de mejor ejecución (forward y swap, de divisas y de tasas, OTC y novado, y futuros; sin opciones) | Cupo por exposición potencial y restricción por propósito (cobertura, inversión o ambas) | Efecto de cobertura (Atribución de retorno y Resumen), **Atribución por producto** | Derivados |
| **Inmobiliario** | Instrumentos (Inmueble y Avalúos), Avaluadores (Catálogos), tipo de vehículo (Portafolios) | Visor (fuente, fecha y «valoración vencida»), Flujos futuros (canon y pérdida esperada) | **Decisiones de inversión** (comité y acta) | Inmueble, arrendatario, ciudad, endeudamiento | Renta y valorización (Resumen), Contribución, **Atribución por producto** | Inmobiliario |
| **Alternativas (TCC y proyectos)** | Instrumentos (Proyecto y TCC, covenants), tipo de vehículo | Visor + pestaña Seguimiento, Flujos futuros (desembolsos) | **Decisiones de inversión** | Originador, proyecto, sector, etapa, activos en desarrollo | TIR y MOIC (Resumen), Contribución, **Atribución por producto** | Inversiones alternativas |
| **Lending (cartera)** | Instrumentos (Cartera), Sectores y Originadores de cartera (Catálogos), prepago supuesto (Flujo de órdenes) | Visor + pestaña **Cartera** (deudor, calificación, plazo, tasa, mora), Flujos futuros con prepago | **Decisiones de inversión** (compra de cartera) | Concentración de cartera por deudor, originador y sector | **Atribución por producto** (TIR, MOIC y rendimiento neto), Reporte de Lending | Lending |

Todos los informes se filtran por tipo de vehículo: **FIC, FCP y FVP**.

## ¿Por qué hay pantallas sin carga masiva?

- **Renta fija, renta variable y mercado monetario** tienen pantalla individual y carga masiva: son órdenes repetitivas y de alto volumen.
- **Derivados** no tiene carga masiva a propósito: cada orden exige cotizaciones de al menos tres contrapartes, comparación con el valor indicativo, justificación si no es la mejor y su evidencia de mejor ejecución. Eso se hace orden por orden en el cotizador.
- **Decisiones de inversión** (inmobiliario, alternativas y Lending) tampoco: cada una pasa por comité y deja un acta inmutable.

## Fuera del Front (por diseño)

Llamados de capital y distribuciones, vinculación de afiliados, cobro de canon y gestión del inmueble, y originación y cobranza de crédito. La composición por deudor de la cartera llega precargada de Administración de activos y crédito.

## Pendientes de negocio

- Benchmarks o índices propios para los FCP (hoy se miden con renta y valorización, y con TIR y MOIC).
- Convenciones de mercado de derivados por país, nombres de vehículos por país y límites normativos frente a internos (Ramiro).
