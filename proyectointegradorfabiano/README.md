# ColdTrace — Monitoreo de cadena de frío

Proyecto integrador full stack: **Spring Boot 4.1.1 + MySQL 8.4** en el backend y
**Angular 22** en el frontend, con autenticación JWT y control de roles.

**Repositorio:** <https://github.com/MrFenix27/ProyectoIntegradorWeb>

## Estructura general

```
proyectointegradorfabiano/
├── src/main/java/...        API REST Spring Boot (controllers, services, security)
├── src/test/java/...        pruebas JUnit + Mockito
├── frontend/                Angular 22 organizado por módulos (core / shared / features)
├── docs/                    informes, evidencias y reporte en PDF
└── docker-compose.yml       MySQL 8.4 + phpMyAdmin
```

El detalle de la organización del frontend (módulos, rutas, servicios y estilos) está en
[`frontend/README.md`](frontend/README.md).

## Requisitos

- JDK 21
- Node.js 20+
- Docker Desktop (para MySQL) — o usar el perfil `h2` sin Docker

## Arranque rápido

### Opción 1: un solo comando (recomendado)

```powershell
# Todo en uno: base de datos + backend + frontend
.\start.cmd

# Con MySQL persistente (levanta docker compose)
.\start.cmd -Db mysql

# Detener todo
.\stop.ps1
```

`start.ps1` (o `start.cmd` para doble clic) abre una ventana por servicio, espera a que el
backend y el frontend respondan y abre el navegador. Sin argumentos usa H2 en memoria
(no requiere Docker); con `-Db mysql` levanta MySQL y usa el perfil persistente.
Otros parámetros: `-NoBackend`, `-NoFrontend`, `-NoBrowser`.

### Opción 2: manual

```powershell
# 1) Base de datos MySQL + phpMyAdmin
docker compose up -d

# 2) Backend en http://localhost:8080
.\mvnw.cmd spring-boot:run

# 3) Frontend en http://localhost:4200 (otra terminal)
cd frontend
npm install
npm start
```

- Aplicación: `http://localhost:4200/login`
- API: `http://localhost:8080/api`
- phpMyAdmin: `http://localhost:8081` (servidor `mysql`, usuario `coldtrace`, clave `coldtrace123`)
- Consola H2: solo con perfil `h2`

## Usuarios de prueba

| Usuario | Clave | Rol | Permisos |
|---|---|---|---|
| `admin` | `admin123` | ADMIN | Lectura, alta, edición y eliminación |
| `user` | `user123` | USER | Lectura, alta y edición |
| `guest` | `guest123` | GUEST | Solo lectura |

## Base de datos

| Perfil | Cuándo se usa | Configuración |
|---|---|---|
| `mysql` (por defecto) | Arranque normal, demo y exposición | `application-mysql.yaml` · `jdbc:mysql://localhost:3306/coldtrace` · `ddl-auto: update` (los datos persisten) |
| `h2` | Sin Docker, pruebas rápidas | `application-h2.yaml` · `jdbc:h2:mem:coldtrace` · `ddl-auto: create-drop` (se borra al detener) |

```powershell
# Forzar H2 (sin MySQL)
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

# Reiniciar la base de datos desde cero (borra el volumen)
docker compose down -v
docker compose up -d
```

Los datos iniciales (3 productos, 3 lotes, 3 lecturas, 3 operaciones y los
usuarios de prueba) los inserta `config/DatosIniciales.java` **solo si la tabla
`producto` está vacía**, por lo que se conservan entre reinicios con MySQL.

## Pruebas

```powershell
# Backend: 5 tests (usan H2, no requieren MySQL)
.\mvnw.cmd test

# Frontend: build de producción
cd frontend
npm run build

# Frontend: 6 pruebas de navegador + capturas en docs/evidencias
npm run e2e
```

Las pruebas E2E requieren el backend corriendo (`http://localhost:8080`).

## Documentación

- [`docs/INFORME-AVANCE.md`](docs/INFORME-AVANCE.md) — cumplimiento de requerimientos
- [`docs/INFORME-EXPOSICION.md`](docs/INFORME-EXPOSICION.md) — guion de exposición por requerimiento
- [`docs/reporte/Guion-Exposicion-ColdTrace.pdf`](docs/reporte/Guion-Exposicion-ColdTrace.pdf) — guion visual con rutas, líneas y capturas por sección
- [`docs/evidencias/README.md`](docs/evidencias/README.md) — capturas y cómo reproducirlas
- [`frontend/README.md`](frontend/README.md) — arquitectura del frontend, SASS y formularios

## Informe técnico en PDF

El informe (portada, índice, capturas, consumo de API, validaciones y problemas de integración)
se regenera desde el HTML con las capturas actuales:

```powershell
cd frontend
npm run pdf
```

Genera `Informe-Tecnico-ColdTrace.pdf` en el escritorio y una copia en `docs/reporte/`.
