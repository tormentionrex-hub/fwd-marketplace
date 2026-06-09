import 'server-only';
import { buscarProyectoGestion, cerrarProyectoRepo } from '@/server/repositories/proyecto.repository';
import {
  buscarOfertaConProyecto,
  adjudicarOferta,
  buscarEstudianteAdjudicado,
} from '@/server/repositories/oferta-gestion.repository';
import {
  buscarEntregable,
  aprobarEntregable,
  marcarCambiosEntregable,
  existeFinalAprobado,
} from '@/server/repositories/entregable.repository';
import { upsertEvaluacion } from '@/server/repositories/evaluacion.repository';

// Lógica de negocio de la gestión del proyecto (Página 14). Cada acción valida
// que el proyecto sea del empresario y devuelve una unión discriminada.
export type ResultadoGestion =
  | { ok: true }
  | 'no_encontrado'
  | 'no_autorizado'
  | 'comentario_requerido'
  | 'falta_entregable_final';

async function esDuenoDelProyecto(idProyecto: string, idEmpresario: string): Promise<boolean> {
  const p = await buscarProyectoGestion(idProyecto);
  return p?.id_empresario === idEmpresario;
}

// FASE 2: adjudicar una oferta.
export async function adjudicarOfertaService(
  idOferta: string,
  idEmpresario: string,
): Promise<ResultadoGestion> {
  const oferta = await buscarOfertaConProyecto(idOferta);
  if (!oferta) return 'no_encontrado';
  if (!(await esDuenoDelProyecto(oferta.id_proyecto, idEmpresario))) return 'no_autorizado';
  await adjudicarOferta(idOferta, oferta.id_proyecto);
  return { ok: true };
}

// FASE 3: aprobar un entregable.
export async function aprobarEntregableService(
  idEntregable: string,
  idEmpresario: string,
): Promise<ResultadoGestion> {
  const e = await buscarEntregable(idEntregable);
  if (!e) return 'no_encontrado';
  if (!(await esDuenoDelProyecto(e.id_proyecto, idEmpresario))) return 'no_autorizado';
  await aprobarEntregable(idEntregable);
  return { ok: true };
}

// FASE 3: solicitar cambios (comentario obligatorio en el servidor).
export async function solicitarCambiosService(
  idEntregable: string,
  idEmpresario: string,
  comentario: string,
): Promise<ResultadoGestion> {
  if (!comentario?.trim()) return 'comentario_requerido';
  const e = await buscarEntregable(idEntregable);
  if (!e) return 'no_encontrado';
  if (!(await esDuenoDelProyecto(e.id_proyecto, idEmpresario))) return 'no_autorizado';
  await marcarCambiosEntregable(idEntregable);
  return { ok: true };
}

// FASE 4: cerrar el proyecto. Sólo si existe entregable final aprobado.
// Guarda la calificación final en evaluaciones (upsert).
export async function cerrarProyectoService(datos: {
  idProyecto: string;
  idEmpresario: string;
  puntuacion: number;
  comentario?: string | null;
}): Promise<ResultadoGestion> {
  if (!(await esDuenoDelProyecto(datos.idProyecto, datos.idEmpresario))) return 'no_autorizado';
  if (!(await existeFinalAprobado(datos.idProyecto))) return 'falta_entregable_final';

  const adj = await buscarEstudianteAdjudicado(datos.idProyecto);
  if (!adj) return 'no_encontrado';

  await upsertEvaluacion({
    idProyecto: datos.idProyecto,
    idEstudiante: adj.id_estudiante,
    idEmpresario: datos.idEmpresario,
    puntuacion: datos.puntuacion,
    comentario: datos.comentario ?? null,
  });
  await cerrarProyectoRepo(datos.idProyecto);
  return { ok: true };
}
