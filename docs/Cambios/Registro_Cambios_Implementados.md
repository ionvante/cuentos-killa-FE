# Registro de Cambios Implementados

*Fecha de actualización: 2026-03-19*

Este documento consolida el historial de las mejoras estructurales que **ya han sido implementadas** en base a las recomendaciones de los documentos de arquitectura y producto (`docs/Principal`).
De ahora en adelante, cada nueva historia/cambio completado debe registrarse aquí con la fecha, el flujo afectado y el documento base que motivó el cambio.

---

## 1. Autenticación en Contexto (Login con Retorno)
- **Fecha de Implementación:** Marzo 2026
- **Flujo Afectado:** Flujo de Autenticación, Carrito y Checkout (Frontend).
- **Documentos Principales Base:** 
  - `Product Flow Document.txt` (Sección 5: Permitir login en contexto para evitar pérdida de flujo).
  - `Architecture Flow.txt` (Sección 4.3: Evitar pérdida de contexto al autenticarse).
- **Detalle:** Se implementó el parámetro `returnTo=/checkout` para asegurar que el usuario retorne directamente al proceso de compra luego de autenticarse, unificando la experiencia y reduciendo la confusión de modales de login redundantes.

---

## 2. Checkout por Pasos (Stepper)
- **Fecha de Implementación:** Marzo 2026
- **Flujo Afectado:** Flujo de Checkout (Frontend).
- **Documentos Principales Base:** 
  - `Product Flow Document.txt` (Sección 6: Checkout en 3 pasos: Datos Personales, Dirección, Entrega).
  - `Customer Journey Map.txt` (Sección 7: Reducir fricción en la transición checkout -> pago).
- **Detalle:** Se dividió el checkout monolítico en un asistente de 3 pasos lógicos, reduciendo la carga cognitiva, mejorando la validación de los datos (mediante grupos de `React Form`) y reduciendo la tasa de errores de ingreso.

---

## 3. Carrito Editable e Interactivo
- **Fecha de Implementación:** Marzo 2026
- **Flujo Afectado:** Flujo del Carrito (Frontend).
- **Documentos Principales Base:** 
  - `Product Flow Document.txt` (Sección 4: Reglas del carrito: "permitir modificar cantidades, recalcular total dinámicamente").
- **Detalle:** Se integraron controles para modificar cantidades dinámicamente (`+` / `-`) y recalcular el costo en la vista del carrito antes de proceder a la pantalla crítica de checkout, asegurando que la intención de compra se mantiene.

---

## 4. Estandarización Visual Básica (Validaciones y Precio)
- **Fecha de Implementación:** Marzo 2026
- **Flujo Afectado:** Transversal UI (Frontend).
- **Documentos Principales Base:**
  - *Sugerencia directa por auditoría UX*. Adicional indirecto a `QA Flow Document.txt` (mitigación de errores base).
- **Detalle:** Se homologaron de forma transversal los mensajes de error en los campos (`form-error`) y se fijó una consistencia de moneda única en la aplicación, consolidando la confianza transaccional.
