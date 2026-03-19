# Plan de Historias - Release 1 (4 Sprints)

*Fecha de planificación: 2026-03-19*

Este documento establece el Roadmap de ejecución para cubrir las mejoras y mitigaciones de riesgo documentadas en la carpeta `Principal` (`Architecture Flow.txt`, `Customer Journey Map.txt`, `Product Flow Document.txt`, `QA Flow Document.txt`) y los análisis detallados que se encuentran en `docs/Cambios`.

El alcance es un **Release 1**, organizado en **4 Sprints** consecutivos y lógicos.

---

## 📅 Sprint 1: Quick Wins UX y Estandarización Base
*Objetivo: Mitigar confusión del usuario y organizar la información estructural.*

- **HU-R1-01: Homologar estados de pedido (UI y API)**
  - *Flujo afectado:* Postcompra, Backoffice Admin.
  - *Base:* `Architecture Flow.txt` (Riesgo 4), `Analisis_BE_flujos_E2E.md`.
  - *Detalle:* Definir contrato único FE/BE: `PAGO_PENDIENTE`, `PAGO_VERIFICADO`, `ENVIADO`, etc.
- **HU-R1-02: Unificar Maestro de Documentos e Integrar en Registro/Checkout**
  - *Flujo afectado:* Formularios, Checkout, Autenticación.
  - *Base:* `analisis-formularios-maestros.md`.
  - *Detalle:* Migrar el tipo de documento hardcodeado a un `<select>` alimentado directamente por el maestro de la base de datos de manera uniforme en todos los formularios.
- **HU-R1-03: Eliminar Cargas Artificiales y Datos Falsos**
  - *Flujo afectado:* Catálogo (Frontend).
  - *Base:* `analisis-FE_flujos_E2E.md` (Quick Wins).
  - *Detalle:* Retirar el `setTimeout` artificial en el catálogo y evitar inyecciones de datos hardcodeados que afecten el SEO y la UX percibida.
- **HU-R1-04: Estados Vacíos Útiles (Empty States)**
  - *Flujo afectado:* Carrito, Pedidos, Catálogo.
  - *Base:* `analisis-ux-ui.md`.
  - *Detalle:* Agregar CTA's en pantallas vacías ("Explorar Cuentos" en vez de solo decir "No hay pedidos").

---

## 📅 Sprint 2: Operativa Logística y Simplificación de Pagos
*Objetivo: Resolver la fricción entre el pago, el voucher y la selección de envío.*

- **HU-R1-05: Reglas de Cobertura Logística Dinámica (Courier vs Shalom)**
  - *Flujo afectado:* Checkout (Paso 3).
  - *Base:* `analisis-formularios-maestros.md` y `Product Flow Document.txt`.
  - *Detalle:* Sugerir automáticamente al momento del checkout la opción Shalom para provincias o "Envío a Domicilio Courier" según ubigeo.
- **HU-R1-06: Simplificar y Unificar Endpoints de Pago y Voucher**
  - *Flujo afectado:* Backend API de Pago y Pedidos.
  - *Base:* `Architecture Flow.txt` (Riesgos 1 y 3).
  - *Detalle:* Consolidar en `/orders` la gestión integral de MercadoPago y las subidas de Voucher (evitar separar almacenamiento local vs Firebase en nivel funcional funcional).
- **HU-R1-07: Aseguramiento de Webhook Mercado Pago**
  - *Flujo afectado:* Integración Mercado Pago (Backend).
  - *Base:* `Architecture Flow.txt` (Riesgo 5).
  - *Detalle:* Corregir la vulnerabilidad en `SecurityConfig` para asegurar que las notificaciones de estado por webhook sigan estándares y puedan confirmarse mediante token de MP, quitando autenticaciones rotas o locales.
- **HU-R1-08: Migración de Histórico de Cuentos a Maestros**
  - *Flujo afectado:* Catálogo de Cuentos y Admin Cuentos.
  - *Base:* `cuento-maestros-migracion.md`.
  - *Detalle:* Migrar valores categóricos de cuentos libres a códigos unificados (`CAT_AVENTURA`, `EDAD_4_6`, etc).

---

## 📅 Sprint 3: Autogeneración de Boletas Electrónicas y Trazabilidad (Boleta Phase 1)
*Objetivo: Dar cumplimiento a la normativa de comprobantes y confianza post-pago al usuario.*

- **HU-R1-09: Trazabilidad Visual "Track-my-order" en Postcompra**
  - *Flujo afectado:* Perfil Cliente, Mis Pedidos.
  - *Base:* `Customer Journey Map.txt` y `Product Flow Document.txt`.
  - *Detalle:* Integrar un componente visual tipo Timeline donde se ve la ruta de vida del pedido: Creado -> Pagado -> Empaquetado -> Enviado.
- **HU-R1-10: Generación Automática de Documento/Boleta PDF**
  - *Flujo afectado:* Backend BoletaService.
  - *Base:* `ROADMAP_BOLETA_ELECTRONICA.md` (US-BE-02).
  - *Detalle:* Al pasar a `PAGO_VERIFICADO`, generar el .pdf del recibo empleando el monto neto y correlativo desde JasperReports o equivalente.
- **HU-R1-11: Botón de Descarga Confidencial de Boleta**
  - *Flujo afectado:* Mis Pedidos (Frontend).
  - *Base:* `ROADMAP_BOLETA_ELECTRONICA.md` (US-FE-02 / US-BE-03).
  - *Detalle:* Mostrar botón con icono PDF en los detalles de las compras finalizadas y conectar al endpoint autorizado para entregar la boleta generada en la HU anterior.
- **HU-R1-12: Recordatorio Activo de Carrito Abandonado**
  - *Flujo afectado:* Home.
  - *Base:* `Customer Journey Map.txt` y `analisis-ux-ui-fase2.md`.
  - *Detalle:* Aviso temporal si el localStorage indica un carrito con elementos existentes pero inactivo de sesiones anteriores.

---

## 📅 Sprint 4: UX Pura, Accesibilidad y Preparación a Producción
*Objetivo: Elevar la robustez, pulir la micro-interacción de la tienda e impedir regresiones.*

- **HU-R1-13: Búsqueda Predictiva y Filtros Centrales**
  - *Flujo afectado:* Navbar y Catálogo.
  - *Base:* `analisis-ux-ui-fase2.md` y `Customer Journey Map.txt`.
  - *Detalle:* Búsqueda tipo Typeahead desplegable desde el navbar y filtrado server-side con chips activos para refinar búsqueda.
- **HU-R1-14: Accesibilidad Estándar (WCAG AA)**
  - *Flujo afectado:* App Transversal (Frontend).
  - *Base:* `analisis-ux-ui.md`.
  - *Detalle:* Revisar foco tabulador en login, modales y formularios; validación de colores de alto contraste en botones críticos.
- **HU-R1-15: Skeletons Loaders y Ocultación Inteligente del Mini-carrito**
  - *Flujo afectado:* Transiciones de carga de Catálogo y Checkout.
  - *Base:* `analisis-ux-ui-fase2.md`.
  - *Detalle:* Implementar carga tipo Skeleton y evitar que el widget del mini carrito obstruya la vista cuando el usuario ya se encuentra finalizando el proceso de compra.
- **HU-R1-16: Automatización de Prueba Crítica E2E (P0s)**
  - *Flujo afectado:* QA, DevOps.
  - *Base:* `QA Flow Document.txt`.
  - *Detalle:* Automatizar los flujos nucleares expuestos en QA Flow (Checkout -> MP Webhook Callback) en el proceso de Release, usando Cypress o Playwright base.

---
*Este plan documenta el camino directo para asegurar el paso a Producción bajo altos estándares de operación logística, e-commerce y facturación.*
