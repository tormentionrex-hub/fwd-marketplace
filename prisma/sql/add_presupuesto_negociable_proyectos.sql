-- Presupuesto (moneda + mínimo + máximo) y bandera "negociable" para proyectos.
-- El presupuesto se muestra en el marketplace; negociable pinta un badge
-- (verde "Negociable" / rojo "No negociable"). Aplicar en Supabase.

ALTER TABLE public.proyectos
  ADD COLUMN IF NOT EXISTS presupuesto_min    numeric(12,2),
  ADD COLUMN IF NOT EXISTS presupuesto_max    numeric(12,2),
  ADD COLUMN IF NOT EXISTS presupuesto_moneda varchar(10) NOT NULL DEFAULT 'CRC',
  ADD COLUMN IF NOT EXISTS negociable         boolean     NOT NULL DEFAULT true;
