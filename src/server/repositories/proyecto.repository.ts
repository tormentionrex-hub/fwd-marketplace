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
      // Estudiante adjudicado (si lo hay): se deriva de la oferta 'adjudicada'.
      // Una sola query (take:1 filtrado) — sin N+1.
      ofertas: {
        where: { estado: 'adjudicada' },
        select: {
          perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
        },
        take: 1,
      },
    },
    orderBy: { publicado: 'desc' },
  });
}
// Lista todos los proyectos para el panel admin: empresario, estado y nº de
// ofertas. Solo lectura, acotado a los más recientes.
export function listarProyectosAdmin() {
  return db.proyectos.findMany({
    take: 50,
    orderBy: { publicado: 'desc' },
    select: {
      id: true,
      titulo: true,
      estado: true,
      publicado: true,
      cierre: true,
      perfiles_empresario: { select: { usuarios: { select: { nombre: true } } } },
      _count: { select: { ofertas: true } },
    },
  });
}

// Cuenta las ofertas recibidas en los proyectos del empresario desde `desde`
// (para el delta "nuevas esta semana" del dashboard). Una query agregada.
export function contarOfertasDesde(idEmpresario: string, desde: Date) {
  return db.ofertas.count({
    where: { proyectos: { id_empresario: idEmpresario }, enviado: { gte: desde } },
  });
}

// Obtiene fechas de proyectos y ofertas de los últimos 6 meses
export function obtenerActividadSeisMeses(idEmpresario: string) {
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 5);
  hace6Meses.setDate(1);
  hace6Meses.setHours(0, 0, 0, 0);

  const proyectos = db.proyectos.findMany({
    where: { id_empresario: idEmpresario, publicado: { gte: hace6Meses } },
    select: { publicado: true },
  });

  const ofertas = db.ofertas.findMany({
    where: { proyectos: { id_empresario: idEmpresario }, enviado: { gte: hace6Meses } },
    select: { enviado: true },
  });

  return Promise.all([proyectos, ofertas]);
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

// ── Actividad reciente del empresario (Dashboard, Página 12) ────────────────
// Tres consultas acotadas a los proyectos del empresario; la capa de servicio
// las mezcla y ordena. Cada una trae solo lo que la UI muestra.

// Últimas ofertas recibidas en los proyectos del empresario (con autor y proyecto).
export function ofertasRecientesDeEmpresario(idEmpresario: string, limite: number) {
  return db.ofertas.findMany({
    where: { proyectos: { id_empresario: idEmpresario } },
    select: {
      id: true,
      enviado: true,
      id_proyecto: true,
      proyectos: { select: { titulo: true } },
      perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
    },
    orderBy: { enviado: 'desc' },
    take: limite,
  });
}

// Últimas entregas subidas en los proyectos del empresario.
export function entregablesRecientesDeEmpresario(idEmpresario: string, limite: number) {
  return db.entregables.findMany({
    where: { proyectos: { id_empresario: idEmpresario } },
    select: {
      id: true,
      creado: true,
      id_proyecto: true,
      proyectos: { select: { titulo: true } },
      perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
    },
    orderBy: { creado: 'desc' },
    take: limite,
  });
}

// Últimos proyectos cerrados del empresario.
export function proyectosCerradosDeEmpresario(idEmpresario: string, limite: number) {
  return db.proyectos.findMany({
    where: { id_empresario: idEmpresario, estado: 'cerrado', cierre: { not: null } },
    select: { id: true, titulo: true, cierre: true },
    orderBy: { cierre: 'desc' },
    take: limite,
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

