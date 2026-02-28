# Auditoría UX/UI estructural — Cuentos Killa FE

## 1) Análisis estructural de funcionalidades actuales

### 1.1 Arquitectura de navegación (journeys principales)
- **Flujo de descubrimiento**: `Home` → `Cuentos` → `Detalle de cuento`.
- **Flujo de compra**: `Detalle/Lista` → `Carrito`/mini-carrito → `Checkout` → `Pago` → `Voucher`.
- **Flujo de cuenta**: `Login` / `Registro` → `Pedidos` → `Detalle de pedido`.
- **Flujo administrativo**: Acceso por rol `ADMIN` a módulo de administración.

### 1.2 Fortalezas UX actuales
- Uso de navegación clara por rutas para secciones clave (tienda, compra, pedidos, admin).
- Búsqueda visible en navbar, acceso rápido a carrito y estado de sesión.
- Carga de vistas con lazy loading en varios módulos/componentes, lo que ayuda al rendimiento percibido.
- Presencia de estados en lista de pedidos (loading, error, vacío, listado), buena base de UX resilient.

### 1.3 Hallazgos estructurales (dolores UX)
- **Inconsistencia de patrones**: coexistencia de modal de login y ruta dedicada de login puede confundir.
- **Microcopys y formatos**: mezcla de moneda y etiquetas no siempre consistentes (ej. total en USD en pedidos vs PEN en checkout).
- **Accesibilidad parcial**: hay `aria-label` en puntos concretos, pero falta estandarización (foco, navegación teclado, roles y mensajes de error accesibles).
- **Jerarquía visual dispar**: algunas pantallas parecen MVP (carrito simple) frente a otras más maduras (lista de pedidos).
- **Feedback de sistema mejorable**: faltan estados de éxito/fracaso más ricos y próximos al contexto de acción en varios formularios.

---

## 2) 10 puntos de mejora UX/UI priorizados

> Escala sugerida de prioridad: **P1 (alta)**, **P2 (media)**, **P3 (baja)**.

### 1. Unificar el patrón de autenticación (Modal vs Página)
- **Problema**: El usuario puede iniciar sesión desde modal (navbar) o página dedicada; esto rompe continuidad y puede duplicar flujos.
- **Mejora UX**: Definir un único patrón principal (recomendado: página dedicada) y usar modal solo para contextos de interrupción mínima (ej. checkout no autenticado).
- **Impacto esperado**: Menos fricción, menor tasa de abandono en autenticación.
- **Prioridad**: P1.

### 2. Diseñar un Checkout en pasos con barra de progreso
- **Problema**: El checkout en una sola vista incrementa carga cognitiva y errores.
- **Mejora UX**: Separar en 3 pasos: Datos de contacto → Dirección → Confirmación y pago.
- **Impacto esperado**: Mayor tasa de finalización y menor tasa de errores por campo.
- **Prioridad**: P1.

### 3. Estandarizar sistema de feedback y validación de formularios
- **Problema**: Validaciones no siempre visibles/consistentes (mensajes, timing y estilo).
- **Mejora UX**: Errores inline por campo + resumen de errores + estados de éxito no intrusivos.
- **Impacto esperado**: Menos errores repetidos y menor tiempo de completado.
- **Prioridad**: P1.

### 4. Homologar moneda, formatos y lenguaje de interfaz
- **Problema**: Inconsistencia de moneda (USD/PEN), textos y convenciones.
- **Mejora UX**: Configuración única de locale + pipe de moneda centralizado + guía de microcopy.
- **Impacto esperado**: Mayor confianza y comprensión de precios.
- **Prioridad**: P1.

### 5. Mejorar accesibilidad transversal (WCAG 2.2 AA)
- **Problema**: Falta cobertura completa para navegación por teclado, foco visible, roles y descripciones.
- **Mejora UX**: Implementar auditoría A11y y corregir formularios, menús, modales y componentes interactivos.
- **Impacto esperado**: Inclusión real y reducción de barreras de uso.
- **Prioridad**: P1.

### 6. Rediseñar carrito para decisión rápida (resumen + edición inline)
- **Problema**: El carrito actual tiene interacción básica y poca capacidad de ajuste sin fricción.
- **Mejora UX**: Controles +/- cantidad, eliminar, subtotal por ítem, CTA principal claro y sticky.
- **Impacto esperado**: Aumento de conversión carrito→checkout.
- **Prioridad**: P1.

### 7. Implementar estados vacíos guiados (empty states con CTA útil)
- **Problema**: Algunos vacíos solo informan; no siempre orientan al siguiente paso.
- **Mejora UX**: Empty states con recomendación de acción contextual (explorar cuentos, retomar pago, ayuda).
- **Impacto esperado**: Menor rebote y mayor reenganche.
- **Prioridad**: P2.

### 8. Optimizar descubrimiento en catálogo (filtros, orden y chips activos)
- **Problema**: Búsqueda general existe, pero faltan filtros robustos y visibilidad del estado de filtrado.
- **Mejora UX**: Filtros por autor/categoría/precio, orden, chips removibles y persistencia en URL.
- **Impacto esperado**: Menos tiempo para encontrar un cuento, más clics a detalle.
- **Prioridad**: P2.

### 9. Reforzar confianza en pago y postcompra
- **Problema**: El paso a pago y voucher puede no comunicar claramente estado, próximos pasos y tiempos.
- **Mejora UX**: Línea de estado del pedido, checklist de pago exitoso, confirmación por correo y tracking visual.
- **Impacto esperado**: Menos contactos de soporte y más percepción de control.
- **Prioridad**: P2.

### 10. Definir Design System base (tokens + componentes)
- **Problema**: Diferencias visuales entre pantallas indican deuda de consistencia.
- **Mejora UX**: Crear librería interna de tokens (color, tipografía, espaciado), botones, inputs, cards, modales y tablas.
- **Impacto esperado**: UI más coherente y menor costo de mantenimiento.
- **Prioridad**: P2.

---

## 3) Historias de usuario (más historias) con detalle técnico y funcional esperado

### HU-01 — Autenticación consistente (✅ COMPLETADA)
- **Como** comprador recurrente,
- **quiero** un flujo de inicio de sesión consistente,
- **para** no perder contexto ni confundirme entre modal y página.
- **Detalle técnico**:
  - Definir `AuthEntryMode` global (`page-first`, `modal-contextual`).
  - Redirigir a `/login` con `returnTo` cuando se requiera autenticación.
  - Mantener modal solo en evento puntual (checkout desde mini-carrito).
- **Esperado funcional**:
  - En cualquier trigger de login, el usuario entiende dónde está y a dónde volverá.
  - Retorno exitoso al flujo previo tras autenticarse.

### HU-02 — Checkout por pasos (✅ COMPLETADA)
- **Como** usuario comprador,
- **quiero** completar mi pedido en pasos claros,
- **para** reducir errores y sentir progreso.
- **Detalle técnico**:
  - Implementar stepper (3 pasos) con estado en `FormGroup` anidado.
  - Persistir avance en `sessionStorage` para recuperación tras refresh.
  - Validación por paso + bloqueo de avance hasta cumplimiento.
- **Esperado funcional**:
  - El usuario visualiza progreso y completa checkout con menos abandonos.

### HU-03 — Validaciones claras y accesibles (✅ COMPLETADA)
- **Como** usuario,
- **quiero** mensajes de error precisos y oportunos,
- **para** corregir rápido sin frustración.
- **Detalle técnico**:
  - Crear componente reutilizable `form-error` con `aria-live="polite"`.
  - Mostrar error al `blur` y en `submit` para campos inválidos.
  - Estandarizar regex y mensajes desde configuración central.
- **Esperado funcional**:
  - Errores comprensibles campo por campo y éxito visible al enviar.

### HU-04 — Precios consistentes (✅ COMPLETADA)
- **Como** comprador,
- **quiero** ver precios en una moneda única y formato coherente,
- **para** confiar en el total antes de pagar.
- **Detalle técnico**:
  - Centralizar moneda/locale en `environment` y/o servicio de configuración.
  - Sustituir pipes directas dispersas por helper común de formato.
- **Esperado funcional**:
  - Todos los importes se muestran con mismo símbolo y separadores.

### HU-05 — Accesibilidad completa
- **Como** persona usuaria de teclado o lector de pantalla,
- **quiero** navegar y comprar sin barreras,
- **para** usar la plataforma con autonomía.
- **Detalle técnico**:
  - Incorporar checklist WCAG 2.2 AA en CI (axe/lighthouse en smoke).
  - Corregir foco en modal, navegación de menú, etiquetas y contrastes.
- **Esperado funcional**:
  - Se puede completar login, búsqueda, carrito y checkout sin mouse.

### HU-06 — Carrito editable y claro (✅ COMPLETADA)
- **Como** comprador,
- **quiero** ajustar cantidades y ver subtotales en el carrito,
- **para** decidir rápido antes de pagar.
- **Detalle técnico**:
  - Añadir acciones `increment/decrement/remove` en servicio de carrito.
  - Actualización reactiva del total y badge en navbar.
  - CTA fijo “Ir a checkout”.
- **Esperado funcional**:
  - Cambios instantáneos en carrito y total sin recarga.

### HU-07 — Estados vacíos accionables
- **Como** usuario sin resultados o sin pedidos,
- **quiero** recomendaciones claras de siguiente paso,
- **para** no quedarme bloqueado.
- **Detalle técnico**:
  - Componente `empty-state` configurable por contexto.
  - Props: título, descripción, CTA principal, CTA secundaria.
- **Esperado funcional**:
  - Cada pantalla vacía propone una acción útil y medible.

### HU-08 — Filtros avanzados en catálogo
- **Como** lector,
- **quiero** filtrar cuentos por atributos relevantes,
- **para** encontrar contenido de mi interés más rápido.
- **Detalle técnico**:
  - Filtros reactivos y sincronizados con query params.
  - Chips activos removibles + botón “limpiar filtros”.
- **Esperado funcional**:
  - Resultados de catálogo acordes al criterio seleccionado en tiempo real.

### HU-09 — Postcompra transparente
- **Como** comprador,
- **quiero** entender el estado de mi pago/pedido,
- **para** sentir certeza después de pagar.
- **Detalle técnico**:
  - Timeline de estados (`PAGO_PENDIENTE`, `PAGADO`, `ENTREGADO`, etc.).
  - Notificaciones transaccionales y enlace a detalle de pedido.
- **Esperado funcional**:
  - El usuario sabe qué ocurrió y qué sigue sin contactar soporte.

### HU-10 — Sistema visual consistente
- **Como** usuario final,
- **quiero** una experiencia visual coherente,
- **para** percibir profesionalismo y facilidad de uso.
- **Detalle técnico**:
  - Documentar tokens y componentes base en Storybook o catálogo interno.
  - Reemplazo progresivo de estilos ad hoc por componentes estándar.
- **Esperado funcional**:
  - Interfaz homogénea en todas las pantallas, con menor deuda visual.

---

## 4) Métricas de éxito recomendadas
- Conversión `carrito → checkout`.
- Conversión `checkout iniciado → pago completado`.
- Tasa de error por formulario (login, registro, checkout).
- Tiempo medio para completar checkout.
- Rebote en estados vacíos.
- Éxito en tareas con teclado (A11y).

## 5) Roadmap sugerido (6 semanas)
- **Semanas 1-2**: Autenticación consistente, validaciones estándar, moneda/formato unificado.
- **Semanas 3-4**: Checkout por pasos + carrito editable + empty states accionables.
- **Semanas 5-6**: Filtros avanzados, mejoras postcompra y baseline de Design System.
