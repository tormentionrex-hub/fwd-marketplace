import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { generarPreguntasDesdeBrief } from '@/lib/ia-preguntas';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { preguntasIaSchema } from '@/server/validation/proyectos.schema';

// POST /api/proyectos/preguntas-ia
// Recibe un brief y devuelve 3 preguntas de seguimiento generadas por IA con opciones de respuesta.
// El cliente muestra las preguntas una por una (estilo Freelancer) y luego llama a /generar-ia con las respuestas.
// Solo empresarios autenticados.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const parseo = await parsearBody(request, preguntasIaSchema);
  if (!parseo.ok) return parseo.respuesta;

  const { brief } = parseo.data;

  try {
    const preguntas = await generarPreguntasDesdeBrief(brief);
    return NextResponse.json({ preguntas });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('no configurada')) {
      return error('El servicio de IA no esta disponible en este momento.', 503);
    }
    return errorInterno('proyectos/preguntas-ia/POST', e);
  }
}
