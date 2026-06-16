-- Tabla de historial de suspensiones y reactivaciones de cuentas.
-- Cada fila registra una acción (suspender/reactivar) con motivo y admin que la ejecutó.
-- Ejecutar en Supabase SQL Editor o via psql.

CREATE TABLE IF NOT EXISTS suspensiones (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario   UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  accion       VARCHAR(20)  NOT NULL, -- 'suspender' | 'reactivar'
  motivo       TEXT,
  id_admin     UUID         NOT NULL,
  nombre_admin VARCHAR(150) NOT NULL,
  creado       TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suspensiones_id_usuario ON suspensiones(id_usuario);
CREATE INDEX IF NOT EXISTS idx_suspensiones_accion ON suspensiones(accion);

-- Habilitar Row Level Security (si lo requiere tu proyecto Supabase)
-- ALTER TABLE suspensiones ENABLE ROW LEVEL SECURITY;
