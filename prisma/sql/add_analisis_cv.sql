-- Agrega columnas de analisis IA al CV del estudiante.
-- Aplicar: npx prisma db execute --file prisma/sql/add_analisis_cv.sql --schema prisma/schema.prisma

ALTER TABLE public.curriculums
  ADD COLUMN IF NOT EXISTS ultimo_analisis JSONB,
  ADD COLUMN IF NOT EXISTS fecha_analisis  TIMESTAMPTZ;
