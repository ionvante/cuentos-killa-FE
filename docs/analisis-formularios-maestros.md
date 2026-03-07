# Análisis de formularios para uso de combos (maestros) — Cuentos Killa FE

## Objetivo
Reducir errores de digitación en campos críticos migrando valores libres a **combos alimentados por maestros** y mejorar la UX del flujo end-to-end (registro → compra → gestión).

## Hallazgos por formulario

### 1) Registro de usuario (`/register`)
**Estado actual**
- Ya consume maestros para tipo de documento (`TIPO_DOCUMENTO`) y usa fallback local.
- El `<select>` incluye además un `option` fijo `DNI`, lo que puede duplicar ese valor si también llega desde maestros.
- `documentoNumero` sigue como texto libre (solo validación básica por formato).

**Recomendación de combos/maestros**
- Mantener combo para **Tipo de documento** y eliminar opción fija duplicada.
- Agregar maestro para **País de documento** (si planean crecimiento fuera de PE).

**Mejoras UX/UI**
- Mostrar ayuda dinámica por tipo de doc (“DNI: 8 dígitos”, “CE: 9 dígitos”).
- Si se selecciona tipo, autolimpiar y reenfocar número de documento.

---

### 2) Checkout (`/checkout`)
**Estado actual**
- Tiene combo para tipo de documento, pero consulta grupo `TIPO_DOC` (distinto a `TIPO_DOCUMENTO` usado en registro).
- Dirección ya usa cascada de combos (departamento → provincia → distrito) con UBIGEO.
- El número de documento usa reglas dinámicas por tipo (buena base).
- No contempla explícitamente reglas de cobertura logística por tipo de envío.

**Recomendación de combos/maestros**
- Unificar nombre de grupo maestro: **definir uno solo** (`TIPO_DOCUMENTO`) para registro/checkout/perfil.
- Crear maestro para **Tipo de envío** con opciones:
  - `DOMICILIO_COURIER`: envío a domicilio (validar cobertura del courier).
  - `ENVIO_SHALOM`: envío por Shalom (principalmente provincia y Lima fuera de alcance courier).
- Agregar maestro para **Estado de cobertura courier** (`COBERTURA_COURIER`) para controlar habilitación por ubigeo.

**Mejoras UX/UI**
- Bloquear y mostrar skeleton/spinner de provincia y distrito hasta terminar la carga.
- Persistir el id/código de ubigeo, no solo nombre, para evitar ambigüedad de distritos homónimos.
- Mostrar microcopy condicional por tipo de envío:
  - “Tu dirección tiene cobertura courier” o
  - “Zona fuera de cobertura courier, te sugerimos envío Shalom”.
- Si se selecciona Shalom, mostrar campos de agencia/oficina de recojo si el proceso logístico lo requiere.

---

### 2.1) Reglas logísticas sugeridas (alcance courier vs shalom)
1. Si el ubigeo está en cobertura courier, habilitar **Envío a domicilio (courier)** por defecto.
2. Si el ubigeo está fuera de cobertura courier:
   - en Lima: habilitar fallback según política logística vigente,
   - en provincia: priorizar **Envío Shalom**.
3. Guardar en pedido: tipo de envío elegido, motivo de fallback y ubigeo evaluado.
4. Mostrar costo/tiempo estimado por tipo de envío antes de confirmar.

---

### 3) Perfil de usuario (`/profile`)
**Estado actual**
- Edición de datos personales usa inputs libres para teléfono/documento.
- Direcciones sí usan combos UBIGEO (bien alineado).

**Recomendación de combos/maestros**
- Agregar combo para **Tipo de documento** también aquí (consistencia multiformulario).
- Agregar combo para **Tipo de dirección**: casa, trabajo, familiar, otro.

**Mejoras UX/UI**
- Indicador visual de dirección principal y facturación antes de guardar.
- Validación inline homogénea (hoy mezcla estilos entre pantallas).

---

### 4) Admin Cuentos (`/admin/cuentos/*`)
**Estado actual**
- Varios campos clave son texto libre: `editorial`, `tipoEdicion`, `edadRecomendada`.
- El modelo `Cuento` contempla `categoria`, pero el formulario no expone selector para este dato.

**Recomendación de combos/maestros**
- Agregar combo maestro para **Categoría de cuento** (`CUENTO_CATEGORIA`) — *prioridad alta*.
- Agregar combo para **Rango de edad** (`RANGO_EDAD`) en lugar de texto libre.
- Agregar combo para **Tipo de edición** (`TIPO_EDICION`) para normalizar catálogo.
- (Opcional) combo de **Editorial** si existe catálogo controlado.

**Mejoras UX/UI**
- Preview de portada + checklist de metadatos obligatorios antes de guardar.
- Validar `precio`, `stock` y `nroPaginas` con límites y mensajes claros.

---

### 5) Admin Maestros (`/admin/maestros`)
**Estado actual**
- Permite crear grupos/códigos/valores libremente (correcto para backoffice).
- Tiene datalist para grupos conocidos, pero no guía de “grupos recomendados por dominio”.

**Recomendación de combos/maestros**
- Definir catálogo inicial gobernado:
  - `TIPO_DOCUMENTO`
  - `CUENTO_CATEGORIA`
  - `RANGO_EDAD`
  - `TIPO_EDICION`
  - `TIPO_DIRECCION`
  - `TIPO_ENTREGA`
- Añadir validaciones administrativas: unicidad por (`grupo`, `codigo`) y estado activo/inactivo con auditoría.

**Mejoras UX/UI**
- Plantillas rápidas para crear grupos estándar.
- Tooltip por grupo con “dónde se usa en la app”.

---

## Formularios adicionales donde conviene usar combos
1. **Perfil (datos personales):** tipo de documento.
2. **Perfil (direcciones):** tipo de dirección.
3. **Checkout:** tipo de envío (courier / shalom) y franja horaria de entrega (si aplica operación logística).
4. **Admin cuentos:** categoría, rango de edad, tipo de edición.
5. **Filtros de catálogo público:** poblar categorías/rangos desde maestros para coherencia con lo administrado.
6. **Checkout / Perfil:** cobertura logística por ubigeo (para decidir courier vs shalom).

## Historias de usuario propuestas (backlog)

### HU-FORM-01 — Unificación de tipos de documento
**Como** usuario, **quiero** ver los mismos tipos de documento en registro, checkout y perfil, **para** no confundirme ni cometer errores.
- Criterios:
  - Un solo grupo maestro (`TIPO_DOCUMENTO`) en todos los formularios.
  - Sin opciones hardcodeadas duplicadas.
  - Validación dinámica de longitud/formato por tipo.

### HU-FORM-02 — Categoría de cuento desde maestros
**Como** admin, **quiero** seleccionar la categoría desde un combo, **para** mantener consistencia del catálogo.
- Criterios:
  - Crear grupo `CUENTO_CATEGORIA` en maestros.
  - Campo `categoria` obligatorio en alta/edición de cuento.
  - Filtros de catálogo consumen exactamente los mismos valores.

### HU-FORM-03 — Rango de edad normalizado
**Como** admin, **quiero** elegir rango de edad desde un combo, **para** evitar variaciones de texto y mejorar filtros.
- Criterios:
  - Grupo `RANGO_EDAD` activo.
  - Reemplazo del input libre `edadRecomendada` por select.
  - Migración de datos históricos con equivalencias.

### HU-FORM-04 — Tipo de dirección en perfil
**Como** cliente, **quiero** clasificar mis direcciones (casa/trabajo/otro), **para** seleccionar más rápido en checkout.
- Criterios:
  - Grupo `TIPO_DIRECCION`.
  - Visualización del tipo en tarjetas de direcciones.
  - Preselección inteligente en checkout.

### HU-FORM-05 — Gobernanza de maestros
**Como** admin funcional, **quiero** reglas de unicidad y trazabilidad de cambios en maestros, **para** evitar inconsistencias de negocio.
- Criterios:
  - Unicidad por (`grupo`,`codigo`).
  - Bloqueo de eliminación física si el maestro está en uso.
  - Log de cambios (quién/cuándo/qué).

### HU-FORM-06 — UX de validación unificada
**Como** usuario, **quiero** mensajes de error consistentes en todos los formularios, **para** corregir rápido sin frustración.
- Criterios:
  - Misma semántica visual para error/éxito/ayuda.
  - Mensajes orientados a acción.
  - Priorización de primer error en submit.

### HU-FORM-07 — Selección inteligente de tipo de envío
**Como** cliente, **quiero** que el checkout me sugiera automáticamente courier o Shalom según mi ubicación, **para** elegir una opción válida sin fricción.
- Criterios:
  - Tipo de envío configurable por maestros (`DOMICILIO_COURIER`, `ENVIO_SHALOM`).
  - Evaluación automática de cobertura por ubigeo.
  - Si courier no aplica, sugerir Shalom y explicar el motivo en UI.
  - Registrar el tipo de envío seleccionado en el pedido.

### HU-FORM-08 — Mapa y sincronización de direcciones entre checkout y perfil
**Como** cliente, **quiero** seleccionar mi ubicación en un mapa y que la dirección del pedido se guarde en mi perfil, **para** reutilizarla en futuras compras.
- Criterios:
  - Integrar mapa en checkout y perfil para seleccionar/pin de ubicación.
  - Permitir cargar en el mapa una dirección existente del perfil para edición rápida.
  - Al confirmar pedido, guardar/actualizar dirección en perfil (con consentimiento del usuario).
  - Guardar latitud/longitud + referencia + ubigeo normalizado.
  - En próximos pedidos, mostrar primero direcciones usadas recientemente.

## Mejora UI/UX transversal recomendada
1. **Consistencia visual de formularios:** mismo patrón de labels, ayudas, errores y botones primarios/secundarios.
2. **Estados de carga explícitos:** skeleton o disabled con feedback en combos dependientes.
3. **Microcopy contextual:** ejemplos por campo y aclaraciones cortas de formato.
4. **Prevención de error antes de enviar:** masks livianas y validación en blur.
5. **Accesibilidad:** `aria-describedby` en ayudas/errores y navegación de teclado completa en selects/modales.
6. **Mapa centrado en tarea:** botón “Usar mi ubicación” + arrastrar pin + reverse geocoding para autocompletar dirección.
7. **Sincronización transparente:** checkbox “Guardar esta dirección en mi perfil” preactivado con aviso de privacidad.

## Priorización sugerida
- **P1 (alto impacto / bajo-medio esfuerzo):** HU-FORM-01, HU-FORM-02, HU-FORM-03, HU-FORM-07.
- **P2:** HU-FORM-06, HU-FORM-04, HU-FORM-08.
- **P3:** HU-FORM-05 (si requiere soporte backend y auditoría).

## Nota de implementación técnica (mapa + direcciones)
- Backend:
  - Endpoint de cobertura logística por ubigeo.
  - Endpoint para upsert de direcciones desde checkout a perfil.
- Frontend:
  - Componente reutilizable `address-map-picker` (checkout y perfil).
  - Modelo de dirección con `lat`, `lng`, `ubigeoId`, `fuente` (`perfil`|`checkout`).
  - Hook de sincronización al confirmar pedido para persistir dirección en perfil.
