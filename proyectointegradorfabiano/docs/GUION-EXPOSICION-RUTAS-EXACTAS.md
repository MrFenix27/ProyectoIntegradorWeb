# Guion de exposición — rutas exactas de archivos

**Raíz del proyecto en VS Code:** `integradorWeb/`
**Carpeta del proyecto:** `proyectointegradorfabiano/`

> Todas las rutas de este documento son relativas a `integradorWeb/`, tal como se ven en el explorador de VS Code.
> Se distinguen tres tipos de ruta:
> - **Ruta en la app:** URL que debes abrir en el navegador durante la demo.
> - **Ruta exacta del archivo:** ubicación real del código o documento.
> - **Ruta de comando:** carpeta desde la que se ejecuta un comando.

---

## Árbol exacto del proyecto

```text
integradorWeb/
├── .postman/
├── postman/
└── proyectointegradorfabiano/
    ├── frontend/
    │   ├── src/
    │   │   ├── app/
    │   │   │   ├── app.routes.ts
    │   │   │   ├── app.config.ts
    │   │   │   ├── app.html
    │   │   │   ├── app.ts
    │   │   │   ├── core/
    │   │   │   │   ├── guards/auth.guard.ts
    │   │   │   │   ├── interceptors/auth.interceptor.ts
    │   │   │   │   └── services/
    │   │   │   │       ├── auth.service.ts
    │   │   │   │       ├── coldtrace-api.service.ts
    │   │   │   │       ├── coldtrace-store.service.ts
    │   │   │   │       └── ui-state.service.ts
    │   │   │   ├── features/
    │   │   │   │   ├── auth/
    │   │   │   │   │   ├── auth.routes.ts
    │   │   │   │   │   └── login.component.ts
    │   │   │   │   ├── dashboard/
    │   │   │   │   │   ├── dashboard.routes.ts
    │   │   │   │   │   └── dashboard.component.ts
    │   │   │   │   ├── lots/
    │   │   │   │   │   ├── lots.routes.ts
    │   │   │   │   │   ├── lots.component.ts
    │   │   │   │   │   └── producto-detalle.component.ts
    │   │   │   │   ├── logistics/
    │   │   │   │   │   ├── logistics.routes.ts
    │   │   │   │   │   └── logistics.component.ts
    │   │   │   │   └── traceability/
    │   │   │   │       ├── traceability.routes.ts
    │   │   │   │       └── trace-report.component.ts
    │   │   │   └── shared/models/
    │   │   │       ├── auth.models.ts
    │   │   │       └── domain.models.ts
    │   │   └── styles/
    │   │       ├── _tokens.scss
    │   │       ├── _shell.scss
    │   │       ├── _components.scss
    │   │       └── _login.scss
    │   ├── e2e/
    │   │   ├── coldtrace.spec.ts
    │   │   └── capturas-informe.spec.ts
    │   ├── scripts/
    │   │   ├── generar-informe.mjs
    │   │   └── generar-guion-visual.mjs
    │   ├── playwright.config.ts
    │   └── package.json
    ├── src/
    │   ├── main/
    │   │   ├── java/com/example/WebIntegrado/
    │   │   │   ├── config/DatosIniciales.java
    │   │   │   ├── controller/
    │   │   │   │   ├── AuthController.java
    │   │   │   │   ├── ProductoController.java
    │   │   │   │   ├── LoteController.java
    │   │   │   │   └── OperacionController.java
    │   │   │   ├── exception/GlobalExceptionHandler.java
    │   │   │   ├── model/Producto.java
    │   │   │   ├── model/Lote.java
    │   │   │   ├── model/Operacion.java
    │   │   │   ├── security/JwtAuthFilter.java
    │   │   │   ├── security/JwtUtil.java
    │   │   │   ├── security/SecurityConfig.java
    │   │   │   ├── security/RestAuthenticationEntryPoint.java
    │   │   │   ├── security/RestAccessDeniedHandler.java
    │   │   │   └── service/
    │   │   │       ├── ProductoService.java
    │   │   │       └── OperacionService.java
    │   │   └── resources/
    │   │       ├── application.yaml
    │   │       ├── application-mysql.yaml
    │   │       └── application-h2.yaml
    │   └── test/java/com/example/WebIntegrado/
    │       ├── WebIntegradoApplicationTests.java
    │       ├── controller/ProductoControllerTest.java
    │       ├── controller/SecurityIntegrationTest.java
    │       └── service/
    │           ├── ProductoServiceTest.java
    │           └── OperacionServiceTest.java
    ├── docs/
    │   ├── evidencias/
    │   ├── reporte/
    │   │   ├── informe.html
    │   │   ├── Informe-Tecnico-ColdTrace.pdf
    │   │   └── Guion-Exposicion-ColdTrace.pdf
    │   ├── INFORME-AVANCE.md
    │   └── INFORME-EXPOSICION.md
    ├── docker-compose.yml
    ├── mvnw
    ├── mvnw.cmd
    ├── package.json
    ├── pom.xml
    └── README.md
```

---

## 1. Interfaz Angular (1,5 min)

**Ruta en la app donde debes estar:** `/dashboard`

| Qué parte del guion | Ruta exacta del archivo |
|---|---|
| Panel principal | `proyectointegradorfabiano/frontend/src/app/features/dashboard/dashboard.component.ts` |
| Lista y formulario de productos/lotes | `proyectointegradorfabiano/frontend/src/app/features/lots/lots.component.ts` |
| Detalle del producto `/productos/:id` | `proyectointegradorfabiano/frontend/src/app/features/lots/producto-detalle.component.ts` |
| Logística | `proyectointegradorfabiano/frontend/src/app/features/logistics/logistics.component.ts` |
| Trazabilidad | `proyectointegradorfabiano/frontend/src/app/features/traceability/trace-report.component.ts` |
| Composición de rutas | `proyectointegradorfabiano/frontend/src/app/app.routes.ts` |
| Rutas de autenticación | `proyectointegradorfabiano/frontend/src/app/features/auth/auth.routes.ts` |
| Rutas del panel | `proyectointegradorfabiano/frontend/src/app/features/dashboard/dashboard.routes.ts` |
| Rutas de lotes y detalle | `proyectointegradorfabiano/frontend/src/app/features/lots/lots.routes.ts` |
| Rutas de logística | `proyectointegradorfabiano/frontend/src/app/features/logistics/logistics.routes.ts` |
| Rutas de trazabilidad | `proyectointegradorfabiano/frontend/src/app/features/traceability/traceability.routes.ts` |
| Guardas `authGuard` y `roleGuard` | `proyectointegradorfabiano/frontend/src/app/core/guards/auth.guard.ts` |
| Menú lateral y navegación | `proyectointegradorfabiano/frontend/src/app/app.html` |
| Tokens, mixins y breakpoint | `proyectointegradorfabiano/frontend/src/styles/_tokens.scss` |
| Sidebar, topbar y layout responsivo | `proyectointegradorfabiano/frontend/src/styles/_shell.scss` |
| Componentes visuales y responsivo | `proyectointegradorfabiano/frontend/src/styles/_components.scss` |
| Estilos del login | `proyectointegradorfabiano/frontend/src/styles/_login.scss` |
| Entrada de estilos SASS | `proyectointegradorfabiano/frontend/src/styles.scss` |
| Estado compartido con signals | `proyectointegradorfabiano/frontend/src/app/core/services/coldtrace-store.service.ts` |

**Rutas de la demo:** `/dashboard` → `/lotes` → `/logistica` → `/trazabilidad` → `/productos/1`

**Ruta para responder la pregunta:** `/productos/1`

---

## 2. Formularios (2 min)

**Ruta en la app donde debes estar:** `/lotes`

| Qué parte del guion | Ruta exacta del archivo |
|---|---|
| Formulario de producto, lote y temperatura | `proyectointegradorfabiano/frontend/src/app/features/lots/lots.component.ts` |
| Edición de lote con el mismo formulario | `proyectointegradorfabiano/frontend/src/app/features/lots/lots.component.ts` |
| Método `PUT` de lote | `proyectointegradorfabiano/frontend/src/app/core/services/coldtrace-api.service.ts` |
| Formulario de login | `proyectointegradorfabiano/frontend/src/app/features/auth/login.component.ts` |
| Formularios de despacho y recepción | `proyectointegradorfabiano/frontend/src/app/features/logistics/logistics.component.ts` |
| Validación del rango térmico | `proyectointegradorfabiano/frontend/src/app/features/lots/lots.component.ts` |
| Validación de servidor | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/service/ProductoService.java` |
| Validaciones del modelo `Producto` | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/model/Producto.java` |
| Respuesta 400 de validación | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/exception/GlobalExceptionHandler.java` |
| Respuesta 400 de rango inválido | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/exception/IllegalArgumentExceptionHandler.java` |
| Prueba del rechazo del rango | `proyectointegradorfabiano/src/test/java/com/example/WebIntegrado/service/ProductoServiceTest.java` |

**Ruta de la demo:** `/lotes` (formulario “Registrar producto”)

**Ruta para responder:** `/lotes`

---

## 3. Consumo de servicios REST (2 min)

**Ruta en la app donde debes estar:** `/lotes`

| Qué parte del guion | Ruta exacta del archivo |
|---|---|
| Servicio con GET, POST, PUT y DELETE | `proyectointegradorfabiano/frontend/src/app/core/services/coldtrace-api.service.ts` |
| Interceptor que agrega el `Bearer` | `proyectointegradorfabiano/frontend/src/app/core/interceptors/auth.interceptor.ts` |
| Registro del interceptor | `proyectointegradorfabiano/frontend/src/app/app.config.ts` |
| Proxy `/api` al backend | `proyectointegradorfabiano/frontend/proxy.conf.json` |
| CRUD de producto en la interfaz | `proyectointegradorfabiano/frontend/src/app/features/lots/lots.component.ts` |
| Despacho y recepción en la interfaz | `proyectointegradorfabiano/frontend/src/app/features/logistics/logistics.component.ts` |
| Manejo del 409 en el frontend | `proyectointegradorfabiano/frontend/src/app/features/lots/lots.component.ts` |
| Manejo del 409 en el backend | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/exception/GlobalExceptionHandler.java` |
| Endpoints de productos | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/controller/ProductoController.java` |
| Endpoints de operaciones | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/controller/OperacionController.java` |
| Lectura del token en el backend | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/security/JwtAuthFilter.java` |

**Rutas de la demo:** `/lotes` (POST, PUT y DELETE de producto) · `/logistica` (si muestras el POST de despacho)

**Ruta para responder:** `/lotes` (con sesión ADMIN)

**Pestaña del navegador:** `DevTools → Network → Fetch/XHR`

---

## 4. Autenticación y autorización (2 min)

**Ruta en la app donde debes estar:** `/login`

| Qué parte del guion | Ruta exacta del archivo |
|---|---|
| Formulario de login | `proyectointegradorfabiano/frontend/src/app/features/auth/login.component.ts` |
| Guardado del token y del rol | `proyectointegradorfabiano/frontend/src/app/core/services/auth.service.ts` |
| Redirección según el rol | `proyectointegradorfabiano/frontend/src/app/core/services/auth.service.ts` |
| Interceptor del token | `proyectointegradorfabiano/frontend/src/app/core/interceptors/auth.interceptor.ts` |
| Cierre de sesión automático ante 401 | `proyectointegradorfabiano/frontend/src/app/core/interceptors/error.interceptor.ts` |
| Guardas de sesión y rol | `proyectointegradorfabiano/frontend/src/app/core/guards/auth.guard.ts` |
| Menú y usuario/rol visibles | `proyectointegradorfabiano/frontend/src/app/app.html` |
| Endpoint de login y registro | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/controller/AuthController.java` |
| Generación y validación del JWT | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/security/JwtUtil.java` |
| Filtro JWT por request | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/security/JwtAuthFilter.java` |
| Matriz de permisos por rol | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/security/SecurityConfig.java` |
| Respuesta 401 para token ausente/inválido | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/security/RestAuthenticationEntryPoint.java` |
| Respuesta 403 para rol insuficiente | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/security/RestAccessDeniedHandler.java` |
| Carga del usuario desde la base | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/security/CustomUserDetailsService.java` |
| Error 401 de credenciales | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/exception/GlobalExceptionHandler.java` |
| Usuarios de prueba | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/config/DatosIniciales.java` |

**Rutas de la demo:** `/login` → `/dashboard` (admin) → `/login` → `/lotes` (guest) · credenciales malas: `/login`

**Ruta para responder:** `/login` o `/lotes`

---

## 5. Integración técnica (1 min)

**Ruta en la app donde debes estar:** `/logistica`

| Qué parte del guion | Ruta exacta del archivo |
|---|---|
| MySQL y phpMyAdmin en Docker | `proyectointegradorfabiano/docker-compose.yml` |
| Perfil MySQL por defecto | `proyectointegradorfabiano/src/main/resources/application.yaml` |
| Conexión a MySQL | `proyectointegradorfabiano/src/main/resources/application-mysql.yaml` |
| Alternativa H2 | `proyectointegradorfabiano/src/main/resources/application-h2.yaml` |
| Proxy del frontend al backend | `proyectointegradorfabiano/frontend/proxy.conf.json` |
| Store que carga y comparte datos | `proyectointegradorfabiano/frontend/src/app/core/services/coldtrace-store.service.ts` |
| Tarjetas KPI y tablas del panel | `proyectointegradorfabiano/frontend/src/app/features/dashboard/dashboard.component.ts` |
| Tablas de productos y lotes | `proyectointegradorfabiano/frontend/src/app/features/lots/lots.component.ts` |
| Despacho y recepción | `proyectointegradorfabiano/frontend/src/app/features/logistics/logistics.component.ts` |
| Telemetría simulada | `proyectointegradorfabiano/frontend/src/app/features/traceability/trace-report.component.ts` |
| Endpoints de operaciones | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/controller/OperacionController.java` |
| Regla de negocio despacho → recepción | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/service/OperacionService.java` |
| Datos iniciales de la demo | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/config/DatosIniciales.java` |

**Rutas de la demo:** `/logistica` (despacho y recepción) → `/trazabilidad` (telemetría)

**Ruta para la aclaración:** `/trazabilidad`

---

## 6. Pruebas y documentación (1 min)

**Ruta en la app donde debes estar:** fuera de la app; abre el informe y la terminal.

| Qué parte del guion | Ruta exacta del archivo |
|---|---|
| 6 pruebas funcionales de Playwright | `proyectointegradorfabiano/frontend/e2e/coldtrace.spec.ts` |
| 1 prueba de capturas | `proyectointegradorfabiano/frontend/e2e/capturas-informe.spec.ts` |
| Configuración de Playwright | `proyectointegradorfabiano/frontend/playwright.config.ts` |
| Script `npm run e2e` | `proyectointegradorfabiano/frontend/package.json` |
| Pruebas de producto (incluye 409 con lotes) | `proyectointegradorfabiano/src/test/java/com/example/WebIntegrado/service/ProductoServiceTest.java` |
| Pruebas de operación | `proyectointegradorfabiano/src/test/java/com/example/WebIntegrado/service/OperacionServiceTest.java` |
| Prueba del controlador de productos | `proyectointegradorfabiano/src/test/java/com/example/WebIntegrado/controller/ProductoControllerTest.java` |
| Pruebas de seguridad y roles (401/403/409) | `proyectointegradorfabiano/src/test/java/com/example/WebIntegrado/controller/SecurityIntegrationTest.java` |
| Prueba de contexto | `proyectointegradorfabiano/src/test/java/com/example/WebIntegrado/WebIntegradoApplicationTests.java` |
| Informe técnico en PDF | `proyectointegradorfabiano/docs/reporte/Informe-Tecnico-ColdTrace.pdf` |
| Informe técnico en HTML | `proyectointegradorfabiano/docs/reporte/informe.html` |
| Informe de avance | `proyectointegradorfabiano/docs/INFORME-AVANCE.md` |
| Capturas | `proyectointegradorfabiano/docs/evidencias/` |
| Repositorio en GitHub | `proyectointegradorfabiano/README.md` |

**Rutas de la demo:**

- Informe: `proyectointegradorfabiano/docs/reporte/Informe-Tecnico-ColdTrace.pdf`
- Capturas: `proyectointegradorfabiano/docs/evidencias/`
- Terminal para Playwright: `proyectointegradorfabiano/frontend` → `npm run e2e`

> **Ojo:** el `package.json` de la raíz `proyectointegradorfabiano/package.json` solo tiene `start`, `build` y `frontend`.
> El script `e2e` está en `proyectointegradorfabiano/frontend/package.json`.

---

## Cierre (1 min)

**Ruta en la app donde debes estar:** `/dashboard` → `/lotes`

| Problema de integración | Ruta exacta del archivo |
|---|---|
| Interfaz mostraba 0 aunque la API respondía: cambio a signals | `proyectointegradorfabiano/frontend/src/app/core/services/coldtrace-store.service.ts` |
| Configuración zoneless de Angular | `proyectointegradorfabiano/frontend/src/app/app.config.ts` |
| Guest recibía 403: reglas de seguridad | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/security/SecurityConfig.java` |
| Permisos por endpoint | `proyectointegradorfabiano/src/main/java/com/example/WebIntegrado/controller/ProductoController.java` |
| Reintento sin fin: lógica de reintento | `proyectointegradorfabiano/frontend/src/app/core/services/coldtrace-store.service.ts` |

**Rutas de la demo:**

- Problema 1: `/dashboard` → `/lotes`
- Problema 2: `/login` → `/lotes` como guest, con la pestaña **Network** abierta

---

## Resumen rápido de URLs de la app

| URL | Archivo exacto |
|---|---|
| `/login` | `proyectointegradorfabiano/frontend/src/app/features/auth/login.component.ts` |
| `/dashboard` | `proyectointegradorfabiano/frontend/src/app/features/dashboard/dashboard.component.ts` |
| `/lotes` | `proyectointegradorfabiano/frontend/src/app/features/lots/lots.component.ts` |
| `/productos/:id` | `proyectointegradorfabiano/frontend/src/app/features/lots/producto-detalle.component.ts` |
| `/logistica` | `proyectointegradorfabiano/frontend/src/app/features/logistics/logistics.component.ts` |
| `/trazabilidad` | `proyectointegradorfabiano/frontend/src/app/features/traceability/trace-report.component.ts` |
