-- Agrega reputacion a perfiles_empresario y crea la tabla evaluaciones_empresa
-- (calificaciones del estudiante hacia la empresa al cerrar un proyecto).
-- Aplicar en Supabase: SQL Editor → New query → pegar y ejecutar.

-- 1. Columna reputacion en perfiles_empresario
ALTER TABLE perfiles_empresario
  ADD COLUMN IF NOT EXISTS reputacion INTEGER NOT NULL DEFAULT 0;

-- 2. Tabla evaluaciones_empresa
CREATE TABLE IF NOT EXISTS evaluaciones_empresa (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proyecto   UUID        NOT NULL REFERENCES proyectos(id)                   ON DELETE CASCADE,
  id_estudiante UUID        NOT NULL REFERENCES perfiles_estudiante(id_usuario)  ON DELETE CASCADE,
  id_empresario UUID        NOT NULL REFERENCES perfiles_empresario(id_usuario)  ON DELETE CASCADE,
  puntuacion    INTEGER     NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario    TEXT,
  creado        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_ev_empresa_proyecto_estudiante UNIQUE (id_proyecto, id_estudiante)
);

CREATE INDEX IF NOT EXISTS idx_ev_empresa_id_empresario
  ON evaluaciones_empresa (id_empresario);
