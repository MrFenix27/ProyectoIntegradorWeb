# Guion de exposición — rutas donde debes estar

> El texto del guion se mantiene tal cual. Solo se agregaron las rutas de la aplicación para ubicarte durante la demo.

---

## 1. Interfaz Angular (1,5 min)

**Ruta donde debes estar:** `/dashboard`

Decir: hay componentes para lista, formulario y detalle. El enrutamiento tiene 6 rutas con guardas. Los estilos están en SASS, con tokens, mixins y parciales, y el diseño es responsivo.

Mostrar: navega por Panel, Lotes, Logística y Trazabilidad. Entra al detalle de un producto, que usa la ruta /productos/:id.

**Rutas de la demo:** `/dashboard` → `/lotes` → `/logistica` → `/trazabilidad` → `/productos/1`

Pregunta probable: ¿cómo pasas datos entre vistas? Se lee el parámetro de la URL con ActivatedRoute y el estado compartido está en signals.

**Ruta para responder:** `/productos/1` (detalle del producto)

---

## 2. Formularios (2 min)

**Ruta donde debes estar:** `/lotes`

Decir: son formularios reactivos que sirven para registrar y para editar, porque el mismo formulario se reutiliza. Tienen validaciones de campos requeridos, de formato (el código de lote con patrón) y de longitud, y una validación cruzada: la temperatura máxima debe ser mayor que la mínima.

Mostrar: deja el nombre vacío y pon una temperatura máxima menor que la mínima, para que salgan los dos errores a la vez. Muestra que el botón queda deshabilitado.

**Ruta de la demo:** `/lotes` (formulario “Registrar producto”)

Pregunta probable: ¿por qué validar también en el servidor? Porque una petición enviada directo a la API se saltaría la interfaz.

**Ruta para responder:** `/lotes` (mismo formulario)

---

## 3. Consumo de servicios REST (2 min)

**Ruta donde debes estar:** `/lotes`

Decir: todo pasa por HttpClient. Un interceptor agrega el token a cada petición. Se usan los cuatro métodos: GET (listar y consultar), POST (crear producto o despacho), PUT (editar producto, recibir despacho) y DELETE (eliminar).

Mostrar: crea un producto (POST), edítalo (PUT) y elimínalo (DELETE). Si puedes, abre la pestaña Red del navegador y señala el encabezado Authorization: Bearer.

**Rutas de la demo:** `/lotes` (productos: POST, PUT y DELETE) · `/logistica` (si muestras el POST de despacho)

Pregunta probable: ¿qué pasa si eliminas un producto que tiene lotes? La API responde 409 y la interfaz muestra un mensaje claro.

**Ruta para responder:** `/lotes` (con sesión ADMIN, intentando eliminar el producto)

---

## 4. Autenticación y autorización (2 min)

**Ruta donde debes estar:** `/login`

Decir: el login es un formulario en Angular. El token JWT se guarda en localStorage junto con el rol, y se usa en cada petición. La redirección depende del rol: admin y user van al panel, guest va a /lotes.

Mostrar: entra como admin, y luego como guest para que se vea que solo puede consultar. Muestra también que sin token, o con credenciales malas, aparece el error.

**Rutas de la demo:** `/login` → `/dashboard` (admin) → `/login` → `/lotes` (guest) · credenciales malas: `/login`

Pregunta probable: ¿es seguro guardar el token en localStorage? Responde con honestidad: es práctico para un avance, pero en producción convendría usar cookies HttpOnly y HTTPS.

**Ruta para responder:** `/login` o `/lotes` (según la sesión que esté abierta)

---

## 5. Integración técnica (1 min)

**Ruta donde debes estar:** `/logistica`

Decir: la API está desplegada en local con MySQL en Docker. El frontend envía y recupera datos, y las respuestas se ven en tablas, tarjetas y listas.

Mostrar: el despacho y la recepción de un lote. El despacho aparece en la tabla “en tránsito” y pasa a “recepcionado”.

**Rutas de la demo:** `/logistica` (despacho y recepción) → `/trazabilidad` (telemetría)

Aclaración útil: la telemetría de tránsito se simula en el cliente. Dilo tú antes de que pregunten.

**Ruta para la aclaración:** `/trazabilidad`

---

## 6. Pruebas y documentación (1 min)

**Ruta donde debes estar:** fuera de la app; abre el informe y la terminal.

Decir: hay pruebas de navegador con Playwright (6 de 6 correctas), pruebas de backend con JUnit (5 de 5), el informe técnico con las capturas y el repositorio en GitHub.

Mostrar: el informe y, si puedes, el resultado de npm run e2e.

**Rutas de la demo:**

- Informe: `docs/reporte/Informe-Tecnico-ColdTrace.pdf`
- Capturas: `docs/evidencias/`
- Terminal para Playwright: `proyectointegradorfabiano/frontend` → `npm run e2e`

---

## Cierre (1 min). Cuenta 2 problemas de integración resueltos, porque la consigna pide explicarlos:

**Ruta donde debes estar:** `/dashboard` → `/lotes`

La interfaz mostraba 0 aunque la API respondía bien, porque Angular no usa Zone.js; se resolvió con signals.

**Ruta donde debes estar:** `/login` → `/lotes` (como guest)

El rol guest recibía 403 y el frontend reintentaba sin fin, por reglas de seguridad inconsistentes; se alinearon y se limitó el reintento.
