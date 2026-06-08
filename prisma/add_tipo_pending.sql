-- Agrega el campo tipo para distinguir el origen de la fila:
--   'invitacion' → el admin invitó al estudiante
--   'solicitud'  → el estudiante pidió acceso por su cuenta
ALTER TABLE pending_verifications
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'invitacion'
  CHECK (tipo IN ('invitacion', 'solicitud'));
