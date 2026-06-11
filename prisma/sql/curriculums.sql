-- Currículum del estudiante (StudentCV) + auditoría de accesos.
-- Solo se guarda la ruta en Storage (bucket privado) + metadatos; el archivo
-- vive en Supabase Storage, no en la base.
-- Aplicar:  npx prisma db execute --file prisma/sql/curriculums.sql --schema prisma/schema.prisma

CREATE TABLE IF NOT EXISTS public.curriculums (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario   UUID NOT NULL UNIQUE REFERENCES public.perfiles_estudiante(id_usuario) ON DELETE CASCADE,
  file_name    VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  file_size    BIGINT NOT NULL,
  file_type    VARCHAR(100) NOT NULL,
  es_publico   BOOLEAN NOT NULL DEFAULT false,
  subido       TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auditoría: quién (empresario) vio/descargó un CV, cuándo y para qué proyecto.
CREATE TABLE IF NOT EXISTS public.cv_accesos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_curriculum UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE CASCADE,
  id_empresario UUID NOT NULL REFERENCES public.perfiles_empresario(id_usuario) ON DELETE CASCADE,
  id_proyecto   UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
  accion        VARCHAR(20) NOT NULL DEFAULT 'ver',
  creado        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cv_accesos_curriculum ON public.cv_accesos (id_curriculum);
CREATE INDEX IF NOT EXISTS idx_cv_accesos_empresario ON public.cv_accesos (id_empresario);
