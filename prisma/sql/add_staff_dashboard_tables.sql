-- 1. Agregar el rol 'staff' a la tabla roles
INSERT INTO roles (nombre)
VALUES ('staff')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Agregar columna tipo_staff a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipo_staff VARCHAR(50);

-- 3. Actualizar el usuario administrador existente (si existe) al rol 'staff' y tipo_staff 'admin_general'
UPDATE usuarios
SET id_rol = (SELECT id FROM roles WHERE nombre = 'staff'),
    tipo_staff = 'admin_general'
WHERE correo = 'staff@fwdcr.com';

-- 4. Crear la tabla de invitaciones_staff
CREATE TABLE IF NOT EXISTS invitaciones_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    tipo_staff VARCHAR(50) NOT NULL, -- 'admin_general' o 'moderador'
    pending BOOLEAN DEFAULT TRUE NOT NULL,
    solicitado TIMESTAMPTZ(6) DEFAULT now() NOT NULL,
    resuelto TIMESTAMPTZ(6),
    id_usuario UUID REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_invitaciones_staff_pending ON invitaciones_staff(pending);

-- 5. Crear la tabla de registro_auditoria
CREATE TABLE IF NOT EXISTS registro_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_staff UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_staff VARCHAR(150) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    detalles JSONB,
    justificacion TEXT,
    creado TIMESTAMPTZ(6) DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auditoria_staff ON registro_auditoria(id_staff);
CREATE INDEX IF NOT EXISTS idx_auditoria_creado ON registro_auditoria(creado);

-- 6. Crear la tabla de reportes
CREATE TABLE IF NOT EXISTS reportes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_reportante UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_contenido VARCHAR(50) NOT NULL, -- 'proyecto', 'usuario', 'mensaje'
    id_contenido UUID NOT NULL,
    motivo TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL, -- 'pendiente', 'en_revision', 'resuelto', 'desestimado'
    id_moderador UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    resolucion TEXT,
    creado TIMESTAMPTZ(6) DEFAULT now() NOT NULL,
    actualizado TIMESTAMPTZ(6) DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_contenido ON reportes(tipo_contenido, id_contenido);

-- 7. Crear la tabla de categorias_negocio
CREATE TABLE IF NOT EXISTS categorias_negocio (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) UNIQUE NOT NULL,
    activa BOOLEAN DEFAULT TRUE NOT NULL
);

-- 8. Agregar columna activa a tecnologías y habilidades si no existe
ALTER TABLE tecnologias ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE habilidades ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT TRUE NOT NULL;
