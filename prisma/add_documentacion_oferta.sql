-- Agrega URL de documentación técnica opcional (PDF) a las ofertas
ALTER TABLE ofertas
  ADD COLUMN IF NOT EXISTS documentacion_url TEXT;
