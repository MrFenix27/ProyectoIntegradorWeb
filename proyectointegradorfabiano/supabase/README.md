# Supabase — ColdTrace

## Opción A (recomendada): dejar que el backend cree todo

No ejecutes nada. Con `SPRING_PROFILES_ACTIVE=prod`:

1. Hibernate (`ddl-auto: update`) crea las tablas en el esquema `public`.
2. `config/DatosIniciales.java` inserta usuarios, productos, lotes,
   temperaturas y operaciones de demo (es idempotente: valida `count()`).

## Opción B: ejecutar los scripts manualmente

En **Supabase Dashboard → SQL Editor**, en este orden:

1. `01_schema.sql` — crea las 6 tablas e índices (idempotente).
2. `02_seed.sql` — carga los datos de demo (no duplica registros).

Si ejecutas `02_seed.sql` antes del primer arranque del backend, `DatosIniciales`
no volverá a insertar nada porque detecta que ya hay datos.

## Cadena de conexión para Render

Supabase Dashboard → **Connect** → **Session pooler**:

```
jdbc:postgresql://aws-0-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require
```

- **Usuario:** `postgres.<PROJECT_REF>` (el pooler lo exige así).
- **Password:** la del proyecto (Settings → Database → Database password).
- No uses la conexión "Direct" (`db.<ref>.supabase.co`): en proyectos nuevos
  resuelve solo a IPv6 y Render no tiene salida IPv6.
- No uses el Transaction pooler (puerto 6543): no soporta prepared statements.

## Verificación rápida

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

SELECT username, rol FROM usuario;
SELECT COUNT(*) FROM producto;
```
