import 'server-only';
import { db } from '@/lib/db';

// Capa de datos del CV. Tabla curriculums (1→1 con perfiles_estudiante) +
// cv_accesos (auditoría). Todo acotado por id_usuario (ownership).

export function obtenerCvDeUsuario(idUsuario: string) {
  return db.curriculums.findUnique({ where: { id_usuario: idUsuario } });
}

export function obtenerCvPorId(id: string) {
  return db.curriculums.findUnique({ where: { id } });
}

export function upsertCv(
  idUsuario: string,
  datos: { fileName: string; storagePath: string; fileSize: number; fileType: string },
) {
  return db.curriculums.upsert({
    where: { id_usuario: idUsuario },
    create: {
      id_usuario: idUsuario,
      file_name: datos.fileName,
      storage_path: datos.storagePath,
      file_size: BigInt(datos.fileSize),
      file_type: datos.fileType,
    },
    update: {
      file_name: datos.fileName,
      storage_path: datos.storagePath,
      file_size: BigInt(datos.fileSize),
      file_type: datos.fileType,
      actualizado: new Date(),
    },
  });
}

export function eliminarCv(idUsuario: string) {
  return db.curriculums.delete({ where: { id_usuario: idUsuario } });
}

export function cambiarPrivacidadCv(idUsuario: string, esPublico: boolean) {
  return db.curriculums.update({
    where: { id_usuario: idUsuario },
    data: { es_publico: esPublico, actualizado: new Date() },
  });
}

export function registrarAccesoCv(datos: {
  idCurriculum: string;
  idEmpresario: string;
  accion: string;
  idProyecto?: string | null;
}) {
  return db.cv_accesos.create({
    data: {
      id_curriculum: datos.idCurriculum,
      id_empresario: datos.idEmpresario,
      accion: datos.accion,
      id_proyecto: datos.idProyecto ?? null,
    },
  });
}

// Resuelve un username (slug del nombre) al id del estudiante real.
export async function buscarIdEstudiantePorSlug(username: string): Promise<string | null> {
  const slug = (n: string) => n.trim().toLowerCase().replace(/\s+/g, '-');
  const estudiantes = await db.usuarios.findMany({
    where: { roles: { nombre: 'estudiante' } },
    select: { id: true, nombre: true },
  });
  return estudiantes.find((u) => slug(u.nombre) === username)?.id ?? null;
}
