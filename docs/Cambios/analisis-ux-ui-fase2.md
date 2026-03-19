# Auditoría UX/UI Estructural — Cuentos Killa FE (Fase 2)

## 1) Análisis Estructural de Flujos de Compra (Fase 2)

Tras implementar el carrito editable y el checkout por pasos, los flujos principales de compra (`Descubrimiento -> Carrito -> Checkout -> Pago`) son mucho más robustos. Sin embargo, analizando el comportamiento de elementos globales como el **Mini-carrito (Botón flotante)**, encontramos áreas de fricción:

- **Redundancia visual**: El ícono flotante (FAB) naranja del carrito aparece en vistas donde ya existe el contexto de compra (ej. la página `/carrito` o en el `/checkout`). Esto genera confusión y acciones duplicadas. Se requiere que el ícono sea inteligente al contexto de la ruta.
- **Falta de Micro-interacciones (Feedback inmediato)**: Al presionar "Agregar al carrito", la dependencia exclusiva de un mensaje Toast no siempre es suficiente. Falta feedback visual en el propio ícono (ej. animación *pop* o *shake* en el badge del carrito).
- **Carga cognitiva percibida**: La transición entre la lista de cuentos y su detalle podría beneficiarse de `Skeleton Loaders` en lugar de tiempos de espera en blanco o spinners.

---

## 2) 10 Nuevos Puntos de Mejora UX/UI (Fase 2)

1. **Visibilidad Inteligente del Ícono Flotante del Carrito (FAB)**
   - *Problema*: El botón superpuesto estorba e interfiere en páginas como el carrito o el checkout.
   - *Solución*: Ocultarlo dinámicamente leyendo la ruta activa (ej. esconder en `/carrito`, `/checkout`, `/pagos`).
2. **Skeleton Loaders para Tiempos de Carga**
   - *Problema*: Durante la recuperación de productos o pedidos, la pantalla vacía o el spinner bloquean al usuario.
   - *Solución*: Implementar esqueletos de carga con diseño de "esqueleto de tarjeta" y "esqueleto de texto" para bajar el tiempo de carga percibido (LCP).
3. **Búsqueda Predictiva en Navbar (Typeahead/Auto-suggest)**
   - *Problema*: El usuario debe buscar y cargar otra página para ver si un cuento existe.
   - *Solución*: Desplegar resultados rápidos (título + miniatura) bajo el buscador al tipear.
4. **Migas de Pan Dinámicas (Breadcrumbs)**
   - *Problema*: En niveles profundos como el detalle de un pedido o cuento, es difícil volver al paso anterior de la categoría.
   - *Solución*: Implementar un componente de breadcrumbs (`Inicio > Tienda > Cuentos Educativos`).
5. **Micro-animaciones al agregar productos (Add-to-cart feedback)**
   - *Problema*: Falta impacto visual que confirme y motive al usuario de que su producto voló al carrito.
   - *Solución*: Animación css `fly-to-cart` y el badge del carrito debe hacer un efecto "bounce".
6. **Recuperación Activa de Carrito Abandonado**
   - *Problema*: Los carritos se guardan en localStorage silenciosamente.
   - *Solución*: Notificación emergente amistosa al volver: "¡Hola! Dejaste algunos cuentos esperando, ¿quieres revisar tu carrito?".
7. **Paginación vs Carga Infinita en Catálogo**
   - *Problema*: Demasiados cuentos podrían requerir clics innecesarios.
   - *Solución*: Implementar un botón "Cargar más" o un Intersection Observer para scroll infinito en el catálogo.
8. **Prueba Social (Social Proof) - Reseñas Parciales**
   - *Problema*: Los cuentos no tienen credibilidad visible rápida en el catálogo.
   - *Solución*: Mostrar estrellitas (ej. 4.8/5) directamente en las tarjetas de descripción.
9. **Modo Accesible Nocturno (Soft Dark Mode)**
   - *Problema*: Los cuentos suelen leerse o comprarse antes de dormir (contexto infantil).
   - *Solución*: Introducir una capa de tema oscuro cálido para proteger la vista en horarios nocturnos.
10. **Mejora del Menú Móvil (Bottom Tab Bar para E-Commerce)**
    - *Problema*: El navbar se vuelve complejo en móviles, escondiendo opciones clave.
    - *Solución*: Implementar una barra de navegación fija en la parte inferior de la pantalla para móviles con [Inicio, Catálogo, Carrito, Perfil].

---

## 3) Historias de Usuario Técnicas (Fase 2)

### HU-11 — Visibilidad Inteligente del Mini-Carrito
- **Como** usuario comprador,
- **quiero** que el botón flotante del carrito desaparezca cuando ya estoy en la página del carrito o de pagos,
- **para** que no obstruya mi vista y no confunda mis opciones de navegación.
- **Detalle técnico**:
  - Modificar `AppComponent.ts` (función `get showMiniCart()`).
  - Evaluar la url del router (`!url.includes('/carrito') && !url.includes('/checkout')`).
- **Esperado funcional**:
  - El botón naranja aparece en el Home y Catálogo, pero desaparece al ingresar al flujo duro de pago.

### HU-12 — Esqueletos de Carga (Skeleton Loaders)
- **Como** visitante casual,
- **quiero** ver una estructura fantasma del contenido antes de que carguen los cuentos,
- **para** saber que la página está funcionando rápidamente.
- **Detalle técnico**:
  - Crear componente genérico `app-skeleton`.
  - Usar CSS `@keyframes pulse` para animar fondo opaco a gris claro.
  - Colocar el esqueleto condicionalmente con `*ngIf="isLoading"` envolviendo listas (`*ngFor`).
- **Esperado funcional**:
  - Transición fluida entre clickar una categoría y ver los libros cargados.

### HU-13 — Feedback Animado "Fly to Cart"
- **Como** comprador entusiasta,
- **quiero** una animación clara al momento de añadir un producto,
- **para** tener total seguridad táctil y visual de que mi acción funcionó.
- **Detalle técnico**:
  - Usar la directiva o crear una clase utilitaria CSS para gatillar un keyframe `.shake` en el FAB del header/mini-cart cuando la emisión del `CartService` reciba el evento de "agregado".
- **Esperado funcional**:
  - Una animación vistosa del carrito temblando amigablemente + Toast message actual.

### HU-14 — Aviso de Carrito Abandonado (Local)
- **Como** comprador recurrente,
- **quiero** recibir un pequeño aviso al retornar si mi carrito anterior tenía cosas,
- **para** retomar fácilmente la compra que pausé.
- **Detalle técnico**:
  - Suscribir un evento en el `OnInit` del `HomeComponent` o `AppComponent`.
  - Revisar si el carro `length > 0` y emitir un Toast azul informativo, con un botón `/carrito`. Solo mostrar una vez por sesión (guardar cookie bandera).
- **Esperado funcional**:
  - Reactivación e incremento de la conversión general de usuarios dubitativos.

### HU-15 — Búsqueda Predictiva (Typeahead)
- **Como** usuario curioso,
- **quiero** ver resultados instantáneos debajo de la barra de búsqueda mientras escribo,
- **para** encontrar cuentos rápidamente sin tener que navegar a otra página si no es necesario.
- **Detalle técnico**:
  - Convertir el input de búsqueda del `NavbarComponent` o de `CuentosComponent` para emitir valores (`valueChanges` del Reactive Forms) a un `Subject` con `debounceTime(300)`.
  - Suscribir ese flujo a una búsqueda en memoria (`CuentoService`).
  - Mostrar una lista flotante debajo del input con miniaturas de coincidencia.
- **Esperado funcional**:
  - Resultados en vivo tras 300ms de dejar de tipear.

### HU-16 — Migas de Pan (Breadcrumbs)
- **Como** lector navegando categorías profundas,
- **quiero** ver una ruta textual que indique dónde estoy (ej: `Home > Cuentos > Detalle`),
- **para** poder regresar rápidamente a los niveles anteriores.
- **Detalle técnico**:
  - Crear un componente `app-breadcrumb` que escuche los eventos de ruta (`Router.events`).
  - Mapear las rutas cargadas a nombres amigables.
- **Esperado funcional**:
  - En las páginas `/cuentos` y `/cuento/:id` aparecerá el enlace rápido superior.

### HU-17 — Prueba Social (Rating visual en tarjetas)
- **Como** cliente nuevo,
- **quiero** ver una valoración en estrellas (ej. 4.8 ⭐) en las previsualizaciones de los cuentos,
- **para** sentir confianza en la calidad del libro basado en la opinión de otros.
- **Detalle técnico**:
  - Modificar `cuento-card.component.html/.ts` y `detalle-cuento.component.html`.
  - Usar la propiedad de rating existente (o generar un mock de 4-5 estrellas) para pintar un loop de íconos de estrella llena/mitad/vacía.
- **Esperado funcional**:
  - Todas las tarjetas de productos presentan las estrellas y un numero aleatorio de "reseñas".

### HU-18 — Menú Móvil Inferior (Bottom Tab Bar)
- **Como** comprador en dispositivo móvil,
- **quiero** un acceso fijo en la zona inferior de la pantalla a los enlaces más importantes (Home, Tienda, Carrito, Perfil),
- **para** navegar cómodamente con una sola mano.
- **Detalle técnico**:
  - Crear un componente `app-bottom-nav` o añadir lógica en `app.component.html`/`navbar`.
  - Usar un `@media (max-width: 768px)` para mostrar la barra `fixed bottom` y ocultar partes del navbar superior.
- **Esperado funcional**:
  - Experiencia Mobile-First fluida similar a aplicaciones de venta.
