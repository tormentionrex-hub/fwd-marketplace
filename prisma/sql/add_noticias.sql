-- Foro de noticias/tecnología estilo comunidad.
-- Estudiantes y empresarios publican noticias con texto, enlace (con preview
-- Open Graph), imagen o video. Incluye votos (upvote) y comentarios anidados.
-- Aplicar en Supabase (proyecto fwd-marketplace).

-- Tabla principal de publicaciones
CREATE TABLE IF NOT EXISTS public.noticias (
  id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  id_autor       uuid          NOT NULL,
  titulo         varchar(300)  NOT NULL,
  texto          text,
  enlace_url     text,
  imagen_url     text,
  video_url      text,
  categoria      varchar(80),
  og_titulo      text,
  og_descripcion text,
  og_imagen      text,
  og_sitio       varchar(200),
  estado         varchar(20)   NOT NULL DEFAULT 'activa',
  creado         timestamptz   NOT NULL DEFAULT now(),
  actualizado    timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT fk_noticias_autor FOREIGN KEY (id_autor)
    REFERENCES public.usuarios (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_noticias_creado   ON public.noticias (creado);
CREATE INDEX IF NOT EXISTS idx_noticias_id_autor ON public.noticias (id_autor);
CREATE INDEX IF NOT EXISTS idx_noticias_estado   ON public.noticias (estado);

-- Votos (un upvote por usuario y noticia)
CREATE TABLE IF NOT EXISTS public.noticias_votos (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_noticia uuid        NOT NULL,
  id_usuario uuid        NOT NULL,
  creado     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_noticias_votos_noticia FOREIGN KEY (id_noticia)
    REFERENCES public.noticias (id) ON DELETE CASCADE,
  CONSTRAINT fk_noticias_votos_usuario FOREIGN KEY (id_usuario)
    REFERENCES public.usuarios (id) ON DELETE CASCADE,
  CONSTRAINT unique_noticia_voto UNIQUE (id_noticia, id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_noticias_votos_id_noticia ON public.noticias_votos (id_noticia);

-- Comentarios (id_padre permite respuestas anidadas)
CREATE TABLE IF NOT EXISTS public.noticias_comentarios (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_noticia uuid        NOT NULL,
  id_autor   uuid        NOT NULL,
  id_padre   uuid,
  texto      text        NOT NULL,
  creado     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_noticias_comentarios_noticia FOREIGN KEY (id_noticia)
    REFERENCES public.noticias (id) ON DELETE CASCADE,
  CONSTRAINT fk_noticias_comentarios_autor FOREIGN KEY (id_autor)
    REFERENCES public.usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_noticias_comentarios_padre FOREIGN KEY (id_padre)
    REFERENCES public.noticias_comentarios (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_noticias_comentarios_id_noticia ON public.noticias_comentarios (id_noticia);
