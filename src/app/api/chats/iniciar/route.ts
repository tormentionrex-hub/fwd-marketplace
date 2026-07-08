import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { iniciarChatConEmpresario } from '@/server/services/chat.service';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { iniciarChatSchema } from '@/server/validation/chat.schema';

// POST /api/chats/iniciar
// Body: { idProyecto }. Crea o recupera el chat entre el estudiante autenticado
// y el empresario dueño del proyecto. Devuelve { chatId }.
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);

  const parseo = await parsearBody(request, iniciarChatSchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const resultado = await iniciarChatConEmpresario(
      parseo.data.idProyecto,
      user.id,
      user.roles?.nombre ?? '',
      parseo.data.crear ?? true,
    );

    if (resultado === 'proyecto_no_encontrado') return error('Proyecto no encontrado', 404);
    if (resultado === 'es_dueno') return error('Este proyecto es tuyo', 409);
    if (resultado === 'solo_estudiantes') {
      return error('Solo los estudiantes pueden contactar a la empresa', 403);
    }

    return NextResponse.json({ chatId: resultado.chatId });
  } catch (e) {
    return errorInterno('POST /api/chats/iniciar', e);
  }
}
