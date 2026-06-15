-- Columna JSONB para guardar las preferencias del empresario (notificaciones y privacidad).
-- Aplicar en Supabase: SQL Editor → New query → pegar y ejecutar.

ALTER TABLE perfiles_empresario
  ADD COLUMN IF NOT EXISTS preferencias JSONB;
