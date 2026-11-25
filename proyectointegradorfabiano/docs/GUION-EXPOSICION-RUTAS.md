# Guion de exposición con rutas y líneas de código

> **Versión visual:** el mismo contenido, con las capturas del sistema en cada sección, está en
> `docs/reporte/Guion-Exposicion-ColdTrace.pdf`. El HTML fuente es
> `docs/reporte/guion-exposicion-visual.html` y se regenera con `npm run guion` desde `frontend/`.

**Proyecto:** ColdTrace / WebIntegrado
**Base de rutas:** todas las rutas de archivo de este documento son relativas a `proyectointegradorfabiano/`.
**URLs demo:** front `http://localhost:4200/login` · API `http://localhost:8080/api` · phpMyAdmin `http://localhost:8081`

> Este documento conserva la estructura de exposición de 6 bloques y le agrega, para cada afirmación, el archivo, las líneas y —cuando aporta— el fragmento exacto de código.

---

## Mapa rápido de rutas de la aplicación

| URL | Componente | Archivo del componente | Archivo de ruta | Guarda |
|---|---|---|---|---|
| `/login` | `LoginComponent` | `frontend/src/app/features/auth/login.component.ts:7-105` | `frontend/src/app/features/auth/auth.routes.ts:5` | Pública |
| `/dashboard` | `DashboardComponent` | `frontend/src/app/features/dashboard/dashboard.component.ts:8-163` | `frontend/src/app/features/dashboard/dashboard.routes.ts:6-8` | `authGuard` |
| `/lotes` | `LotsComponent` | `frontend/src/app/features/lots/lots.component.ts:29-626` | `frontend/src/app/features/lots/lots.routes.ts:8` | `authGuard` |
| `/productos/:id` | `ProductoDetalleComponent` | `frontend/src/app/features/lots/producto-detalle.component.ts:13-200` | `frontend/src/app/features/lots/lots.routes.ts:9` | `authGuard` |
| `/logistica` | `LogisticsComponent` | `frontend/src/app/features/logistics/logistics.component.ts:9-440` | `frontend/src/app/features/logistics/logistics.routes.ts:6-13` | `authGuard` + `roleGuard` (ADMIN/USER) |
| `/trazabilidad` | `TraceReportComponent` | `frontend/src/app/features/traceability/trace-report.component.ts:7-353` | `frontend/src/app/features/traceability/traceability.routes.ts:6-8` | `authGuard` |

La composición de todas las rutas está en `frontend/src/app/app.routes.ts:13-21`:

```ts
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  ...AUTH_ROUTES,
  ...DASHBOARD_ROUTES,
  ...LOTS_ROUTES,
  ...LOGISTICS_ROUTES,
  ...TRACEABILITY_ROUTES,
  { path: '**', redirectTo: 'dashboard' },
];
```

> **Precisión:** son **6 rutas de componente**; **5 están protegidas** con guardas. La única pública es `/login`. Si en la exposición dices “6 rutas con guardas”, un jurado podría objetarlo: lo correcto es “6 rutas, 5 protegidas”.

---

## 1. Interfaz Angular (1,5 min)

### Decir: hay componentes para lista, formulario y detalle

**Lista de productos y lotes**
- `frontend/src/app/features/lots/lots.component.ts:258-305` → tabla de productos.
- `frontend/src/app/features/lots/lots.component.ts:307-355` → tabla de lotes.
- `frontend/src/app/features/dashboard/dashboard.component.ts:83-115` → tabla de últimos lotes monitoreados.

**Formularios**
- Producto: `frontend/src/app/features/lots/lots.component.ts:51-141`.
- Lote y lectura de temperatura: `frontend/src/app/features/lots/lots.component.ts:143-255`.
- Despacho y recepción: `frontend/src/app/features/logistics/logistics.component.ts:33-205`.
- Login: `frontend/src/app/features/auth/login.component.ts:13-57`.

**Detalle**
- `frontend/src/app/features/lots/producto-detalle.component.ts:32-90` → plantilla de la ficha, lotes asociados y cumplimiento térmico.
- `frontend/src/app/features/lots/producto-detalle.component.ts:93-200` → lógica del componente.

### Decir: el enrutamiento tiene 6 rutas con guardas

- Composición: `frontend/src/app/app.routes.ts:13-21`.
- `authGuard` (exige sesión): `frontend/src/app/core/guards/auth.guard.ts:7-11`.
- `roleGuard` (exige rol): `frontend/src/app/core/guards/auth.guard.ts:18-32`.
- Ruta logística protegida por ambos y limitada a ADMIN/USER: `frontend/src/app/features/logistics/logistics.routes.ts:6-13`.

```ts
// auth.guard.ts:7-11
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.logueado ? true : router.parseUrl('/login');
};
```

### Decir: los estilos están en SASS, con tokens, mixins y parciales

- Punto de entrada: `frontend/src/styles.scss:9-12`.
- Tokens, mixins y breakpoint: `frontend/src/styles/_tokens.scss:8-67`.
  - Variables de color, tipografía y layout: `:8-42`.
  - Breakpoint responsivo: `:44-45`.
  - Mixin `mobile`: `:47-51`.
  - Mixin `card`: `:53-58`.
  - Mixin `badge`: `:60-67`.
- Parciales:
  - `frontend/src/styles/_shell.scss:1-213` → sidebar, topbar, layout y bloque responsivo.
  - `frontend/src/styles/_components.scss:1-749` → paneles, tablas, formularios, badges y bloque responsivo.
  - `frontend/src/styles/_login.scss:1-91` → pantalla de login.

```scss
// styles.scss:9-12
@use 'tokens' as t;
@use 'shell';
@use 'components';
@use 'login';
```

### Decir: el diseño es responsivo

- Definición del breakpoint y mixin: `frontend/src/styles/_tokens.scss:44-51`.
- Uso en el shell: `frontend/src/styles/_shell.scss:166`.
- Uso en componentes (grids a una columna): `frontend/src/styles/_components.scss:715`.

```scss
// _tokens.scss:44-51
$breakpoint-mobile: 900px;

@mixin mobile {
  @media (max-width: $breakpoint-mobile) {
    @content;
  }
}
```

### Mostrar: navegar por Panel, Lotes, Logística y Trazabilidad

El menú lateral está en `frontend/src/app/app.html:10-26`:
- Panel principal: `:11-13`.
- Lotes: `:14-16`.
- Logística: `:17-19` (solo se muestra si `auth.puedeEscribir`).
- Trazabilidad: `:20-22`.

### Mostrar: entrar al detalle de un producto, ruta `/productos/:id`

- Ruta declarada: `frontend/src/app/features/lots/lots.routes.ts:9`.
- Botón “Ver” de la tabla: `frontend/src/app/features/lots/lots.component.ts:284`.
- Navegación programática: `frontend/src/app/features/lots/lots.component.ts:515-517`.

```ts
// lots.component.ts:515-517
verDetalle(producto: { id: number }): void {
  this.router.navigate(['/productos', producto.id]);
}
```

### Pregunta probable: ¿cómo pasas datos entre vistas?

**Respuesta:** el identificador viaja en la URL y se lee con `ActivatedRoute`; el estado compartido vive en un store con signals.

- Inyección de `ActivatedRoute`: `frontend/src/app/features/lots/producto-detalle.component.ts:96`.
- Lectura del parámetro `:id`: `frontend/src/app/features/lots/producto-detalle.component.ts:125-134`.
- Estado global con signals: `frontend/src/app/core/services/coldtrace-store.service.ts:20-28`.
- Recarga y exposición de datos: `frontend/src/app/core/services/coldtrace-store.service.ts:34-90`.
- Filtro derivado con `computed`: `frontend/src/app/features/lots/lots.component.ts:376-387`.

```ts
// producto-detalle.component.ts:125-134
ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));
  if (!Number.isInteger(id) || id <= 0) {
    this.error.set('El identificador del producto no es válido.');
    this.cargando.set(false);
    return;
  }
  this.productoId.set(id);
  this.cargarProducto();
}
```

---

## 2. Formularios (2 min)

### Decir: son formularios reactivos

- Importación de `ReactiveFormsModule`: `frontend/src/app/features/lots/lots.component.ts:4-11` y `:32`.
- Login reactivo: `frontend/src/app/features/auth/login.component.ts:3` y `:13`.
- Logística reactiva: `frontend/src/app/features/logistics/logistics.component.ts:3`, `:37` y `:135`.

### Decir: sirven para registrar y para editar, porque el mismo formulario se reutiliza

- Título y endpoint cambian según `editandoId()`: `frontend/src/app/features/lots/lots.component.ts:52-56`.
- El método elige `POST` o `PUT`: `frontend/src/app/features/lots/lots.component.ts:438-448`.
- Carga los datos del producto en el mismo formulario: `frontend/src/app/features/lots/lots.component.ts:476-487`.
- Cancela la edición y limpia el formulario: `frontend/src/app/features/lots/lots.component.ts:489-500`.
- El texto del botón también cambia: `frontend/src/app/features/lots/lots.component.ts:135-137`.

```ts
// lots.component.ts:445-448
const datos = this.productoForm.getRawValue();
const editando = this.editandoId();
const peticion =
  editando === null ? this.api.registrarProducto(datos) : this.api.actualizarProducto(editando, datos);
```

### Decir: tienen validaciones de requeridos, formato y longitud

- Formulario de producto: `frontend/src/app/features/lots/lots.component.ts:389-398`.
  - `nombre`: requerido, mínimo 3 y máximo 60 → `:391`.
  - `tipo`: requerido, mínimo 3 y máximo 40 → `:392`.
  - Temperaturas: requeridas y entre -60 y 40 → `:393-394`.
  - Vida útil: requerida, entre 1 y 3650 días → `:395`.
- Formulario de lote: `frontend/src/app/features/lots/lots.component.ts:400-405`.
  - Patrón del código de lote → `:401`.
- Formulario de temperatura: `frontend/src/app/features/lots/lots.component.ts:407-411`.
- Login: `frontend/src/app/features/auth/login.component.ts:69-72`.
- Despacho: `frontend/src/app/features/logistics/logistics.component.ts:304-311`.
- Recepción: `frontend/src/app/features/logistics/logistics.component.ts:313-320`.

```ts
// lots.component.ts:400-401
readonly loteForm = this.fb.nonNullable.group({
  codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]{3,20}$/)]],
```

Mensajes visibles por campo:
- Nombre: `frontend/src/app/features/lots/lots.component.ts:67-71`.
- Tipo: `:82-86`.
- Temperatura mínima: `:97-101`.
- Temperatura máxima y error cruzado: `:110-117`.
- Código de lote: `:156-161`.
- Helper que decide cuándo mostrar el error: `:414-417`.

### Decir: hay una validación cruzada, la temperatura máxima debe ser mayor que la mínima

- Función validadora: `frontend/src/app/features/lots/lots.component.ts:19-27`.
- Se aplica al grupo completo: `frontend/src/app/features/lots/lots.component.ts:397`.
- Se muestra en el campo de temperatura máxima: `frontend/src/app/features/lots/lots.component.ts:110-117`.

```ts
// lots.component.ts:19-27
function rangoTermico(grupo: AbstractControl): ValidationErrors | null {
  const minima = grupo.get('temperaturaMinima')?.value;
  const maxima = grupo.get('temperaturaMaxima')?.value;
  if (minima === null || maxima === null || minima === '' || maxima === '') {
    return null;
  }
  return Number(minima) < Number(maxima) ? null : { rangoTermico: true };
}
```

### Mostrar: nombre vacío y temperatura máxima menor que la mínima

- El flujo exacto ya está automatizado en `frontend/e2e/coldtrace.spec.ts:71-93`:
  - Nombre con 2 caracteres y `blur` → error de longitud (`:77-80`).
  - Nombre vacío y `blur` → error de obligatorio (`:82-84`).
  - Mínima 10 y máxima 5 → error de rango térmico (`:86-90`).
- El botón queda deshabilitado por `productoForm.invalid`: `frontend/src/app/features/lots/lots.component.ts:135`.

```html
<!-- lots.component.ts:135 -->
<button class="primary" type="submit" [disabled]="productoForm.invalid || guardando()">
```

### Pregunta probable: ¿por qué validar también en el servidor?

**Respuesta:** porque una petición enviada directamente a la API se saltaría la interfaz; el backend debe proteger la regla de negocio.

- Validación en el servicio: `src/main/java/com/example/WebIntegrado/service/ProductoService.java:36-40` y `:59-63`.
- Validaciones declarativas del modelo: `src/main/java/com/example/WebIntegrado/model/Producto.java:24-37`.
- Respuesta 400 con el mensaje de validación: `src/main/java/com/example/WebIntegrado/exception/GlobalExceptionHandler.java:27-34`.
- Rango térmico inválido → 400: `src/main/java/com/example/WebIntegrado/exception/IllegalArgumentExceptionHandler.java:12-18`.
- Prueba que demuestra el rechazo: `src/test/java/com/example/WebIntegrado/service/ProductoServiceTest.java:36-41`.

```java
// ProductoService.java:59-63
private void validarRango(Producto producto) {
    if (producto.getTemperaturaMinima() > producto.getTemperaturaMaxima()) {
        throw new IllegalArgumentException("La temperatura minima no puede superar la maxima");
    }
}
```

---

## 3. Consumo de servicios REST (2 min)

### Decir: todo pasa por HttpClient

- Servicio central de API: `frontend/src/app/core/services/coldtrace-api.service.ts:14-34`.
- Inyección de `HttpClient` y base `/api`: `frontend/src/app/core/services/coldtrace-api.service.ts:16-17`.
- Registro de `provideHttpClient` con interceptor: `frontend/src/app/app.config.ts:14`.
- Proxy del frontend hacia el backend: `frontend/proxy.conf.json:1-7`.

### Decir: se usan los cuatro métodos

| Método | Operación | Línea exacta |
|---|---|---|
| GET | Listar productos | `coldtrace-api.service.ts:18` |
| GET | Consultar producto por ID | `coldtrace-api.service.ts:19` |
| GET | Listar lotes | `coldtrace-api.service.ts:23` |
| GET | Historial de temperaturas | `coldtrace-api.service.ts:26` |
| GET | Listar operaciones | `coldtrace-api.service.ts:28` |
| GET | Operaciones en tránsito | `coldtrace-api.service.ts:30` |
| POST | Crear producto | `coldtrace-api.service.ts:20` |
| POST | Crear lote | `coldtrace-api.service.ts:24` |
| POST | Registrar temperatura | `coldtrace-api.service.ts:27` |
| POST | Registrar despacho/operación | `coldtrace-api.service.ts:29` |
| PUT | Editar producto | `coldtrace-api.service.ts:21` |
| PUT | Registrar recepción | `coldtrace-api.service.ts:31` |
| DELETE | Eliminar producto | `coldtrace-api.service.ts:22` |
| DELETE | Eliminar lote | `coldtrace-api.service.ts:25` |

```ts
// coldtrace-api.service.ts:18-22
productos(): Observable<Producto[]> { return this.http.get<Producto[]>(`${this.base}/productos`); }
buscarProducto(id: number): Observable<Producto> { return this.http.get<Producto>(`${this.base}/productos/${id}`); }
registrarProducto(data: Omit<Producto, 'id'>): Observable<Producto> { return this.http.post<Producto>(`${this.base}/productos`, data); }
actualizarProducto(id: number, data: Omit<Producto, 'id'>): Observable<Producto> { return this.http.put<Producto>(`${this.base}/productos/${id}`, data); }
eliminarProducto(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/productos/${id}`); }
```

### Decir: un interceptor agrega el token a cada petición

- Interceptor completo: `frontend/src/app/core/interceptors/auth.interceptor.ts:3-11`.
- Excepción para `/api/auth`: `:4-6`.
- Lectura del token: `:7`.
- Cabecera `Authorization: Bearer`: `:9`.
- Registro global: `frontend/src/app/app.config.ts:14`.

```ts
// auth.interceptor.ts:3-11
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/auth')) {
    return next(req);
  }
  const token = localStorage.getItem('jwt');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
```

### Mostrar: crear, editar y eliminar un producto

- Crear: `frontend/src/app/features/lots/lots.component.ts:438-474`.
- Editar: `frontend/src/app/features/lots/lots.component.ts:476-487`.
- Eliminar: `frontend/src/app/features/lots/lots.component.ts:502-513`.
- Mensajes de éxito/error: `frontend/src/app/features/lots/lots.component.ts:424-435`.
- El E2E del CRUD completo está en `frontend/e2e/coldtrace.spec.ts:95-145`.

### Mostrar: pestaña Red y encabezado `Authorization: Bearer`

- El frontend lo agrega en `frontend/src/app/core/interceptors/auth.interceptor.ts:9`.
- El backend lo lee y valida en `src/main/java/com/example/WebIntegrado/security/JwtAuthFilter.java:31-34`.

```java
// JwtAuthFilter.java:31-34
String header = request.getHeader("Authorization");
if (header != null && header.startsWith("Bearer ")) {
    String token = header.substring(7);
    if (jwtUtil.validarToken(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
```

### Pregunta probable: ¿qué pasa si eliminas un producto que tiene lotes?

**Respuesta corta:** la API responde **409 Conflict** y la interfaz muestra un mensaje claro.

- `ProductoService.eliminar` consulta `loteRepository.existsByProductoId(id)` y lanza `IllegalStateException` si el producto tiene lotes: `src/main/java/com/example/WebIntegrado/service/ProductoService.java:54-64`.
- `GlobalExceptionHandler` traduce `IllegalStateException` a 409: `src/main/java/com/example/WebIntegrado/exception/GlobalExceptionHandler.java:42-45`.
- Mensaje en el frontend para 409: `frontend/src/app/features/lots/lots.component.ts:429-435`.
- Pruebas: `ProductoServiceTest.rechazaEliminarProductoConLotes` y `SecurityIntegrationTest.adminNoPuedeEliminarProductoConLotes`.

```java
// ProductoService.java:54-64
@Transactional
public void eliminar(Long id) {
    Producto producto = buscarPorId(id);
    if (loteRepository.existsByProductoId(id)) {
        throw new IllegalStateException(
                "No se puede eliminar el producto " + id + " porque tiene lotes asociados");
    }
    repository.delete(producto);
}
```

> **Estado actual:** el 409 es determinista para un producto con lotes. Ya no depende de que exista una operación referenciando el lote.

---

## 4. Autenticación y autorización (2 min)

### Decir: el login es un formulario en Angular

- Plantilla: `frontend/src/app/features/auth/login.component.ts:13-57`.
- Formulario reactivo: `frontend/src/app/features/auth/login.component.ts:69-72`.
- Envío y manejo de error: `frontend/src/app/features/auth/login.component.ts:79-104`.
- Endpoint backend: `src/main/java/com/example/WebIntegrado/controller/AuthController.java:59-67`.
- Generación del JWT: `src/main/java/com/example/WebIntegrado/security/JwtUtil.java:27-36`.

### Decir: el token JWT se guarda en localStorage junto con el rol

- Guardado de token, usuario y rol: `frontend/src/app/core/services/auth.service.ts:25-29`.
- Lectura del token: `frontend/src/app/core/services/auth.service.ts:38-40`.
- Lectura del rol: `frontend/src/app/core/services/auth.service.ts:46-48`.
- Cierre de sesión: `frontend/src/app/core/services/auth.service.ts:31-36`.

```ts
// auth.service.ts:25-29
private guardarSesion(res: AuthResponse) {
  localStorage.setItem('jwt', res.token);
  localStorage.setItem('username', res.username);
  localStorage.setItem('rol', res.rol);
}
```

### Decir: se usa en cada petición

- Interceptor: `frontend/src/app/core/interceptors/auth.interceptor.ts:7-10`.
- Validación en backend: `src/main/java/com/example/WebIntegrado/security/JwtAuthFilter.java:31-41`.
- Matriz de permisos por URL: `src/main/java/com/example/WebIntegrado/security/SecurityConfig.java:32-37`.

### Decir: la redirección depende del rol; admin y user al panel, guest a /lotes

- Regla de redirección: `frontend/src/app/core/services/auth.service.ts:54-57`.
- Uso después del login: `frontend/src/app/features/auth/login.component.ts:90-94`.

```ts
// auth.service.ts:54-57
get rutaInicio(): string {
  return this.tieneRol('GUEST') ? '/lotes' : '/dashboard';
}
```

### Mostrar: entrar como admin y luego como guest

- Login ADMIN y redirección al panel: `frontend/e2e/coldtrace.spec.ts:41-59`.
- Login GUEST, redirección a `/lotes` y ausencia de formularios: `frontend/e2e/coldtrace.spec.ts:168-180`.
- Aviso de solo lectura en lotes: `frontend/src/app/features/lots/lots.component.ts:44-47`.
- El formulario de producto se oculta si no puede escribir: `frontend/src/app/features/lots/lots.component.ts:52`.
- El enlace de Logística se oculta: `frontend/src/app/app.html:17`.
- Los botones de eliminar se reservan a ADMIN:
  - Producto: `frontend/src/app/features/lots/lots.component.ts:288-295`.
  - Lote: `frontend/src/app/features/lots/lots.component.ts:323` y `:340-344`.

### Mostrar: sin token, o con credenciales malas, aparece el error

- **Credenciales malas:** mensaje `Credenciales inválidas.` en `frontend/src/app/features/auth/login.component.ts:95-101`.
- **Backend:** `BadCredentialsException` → 401 en `src/main/java/com/example/WebIntegrado/exception/GlobalExceptionHandler.java:22-25`.
- **Sin token en una ruta del frontend:** `authGuard` redirige a `/login` en `frontend/src/app/core/guards/auth.guard.ts:7-11`.
- **Sin token contra la API:** `SecurityConfig` exige autenticación en `src/main/java/com/example/WebIntegrado/security/SecurityConfig.java:32-37`.

> **Precisión:** sin token no aparece un mensaje de error en pantalla; el guard redirige silenciosamente al login. El mensaje visible aparece con credenciales inválidas. Conviene decirlo así.

### Pregunta probable: ¿es seguro guardar el token en localStorage?

**Respuesta honesta:** es práctico para un avance, pero no es la opción más segura para producción.

- Implementación actual: `frontend/src/app/core/services/auth.service.ts:26`.
- En producción convendría usar cookies `HttpOnly` + `Secure` + HTTPS, para que JavaScript no pueda leer el token y para evitar el robo por XSS.
- La API ya es stateless y valida el token en cada request: `src/main/java/com/example/WebIntegrado/security/SecurityConfig.java:31` y `JwtAuthFilter.java:31-41`.

---

## 5. Integración técnica (1 min)

### Decir: la API está desplegada en local con MySQL en Docker

- Servicios Docker: `docker-compose.yml:1-34`.
  - MySQL 8.4: `:2-18`.
  - phpMyAdmin: `:20-31`.
  - Volumen persistente: `:12-13` y `:33-34`.
- Perfil MySQL por defecto: `src/main/resources/application.yaml:5-9`.
- Conexión JDBC: `src/main/resources/application-mysql.yaml:1-14`.
- Puerto del backend: `src/main/resources/application.yaml:15-16`.
- Alternativa sin Docker (H2): `src/main/resources/application-h2.yaml:1-15`.
- Datos iniciales (3 productos, 3 lotes, 3 lecturas y usuarios): `src/main/java/com/example/WebIntegrado/config/DatosIniciales.java:34-60`.

```yaml
# application-mysql.yaml:2-7
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/coldtrace?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: coldtrace
    password: coldtrace123
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### Decir: el frontend envía y recupera datos

- Proxy `/api` → `http://localhost:8080`: `frontend/proxy.conf.json:1-7`.
- Servicio HTTP: `frontend/src/app/core/services/coldtrace-api.service.ts:14-34`.
- Store que carga y comparte los datos: `frontend/src/app/core/services/coldtrace-store.service.ts:34-90`.

### Decir: las respuestas se ven en tablas, tarjetas y listas

- Tarjetas KPI del panel: `frontend/src/app/features/dashboard/dashboard.component.ts:23-44`.
- Tabla de últimos lotes: `frontend/src/app/features/dashboard/dashboard.component.ts:83-115`.
- Tabla de productos: `frontend/src/app/features/lots/lots.component.ts:258-305`.
- Tabla de lotes: `frontend/src/app/features/lots/lots.component.ts:307-355`.
- Tabla de despachos en tránsito: `frontend/src/app/features/logistics/logistics.component.ts:210-242`.
- Tabla de operaciones registradas: `frontend/src/app/features/logistics/logistics.component.ts:245-285`.

### Mostrar: despacho y recepción de un lote

- Formulario de despacho: `frontend/src/app/features/logistics/logistics.component.ts:33-130`.
- Método que registra el despacho (`POST`): `frontend/src/app/features/logistics/logistics.component.ts:336-381`.
- Formulario de recepción: `frontend/src/app/features/logistics/logistics.component.ts:132-205`.
- Método que registra la recepción (`PUT`): `frontend/src/app/features/logistics/logistics.component.ts:383-421`.
- La tabla “Despachos en tránsito” filtra por `EN_TRANSITO`: `frontend/src/app/features/logistics/logistics.component.ts:300-302`.
- El estado se pinta como “En tránsito” o “Recepcionado”: `frontend/src/app/features/logistics/logistics.component.ts:270-275`.
- Mensaje de éxito del cambio de estado: `frontend/src/app/features/logistics/logistics.component.ts:401-405`.

**Backend:**
- `POST /api/operaciones`: `src/main/java/com/example/WebIntegrado/controller/OperacionController.java:54-59`.
- `PUT /api/operaciones/{id}/recepcion`: `src/main/java/com/example/WebIntegrado/controller/OperacionController.java:61-66`.
- El despacho nace `EN_TRANSITO`: `src/main/java/com/example/WebIntegrado/service/OperacionService.java:38-45`.
- La recepción valida el estado y lo pasa a `RECEPCIONADO`: `src/main/java/com/example/WebIntegrado/service/OperacionService.java:47-72`.

```java
// OperacionService.java:51-55
if (!"EN_TRANSITO".equals(operacion.getEstado())) {
    throw new IllegalStateException("El despacho " + operacion.getManifiesto() + " ya fue recepcionado");
}

operacion.setEstado("RECEPCIONADO");
```

### Aclaración útil: la telemetría de tránsito se simula en el cliente

**Dilo tú antes de que pregunten.**

- Timer de simulación: `frontend/src/app/features/traceability/trace-report.component.ts:243` (cada 2000 ms).
- Arranque y limpieza del timer: `frontend/src/app/features/traceability/trace-report.component.ts:234-248`.
- Lógica de simulación (ruido, reversión a la media y picos): `frontend/src/app/features/traceability/trace-report.component.ts:271-312`.
- Pico aleatorio: `:289-291`.
- Lecturas “en vivo” que se agregan solo en memoria: `:303-311`.
- Selección automática del primer lote en tránsito: `:234-241`.

```ts
// trace-report.component.ts:243
this.simulacion = setInterval(() => this.avanzarSimulacion(), 2000);
```

---

## 6. Pruebas y documentación (1 min)

### Decir: hay pruebas de navegador con Playwright

- Configuración: `frontend/playwright.config.ts:1-31`.
  - Directorio de pruebas: `:11`.
  - Arranque automático del frontend: `:25-30`.
- Script `npm run e2e`: `frontend/package.json:10`.
- **6 pruebas funcionales** en `frontend/e2e/coldtrace.spec.ts`:
  1. Login ADMIN → panel: `:41`.
  2. Credenciales inválidas: `:61`.
  3. Validaciones de formulario: `:71`.
  4. CRUD completo + detalle: `:95`.
  5. Despacho logístico: `:147`.
  6. Rol GUEST: `:168`.
- **1 prueba adicional de capturas** (trazabilidad y recepción): `frontend/e2e/capturas-informe.spec.ts:33-75`.

> **Precisión:** `npm run e2e` ejecuta **7 tests** (6 funcionales + 1 de capturas). Si quieres sostener “6 de 6”, ejecuta solo el archivo funcional:
> `npx playwright test e2e/coldtrace.spec.ts`
> o di: “6 pruebas funcionales, más 1 prueba de capturas”.

### Decir: hay pruebas de backend con JUnit (5 de 5)

| Test | Archivo | Línea |
|---|---|---|
| Registra producto válido | `src/test/java/com/example/WebIntegrado/service/ProductoServiceTest.java` | `:25-34` |
| Rechaza rango de temperatura inválido | `src/test/java/com/example/WebIntegrado/service/ProductoServiceTest.java` | `:36-41` |
| Registra operación y asigna fecha | `src/test/java/com/example/WebIntegrado/service/OperacionServiceTest.java` | `:27-38` |
| Lista productos con 200 OK | `src/test/java/com/example/WebIntegrado/controller/ProductoControllerTest.java` | `:34-41` |
| Carga el contexto con perfil H2 | `src/test/java/com/example/WebIntegrado/WebIntegradoApplicationTests.java` | `:11-13` |

Comando: `.\mvnw.cmd test`

### Decir: el informe técnico con capturas

- PDF: `docs/reporte/Informe-Tecnico-ColdTrace.pdf`.
- HTML fuente del informe: `docs/reporte/informe.html`.
- Informe de cumplimiento de requerimientos: `docs/INFORME-AVANCE.md`.
- Índice y explicación de capturas: `docs/evidencias/README.md`.
- Capturas generadas: `docs/evidencias/01-login.png` … `docs/evidencias/12-recepcion.png`.
- Guion de exposición por requerimiento: `docs/INFORME-EXPOSICION.md`.

### Decir: el repositorio en GitHub

- URL declarada en el README: `README.md:6`.
- Repositorio: <https://github.com/MrFenix27/ProyectoIntegradorWeb>

### Mostrar: resultado de `npm run e2e`

```powershell
cd proyectointegradorfabiano\frontend
npm run e2e
```

- Script: `frontend/package.json:10`.
- Reporte HTML: `frontend/playwright-report/index.html`.
- Abrir el reporte: `npm run e2e:report` (`frontend/package.json:11`).
- Requisito previo: backend corriendo en `http://localhost:8080` (`frontend/playwright.config.ts:25-30`).

---

## Ajustes de precisión para la exposición

Estos cuatro puntos evitan afirmaciones que el código no respalda al 100 %:

1. **“6 rutas con guardas”** → son 6 rutas de componente y 5 protegidas; `/login` es pública.
2. **“Sin token aparece el error”** → sin token el guard redirige a `/login`; el mensaje visible aparece con credenciales inválidas.
3. **“Eliminar producto con lotes da 409”** → ya es correcto: `ProductoService.eliminar` valida los lotes y `GlobalExceptionHandler` responde 409.
4. **“Playwright 6 de 6”** → son 6 pruebas funcionales y 1 de capturas; `npm run e2e` corre 7. Para mostrar exactamente 6, ejecuta `npx playwright test e2e/coldtrace.spec.ts`.

---

## Comandos de arranque para la demo

```powershell
# 1) Base de datos
cd proyectointegradorfabiano
docker compose up -d

# 2) Backend (terminal 1)
.\mvnw.cmd spring-boot:run

# 3) Frontend (terminal 2)
cd frontend
npm start

# 4) Pruebas backend
cd ..
.\mvnw.cmd test

# 5) Pruebas E2E (con backend corriendo)
cd frontend
npm run e2e
```
