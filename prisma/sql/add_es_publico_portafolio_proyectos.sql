-- Añadir columna es_publico a la tabla portafolio_proyectos
-- Aplicar en Supabase: npx prisma db execute --file prisma/sql/add_es_publico_portafolio_proyectos.sql --schema prisma/schema.prisma
ALTER TABLE public.portafolio_proyectos 
ADD COLUMN IF NOT EXISTS es_publico BOOLEAN NOT NULL DEFAULT true;
