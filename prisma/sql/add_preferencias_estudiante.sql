-- Preferencias del estudiante (empleabilidad, notificaciones, privacidad) en un
-- único JSON, espejando el patrón de perfiles_empresario.preferencias.
-- Aditiva y nullable: no rompe cuentas existentes.

ALTER TABLE perfiles_estudiante
  ADD COLUMN IF NOT EXISTS preferencias jsonb;
