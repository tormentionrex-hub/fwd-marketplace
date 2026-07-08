import 'server-only';
import * as repo from '@/server/repositories/curriculum.repository';
import * as storage from '@/server/storage/curriculum-storage';
import type { AnalisisCv } from '@/types/cv-analisis';

// Tipos MIME permitidos → extensión.
export const TIPOS_CV: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};
export const MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MB

export interface CvDTO {
  fileName: string;
  /** MIME del archivo. */
  fileType: string;
  /** Tamaño en bytes. */
  fileSize: number;
  esPublico: boolean;
  subido: string;
  actualizado: string;
  /** URL firmada para ver el archivo (inline), ~10 min. */
  viewUrl: string | null;
  ultimoAnalisis: AnalisisCv | null;
  fechaAnalisis: string | null;
}

type FilaCv = {
  file_name: string;
  file_type: string;
  file_size: bigint;
  es_publico: boolean;
  subido: Date;
  actualizado: Date;
  storage_path: string;
  ultimo_analisis: unknown;
  fecha_analisis: Date | null;
};

async function mapDto(cv: FilaCv, withUrl = true): Promise<CvDTO> {
  return {
    fileName: cv.file_name,
    fileType: cv.file_type,
    fileSize: Number(cv.file_size),
    esPublico: cv.es_publico,
    subido: cv.subido.toISOString(),
    actualizado: cv.actualizado.toISOString(),
    viewUrl: withUrl ? await storage.urlFirmadaCv(cv.storage_path) : null,
    ultimoAnalisis: (cv.ultimo_analisis as AnalisisCv | null) ?? null,
    fechaAnalisis: cv.fecha_analisis ? cv.fecha_analisis.toISOString() : null,
  };
}

// ── Estudiante (dueño) ───────────────────────────────────────────────────

export async function obtenerMiCv(idUsuario: string): Promise<CvDTO | null> {
  const cv = await repo.obtenerCvDeUsuario(idUsuario);
  return cv ? mapDto(cv) : null;
}

export type ResultadoSubir =
  | { ok: true; cv: CvDTO }
  | 'vacio'
  | 'tipo_invalido'
  | 'muy_grande'
  | 'error_storage';

// Sube (o reemplaza) el CV del estudiante. Valida tipo y tamaño.
export async function subirMiCv(
  idUsuario: string,
  archivo: { nombre: string; tipo: string; size: number; buffer: Buffer },
): Promise<ResultadoSubir> {
  if (!archivo.buffer.length || archivo.size === 0) return 'vacio';

  // Tipo por MIME; fallback por extensión (algunos navegadores mandan
  // application/octet-stream para .docx).
  const POR_EXT: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  let tipo = archivo.tipo;
  let ext = TIPOS_CV[tipo];
  if (!ext) {
    const e = archivo.nombre.toLowerCase().match(/\.(pdf|docx|doc)$/)?.[1];
    if (e) {
      ext = e;
      tipo = POR_EXT[e] ?? tipo;
    }
  }
  if (!ext) return 'tipo_invalido';
  if (archivo.size > MAX_CV_BYTES) return 'muy_grande';

  const path = `${idUsuario}/cv.${ext}`;

  // Si ya tenía un CV con otra extensión, borrá el archivo anterior.
  const previo = await repo.obtenerCvDeUsuario(idUsuario);
  if (previo && previo.storage_path !== path) {
    await storage.borrarArchivoCv(previo.storage_path);
  }

  const ok = await storage.subirArchivoCv(path, archivo.buffer, archivo.tipo);
  if (!ok) return 'error_storage';

  const cv = await repo.upsertCv(idUsuario, {
    fileName: archivo.nombre.slice(0, 255),
    storagePath: path,
    fileSize: archivo.size,
    fileType: tipo,
  });
  return { ok: true, cv: await mapDto(cv) };
}

export async function eliminarMiCv(idUsuario: string): Promise<boolean> {
  const cv = await repo.obtenerCvDeUsuario(idUsuario);
  if (!cv) return false;
  await storage.borrarArchivoCv(cv.storage_path);
  await repo.eliminarCv(idUsuario);
  return true;
}

export async function cambiarPrivacidadMiCv(
  idUsuario: string,
  esPublico: boolean,
): Promise<CvDTO | null> {
  const cv = await repo.obtenerCvDeUsuario(idUsuario);
  if (!cv) return null;
  const actualizado = await repo.cambiarPrivacidadCv(idUsuario, esPublico);
  return mapDto(actualizado);
}

/** URL firmada de DESCARGA (fuerza el nombre original) para el dueño. */
export async function urlDescargaMiCv(idUsuario: string): Promise<string | null> {
  const cv = await repo.obtenerCvDeUsuario(idUsuario);
  if (!cv) return null;
  return storage.urlFirmadaCv(cv.storage_path, cv.file_name);
}

// ── Empresario (perfil público) ──────────────────────────────────────────

export interface CvPublicoDTO {
  fileName: string;
  fileType: string;
  actualizado: string;
  viewUrl: string;
  downloadUrl: string;
}

/**
 * CV público de un estudiante (por username) para un empresario.
 * Solo devuelve datos si el CV existe y `es_publico`. Registra el acceso
 * en auditoría (quién, cuándo, qué acción, proyecto si aplica).
 */
export async function obtenerCvPublicoDeEstudiante(
  username: string,
  idEmpresario: string,
  opts?: { accion?: string; idProyecto?: string | null },
): Promise<CvPublicoDTO | null> {
  const idEstudiante = await repo.buscarIdEstudiantePorSlug(username);
  if (!idEstudiante) return null;

  const cv = await repo.obtenerCvDeUsuario(idEstudiante);
  if (!cv || !cv.es_publico) return null;

  const [viewUrl, downloadUrl] = await Promise.all([
    storage.urlFirmadaCv(cv.storage_path),
    storage.urlFirmadaCv(cv.storage_path, cv.file_name),
  ]);
  if (!viewUrl || !downloadUrl) return null;

  // Auditoría del acceso.
  await repo.registrarAccesoCv({
    idCurriculum: cv.id,
    idEmpresario,
    accion: opts?.accion ?? 'ver',
    idProyecto: opts?.idProyecto ?? null,
  });

  return {
    fileName: cv.file_name,
    fileType: cv.file_type,
    actualizado: cv.actualizado.toISOString(),
    viewUrl,
    downloadUrl,
  };
}

/** Metadata del CV público (sin auditar, sin URL firmada) para el SSR del perfil. */
export async function metadataCvPublico(
  username: string,
): Promise<{ fileName: string; fileType: string; actualizado: string } | null> {
  const idEstudiante = await repo.buscarIdEstudiantePorSlug(username);
  if (!idEstudiante) return null;
  const cv = await repo.obtenerCvDeUsuario(idEstudiante);
  if (!cv || !cv.es_publico) return null;
  return {
    fileName: cv.file_name,
    fileType: cv.file_type,
    actualizado: cv.actualizado.toISOString(),
  };
}
