# Despliegue en la nube — ColdTrace

## Estado actual del despliegue

| Componente | URL / dato |
|---|---|
| Backend (Render) | `https://coldtrace-api-k6sn.onrender.com` |
| Frontend (Vercel) | `https://coldtrace-one.vercel.app` |
| Base de datos (Supabase) | `us-east-1` · project ref `unbovhkzidhzcurjshxe` · **Session Pooler `aws-1-us-east-1`** |
| Health check | `https://coldtrace-api-k6sn.onrender.com/actuator/health` |

> El shard del pooler de Supabase puede ser `aws-0` o `aws-1` según el proyecto.
> Este proyecto usa `aws-1-us-east-1.pooler.supabase.com`; con `aws-0` el pooler
> responde `FATAL: (ENOTFOUND) tenant/user ... not found`.

Arquitectura final:

```
Vercel (Angular 22)  ──HTTPS/CORS──▶  Render (Spring Boot 4, Docker)  ──JDBC/SSL──▶  Supabase (PostgreSQL)
```

Orden obligatorio: **Supabase → Render → Vercel → (ajustar FRONTEND_URL en Render)**.

---

## 0. Requisitos previos

- Cuenta en [Supabase](https://supabase.com), [Render](https://render.com) y [Vercel](https://vercel.com).
- Repositorio GitHub con este proyecto: <https://github.com/MrFenix27/ProyectoIntegradorWeb>
- El backend vive en `proyectointegradorfabiano/` y el frontend en `proyectointegradorfabiano/frontend/`.

---

## 1. Supabase (base de datos)

1. Dashboard → **New project**. Guarda la **región** y el **project ref**.
2. **Settings → Database → Database password**: define una contraseña segura
   (o usa la generada). No la subas al repo.
3. **Connect → Session pooler** y copia el host. La cadena JDBC es:

```
jdbc:postgresql://aws-<0|1>-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require
```

- Usuario: `postgres.<PROJECT_REF>`
- Password: la del paso 2.

> ✅ **Session pooler** (IPv4, soporta prepared statements).
> ❌ Conexión directa `db.<ref>.supabase.co` (solo IPv6: Render no llega).
> ❌ Transaction pooler puerto 6543 (no soporta prepared statements).

4. **Esquema y datos**: dos opciones
   - **A (recomendada)**: no hagas nada. Al arrancar, Hibernate
     (`ddl-auto: update`) crea las tablas y `DatosIniciales` inserta la demo.
   - **B**: ejecutar en el **SQL Editor**, en orden, `supabase/01_schema.sql`
     y `supabase/02_seed.sql` (ver `supabase/README.md`).

---

## 2. Render (backend)

1. **New → Blueprint** (detecta `render.yaml` en la raíz del repo) o
   **New → Web Service** con:
   - Runtime: **Docker**
   - Root Directory: `proyectointegradorfabiano`
   - Dockerfile Path: `./Dockerfile`
   - Health Check Path: `/actuator/health`
   - Plan: **Free**
2. Variables de entorno (Environment → Add Environment Variable):

| Variable | Valor |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-<0|1>-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | `postgres.<PROJECT_REF>` |
| `SPRING_DATASOURCE_PASSWORD` | *(password de Supabase)* |
| `JWT_SECRET` | cadena aleatoria ≥ 32 caracteres (`openssl rand -base64 48`) |
| `FRONTEND_URL` | `https://<tu-app>.vercel.app` (se completa en el paso 3) |
| `ALLOW_VERCEL_PREVIEWS` | `true` (opcional) |
| `DB_POOL_MAX` | `5` |
| `JAVA_TOOL_OPTIONS` | `-XX:MaxRAMPercentage=75 -XX:+UseSerialGC` |

> `PORT` lo inyecta Render automáticamente; la app lo lee con `${PORT:8080}`.

3. Deploy → esperar `Live`. Verificar:

```bash
curl https://<servicio>.onrender.com/actuator/health
# {"status":"UP","groups":["liveness","readiness"]}
```

> Plan Free: el servicio se duerme a los 15 min sin tráfico y tarda ~50 s
> en despertar. Ábrelo antes de una demo.

---

## 3. Vercel (frontend)

1. **Add New → Project** → importar el repo de GitHub.
2. Configuración:
   - **Root Directory**: `proyectointegradorfabiano/frontend`
   - Framework Preset: **Angular** (se detecta solo)
   - Build Command: `npm run build`
   - Output Directory: `dist/frontend/browser`
3. Antes del deploy, edita `src/environments/environment.prod.ts` con la URL
   real de Render (sin barra final). Si el subdominio es distinto de
   `coldtrace-api`, haz el cambio y haz commit.
4. Deploy → copia el dominio (`https://<tu-app>.vercel.app`).
5. Vuelve a **Render → Environment** y actualiza `FRONTEND_URL` con ese dominio
   → **Save** (Render redeploya solo).

---

## 4. Variables por plataforma (resumen)

| Plataforma | Variables |
|---|---|
| Supabase | ninguna (solo credenciales que se copian a Render) |
| Render | `SPRING_PROFILES_ACTIVE`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, `ALLOW_VERCEL_PREVIEWS`, `DB_POOL_MAX`, `JAVA_TOOL_OPTIONS` |
| Vercel | ninguna (la URL de la API está en `environment.prod.ts`) |

---

## 5. Checklist post-despliegue

Antes de una demo, ejecuta la verificación automática (despierta Render y valida
health, login, datos, SPA y CORS):

```powershell
.\produccion.cmd
```

Salida esperada: seis líneas `[ OK ]` y `Todo listo: Render + Supabase + Vercel responden.`
El script abre el frontend al terminar; usa `-NoBrowser` para no abrirlo.

Verificación manual:

- [ ] `GET https://<render>/actuator/health` → `200` y `"status":"UP"`.
- [ ] `GET https://<render>/` → JSON de bienvenida.
- [ ] `POST https://<render>/api/auth/login` con `admin/admin123` → `200` + `token`.
- [ ] `GET https://<render>/api/productos` con `Authorization: Bearer <token>` → 3 productos.
- [ ] Login en Vercel con `admin/admin123` → entra al dashboard.
- [ ] CRUD: crear, editar y eliminar un producto.
- [ ] Rol `guest` (`guest/guest123`) → solo lectura (sin botones de escritura).
- [ ] Recargar `https://<vercel>/lotes` y `https://<vercel>/dashboard` → no da 404.
- [ ] DevTools → Network: las llamadas van a `https://<render>/api/...` y **no** hay errores CORS.
- [ ] Persistencia: crear un producto y recargar la página (sigue ahí).
- [ ] Reiniciar el servicio en Render → los datos siguen en Supabase.

---

## 6. Pruebas locales de esta configuración

```bash
# Backend
cd proyectointegradorfabiano
./mvnw.cmd -B -DskipTests package
./mvnw.cmd -B test                 # 10 tests, perfil h2

# Frontend (producción)
cd frontend
npm run build                      # genera dist/frontend/browser

# Imagen Docker
docker build -t coldtrace-api:local .
docker run --rm -p 8081:8080 -e SPRING_PROFILES_ACTIVE=h2 coldtrace-api:local
curl http://localhost:8081/actuator/health
```

---

## 7. Problemas típicos

| Síntoma | Causa | Solución |
|---|---|---|
| `UnknownHostException: db.<ref>.supabase.co` | conexión directa IPv6 | usar Session pooler |
| `FATAL: (ENOTFOUND) tenant/user postgres.<ref> not found` | shard del pooler equivocado (`aws-0` vs `aws-1`) | copiar el host exacto de Connect → Session pooler y probar el otro shard |
| `FATAL: password authentication failed` | usuario sin `.<PROJECT_REF>` | usuario `postgres.<ref>` |
| `too many connections` | pool grande en free tier | `DB_POOL_MAX=5` |
| CORS bloqueado en el navegador | `FRONTEND_URL` desactualizado | actualizar y redeploy |
| 404 al recargar `/lotes` | rewrite SPA | revisar `vercel.json` |
| 502 en el primer request | cold start de Render Free | esperar ~50 s |
| `JWT_SECRET` inválido al arrancar | secreto vacío o < 32 caracteres | generar uno nuevo |
