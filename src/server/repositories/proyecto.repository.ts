import 'server-only';
import { db } from '@/lib/db';

// Capa de datos (Prisma puro) sobre el modelo proyectos. Sin lógica de negocio.

// Lista los proyectos de un empresario con el conteo de ofertas (candidatos).
// Una sola query con _count para evitar N+1. (Dashboard empresario, Página 12.)
export function listarProyectosDeEmpresario(idEmpresario: string) {
  return db.proyectos.findMany({
    where: { id_empresario: idEmpresario },
    select: {
      id: true,
      titulo: true,
      estado: true,
      plazo_dias: true,
      publicado: true,
      cierre: true,
      _count: { select: { ofertas: true } },
    },
    orderBy: { publicado: 'desc' },
  });
}

// Trae un proyecto con su empresario (nombre + sector) y sus tecnologías
// (ficha pública del proyecto).
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

// Datos mínimos del proyecto para la pantalla de gestión (Página 14) y para
// validar dueño. `buscarProyectoActivo` es el alias que usan las páginas 11/14.
export function buscarProyectoGestion(id: string) {
  return db.proyectos.findUnique({
    where: { id },
    select: { id: true, titulo: true, estado: true, id_empresario: true },
  });
}

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
