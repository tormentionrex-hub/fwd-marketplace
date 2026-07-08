import 'server-only';
import { db } from '@/lib/db';

// Capa de datos del editor de perfil del estudiante (tablas existentes:
// usuarios, perfiles_estudiante, habilidades, estudiantes_habilidades,
// evaluaciones). Todo acotado por id_usuario (ownership).

export function obtenerUsuarioBasico(idUsuario: string) {
  return db.usuarios.findUnique({
    where: { id: idUsuario },
    select: { nombre: true, correo: true, image_url: true },
  });
}

export function obtenerPerfilEstudianteCampos(idUsuario: string) {
  return db.perfiles_estudiante.findUnique({
    where: { id_usuario: idUsuario },
    select: { descripcion: true, titulo_profesional: true },
  });
}

export function listarCatalogoHabilidades() {
  return db.habilidades.findMany({
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true, categoria: true },
  });
}

// Busca una habilidad del catálogo por nombre exacto (case-insensitive).
// Sirve para no duplicar filas al agregar una tecnología nueva.
export function buscarHabilidadPorNombre(nombre: string) {
  return db.habilidades.findFirst({
    where: { nombre: { equals: nombre, mode: 'insensitive' } },
    select: { id: true, nombre: true },
  });
}

// Crea una habilidad nueva en el catálogo global. `categoria` opcional.
export function crearHabilidadCatalogo(nombre: string, categoria: string | null = 'Tecnología') {
  return db.habilidades.create({
    data: { nombre, categoria },
    select: { id: true, nombre: true },
  });
}

export function listarHabilidadesEstudiante(idUsuario: string) {
  return db.estudiantes_habilidades.findMany({
    where: { id_usuario: idUsuario },
    select: { id_habilidad: true, nivel: true },
  });
}

// Nombres de las habilidades del estudiante (para el recomendador de proyectos
// "Para ti"). Devuelve solo el nombre de cada habilidad, vía la relación.
export function listarNombresHabilidadesEstudiante(idUsuario: string) {
  return db.estudiantes_habilidades.findMany({
    where: { id_usuario: idUsuario },
    select: { habilidades: { select: { nombre: true } } },
  });
}

// Todos los estudiantes con su JSON de preferencias (crudo), para hacer matching
// en lote cuando se publica un proyecto (sugerencias). Solo trae lo mínimo.
export function listarEstudiantesConPreferencias() {
  return db.perfiles_estudiante.findMany({
    select: { id_usuario: true, preferencias: true },
  });
}

// Proyectos completados = proyectos en los que el estudiante recibió evaluación.
export function listarProyectosCompletados(idUsuario: string) {
  return db.evaluaciones.findMany({
    where: { id_estudiante: idUsuario },
    orderBy: { creado: 'desc' },
    select: {
      puntuacion: true,
      comentario: true,
      creado: true,
      proyectos: { select: { id: true, titulo: true } },
    },
  });
}

// Evaluaciones recibidas por el estudiante (para el apartado de Reputación).
export function listarEvaluacionesRecibidas(idUsuario: string) {
  return db.evaluaciones.findMany({
    where: { id_estudiante: idUsuario },
    orderBy: { creado: 'desc' },
    select: {
      id: true,
      puntuacion: true,
      comentario: true,
      creado: true,
      proyectos: { select: { titulo: true } },
      perfiles_empresario: {
        select: { nombre_empresa: true, usuarios: { select: { nombre: true } } },
      },
    },
  });
}

export function listarPortafolio(idUsuario: string) {
  return db.portafolio_proyectos.findMany({
    where: { id_usuario: idUsuario },
    orderBy: { creado: 'desc' },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      tecnologias: true,
      fecha: true,
      repo_url: true,
      demo_url: true,
      es_publico: true,
    },
  });
}

export interface PortafolioPersistencia {
  titulo: string;
  descripcion: string | null;
  tecnologias: string | null;
  fecha: Date | null;
  repoUrl: string | null;
  demoUrl: string | null;
  esPublico?: boolean;
}

// Guarda datos personales + reemplaza los sets de habilidades y portafolio,
// todo en una sola transacción atómica.
export async function actualizarReputacion(idEstudiante: string, reputacion: number) {
  const total = await db.evaluaciones.count({ where: { id_estudiante: idEstudiante } });
  return db.perfiles_estudiante.update({
    where: { id_usuario: idEstudiante },
    data: { reputacion, total_calificaciones: total },
  });
}

export function guardarPerfilCompleto(
  idUsuario: string,
  datos: {
    nombre: string;
    correo: string;
    fotoUrl: string | null;
    resumen: string;
    habilidades: { idHabilidad: bigint; nivel: string }[];
    portafolio: PortafolioPersistencia[];
  },
) {
  return db.$transaction([
    db.usuarios.update({
      where: { id: idUsuario },
      data: { nombre: datos.nombre, correo: datos.correo, image_url: datos.fotoUrl },
    }),
    db.perfiles_estudiante.update({
      where: { id_usuario: idUsuario },
      data: { descripcion: datos.resumen },
    }),
    db.estudiantes_habilidades.deleteMany({ where: { id_usuario: idUsuario } }),
    db.estudiantes_habilidades.createMany({
      data: datos.habilidades.map((h) => ({
        id_usuario: idUsuario,
        id_habilidad: h.idHabilidad,
        nivel: h.nivel,
      })),
    }),
    db.portafolio_proyectos.deleteMany({ where: { id_usuario: idUsuario } }),
    db.portafolio_proyectos.createMany({
      data: datos.portafolio.map((p) => ({
        id_usuario: idUsuario,
        titulo: p.titulo,
        descripcion: p.descripcion,
        tecnologias: p.tecnologias,
        fecha: p.fecha,
        repo_url: p.repoUrl,
        demo_url: p.demoUrl,
        es_publico: p.esPublico ?? true,
      })),
    }),
  ]);
}
