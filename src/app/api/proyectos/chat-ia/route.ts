import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { chatAgente } from '@/lib/openrouter';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { chatProyectoIaSchema } from '@/server/validation/proyectos.schema';

// POST /api/proyectos/chat-ia
// Recibe el historial de la conversacion con el agente y devuelve la siguiente respuesta.
// Cuando el agente tiene suficiente informacion (turnoUsuario >= 7), devuelve
// { listo: true, proyecto: {...} } para que el cliente cree el borrador real.
// Solo empresarios autenticados.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const parseo = await parsearBody(request, chatProyectoIaSchema);
  if (!parseo.ok) return parseo.respuesta;

  const { historial, turnoUsuario } = parseo.data;

  try {
    const respuesta = await chatAgente(historial, turnoUsuario);
    return NextResponse.json(respuesta);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (
      msg.includes('API_KEY') ||
      msg.includes('no configurada') ||
      msg.includes('agente de IA') ||
      msg.includes('OpenRouter')
    ) {
      return error('El servicio de IA no esta disponible en este momento.', 503);
    }
    return errorInterno('proyectos/chat-ia/POST', e);
  }
}
