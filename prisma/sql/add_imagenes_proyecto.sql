-- Agrega columna imagenes (array de URLs de Cloudinary) a la tabla proyectos.
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS imagenes text[] DEFAULT '{}';
