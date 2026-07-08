-- Agrega los roles de staff del equipo FWD a la tabla roles.
--   owner     → dueño de la plataforma (máximo nivel; accede al panel /admin)
--   staff     → miembro del staff (creado; acceso al panel se habilita más adelante)
--   moderator → moderador (creado; acceso al panel se habilita más adelante)
-- Idempotente: ON CONFLICT no hace nada si el rol ya existe.
INSERT INTO roles (nombre)
VALUES ('owner'), ('staff'), ('moderator')
ON CONFLICT (nombre) DO NOTHING;
