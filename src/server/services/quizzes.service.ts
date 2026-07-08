import 'server-only';
import {
  leerPreferenciasEstudiante,
  escribirPreferenciasEstudiante,
} from '@/server/repositories/usuario.repository';
import { getFase, getTemaConCategoria } from '@/lib/quizzes';
import { ACIERTOS_PARA_APROBAR, PREGUNTAS_POR_FASE, puntosPorFase } from '@/lib/quizzes/tipos';
import {
  parsearQuizzes,
  type QuizzesEstado,
} from '@/lib/quizzes/progreso';

// Progreso de quizzes del estudiante. Se guarda en el JSON
// perfiles_estudiante.preferencias bajo la clave `quizzes`, preservando el resto
// de secciones (empleabilidad, notif, priv, conexiones). El servidor es la
// autoridad: valida y CALIFICA las respuestas contra el banco estático; el
// cliente nunca decide el avance por su cuenta.

/** Extrae el estado de quizzes del JSON crudo de preferencias. */
function quizzesDesdeRaw(raw: unknown): QuizzesEstado {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return parsearQuizzes(null);
  return parsearQuizzes((raw as Record<string, unknown>).quizzes);
}

export async function cargarQuizzes(idUsuario: string): Promise<QuizzesEstado> {
  const raw = await leerPreferenciasEstudiante(idUsuario);
  return quizzesDesdeRaw(raw);
}

export interface ResultadoCompletarFase {
  /** ¿Se alcanzó el umbral de aciertos para aprobar la fase? */
  aprobado: boolean;
  /** Cantidad de respuestas correctas. */
  aciertos: number;
  /** Cantidad total de preguntas de la fase. */
  total: number;
  /** Índices correctos por pregunta (para retroalimentar al cliente). */
  correctas: number[];
  /** ¿Esta llamada desbloqueó una fase nueva (ganó insignia)? */
  insigniaNueva: boolean;
  /** Estado de quizzes actualizado. */
  estado: QuizzesEstado;
}

export type ErrorCompletarFase =
  | { ok: false; motivo: 'tema_invalido' }
  | { ok: false; motivo: 'fase_invalida' }
  | { ok: false; motivo: 'fase_bloqueada' }
  | { ok: false; motivo: 'respuestas_invalidas' };

export type ResultadoCompletar =
  | ({ ok: true } & ResultadoCompletarFase)
  | ErrorCompletarFase;

/**
 * Califica un intento de fase y, si aprueba y es la fase inmediatamente
 * siguiente a la ya alcanzada, avanza el progreso y otorga la insignia.
 *
 * - Reintentar una fase ya completada está permitido: se califica pero NO
 *   retrocede el progreso ni vuelve a sumar puntos.
 * - Intentar una fase que aún no está desbloqueada devuelve `fase_bloqueada`.
 */
export async function completarFase(
  idUsuario: string,
  temaId: unknown,
  fase: unknown,
  respuestas: unknown,
): Promise<ResultadoCompletar> {
  if (typeof temaId !== 'string' || !getTemaConCategoria(temaId)) {
    return { ok: false, motivo: 'tema_invalido' };
  }
  if (typeof fase !== 'number' || !Number.isInteger(fase)) {
    return { ok: false, motivo: 'fase_invalida' };
  }
  const faseData = getFase(temaId, fase);
  if (!faseData) return { ok: false, motivo: 'fase_invalida' };

  if (
    !Array.isArray(respuestas) ||
    respuestas.length !== PREGUNTAS_POR_FASE ||
    !respuestas.every((r) => typeof r === 'number' && Number.isInteger(r))
  ) {
    return { ok: false, motivo: 'respuestas_invalidas' };
  }

  const raw = await leerPreferenciasEstudiante(idUsuario);
  const estado = quizzesDesdeRaw(raw);
  const faseMaxActual = estado.progreso[temaId] ?? 0;

  // No se puede saltar fases: solo se permite jugar una fase ya alcanzada
  // (reintento) o la inmediatamente siguiente.
  if (fase > faseMaxActual + 1) {
    return { ok: false, motivo: 'fase_bloqueada' };
  }

  // Calificación autoritativa contra el banco.
  const correctas = faseData.preguntas.map((p) => p.correcta);
  let aciertos = 0;
  for (let i = 0; i < correctas.length; i++) {
    if ((respuestas as number[])[i] === correctas[i]) aciertos++;
  }
  const aprobado = aciertos >= ACIERTOS_PARA_APROBAR;

  // Solo avanza si aprueba Y es exactamente la próxima fase por desbloquear.
  const esProximaFase = fase === faseMaxActual + 1;
  let insigniaNueva = false;
  let estadoFinal = estado;

  if (aprobado && esProximaFase) {
    const nuevoProgreso = { ...estado.progreso, [temaId]: fase };
    const nuevosPuntos = estado.puntos + puntosPorFase(fase);
    estadoFinal = {
      progreso: nuevoProgreso,
      puntos: nuevosPuntos,
      actualizado: new Date().toISOString(),
    };
    const base =
      raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
    await escribirPreferenciasEstudiante(idUsuario, { ...base, quizzes: estadoFinal });
    insigniaNueva = true;
  }

  return {
    ok: true,
    aprobado,
    aciertos,
    total: PREGUNTAS_POR_FASE,
    correctas,
    insigniaNueva,
    estado: estadoFinal,
  };
}
