-- El chat puede existir sin un proyecto asociado (contacto desde el perfil).
-- Permite id_proyecto NULL. No destructivo / idempotente. Aplicar con:
--   npx prisma db execute --file prisma/sql/chats_proyecto_nullable.sql --schema prisma/schema.prisma

ALTER TABLE chats ALTER COLUMN id_proyecto DROP NOT NULL;
