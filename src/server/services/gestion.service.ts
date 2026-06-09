import 'server-only';
import {
  buscarProyectoActivo,
  buscarEstudianteAdjudicado,
  cerrarProyectoRepo,
} from '@/server/repositories/proyecto.repository';
import { buscarOferta, adjudicarOferta } from '@/server/repositories/oferta.repository';
import {
  buscarEntregable,
  aprobarEntregable as aprobarEntregableRepo,
  solicitarCambiosEntregable,
  existeFinalAprobado,
} from '@/server/repositories/entregable.repository';
import { upsertEvaluacion } from '@/server/repositories/evaluacion.repository';

// Lógica de negocio de la gestión del proyecto por el empresario (Página 14).
// TODAS las acciones validan que el proyecto pertenezca al empresario.
export type ResultadoAccion =
  | { ok: true }
  | 'no_encontrado'
  | 'no_autorizado'
  | 'comentario_requerido'
  | 'falta_entregable_final';

async function esDelEmpresario(
  idProyecto: string,
  idEmpresario: string,
): Promise<'ok' | 'no_encontrado' | 'no_autorizado'> {
  const proyecto = await buscarProyectoActivo(idProyecto);
  if (!proyecto) return 'no_encontrado';
  if (proyecto.id_empresario !== idEmpresario) return 'no_autorizado';
  return 'ok';
}

// Adjudica una oferta del proyecto (y deja el proyecto 'en_desarrollo').
export async function adjudicar(idOferta: string, idEmpresario: string): Promise<ResultadoAccion> {
  const oferta = await buscarOferta(idOferta);
  if (!oferta) return 'no_encontrado';
  const due = await esDelEmpresario(oferta.id_proyecto, idEmpresario);
  if (due !== 'ok') return due;
  await adjudicarOferta(idOferta, oferta.id_proyecto);
  return { ok: true };
}

// Aprueba un entregable.
export async function aprobar(idEntregable: string, idEmpresario: string): Promise<ResultadoAccion> {
  const entregable = await buscarEntregable(idEntregable);
  if (!entregable) return 'no_encontrado';
  if (entregable.proyectos.id_empresario !== idEmpresario) return 'no_autorizado';
  await aprobarEntregableRepo(idEntregable);
  return { ok: true };
}

// Solicita cambios en un entregable (el comentario es obligatorio).
export async function solicitarCambios(
  idEntregable: string,
  idEmpresario: string,
  comentario: string,
): Promise<ResultadoAccion> {
  if (!comentario.trim()) return 'comentario_requerido';
  const entregable = await buscarEntregable(idEntregable);
  if (!entregable) return 'no_encontrado';
  if (entregable.proyectos.id_empresario !== idEmpresario) return 'no_autorizado';
  await solicitarCambiosEntregable(idEntregable, comentario.trim());
  return { ok: true };
}

// Cierra el proyecto: exige un entregable final aprobado y registra la
// calificación final del estudiante adjudicado.
export async function cerrarProyecto(d: {
  idProyecto: string;
  idEmpresario: string;
  puntuacion: number;
  comentario?: string | null;
}): Promise<ResultadoAccion> {
  const due = await esDelEmpresario(d.idProyecto, d.idEmpresario);
  if (due !== 'ok') return due;

  const finalOk = await existeFinalAprobado(d.idProyecto);
  if (!finalOk) return 'falta_entregable_final';

  const adj = await buscarEstudianteAdjudicado(d.idProyecto);
  if (!adj) return 'no_encontrado';

  await upsertEvaluacion({
    idProyecto: d.idProyecto,
    idEstudiante: adj.id_estudiante,
    idEmpresario: d.idEmpresario,
    puntuacion: d.puntuacion,
    comentario: d.comentario ?? null,
  });
  await cerrarProyectoRepo(d.idProyecto);
  return { ok: true };
}
