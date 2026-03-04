# Cuentos de Killa - Guía de Instalación del MVP

El MVP (Fase 1) de la tienda virtual **Cuentos de Killa** está listo. Este proyecto consta de una arquitectura desacoplada con un **Frontend en Angular** y un **Backend en Spring Boot (Java)**.

## 🛠 Arquitectura Tecnológica
- **Frontend:** Angular 17.x, SCSS, MercadoPago JS V2
- **Backend:** Java 17, Spring Boot 3.3.10, Spring Security, JWT, Spring Mail, MercadoPago SDK
- **Base de Datos:** PostgreSQL
- **Almacenamiento (Archivos):** Local Storage temporal / Firebase Storage
- **Pasarela de Pagos:** Mercado Pago SDK

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu entorno de desarrollo o despliegue:
- [Node.js](https://nodejs.org/) (Recomendado v18+ LTS)
- [Angular CLI](https://angular.io/) v17+
- [Java Development Kit (JDK) 17](https://adoptium.net/)
- [Maven](https://maven.apache.org/) (O utilizar tu IDE de confianza)
- [PostgreSQL](https://www.postgresql.org/download/)

---

## 🚀 1. Configuración del Backend (Spring Boot)

1. Abre tu gestor de base de datos PostgreSQL (`pgAdmin` o `psql`) y **crea una base de datos local llamada `cuentoskilla`**:
   ```sql
   CREATE DATABASE cuentoskilla;
   ```
2. Accede a la ruta del backend (`/cuentos-killa-backend`) y localiza el archivo `src/main/resources/application.yml`.
3. Ajusta la contraseña del usuario `postgres` según la que utilices localmente (`spring.datasource.password`).

> [!CAUTION]
> ### Entornos Vitales a Configurar (Producción / Local)
> Si planeas arrancar los correos o los pagos en vivo, revisa que existan estas variables de entorno en el SO o apliques sus valores en tu `application.yml`:
> - **`FIREBASE_CREDENTIALS` (Opcional):** Nombre del archivo JSON de service account de Firebase para subir imágenes a un bucket externo.
> - **`JWT_SECRET`:** Cadena secreta privada que firma los logins (Mínimo 256 bits).
> - **`mercadopago.access-token`:** Tu token de autorización de entorno (Pruebas o Producción) de MercadoPago.
> - **`SPRING_MAIL_USERNAME` / `SPRING_MAIL_PASSWORD`:** Credencial SMPT (Corroe electrónico emisor) y su "App Password" (ej. en Gmail) que servirá para notificar al cliente sus cambios de pedido (HU-23).

4. **Ejecución del Backend:**
   Inicia la aplicación Spring Boot desde la consola:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   > ⓘ El backend correrá por defecto en **http://localhost:8080**.

---

## 🎨 2. Configuración del Frontend (Angular)

1. Abre una nueva consola y entra al directorio Frontend (ej. `/cuentos-killa-FE`).
2. Instala los paquetes dependientes y librerías declaradas en `package.json`:
   ```bash
   npm install
   ```
3. Verifica las variables de entorno para que el compilado o el entorno local sepa a dónde apuntar. Abre `src/environments/environment.ts` y asegúrate de que el bloque referencie a la API:
   ```typescript
   export const environment = {
     production: false,
     apiBaseUrl: 'http://localhost:8080/api',   // URL generada por nuestro BE Java
     minFreeShipping: 80,
     mercadopagoPublicKey: 'TU_PUBLIC_KEY',     // Public Key del Dasboard de MP
   };
   ```
4. **Desplegar el Servidor Web (Local):**
   ```bash
   ng serve -o
   ```
   La aplicación se abrirá automáticamente en tu navegador por defecto la URL `http://localhost:4200/`.

---

## 👑 3. Credenciales de la App

Una vez que el backend y frontend estén corriendo, puedes ingresar al Panel de Control (Ruta Administrativa `/login` en el Frontend) usando el usuario administrador de fábrica.

*Nota: Esta cuenta es alimentada en el Backend o fue declarada para la prueba MVP inicial.*
- **Correo:** `cdanpg@gmail.com`
- **Contraseña:** `123456`

*(Se recomienda modificar esta información mediante Base de Datos por motivos de seguridad si va a ser expuesta en DNS públicos).*

---

## 🎉 Resumen del MVP Finalizado

Has logrado implementar la Épica completa estructurada para la tienda "Cuentos Killa":
- **Catálogo y Compra Libre:** Búsqueda predictiva, categorización y checkout optimizado con validaciones en campos numéricos y Slide lateral UX.
- **Multipasarela Dinámica:** Integración mixta que recibe subida de `Vouchers` bancarios en formato imagen (Revisados por Admin) y cobro instantáneo y seguro mediante `Webhooks de MercadoPago`.
- **Panel Administrativo (CRUD):** Protección de sesiones en Frontend (`AdminGuard`) y Backend (`JWT Filter`), control del stock de cuentos y subida estandarizada. Listado maestro paginado.
- **Flujo de Notificaciones de Paquetes:** Cambio logístico de estados del pedido ("Pago Verificado", "Empaquetado", "Enviado", "Entregado") con despachos automatizados vía `JavaMailSender` a la cuenta del comprador.

¡Es hora de llevar la cultura andina a nuevos lectores!
