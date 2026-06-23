-- Renombra el rol 'editor' a 'staff' en la tabla roles.
-- Conserva el id del rol, así que las cuentas que ya lo tuvieran (id_rol) siguen
-- apuntando al mismo registro, ahora llamado 'staff'. Idempotente: si ya fue
-- renombrado, el WHERE no encuentra filas y no hace nada.
UPDATE roles SET nombre = 'staff' WHERE nombre = 'editor';
