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

// ── Páginas 11 y 14 (proyecto adjudicado / gestión) ─────────────────────────

// Trae lo mínimo para validar acceso y mostrar la cabecera del proyecto.
export function buscarProyectoActivo(id: string) {
  return db.proyectos.findUnique({
    where: { id },
    select: { id: true, titulo: true, estado: true, id_empresario: true },
  });
}

// El estudiante adjudicado se deriva de la oferta 'adjudicada' del proyecto.
export function buscarEstudianteAdjudicado(idProyecto: string) {
  return db.ofertas.findFirst({
    where: { id_proyecto: idProyecto, estado: 'adjudicada' },
    select: { id_estudiante: true },
  });
}

// Cierra el proyecto: estado 'cerrado' y marca la fecha de cierre.
export function cerrarProyectoRepo(idProyecto: string) {
  return db.proyectos.update({
    where: { id: idProyecto },
    data: { estado: 'cerrado', cierre: new Date() },
  });
}
