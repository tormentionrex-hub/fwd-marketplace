import 'server-only';
import {
  upsertEvaluacionEmpresa,
  promedioReputacionEmpresa,
} from '@/server/repositories/evaluacion-empresa.repository';
import { actualizarReputacionEmpresa } from '@/server/repositories/perfil-empresario.repository';
import { buscarProyectoGestion } from '@/server/repositories/proyecto.repository';
import { buscarEstudianteAdjudicado } from '@/server/repositories/oferta-gestion.repository';

export type ResultadoCalificarEmpresa =
  | { ok: true }
  | 'proyecto_no_encontrado'
  | 'proyecto_no_cerrado'
  | 'no_es_adjudicado';

/**
 * El estudiante adjudicado califica al empresario al finalizar el proyecto.
 * Recalcula y persiste la reputacion del empresario atomicamente.
 */
export async function calificarEmpresa(datos: {
  idProyecto: string;
  idEstudiante: string;
  puntuacion: number;
  comentario: string;
}): Promise<ResultadoCalificarEmpresa> {
  const proyecto = await buscarProyectoGestion(datos.idProyecto);
  if (!proyecto) return 'proyecto_no_encontrado';
  if (proyecto.estado !== 'cerrado') return 'proyecto_no_cerrado';

  const adj = await buscarEstudianteAdjudicado(datos.idProyecto);
  if (!adj || adj.id_estudiante !== datos.idEstudiante) return 'no_es_adjudicado';

  await upsertEvaluacionEmpresa({
    idProyecto: datos.idProyecto,
    idEstudiante: datos.idEstudiante,
    idEmpresario: proyecto.id_empresario,
    puntuacion: datos.puntuacion,
    comentario: datos.comentario,
  });

  const nuevaReputacion = await promedioReputacionEmpresa(proyecto.id_empresario);
  await actualizarReputacionEmpresa(proyecto.id_empresario, nuevaReputacion);

  return { ok: true };
}
