# Evidencias de funcionamiento — ColdTrace

Capturas generadas automáticamente por las pruebas de navegador (Playwright) el
**13-nov-2026**, ejecutando el backend en `http://localhost:8080` y el frontend en
`http://localhost:4200`.

Las imágenes se regeneran en cada ejecución de `npm run e2e` (carpeta `frontend/`).

| Archivo | Qué demuestra | Requisito |
|---|---|---|
| `01-login.png` | Formulario de login de Angular a pantalla completa, con validaciones y usuarios de prueba | 4.1 |
| `02-dashboard-admin.png` | Tras autenticarse, el ADMIN es redirigido al panel; los KPIs y tablas muestran datos reales de la API (3 lotes, 3 lecturas, 1 excursión térmica) | 5.2, 5.3 |
| `03-login-error.png` | Mensaje de error ante credenciales inválidas (respuesta 401 de la API) | 2.3, 4.1 |
| `04-validaciones-formulario.png` | Validaciones reactivas por campo: obligatorio, longitud mínima y rango térmico (máx > mín) | 2.1, 2.2, 2.3 |
| `05-alta-producto.png` | `POST /api/productos` desde el formulario y mensaje de éxito con el ID creado | 3.3, 5.2 |
| `06-detalle-producto.png` | Vista de detalle en la ruta `/productos/1` (`GET /api/productos/1`) con los lotes y lecturas asociados | 1.1, 3.3 |
| `07-edicion-producto.png` | `PUT /api/productos/{id}` y mensaje de actualización correcta | 3.3 |
| `08-eliminacion-producto.png` | `DELETE /api/productos/{id}` con confirmación y mensaje de eliminación | 3.3 |
| `09-despacho-logistico.png` | `POST /api/operaciones` y despliegue del registro en la tabla de despachos en tránsito | 5.3 |
| `10-rol-guest-solo-lectura.png` | Usuario GUEST redirigido a `/lotes`, sin formularios de escritura ni módulo de logística | 4.3 |
| `11-trazabilidad.png` | Reporte de trazabilidad con línea de recorrido, telemetría en vivo y ficha del lote | 1.1, 5.3 |
| `12-recepcion.png` | `PUT /api/operaciones/{id}/recepcion`: el despacho pasa de “En tránsito” a “Recepcionado” con su auditoría | 3.3, 5.3 |
| `13-reporte-playwright.png` | Reporte HTML de Playwright con las 6 pruebas funcionales y la prueba de capturas aprobadas | 6.1, 6.2 |
| `14-informe-tecnico.png` | Portada del informe técnico en PDF, con la identificación del proyecto y el stack | 6.1, 6.2 |

## Cómo reproducirlas

```powershell
# 1) Backend (puerto 8080) — datos sembrados en H2
cd proyectointegradorfabiano
.\mvnw.cmd spring-boot:run

# 2) En otra terminal: pruebas de navegador + capturas
cd proyectointegradorfabiano\frontend
npm run e2e
```

Playwright levanta el frontend automáticamente (`npm start` con `proxy.conf.json`).
El reporte HTML queda en `frontend/playwright-report/` (`npm run e2e:report`).

## Usuarios de prueba

| Usuario | Clave | Rol | Permisos |
|---|---|---|---|
| `admin` | `admin123` | ADMIN | Lectura, alta, edición y eliminación |
| `user` | `user123` | USER | Lectura, alta y edición |
| `guest` | `guest123` | GUEST | Solo lectura |
