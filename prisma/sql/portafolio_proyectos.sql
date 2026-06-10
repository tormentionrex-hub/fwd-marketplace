-- Proyectos de portafolio agregados manualmente por el estudiante.
-- Aplicar en Supabase:  npx prisma db execute --file prisma/sql/portafolio_proyectos.sql --schema prisma/schema.prisma
CREATE TABLE IF NOT EXISTS public.portafolio_proyectos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario  UUID NOT NULL REFERENCES public.perfiles_estudiante(id_usuario) ON DELETE CASCADE,
  titulo      VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tecnologias TEXT,
  fecha       DATE,
  repo_url    TEXT,
  demo_url    TEXT,
  creado      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portafolio_id_usuario
  ON public.portafolio_proyectos (id_usuario);
