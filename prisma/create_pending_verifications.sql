-- Tabla para gestionar solicitudes de acceso pendientes de aprobación admin
CREATE TABLE IF NOT EXISTS pending_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  email       VARCHAR(255) NOT NULL,
  pending     BOOLEAN NOT NULL DEFAULT true,
  solicitado  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resuelto    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pending_verifications_pending    ON pending_verifications(pending);
CREATE INDEX IF NOT EXISTS idx_pending_verifications_id_usuario ON pending_verifications(id_usuario);
