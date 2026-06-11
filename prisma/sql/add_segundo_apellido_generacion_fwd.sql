-- Añade segundo apellido al perfil base del usuario y la generación FWD al
-- perfil del estudiante. Ambas columnas son nullable para no romper filas
-- existentes; el form les exige valor (generacion_fwd) o las deja opcionales
-- (segundo_apellido).
--
-- Aplicar en Supabase:
--   npx prisma db execute --file prisma/sql/add_segundo_apellido_generacion_fwd.sql --schema prisma/schema.prisma

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(150);

ALTER TABLE public.perfiles_estudiante
  ADD COLUMN IF NOT EXISTS generacion_fwd INTEGER;

-- Restricción: si se completa, debe ser un número positivo y razonable.
ALTER TABLE public.perfiles_estudiante
  DROP CONSTRAINT IF EXISTS chk_perfiles_estudiante_generacion_fwd;
ALTER TABLE public.perfiles_estudiante
  ADD CONSTRAINT chk_perfiles_estudiante_generacion_fwd
  CHECK (generacion_fwd IS NULL OR (generacion_fwd >= 1 AND generacion_fwd <= 999));
