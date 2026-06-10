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

export function listarHabilidadesEstudiante(idUsuario: string) {
  return db.estudiantes_habilidades.findMany({
    where: { id_usuario: idUsuario },
    select: { id_habilidad: true, nivel: true },
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
}

// Guarda datos personales + reemplaza los sets de habilidades y portafolio,
// todo en una sola transacción atómica.
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
      })),
    }),
  ]);
}
