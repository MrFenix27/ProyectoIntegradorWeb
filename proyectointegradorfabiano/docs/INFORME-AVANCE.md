# INFORME FINAL — Cumplimiento de requerimientos del avance

**Proyecto:** ColdTrace / WebIntegrado (`proyectointegradorfabiano/`)
**Fecha de verificación:** 13-oct-2026 — Backend `http://localhost:8080` (OK) + Frontend `http://localhost:4200` (HTTP 200)
**Compilación:** `mvnw compile` OK · **Tests:** 5/5 OK (`BUILD SUCCESS`) · **Front:** `ng build` OK
**Colección Postman:** `docs/ColdTrace.postman_collection.json` (16 peticiones)
**Nota técnica:** Spring Boot 4.x eliminó la consola H2 auto-configurada, por eso se registra manual en `config/H2ConsoleConfig.java` (verificado: `/h2-console/` → 200).
**Usuarios de prueba:** `admin/admin123` (ADMIN) · `user/user123` (USER) · `guest/guest123` (GUEST)

## Veredicto general: SÍ CUMPLE (100 %)

| # | Requerimiento pedido | ¿Cumple? | Evidencia (archivo + qué mostrar al jurado) |
|---|---|---|---|
| 1.1 | Entidades de dominio (mín. 3) con relaciones `@OneToMany`, `@ManyToOne` | ✅ SÍ | `model/Producto.java` (`@OneToMany List<Lote> lotes`), `model/Lote.java` (`@ManyToOne producto` + `@OneToMany registros`), `model/RegistroTemperatura.java` (`@ManyToOne lote`), `model/Operacion.java` (`@ManyToOne lote` sobre `lote_id`), más `model/Usuario.java` + `model/Rol.java` (ADMIN/USER/GUEST) |
| 1.2 | BD H2 o MySQL en `application.properties` | ✅ SÍ | `src/main/resources/application.yaml` (equivale a `application.properties`): `jdbc:h2:mem:coldtrace`, `ddl-auto: create-drop`, consola H2 habilitada |
| 1.3 | Repositorios extendiendo `JpaRepository` | ✅ SÍ | `repository/ProductoRepository.java`, `LoteRepository.java`, `OperacionRepository.java`, `RegistroTemperaturaRepository.java`, `UsuarioRepository.java` |
| 1.4 | Servicio con lógica de negocio y CRUD | ✅ SÍ | `service/ProductoService.java` y `service/LoteService.java` (CRUD completo + `validarRango`), `service/OperacionService.java:registrarRecepcion` (regla: solo `EN_TRANSITO` pasa a `RECEPCIONADO`), `service/RegistroTemperaturaService.java` |
| 1.5 | Validar persistencia con Postman | ✅ SÍ | Colección importable + demo en vivo: `POST /api/auth/login` → `GET /api/productos` con token devuelve 3 productos; sin token devuelve 403 |
| 2.1 | Consultas JPQL por fecha/categoría/estado | ✅ SÍ | `ProductoRepository: buscarPorTipo, buscarPorTemperaturaObjetivo`; `LoteRepository: buscarPorEstado, buscarVencidosAntesDe, buscarPorTipoProducto`; `OperacionRepository: buscarPorEstado, buscarPorRangoFechas, buscarPorTransportista`; `RegistroTemperaturaRepository: buscarPorLoteYFechas, buscarAlertasPorLote`; `UsuarioRepository: buscarPorRol`. Demos medidas: `?tipo=Biologico→1`, `?estado=ACTIVO→2`, `/vencidos→1`, `/en-transito→1`, `/alertas→1` |
| 2.2 | Operaciones `@Transactional` | ✅ SÍ | `@Transactional` en los 4 services; escrituras (`registrar`, `actualizar`, `eliminar`, `registrarRecepcion`) transaccionales y lecturas `readOnly` |
| 3.1 | Spring Security integrado | ✅ SÍ | `pom.xml: spring-boot-starter-security` + `security/SecurityConfig.java` (stateless, CSRF off, H2 permitido) |
| 3.2 | Roles y permisos (ADMIN/USER/GUEST) | ✅ SÍ | `model/Rol.java` + matriz en `SecurityConfig` (GET→ADMIN/USER/GUEST, `/api/**` escritura→ADMIN/USER) + `@PreAuthorize` en los 4 controllers (DELETE solo `ADMIN`). Demo: GUEST hace GET (200) pero POST (403) |
| 3.3 | Seguridad a nivel de endpoints | ✅ SÍ | `@PreAuthorize` en `Producto/Lote/Operacion/RegistroTemperaturaController` + endpoints sensibles (`/por-fechas`, `/alertas`) solo ADMIN/USER |
| 3.4 | `UserDetailsService` desde BD | ✅ SÍ | `security/CustomUserDetailsService.java:loadUserByUsername` (lee `UsuarioRepository.findByUsername`, otorga `ROLE_<rol>`) |
| 4.1 | JWT al iniciar sesión (`/api/auth/login`) | ✅ SÍ | `controller/AuthController.java:login` + `security/JwtUtil.java:generarToken` (login `admin/admin123` devuelve `token` verificado) |
| 4.2 | Filtro JWT en cada solicitud | ✅ SÍ | `security/JwtAuthFilter.java` (lee `Authorization: Bearer …`) registrado con `addFilterBefore` en `SecurityConfig` |
| 4.3 | Endpoints protegidos con token | ✅ SÍ | Todo `/api/**` exige token: sin token → 403 (verificado); `GET /` y `/api/auth/**` son públicos |
| 4.4 | Endpoints registro y login | ✅ SÍ | `POST /api/auth/register` (verificado: crea `profe` y devuelve token) y `POST /api/auth/login` en `AuthController.java` |
| Extra | Front Angular consume la API con JWT | ✅ SÍ | `frontend/src/app/auth.service.ts` (login/sesión), `auth.interceptor.ts` (Bearer automático), `auth.guard.ts` + `/login`, verificado en `http://localhost:4200` |

## Guion de exposición (5 min)
1. **Persistencia (1 min):** diagrama `Producto 1—N Lote 1—N RegistroTemperatura` + `Operacion N—1 Lote`; abrir `application.yaml` y la consola H2 con `SELECT * FROM PRODUCTO;`.
2. **JPQL + transacción (1 min):** mostrar `buscarAlertasPorLote` (`@Query`) y ejecutarlo en Postman; mostrar `@Transactional` en `registrarRecepcion`.
3. **Seguridad (1.5 min):** `SecurityConfig` + `Rol` + `@PreAuthorize` del DELETE; demo `GET /api/productos` sin token (403) vs con token (200); login `guest` → POST da 403.
4. **JWT + front (1.5 min):** `JwtUtil`/`JwtAuthFilter`; login en `http://localhost:4200/login` con `admin/admin123` y navegar el dashboard (las peticiones ya llevan el token).

## Cómo ver las tablas de la base de datos (H2)
1. Con el backend corriendo, abre **`http://localhost:8080/h2-console`** en el navegador.
2. En el formulario de login pon exactamente:
   - **JDBC URL:** `jdbc:h2:mem:coldtrace`
   - **User Name:** `sa`
   - **Password:** (vacío)
   - Clic en **Connect**.
3. En el panel izquierdo verás las tablas: `PRODUCTO`, `LOTE`, `REGISTRO_TEMPERATURA`, `OPERACION` (+ `OPERACION_CONTROLES_CONFIRMADOS`), `USUARIO`. Clic en una tabla y luego en **Run** para ver su contenido.
4. Consultas útiles para la exposición (pégalas arriba y pulsa **Run**):
   ```sql
   SELECT * FROM PRODUCTO;
   SELECT * FROM LOTE;
   SELECT * FROM REGISTRO_TEMPERATURA;
   SELECT * FROM OPERACION;
   SELECT USERNAME, ROL FROM USUARIO;
   -- Relación lote + producto:
   SELECT L.CODIGO, L.ESTADO, P.NOMBRE FROM LOTE L JOIN PRODUCTO P ON L.PRODUCTO_ID = P.ID;
   -- Alertas fuera de rango (misma lógica del JPQL):
   SELECT R.ID, R.TEMPERATURA, P.NOMBRE FROM REGISTRO_TEMPERATURA R
     JOIN LOTE L ON R.LOTE_ID = L.ID JOIN PRODUCTO P ON L.PRODUCTO_ID = P.ID
     WHERE R.TEMPERATURA < P.TEMPERATURA_MINIMA OR R.TEMPERATURA > P.TEMPERATURA_MAXIMA;
   ```
5. **Importante:** la BD es **en memoria**: se crea y se siembra sola en cada arranque (`DatosIniciales.java`) y **se borra al detener el backend**. Si la consola no conecta, es que el backend está apagado: relánzalo con `$env:JAVA_HOME="$env:USERPROFILE\tools\jdk21\jdk-21.0.12.1+1"; .\mvnw.cmd spring-boot:run`.
