import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/server/auth/get-user';
import { completarFase } from '@/server/services/quizzes.service';
import { error, errorInterno, parsearBody } from '@/server/http/responder';

const schema = z.object({
  temaId: z.string().min(1).max(80),
  fase: z.number().int().min(1).max(10),
  respuestas: z.array(z.number().int().min(0).max(3)).length(5),
});

// Mensajes de error legibles por motivo de rechazo del service.
const MENSAJES_ERROR: Record<string, string> = {
  tema_invalido: 'El tema seleccionado no existe.',
  fase_invalida: 'La fase seleccionada no es válida.',
  fase_bloqueada: 'Debes completar las fases anteriores primero.',
  respuestas_invalidas: 'Las respuestas enviadas no son válidas.',
};

// POST /api/estudiante/quizzes/completar — califica un intento de fase y, si
// aprueba la fase siguiente, actualiza el progreso y otorga la insignia.
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  const parseo = await parsearBody(request, schema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const resultado = await completarFase(
      user.id,
      parseo.data.temaId,
      parseo.data.fase,
      parseo.data.respuestas,
    );

    if (!resultado.ok) {
      const mensaje = MENSAJES_ERROR[resultado.motivo] ?? 'No se pudo procesar la fase.';
      return error(mensaje, 400);
    }

    const { ok: _ok, ...datos } = resultado;
    return NextResponse.json(datos);
  } catch (e) {
    return errorInterno('POST /api/estudiante/quizzes/completar', e);
  }
}
