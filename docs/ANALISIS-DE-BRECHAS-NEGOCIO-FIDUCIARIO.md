# Análisis de brechas · Front de inversiones para negocio fiduciario

Revisión honesta de lo que el prototipo cubre y de lo que **no** cubre, frente a lo que normalmente se espera de un front de inversiones fiduciario. Se hizo sobre el código del prototipo, no de memoria. No es asesoría regulatoria.

## 1. Lo que sí está cubierto

| Capacidad | Dónde |
| --- | --- |
| Maestros: portafolios (FIC, FCP, FVP y mandatos), instrumentos de todas las clases, índices, benchmarks, contrapartes y cupos, tasas, límites, catálogos, flujo de órdenes | Parametrización |
| Operación de renta fija, renta variable y mercado monetario, con carga masiva | Órdenes |
| Derivados (forward y swap OTC y novado, y futuros) con cotizador, valor indicativo, mejor ejecución, evidencia inmutable y segregación de funciones | Órdenes › Derivados |
| Inmobiliario, alternativas (TCC y proyectos) y Lending por decisión de inversión, comité y acta inmutable | Órdenes › Decisiones de inversión |
| Límites normativos (bloquean) e internos (con motivo y aprobador), concentración y cupos de contraparte | Control de límites |
| Composición del portafolio, flujos futuros, sensibilidad (duración y DV01), exposición y cobertura, mercado monetario | Dashboard |
| Desempeño por producto: renta fija, renta variable, mercado monetario, derivados, inmobiliario, alternativas y Lending | Performance attribution › Atribución por producto |
| Informes de órdenes por producto, filtrables por FIC, FCP y FVP | Órdenes › Reportes |
| Precarga desde los módulos dueños con fuente, fecha y refresco, y eventos publicados | Transversal |

## 2. Performance attribution: qué incluye y qué le falta

**Incluye** Resumen de desempeño (rentabilidad, riesgo, benchmark), Brinson-Fachler (asignación, selección, interacción y efecto de cobertura), contribución por activo, atribución de renta fija y de mercado monetario, y la nueva Atribución por producto con los siete productos.

**Limitaciones conocidas** (honestas, no menores):

- **Efecto cambiario** (cerrado): se separa en Atribución de retorno para las inversiones en USD y EUR, con variaciones de divisa ilustrativas.
- **Derivados**: solo se mide el efecto de la cobertura (activo, costo por puntos forward y neto). No hay atribución de las posiciones de inversión.
- **Inmobiliario** se mide en renta y valorización, **sin benchmark**; la serie de valorización es escalonada por avalúo.
- **Alternativas** se miden en TIR y MOIC, sin comparación contra una referencia.
- **Lending**: el rendimiento (intereses, pérdida por mora, prepago) es ilustrativo y simplificado; no hay curvas de pérdida ni de prepago por vintage.
- Los datos de desempeño son **sintéticos**: sirven para mostrar la mecánica, no para validar cálculos.

## 3. Brechas frente a un front fiduciario completo (estado actualizado)

Cerradas en esta entrega: validación previa de límites en todas las órdenes, pantalla de excesos y aprobaciones, bitácora de auditoría, segregación de funciones en renta fija, renta variable y mercado monetario, y efecto cambiario en la atribución. Los datos de desempeño siguen siendo sintéticos y ahora se muestran como tales, con su fuente (Contabilidad). La tabla siguiente conserva el diagnóstico original; lo que sigue abierto es riesgo de mercado y de liquidez (VaR), asignación de órdenes entre portafolios, proveedores de precios, reglamento del fondo y reportes regulatorios.

| Brecha | Estado | Comentario |
| --- | --- | --- |
| Validación previa de límites en **todas** las órdenes | Parcial | Solo Derivados y Decisiones de inversión la validan antes de registrar. Renta fija, renta variable y mercado monetario no. |
| Registro consolidado de **excesos y aprobaciones** de límites | Parcial | Se registran en la operación y salen como evento publicado, pero no hay una pantalla que los reúna para auditoría. |
| **Bitácora de auditoría** (quién hizo qué y cuándo) | No existe | Hay trazabilidad por orden y por acta, no una bitácora general. |
| **Segregación de funciones** en renta fija, renta variable y mercado monetario | No existe | Solo está en Derivados y en Decisiones de inversión. |
| **Asignación o prorrateo** de una orden entre varios portafolios | No existe | |
| **Riesgo de mercado y de liquidez** (VaR, indicadores de liquidez) | No existe | Hay duración, convexidad y DV01. Normalmente es del módulo de Riesgos. |
| Fuentes de precios y curvas (proveedores de precios) | Parcial | Hay tasas de referencia; no hay parametrización de proveedores de precios. |
| Reglamento o política de inversión del fondo como documento | No existe | Se expresa solo como límites. |
| Reportes regulatorios para el supervisor | No existe | Fuera del alcance definido; lo normal es otro módulo. |

## 4. Recomendación

Para la demo con clientes potenciales, lo que más se notaría es: **validación previa de límites en renta fija, renta variable y mercado monetario**, la pantalla de **excesos y aprobaciones**, y el **efecto cambiario** en la atribución. Las demás brechas pueden presentarse como parte de otros módulos de la plataforma (Riesgos, Contabilidad).

Falta decidir con el negocio cuáles de estas brechas se construyen antes de la demo.

## 5. ¿Hace falta construir un módulo de Cumplimiento?

La plataforma tiene el módulo transversal de **Riesgos** y no tiene **Cumplimiento**. En el prototipo, el evento «límite excedido» ahora se publica a **Riesgos** (antes apuntaba a un módulo de Cumplimiento que no existe).

**Recomendación: no construir un módulo de Cumplimiento completo para esta entrega.** Es una iniciativa aparte y mucho más grande, y buena parte de lo que cubre no es del Front.

Lo que el Front sí necesita, y conviene resolver dentro de **Control de límites**:

- Validación previa de límites en todas las órdenes.
- Una pantalla de **excesos y aprobaciones** (motivo, aprobador, fecha).
- Una **bitácora de auditoría**.

Lo que normalmente es de Cumplimiento y queda **fuera** del Front: reportes al supervisor, listas restrictivas y prevención de lavado de activos (SARLAFT), conflictos de interés y operaciones con vinculados, y gestión de reglamentos.

**Decisión pendiente del negocio:** quién es dueño de los límites normativos de inversión. Si es Riesgos, el Front los publica a Riesgos como hoy. Si más adelante nace un módulo de Cumplimiento, consumiría los mismos eventos publicados sin cambiar el Front.
