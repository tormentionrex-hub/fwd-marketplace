import 'server-only';
import {
  buscarVacanteParaPostular,
  buscarPostulacionExistente,
  crearPostulacion,
  listarPostulacionesDeEstudiante,
  retirarPostulacion,
} from '@/server/repositories/postulacion.repository';
import {
  listarPostulacionesDeVacante,
  buscarPostulacionConVacante,
  actualizarEstadoPostulacion,
} from '@/server/repositories/postulacion-gestion.repository';
import { buscarVacanteActiva } from '@/server/repositories/vacante.repository';
import { crearNotificacion } from '@/server/repositories/notificacion.repository';
import { buscarUsuarioPorId } from '@/server/repositories/usuario.repository';
import { obtenerVerificacionEstudiante } from '@/server/services/verificacion.service';
import type {
  MiPostulacionDTO,
  PostulanteDTO,
  EstadoPostulacion,
  EstadoVacante,
  EstadoPostulacionEmpresa,
} from '@/types/vacante';
import { ESTADO_POSTULACION_META } from '@/types/vacante';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ResultadoPostular =
  | { ok: true; postulacionId: string }
  | 'no_verificado'
  | 'vacante_no_encontrada'
  | 'vacante_cerrada'
  | 'ya_postulado';

// El estudiante se postula a una vacante.
export async function postularse(datos: {
  idVacante: string;
  idEstudiante: string;
  mensaje: string;
  cvUrl?: string | null;
}): Promise<ResultadoPostular> {
  // Enforcement de verificación FWD en el servidor (no confiar en la UI).
  const verif = await obtenerVerificacionEstudiante(datos.idEstudiante);
  if (!verif.verificado) return 'no_verificado';

  const vacante = await buscarVacanteParaPostular(datos.idVacante);
  if (!vacante) return 'vacante_no_encontrada';

  const ahora = new Date();
  const vencida = vacante.fecha_cierre !== null && vacante.fecha_cierre < ahora;
  if (vacante.estado !== 'abierta' || vencida) return 'vacante_cerrada';

  const existente = await buscarPostulacionExistente(datos.idVacante, datos.idEstudiante);
  if (existente) return 'ya_postulado';

  const postulacion = await crearPostulacion({
    idVacante: datos.idVacante,
    idEstudiante: datos.idEstudiante,
    mensaje: datos.mensaje,
    cvUrl: datos.cvUrl ?? null,
  });

  // Avisa al empresario dueño de la vacante (tolerante: no rompe el flujo).
  try {
    const estudiante = await buscarUsuarioPorId(datos.idEstudiante);
    const nombre = estudiante?.nombre?.trim() || 'Un estudiante';
    await crearNotificacion({
      idUsuario: vacante.id_empresario,
      tipo: 'postulacion',
      mensaje: `Nueva postulación de ${nombre} en "${vacante.titulo}"`,
    });
  } catch (e) {
    console.error('[postulacion] no se pudo notificar al empresario', e);
  }

  return { ok: true, postulacionId: postulacion.id };
}

// Retira una postulación propia.
export function retirarPostulacionService(idPostulacion: string, idEstudiante: string) {
  return retirarPostulacion(idPostulacion, idEstudiante);
}

// Lista las postulaciones de un estudiante (para "Mis postulaciones").
export async function listarMisPostulaciones(
  idEstudiante: string,
): Promise<MiPostulacionDTO[]> {
  const filas = await listarPostulacionesDeEstudiante(idEstudiante);
  return filas.map((p) => ({
    id: p.id,
    estado: (p.estado as EstadoPostulacion) ?? 'pendiente',
    mensaje: p.mensaje,
    fecha: p.creado.toISOString(),
    vacante: {
      id: p.vacantes.id,
      titulo: p.vacantes.titulo,
      area: p.vacantes.area,
      empresa:
        p.vacantes.perfiles_empresario?.nombre_empresa?.trim() ||
        p.vacantes.perfiles_empresario?.usuarios?.nombre ||
        'Empresa',
      modalidad: p.vacantes.modalidad,
      tipoEmpleo: p.vacantes.tipo_empleo,
      estado: (p.vacantes.estado as EstadoVacante) ?? 'borrador',
    },
  }));
}

// Indica si el estudiante ya se postuló a una vacante y su estado.
export async function estadoPostulacionDeEstudiante(
  idVacante: string,
  idEstudiante: string,
): Promise<{ existe: boolean; estado: EstadoPostulacion | null; fecha: string | null }> {
  if (!UUID_RE.test(idVacante)) return { existe: false, estado: null, fecha: null };
  const p = await buscarPostulacionExistente(idVacante, idEstudiante);
  if (!p) return { existe: false, estado: null, fecha: null };
  return {
    existe: true,
    estado: (p.estado as EstadoPostulacion) ?? 'pendiente',
    fecha: p.creado ? p.creado.toISOString() : null,
  };
}

// ── Gestión del empresario ──────────────────────────────────────────────────

// Lista los postulantes de una vacante SOLO si pertenece al empresario.
export async function listarPostulantesDeVacante(
  idVacante: string,
  idEmpresario: string,
): Promise<PostulanteDTO[] | 'no_autorizado' | 'no_encontrado'> {
  const vacante = await buscarVacanteActiva(idVacante);
  if (!vacante) return 'no_encontrado';
  if (vacante.id_empresario !== idEmpresario) return 'no_autorizado';

  const filas = await listarPostulacionesDeVacante(idVacante);
  return filas.map((p) => ({
    id: p.id,
    estado: (p.estado as EstadoPostulacion) ?? 'pendiente',
    mensaje: p.mensaje,
    cvUrl: p.cv_url,
    fecha: p.creado.toISOString(),
    estudiante: {
      id: p.perfiles_estudiante?.id_usuario ?? '',
      nombre: p.perfiles_estudiante?.usuarios?.nombre ?? 'Estudiante',
      imageUrl: p.perfiles_estudiante?.usuarios?.image_url ?? null,
      tituloProfesional: p.perfiles_estudiante?.titulo_profesional ?? null,
    },
  }));
}

// El empresario cambia el estado de una postulación. Valida que la vacante sea suya.
export async function cambiarEstadoPostulacionService(
  idPostulacion: string,
  idEmpresario: string,
  nuevoEstado: EstadoPostulacionEmpresa,
): Promise<'ok' | 'no_autorizado' | 'no_encontrado'> {
  const postulacion = await buscarPostulacionConVacante(idPostulacion);
  if (!postulacion) return 'no_encontrado';
  if (postulacion.vacantes?.id_empresario !== idEmpresario) return 'no_autorizado';

  await actualizarEstadoPostulacion(idPostulacion, nuevoEstado);

  // Avisa al estudiante del cambio de estado (tolerante).
  try {
    const label = ESTADO_POSTULACION_META[nuevoEstado].label.toLowerCase();
    await crearNotificacion({
      idUsuario: postulacion.id_estudiante,
      tipo: 'postulacion_estado',
      mensaje: `Tu postulación a "${postulacion.vacantes?.titulo ?? 'una vacante'}" cambió a: ${label}`,
    });
  } catch (e) {
    console.error('[postulacion] no se pudo notificar al estudiante', e);
  }

  return 'ok';
}
