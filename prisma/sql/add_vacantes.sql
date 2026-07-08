-- Vacantes de empleo publicadas por empresas + postulaciones de estudiantes.
-- Una vacante (estado 'abierta') se muestra en el marketplace; el estudiante se
-- postula y la empresa gestiona cada postulacion con estados. Las tecnologias
-- requeridas reutilizan la tabla `tecnologias` (pivote vacantes_tecnologias).
-- Aplicar en Supabase (proyecto fwd-marketplace).

-- Tabla principal de vacantes
CREATE TABLE IF NOT EXISTS public.vacantes (
  id                 uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresario      uuid          NOT NULL,
  titulo             varchar(200)  NOT NULL,
  descripcion        text          NOT NULL,
  area               varchar(150),
  modalidad          varchar(20),
  tipo_empleo        varchar(30),
  nivel_experiencia  varchar(30),
  ubicacion          varchar(200),
  salario_min        numeric(12,2),
  salario_max        numeric(12,2),
  salario_moneda     varchar(10)   NOT NULL DEFAULT 'CRC',
  salario_periodo    varchar(20),
  salario_visible    boolean       NOT NULL DEFAULT true,
  responsabilidades  text,
  requisitos         text,
  beneficios         text,
  plazas             integer       NOT NULL DEFAULT 1,
  fecha_cierre       timestamptz,
  estado             varchar(50)   NOT NULL DEFAULT 'borrador',
  publicado          timestamptz,
  imagenes           text[]        NOT NULL DEFAULT '{}',
  documentos         jsonb         NOT NULL DEFAULT '[]'::jsonb,
  creado             timestamptz   NOT NULL DEFAULT now(),
  actualizado        timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT fk_vacantes_empresario FOREIGN KEY (id_empresario)
    REFERENCES public.perfiles_empresario (id_usuario) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vacantes_estado        ON public.vacantes (estado);
CREATE INDEX IF NOT EXISTS idx_vacantes_id_empresario ON public.vacantes (id_empresario);
CREATE INDEX IF NOT EXISTS idx_vacantes_publicado     ON public.vacantes (publicado);

-- Pivote de tecnologias/habilidades requeridas por la vacante
CREATE TABLE IF NOT EXISTS public.vacantes_tecnologias (
  id_vacante    uuid   NOT NULL,
  id_tecnologia bigint NOT NULL,
  CONSTRAINT pk_vacantes_tecnologias PRIMARY KEY (id_vacante, id_tecnologia),
  CONSTRAINT fk_vacantes_tecnologias_vacante FOREIGN KEY (id_vacante)
    REFERENCES public.vacantes (id) ON DELETE CASCADE,
  CONSTRAINT fk_vacantes_tecnologias_tecnologia FOREIGN KEY (id_tecnologia)
    REFERENCES public.tecnologias (id) ON DELETE CASCADE
);

-- Postulaciones de estudiantes a vacantes (unica por vacante+estudiante)
CREATE TABLE IF NOT EXISTS public.postulaciones (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_vacante    uuid        NOT NULL,
  id_estudiante uuid        NOT NULL,
  mensaje       text        NOT NULL,
  cv_url        text,
  estado        varchar(50) NOT NULL DEFAULT 'pendiente',
  creado        timestamptz NOT NULL DEFAULT now(),
  actualizado   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_postulaciones_vacante FOREIGN KEY (id_vacante)
    REFERENCES public.vacantes (id) ON DELETE CASCADE,
  CONSTRAINT fk_postulaciones_estudiante FOREIGN KEY (id_estudiante)
    REFERENCES public.perfiles_estudiante (id_usuario) ON DELETE CASCADE,
  CONSTRAINT unique_postulacion_vacante_estudiante UNIQUE (id_vacante, id_estudiante)
);

CREATE INDEX IF NOT EXISTS idx_postulaciones_id_vacante    ON public.postulaciones (id_vacante);
CREATE INDEX IF NOT EXISTS idx_postulaciones_id_estudiante ON public.postulaciones (id_estudiante);
CREATE INDEX IF NOT EXISTS idx_postulaciones_estado        ON public.postulaciones (estado);
