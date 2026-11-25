# INFORME FINAL — Cumplimiento de requerimientos del avance

**Proyecto:** ColdTrace / WebIntegrado (`proyectointegradorfabiano/`)
**Fecha de verificación:** 13-oct-2026 — Backend `http://localhost:8080` (OK) + Frontend `http://localhost:4200` (HTTP 200)
**Compilación:** `mvnw compile` OK · **Tests:** 10/10 OK (`BUILD SUCCESS`) · **Front:** `ng build` OK
**Colección Postman:** `docs/ColdTrace.postman_collection.json` (16 peticiones)
**Nota técnica:** la base de datos es **MySQL 8.4** (contenedor `coldtrace-mysql`, perfil por defecto `mysql`). El perfil `h2` se mantiene para correr sin Docker; en Spring Boot 4.x la consola H2 no viene auto-configurada y se registra manual en `config/H2ConsoleConfig.java` (solo con perfil `h2`).
**Usuarios de prueba:** `admin/admin123` (ADMIN) · `user/user123` (USER) · `guest/guest123` (GUEST)

## Veredicto general: SÍ CUMPLE (100 %)

| # | Requerimiento pedido | ¿Cumple? | Evidencia (archivo + qué mostrar al jurado) |
|---|---|---|---|
| 1.1 | Entidades de dominio (mín. 3) con relaciones `@OneToMany`, `@ManyToOne` | ✅ SÍ | `model/Producto.java` (`@OneToMany List<Lote> lotes`), `model/Lote.java` (`@ManyToOne producto` + `@OneToMany registros`), `model/RegistroTemperatura.java` (`@ManyToOne lote`), `model/Operacion.java` (`@ManyToOne lote` sobre `lote_id`), más `model/Usuario.java` + `model/Rol.java` (ADMIN/USER/GUEST) |
| 1.2 | BD H2 o MySQL en `application.properties` | ✅ SÍ | **MySQL 8.4** vía `docker-compose.yml` + `src/main/resources/application-mysql.yaml` (perfil por defecto `mysql`): `jdbc:mysql://localhost:3306/coldtrace`, `ddl-auto: update` (los datos persisten entre reinicios). Alternativa sin Docker: perfil `h2` (`application-h2.yaml`, `jdbc:h2:mem:coldtrace`) |
| 1.3 | Repositorios extendiendo `JpaRepository` | ✅ SÍ | `repository/ProductoRepository.java`, `LoteRepository.java`, `OperacionRepository.java`, `RegistroTemperaturaRepository.java`, `UsuarioRepository.java` |
| 1.4 | Servicio con lógica de negocio y CRUD | ✅ SÍ | `service/ProductoService.java` y `service/LoteService.java` (CRUD completo + `validarRango`), `service/OperacionService.java:registrarRecepcion` (regla: solo `EN_TRANSITO` pasa a `RECEPCIONADO`), `service/RegistroTemperaturaService.java` |
| 1.5 | Validar persistencia con Postman | ✅ SÍ | Colección importable + demo en vivo: `POST /api/auth/login` → `GET /api/productos` con token devuelve 3 productos; sin token devuelve 403 |
| 2.1 | Consultas JPQL por fecha/categoría/estado | ✅ SÍ | `ProductoRepository: buscarPorTipo, buscarPorTemperaturaObjetivo`; `LoteRepository: buscarPorEstado, buscarVencidosAntesDe, buscarPorTipoProducto`; `OperacionRepository: buscarPorEstado, buscarPorRangoFechas, buscarPorTransportista`; `RegistroTemperaturaRepository: buscarPorLoteYFechas, buscarAlertasPorLote`; `UsuarioRepository: buscarPorRol`. Demos medidas: `?tipo=Biologico→1`, `?estado=ACTIVO→2`, `/vencidos→1`, `/en-transito→1`, `/alertas→1` |
| 2.2 | Operaciones `@Transactional` | ✅ SÍ | `@Transactional` en los 4 services; escrituras (`registrar`, `actualizar`, `eliminar`, `registrarRecepcion`) transaccionales y lecturas `readOnly` |
| 3.1 | Spring Security integrado | ✅ SÍ | `pom.xml: spring-boot-starter-security` + `security/SecurityConfig.java` (stateless, CSRF off, consola H2 permitida solo si está habilitada) |
| 3.2 | Roles y permisos (ADMIN/USER/GUEST) | ✅ SÍ | `model/Rol.java` + matriz en `SecurityConfig` (GET→ADMIN/USER/GUEST, `/api/**` escritura→ADMIN/USER) + `@PreAuthorize` en los 4 controllers (DELETE solo `ADMIN`). Demo: GUEST hace GET (200) pero POST (403) |
| 3.3 | Seguridad a nivel de endpoints | ✅ SÍ | `@PreAuthorize` en `Producto/Lote/Operacion/RegistroTemperaturaController` + endpoints sensibles (`/por-fechas`, `/alertas`) solo ADMIN/USER |
| 3.4 | `UserDetailsService` desde BD | ✅ SÍ | `security/CustomUserDetailsService.java:loadUserByUsername` (lee `UsuarioRepository.findByUsername`, otorga `ROLE_<rol>`) |
| 4.1 | JWT al iniciar sesión (`/api/auth/login`) | ✅ SÍ | `controller/AuthController.java:login` + `security/JwtUtil.java:generarToken` (login `admin/admin123` devuelve `token` verificado) |
| 4.2 | Filtro JWT en cada solicitud | ✅ SÍ | `security/JwtAuthFilter.java` (lee `Authorization: Bearer …`) registrado con `addFilterBefore` en `SecurityConfig` |
| 4.3 | Endpoints protegidos con token | ✅ SÍ | Todo `/api/**` exige token: sin token → 403 (verificado); `GET /` y `/api/auth/**` son públicos |
| 4.4 | Endpoints registro y login | ✅ SÍ | `POST /api/auth/register` (verificado: crea `profe` y devuelve token) y `POST /api/auth/login` en `AuthController.java` |
| Extra | Front Angular consume la API con JWT | ✅ SÍ | `frontend/src/app/auth.service.ts` (login/sesión), `auth.interceptor.ts` (Bearer automático), `auth.guard.ts` + `/login`, verificado en `http://localhost:4200` |

## Guion de exposición (5 min)
1. **Persistencia (1 min):** diagrama `Producto 1—N Lote 1—N RegistroTemperatura` + `Operacion N—1 Lote`; abrir `application-mysql.yaml` y **phpMyAdmin** (`http://localhost:8081`) con la tabla `producto`.
2. **JPQL + transacción (1 min):** mostrar `buscarAlertasPorLote` (`@Query`) y ejecutarlo en Postman; mostrar `@Transactional` en `registrarRecepcion`.
3. **Seguridad (1.5 min):** `SecurityConfig` + `Rol` + `@PreAuthorize` del DELETE; demo `GET /api/productos` sin token (403) vs con token (200); login `guest` → POST da 403.
4. **JWT + front (1.5 min):** `JwtUtil`/`JwtAuthFilter`; login en `http://localhost:4200/login` con `admin/admin123` y navegar el dashboard (las peticiones ya llevan el token).

## Cómo ver las tablas de la base de datos (MySQL)

1. Levanta la base de datos (MySQL 8.4 + phpMyAdmin):
   ```powershell
   docker compose up -d
   ```
2. Abre **`http://localhost:8081`** (phpMyAdmin) y entra con:
   - **Servidor:** `mysql`
   - **Usuario:** `coldtrace`
   - **Contraseña:** `coldtrace123`
   - **Base de datos:** `coldtrace`
3. En el panel izquierdo verás las tablas: `producto`, `lote`, `registro_temperatura`, `operacion` (+ `operacion_controles_confirmados`), `usuario`. Clic en una tabla para ver su contenido.
4. Consultas útiles para la exposición (pestaña **SQL**):
   ```sql
   SELECT * FROM producto;
   SELECT * FROM lote;
   SELECT * FROM registro_temperatura;
   SELECT * FROM operacion;
   SELECT username, rol FROM usuario;
   -- Relación lote + producto:
   SELECT l.codigo, l.estado, p.nombre FROM lote l JOIN producto p ON l.producto_id = p.id;
   -- Alertas fuera de rango (misma lógica del JPQL):
   SELECT r.id, r.temperatura, p.nombre FROM registro_temperatura r
     JOIN lote l ON r.lote_id = l.id JOIN producto p ON l.producto_id = p.id
     WHERE r.temperatura < p.temperatura_minima OR r.temperatura > p.temperatura_maxima;
   ```
5. **Importante:** con MySQL los datos **persisten** entre reinicios (volumen `coldtrace-mysql-data`). El sembrado inicial (`DatosIniciales.java`) solo inserta si la tabla `producto` está vacía. Para reiniciar todo desde cero: `docker compose down -v`.

**Alternativa sin Docker (H2 en memoria):**
`.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2` → consola en `http://localhost:8080/h2-console` con JDBC `jdbc:h2:mem:coldtrace`, usuario `sa` y contraseña vacía. En este perfil la base se crea y **se borra al detener el backend**.

---

# ANEXO — Requerimientos técnicos del avance (Frontend Angular)

**Verificado el:** 13-nov-2026 · **Backend:** Spring Boot 4.1.1 en `localhost:8080` · **Frontend:** Angular 22 en `localhost:4200`
**Pruebas de navegador:** 6 funcionales + 1 de capturas, 7/7 OK (`npm run e2e`) · **Tests backend:** 10/10 OK · **Build producción:** OK

## Veredicto: SÍ CUMPLE

| # | Requerimiento | ¿Cumple? | Evidencia (archivo + qué mostrar) |
|---|---|---|---|
| 1.1 | Componentes para lista, formulario y detalle | ✅ | `lots.component.ts` (formulario + tabla de productos y lotes), `logistics.component.ts` (despacho/recepción + tablas), `trace-report.component.ts` (detalle de trazabilidad), **`producto-detalle.component.ts`** (detalle por ID, ruta `/productos/:id`) |
| 1.2 | Enrutamiento entre vistas | ✅ | `app.routes.ts`: `/login`, `/dashboard`, `/lotes`, `/productos/:id`, `/logistica`, `/trazabilidad`, wildcard; `authGuard` + `roleGuard`; `routerLink` en la barra lateral |
| 1.3 | Estilos con SASS y diseño responsivo | ✅ | `src/styles.scss` + `src/styles/_tokens.scss` (variables, mixins, anidamiento), `_shell.scss`, `_components.scss`, `_login.scss`, y `app.scss` con los tokens del host; media query a 900 px que colapsa sidebar y grillas |
| 2.1 | Formulario reactivo para registro y edición | ✅ | `ReactiveFormsModule` con `FormBuilder` en `login`, `lots` (producto, lote, temperatura) y `logistics` (despacho, recepción); edición con `PUT` |
| 2.2 | Validaciones (requeridos, formatos, longitudes) | ✅ | `Validators.required/minLength/maxLength/min/max/pattern` + validación cruzada `rangoTermico` (máx > mín) en `lots.component.ts` |
| 2.3 | Manejo de mensajes de error | ✅ | Mensajes por campo (`.field-error`) y mensajes de operación (`.form-message`), incluidos 401/403/409 y errores del backend |
| 3.1 | `HttpClient` contra la API Spring Boot | ✅ | `coldtrace-api.service.ts` (base `/api` + `proxy.conf.json`) |
| 3.2 | Endpoints protegidos con JWT | ✅ | `auth.interceptor.ts` agrega `Authorization: Bearer`; sin token la API responde 403 |
| 3.3 | GET, POST, PUT y DELETE | ✅ | GET productos/lotes/temperaturas/operaciones, POST productos/lotes/temperaturas/operaciones, PUT productos y recepción, DELETE productos y lotes |
| 4.1 | Formulario de login en Angular | ✅ | `login.component.ts` → `POST /api/auth/login` |
| 4.2 | Almacenamiento y uso del token | ✅ | `localStorage` (`jwt`, `username`, `rol`) en `auth.service.ts` + interceptor |
| 4.3 | Redirección por estado o tipo de usuario | ✅ | `authGuard` (sin sesión → `/login`); login redirige según rol: ADMIN/USER → `/dashboard`, GUEST → `/lotes`; `roleGuard` bloquea `/logistica` a GUEST y la UI oculta acciones de escritura |
| 5.1 | API desplegada (local) | ✅ | Spring Boot en `http://localhost:8080` sobre **MySQL 8.4** (Docker), con datos sembrados y persistencia verificada entre reinicios |
| 5.2 | Comunicación front ↔ back | ✅ | Verificado en vivo: login 200, GET 200, POST 201, PUT 200, DELETE 204, sin token 403 |
| 5.3 | Respuestas en tablas, listas o tarjetas | ✅ | Tablas de productos, lotes, operaciones y lecturas; tarjetas KPI en el dashboard |
| 6.1 | Pruebas de funcionalidad desde el navegador | ✅ | `frontend/e2e/coldtrace.spec.ts` (Playwright, 6 pruebas funcionales) + `frontend/e2e/capturas-informe.spec.ts` (1 prueba de capturas): login OK, login inválido, validaciones, CRUD completo, despacho y rol GUEST |
| 6.2 | Evidencia del flujo (login, registro, consulta, edición, eliminación) | ✅ | 10 capturas en `docs/evidencias/` (ver `docs/evidencias/README.md`) |
| 6.3 | Documentación | ✅ | Este informe, `INFORME-EXPOSICION.md`, `APF1-COLDTRACE.md`, colección Postman y `docs/evidencias/README.md` |

## Notas técnicas de la corrección

- **Base de datos:** migrada de H2 en memoria a **MySQL 8.4** (Docker). `spring.profiles.default: mysql` hace que el backend use MySQL al arrancar; `application-mysql.yaml` usa `ddl-auto: update` para conservar los datos entre reinicios. El perfil `h2` queda como alternativa sin Docker y los tests lo usan con `@ActiveProfiles("h2")`.

- **SASS:** los estilos se migraron de CSS plano a SCSS con arquitectura de parciales (`_tokens`, `_shell`, `_components`, `_login`), variables, mixins y anidamiento; `app.scss` expone los tokens como custom properties. El build compila SCSS (dependencia `sass` en `devDependencies`).
- **Change detection:** Angular 22 funciona sin Zone.js. El estado compartido (`ColdtraceStoreService`) y el estado de cada vista se expusieron con **signals** para que las respuestas HTTP refresquen la UI automáticamente. Por eso `coldtrace-store.service.ts` ya no usa `BehaviorSubject`.
- **Detalle por ID:** nueva ruta `/productos/:id` con `ActivatedRoute` y `GET /api/productos/{id}`; se accede con el botón **Ver** de la tabla de productos.
- **Roles:** se agregó `GET /api/operaciones/**` a GUEST en `SecurityConfig` (coherente con el `@PreAuthorize` del controlador) y el front oculta acciones según el rol.
- **Errores 401:** `GlobalExceptionHandler` traduce `BadCredentialsException` a `401 Usuario o contraseña incorrectos`.

## Cómo demostrar el flujo completo en la exposición

1. `.\mvnw.cmd spring-boot:run` (backend) y `npm start` dentro de `frontend/`.
2. Abrir `http://localhost:4200` → login `admin/admin123`.
3. **Lotes:** registrar un producto (mostrar validaciones dejando campos vacíos), luego **Ver** para abrir el detalle, **Editar** y **Eliminar**.
4. **Logística:** registrar un despacho y recepcionarlo (PUT).
5. **Trazabilidad:** seleccionar el lote en tránsito y ver el gráfico en vivo.
6. Cerrar sesión y entrar con `guest/guest123`: redirección a `/lotes` en modo solo lectura.

---

## Actualización — mejoras de consistencia (15-nov-2026)

| Mejora | Evidencia |
|---|---|
| **409 real al eliminar un producto con lotes** | `LoteRepository.existsByProductoId`, `ProductoService.eliminar`, `ProductoServiceTest.rechazaEliminarProductoConLotes` y `SecurityIntegrationTest.adminNoPuedeEliminarProductoConLotes` |
| **Edición de lotes en la interfaz** | `ColdtraceApiService.actualizarLote`, `LotsComponent.editarLote`, `cancelarEdicionLote` y botón **Editar** en la tabla de lotes |
| **401 para token ausente/inválido y 403 para rol insuficiente** | `RestAuthenticationEntryPoint`, `RestAccessDeniedHandler` y `SecurityConfig.exceptionHandling` |
| **Cierre de sesión automático ante 401** | `frontend/src/app/core/interceptors/error.interceptor.ts` registrado en `app.config.ts` |
| **Pruebas de seguridad** | `SecurityIntegrationTest`: sin token 401, GUEST GET 200/POST 403, USER DELETE 403, ADMIN DELETE con lotes 409 |
| **Conteo de pruebas actualizado** | Backend: **10/10** · E2E: **7/7** (6 funcionales + 1 capturas) |

> Nota: el test E2E del panel ya no exige exactamente 3 lotes; valida que el KPI muestre un número real de la API. Así funciona también cuando MySQL conserva datos de demostraciones anteriores.

