import 'server-only';
import { db } from '@/lib/db';

// Capa de datos (Prisma puro) para el perfil del empresario (pantalla "Mi perfil",
// SRS RF-16/17). Una sola query: datos de la empresa, el usuario dueño y la lista
// de proyectos publicados (para el resumen de actividad y la lista).
export function obtenerPerfilEmpresario(idUsuario: string) {
  // Nota: NO seleccionamos `nombre_empresa`. La columna existe en schema.prisma
  // (migración prisma/sql/add_nombre_empresa.sql) pero NO está aplicada en la DB
  // actual, así que consultarla rompe en runtime. Usamos usuarios.nombre como
  // nombre de la cuenta. Si el equipo aplica esa migración, se puede re-agregar.
  return db.perfiles_empresario.findUnique({
    where: { id_usuario: idUsuario },
    select: {
      tipo: true,
      sector: true,
      descripcion: true,
      usuarios: {
        select: {
          nombre: true,
          correo: true,
          image_url: true,
          estado: true,
          creado: true,
        },
      },
      proyectos: {
        select: { id: true, titulo: true, area_negocio: true, estado: true },
        orderBy: { publicado: 'desc' },
      },
    },
  });
}
