-- Añade el nombre legal de la empresa al perfil del empresario.
-- Nullable para no romper filas existentes; el form lo exige al registrar.
--
-- Aplicar en Supabase:
--   npx prisma db execute --file prisma/sql/add_nombre_empresa.sql --schema prisma/schema.prisma

ALTER TABLE public.perfiles_empresario
  ADD COLUMN IF NOT EXISTS nombre_empresa VARCHAR(200);
