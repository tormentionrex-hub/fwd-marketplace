-- 1. Eliminar FKs (nombre auto PostgreSQL o nombre de Prisma)
ALTER TABLE pending_verifications
  DROP CONSTRAINT IF EXISTS pending_verifications_id_usuario_fkey;

ALTER TABLE pending_verifications
  DROP CONSTRAINT IF EXISTS fk_pending_verifications_usuario;

-- 2. Hacer id_usuario nullable
ALTER TABLE pending_verifications
  ALTER COLUMN id_usuario DROP NOT NULL;

-- 3. Agregar UNIQUE en email solo si no existe ya
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pending_verifications_email_unique'
  ) THEN
    ALTER TABLE pending_verifications
      ADD CONSTRAINT pending_verifications_email_unique UNIQUE (email);
  END IF;
END $$;
