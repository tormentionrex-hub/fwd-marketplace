import 'server-only';
import {
  buscarProyectoActivo,
  buscarEstudianteAdjudicado,
} from '@/server/repositories/proyecto.repository';
import { siguienteVersion, crearEntregable } from '@/server/repositories/entregable.repository';
import { notificarEntregaRecibida } from '@/server/services/notificacion.service';

// Lógica de negocio: el estudiante adjudicado sube un entregable (hito/final).
// 1. Debe venir un archivo (URL ya subida a Storage).
// 2. El proyecto debe estar 'en_desarrollo'.
// 3. Quien sube debe ser el estudiante adjudicado del proyecto.
// 4. La versión se calcula incremental por (proyecto, estudiante, tipo).
export type ResultadoEnviarEntregable =
  | { ok: true; entregableId: string }
  | 'proyecto_no_activo'
  | 'no_autorizado'
  | 'sin_archivo';

export async function enviarEntregable(d: {
  idProyecto: string;
  idEstudiante: string;
  tipo: string | null;
  archivoUrl?: string | null;
}): Promise<ResultadoEnviarEntregable> {
  const archivo = d.archivoUrl?.trim();
  if (!archivo) return 'sin_archivo';

  const proyecto = await buscarProyectoActivo(d.idProyecto);
  if (!proyecto || proyecto.estado !== 'en_desarrollo') return 'proyecto_no_activo';

  const adj = await buscarEstudianteAdjudicado(d.idProyecto);
  if (!adj || adj.id_estudiante !== d.idEstudiante) return 'no_autorizado';

  const version = await siguienteVersion(d.idProyecto, d.idEstudiante, d.tipo);
  const entregable = await crearEntregable({
    idProyecto: d.idProyecto,
    idEstudiante: d.idEstudiante,
    tipo: d.tipo,
    version,
    archivoUrl: archivo,
  });

  // Avisa al empresario dueño del proyecto (no bloquea ni rompe si falla).
  await notificarEntregaRecibida(d.idProyecto, d.idEstudiante);

  return { ok: true, entregableId: entregable.id };
}
