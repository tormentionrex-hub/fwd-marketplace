import 'server-only';
import { db } from '@/lib/db';

// Capa de datos: queries Prisma sobre el modelo proyectos. Solo lee/escribe;
// la lógica de negocio vive en los services.

// Trae un proyecto con su empresario (nombre + sector) y sus tecnologías.
export function obtenerProyectoConDetalle(id: string) {
  return db.proyectos.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      area_negocio: true,
      estado: true,
      plazo_dias: true,
      publicado: true,
      cierre: true,
      perfiles_empresario: {
        select: {
          sector: true,
          usuarios: { select: { nombre: true } },
        },
      },
      proyectos_tecnologias: {
        select: { tecnologias: { select: { nombre: true } } },
      },
    },
  });
}
