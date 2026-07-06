-- Datos adicionales del estudiante en el registro (teléfono, módulo, sede,
-- provincia y cantón). La generación ya existe como perfiles_estudiante.generacion_fwd.
-- Migración aditiva y nullable: no rompe cuentas existentes.
-- Aplicar en Supabase (SQL Editor) o vía `npm run prisma:deploy`.

ALTER TABLE perfiles_estudiante
  ADD COLUMN IF NOT EXISTS telefono          varchar(30),
  ADD COLUMN IF NOT EXISTS modulo_completado varchar(50),
  ADD COLUMN IF NOT EXISTS sede              varchar(100),
  ADD COLUMN IF NOT EXISTS provincia         varchar(100),
  ADD COLUMN IF NOT EXISTS canton            varchar(100),
  ADD COLUMN IF NOT EXISTS distrito          varchar(100);
