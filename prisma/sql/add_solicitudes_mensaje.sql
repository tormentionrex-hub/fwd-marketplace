-- Solicitudes de mensaje empresario -> estudiante (gate previo al chat).
-- Aditivo y seguro de re-ejecutar (IF NOT EXISTS). Aplicar con:
--   npx prisma db execute --file prisma/sql/add_solicitudes_mensaje.sql --schema prisma/schema.prisma

CREATE TABLE IF NOT EXISTS solicitudes_mensaje (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresario uuid NOT NULL,
  id_estudiante uuid NOT NULL,
  id_proyecto   uuid,
  asunto        varchar(200) NOT NULL,
  mensaje       text NOT NULL,
  estado        varchar(20) NOT NULL DEFAULT 'pendiente',
  creado        timestamptz NOT NULL DEFAULT now(),
  actualizado   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_solicitudes_empresario FOREIGN KEY (id_empresario)
    REFERENCES perfiles_empresario (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_solicitudes_estudiante FOREIGN KEY (id_estudiante)
    REFERENCES perfiles_estudiante (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_solicitudes_proyecto FOREIGN KEY (id_proyecto)
    REFERENCES proyectos (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estudiante ON solicitudes_mensaje (id_estudiante);
CREATE INDEX IF NOT EXISTS idx_solicitudes_empresario ON solicitudes_mensaje (id_empresario);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_mensaje (estado);
