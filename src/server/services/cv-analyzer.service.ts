import 'server-only';
import * as repo from '@/server/repositories/curriculum.repository';
import * as storage from '@/server/storage/curriculum-storage';
import { analizarCv } from '@/lib/ia-cv';
import type { AnalisisCv } from '@/types/cv-analisis';

export type ResultadoAnalisis =
  | { ok: true; analisis: AnalisisCv }
  | 'sin_cv'
  | 'solo_pdf'
  | 'error_descarga'
  | 'error_ia';

export async function analizarMiCv(idUsuario: string): Promise<ResultadoAnalisis> {
  const cv = await repo.obtenerCvDeUsuario(idUsuario);
  if (!cv) return 'sin_cv';
  if (!cv.file_type.includes('pdf')) return 'solo_pdf';

  const buffer = await storage.descargarArchivoCv(cv.storage_path);
  if (!buffer) return 'error_descarga';

  let analisis: AnalisisCv;
  try {
    analisis = await analizarCv(buffer);
  } catch (err) {
    console.error('[cv-analyzer] Error IA:', err);
    return 'error_ia';
  }

  try {
    await repo.guardarAnalisisCv(idUsuario, analisis);
  } catch (err) {
    console.error('[cv-analyzer] Error guardando analisis en DB:', err);
  }

  return { ok: true, analisis };
}
