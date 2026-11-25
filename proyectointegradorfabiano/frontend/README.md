# ColdTrace — Frontend (Angular 22)

Aplicación de monitoreo de cadena de frío. Consume la API REST de Spring Boot
(`../src/main/java`) mediante `HttpClient` y JWT.

## Requisitos

- Node.js 20+
- Backend Spring Boot corriendo en `http://localhost:8080`

## Puesta en marcha

```powershell
npm install
npm start        # ng serve en http://localhost:4200 con proxy hacia el backend
```

`proxy.conf.json` redirige `/api` a `http://localhost:8080`, por lo que el
navegador nunca llama a otro origen y no hay problemas de CORS en desarrollo.

## Scripts

| Script | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Build de producción en `dist/frontend` |
| `npm run e2e` | Pruebas de navegador Playwright + capturas en `../docs/evidencias` |
| `npm run e2e:report` | Abre el reporte HTML de la última ejecución |
| `npm run guion` | Genera el guion de exposición con capturas en `docs/reporte/Guion-Exposicion-ColdTrace.pdf` |
| `npm test` | Pruebas unitarias (Vitest) |

## Estructura por módulos

El proyecto usa **componentes standalone** (Angular 22) y se organiza por módulos de
funcionalidad. Cada módulo vive en `features/`, declara sus propias rutas en
`<modulo>.routes.ts` y solo se compone en `app.routes.ts`:

```
src/
├── styles.scss                  # entrada de estilos globales (SASS)
├── styles/
│   ├── _tokens.scss             # variables, mixins y breakpoint responsivo
│   ├── _shell.scss              # sidebar, topbar, layout
│   ├── _components.scss         # paneles, tablas, formularios, badges
│   └── _login.scss              # pantalla de login
└── app/
    ├── app.ts / app.html / app.scss   # componente raíz (shell)
    ├── app.config.ts                  # providers: router, HTTP + interceptor
    ├── app.routes.ts                  # compone las rutas de cada módulo
    │
    ├── core/                          # lógica transversal (singleton)
    │   ├── guards/auth.guard.ts       # authGuard + roleGuard
    │   ├── interceptors/auth.interceptor.ts
    │   └── services/
    │       ├── auth.service.ts        # login, sesión, rol y ruta inicial
    │       ├── coldtrace-api.service.ts   # GET/POST/PUT/DELETE de la API
    │       ├── coldtrace-store.service.ts # estado global con signals
    │       └── ui-state.service.ts        # búsqueda global
    │
    ├── shared/
    │   └── models/
    │       ├── domain.models.ts       # Producto, Lote, Temperatura, Operación…
    │       └── auth.models.ts         # AuthResponse, Rol
    │
    └── features/
        ├── auth/           login.component.ts + auth.routes.ts
        ├── dashboard/      dashboard.component.ts + dashboard.routes.ts
        ├── lots/           lots.component.ts, producto-detalle.component.ts + lots.routes.ts
        ├── logistics/      logistics.component.ts + logistics.routes.ts
        └── traceability/   trace-report.component.ts + traceability.routes.ts
```

**Criterio de organización**

| Carpeta | Contenido | Regla |
|---|---|---|
| `core/` | Servicios singleton, guardas e interceptores | Sin componentes de UI; se inyectan en toda la app |
| `shared/` | Modelos e interfaces del dominio | Sin dependencias de Angular |
| `features/<módulo>/` | Componentes + rutas del módulo | Cada módulo es autocontenido y se registra en `app.routes.ts` |

Agregar un módulo nuevo implica crear `features/<nombre>/` con su componente y su
`<nombre>.routes.ts`, y añadir el spread de sus rutas en `app.routes.ts`. No se
modifica ningún otro módulo.

## Estilos con SASS

Los estilos se escriben en SCSS y se compilan con la dependencia `sass`.
Los tokens (`_tokens.scss`) definen la paleta, tipografía, radios y el mixin
`mobile` usado para el diseño responsivo:

```scss
@use 'tokens' as t;

.card {
  @include t.card;

  &__title {
    color: t.$primary;
  }
}
```

## Formularios

Todos los formularios usan `ReactiveFormsModule`:

- `login.component.ts`: usuario y contraseña.
- `lots.component.ts`: producto (con validación cruzada de rango térmico), lote y lectura de temperatura.
- `logistics.component.ts`: despacho y recepción.

Las validaciones muestran un mensaje por campo (`.field-error`) además del
mensaje general de la operación (`.form-message`).

## Change detection

Angular 22 corre sin Zone.js. El estado compartido se expone con **signals**
(`ColdtraceStoreService`) y cada vista usa `computed`/`signal`, de modo que las
respuestas HTTP refrescan la interfaz automáticamente.

## Pruebas de navegador

```powershell
# Terminal 1
cd ..
.\mvnw.cmd spring-boot:run

# Terminal 2
npm run e2e
```

Las pruebas cubren login, login inválido, validaciones, CRUD completo de
productos, registro de despacho y comportamiento del rol GUEST. Las capturas
quedan en `../docs/evidencias/`.

## Usuarios de prueba

| Usuario | Clave | Rol | Alcance |
|---|---|---|---|
| `admin` | `admin123` | ADMIN | CRUD completo |
| `user` | `user123` | USER | Lectura, alta y edición |
| `guest` | `guest123` | GUEST | Solo lectura |
