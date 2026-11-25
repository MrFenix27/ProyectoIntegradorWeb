-- ============================================================================
-- ColdTrace - Datos iniciales (demo) para Supabase
-- ============================================================================
-- OPCIONAL. El backend ya siembra estos mismos datos de forma idempotente
-- mediante `config/DatosIniciales.java` en el primer arranque.
--
-- Usa este script solo si quieres los datos sin esperar al arranque del backend.
-- No se duplican: cada INSERT valida que el registro no exista.
--
-- Passwords de demo (BCrypt, coste 10):
--   admin / admin123  -> ADMIN
--   user  / user123   -> USER
--   guest / guest123  -> GUEST
-- ============================================================================

-- Usuarios -------------------------------------------------------------------
INSERT INTO usuario (username, password, rol)
VALUES
    ('admin', '$2a$10$w9hW3sIzZIzj5FRQV08cJePSRYS.UxqcuuiOil6YfOsctObFRceli', 'ADMIN'),
    ('user',  '$2a$10$I7HFVVLFRN44EUYIEQpDMeC5YLa6jlg5C1DARJ4YGYLnObHy40gcC', 'USER'),
    ('guest', '$2a$10$f.KHQ5nZtQ9ErgHC3Hg7Y.pgP7poAR/65TWibnXEoKc4vgWzO/jeC', 'GUEST')
ON CONFLICT (username) DO NOTHING;

-- Productos ------------------------------------------------------------------
INSERT INTO producto (nombre, tipo, temperatura_minima, temperatura_maxima, vida_util_dias)
SELECT v.nombre, v.tipo, v.tmin, v.tmax, v.vida
FROM (VALUES
    ('Vacuna Tipo A',      'Biologico',    2.0,   8.0,  90),
    ('Plasma Sanguineo',   'Hemoderivado', -40.0, -20.0, 180),
    ('Reactivos Quimicos', 'Reactivo',     2.0,   8.0,  60)
) AS v(nombre, tipo, tmin, tmax, vida)
WHERE NOT EXISTS (SELECT 1 FROM producto p WHERE p.nombre = v.nombre);

-- Lotes ----------------------------------------------------------------------
INSERT INTO lote (codigo, fecha_vencimiento, estado, producto_id)
SELECT l.codigo, l.vencimiento, l.estado, p.id
FROM (VALUES
    ('VAX-789',  DATE '2026-12-20', 'ACTIVO',     'Vacuna Tipo A'),
    ('PLSM-011', DATE '2027-01-15', 'ACTIVO',     'Plasma Sanguineo'),
    ('REAG-55',  DATE '2026-10-05', 'EN_RIESGO',  'Reactivos Quimicos')
) AS l(codigo, vencimiento, estado, producto)
JOIN producto p ON p.nombre = l.producto
WHERE NOT EXISTS (SELECT 1 FROM lote x WHERE x.codigo = l.codigo);

-- Registros de temperatura ---------------------------------------------------
INSERT INTO registro_temperatura (temperatura, fecha_registro, ubicacion, lote_id)
SELECT t.temp, NOW() - (t.minutos || ' minutes')::interval, t.ubicacion, lo.id
FROM (VALUES
    (2.4,   2, 'Almacen A',     'VAX-789'),
    (-30.2, 3, 'Camara Fria 2', 'PLSM-011'),
    (9.1,   1, 'Camion TR-04',  'REAG-55')
) AS t(temp, minutos, ubicacion, codigo)
JOIN lote lo ON lo.codigo = t.codigo
WHERE NOT EXISTS (
    SELECT 1 FROM registro_temperatura r
    WHERE r.lote_id = lo.id AND r.temperatura = t.temp
);

-- Operaciones logisticas -----------------------------------------------------
INSERT INTO operacion (manifiesto, transportista, tipo_producto, inspector,
                       firma, evidencia, fecha_registro, estado, lote_id)
SELECT o.manifiesto, o.transportista, o.tipo, o.inspector,
       NULL, NULL, NOW() - (o.horas || ' hours')::interval, o.estado, lo.id
FROM (VALUES
    ('MF-2026-001', 'ColdTrace Logistics', 'Despacho - Vacuna Tipo A',      'A. Torres', 3,  'RECEPCIONADO', NULL),
    ('MF-2026-002', 'ColdTrace Logistics', 'Recepcion - Plasma Sanguineo',  'Responsable de recepcion', 2, 'RECEPCIONADO', NULL),
    ('MF-2026-003', 'ColdTrace Logistics', 'Despacho - Reactivos Quimicos', 'M. Rios',   1,  'EN_TRANSITO',  'VAX-789')
) AS o(manifiesto, transportista, tipo, inspector, horas, estado, lote_codigo)
LEFT JOIN lote lo ON lo.codigo = o.lote_codigo
WHERE NOT EXISTS (SELECT 1 FROM operacion x WHERE x.manifiesto = o.manifiesto);

-- Puntos de control por operacion -------------------------------------------
INSERT INTO operacion_controles_confirmados (operacion_id, controles_confirmados)
SELECT o.id, c.control
FROM operacion o
JOIN (VALUES
    ('MF-2026-001', 'Pre-enfriamiento: Verificado'),
    ('MF-2026-001', 'Vehiculo: TRK-402'),
    ('MF-2026-001', 'Conductor: A. Torres'),
    ('MF-2026-001', 'Destino: Centro Norte'),
    ('MF-2026-002', 'Sellos intactos: true'),
    ('MF-2026-002', 'Sin danos: true'),
    ('MF-2026-002', 'Datalogger: Normal (sin alertas)'),
    ('MF-2026-002', 'Temperatura de llegada: -25.0 C'),
    ('MF-2026-003', 'Pre-enfriamiento: Verificado'),
    ('MF-2026-003', 'Vehiculo: TRK-118'),
    ('MF-2026-003', 'Conductor: M. Rios'),
    ('MF-2026-003', 'Destino: Centro Sur')
) AS c(manifiesto, control) ON c.manifiesto = o.manifiesto
WHERE NOT EXISTS (
    SELECT 1 FROM operacion_controles_confirmados cc
    WHERE cc.operacion_id = o.id AND cc.controles_confirmados = c.control
);
