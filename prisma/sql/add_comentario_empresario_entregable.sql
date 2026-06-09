-- Comentario del empresario al solicitar cambios en un entregable (Página 14)
ALTER TABLE entregables
  ADD COLUMN IF NOT EXISTS comentario_empresario TEXT;
