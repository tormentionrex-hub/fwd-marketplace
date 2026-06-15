import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { buscarChatEntre, crearChat } from '@/server/repositories/chat.repository';
import { buscarEstudianteAdjudicado } from '@/server/repositories/oferta-gestion.repository';
import { buscarProyectoGestion } from '@/server/repositories/proyecto.repository';
import { error } from '@/server/http/responder';

// POST /api/chats/proyecto/[id]
// Busca el chat existente entre el empresario y el estudiante adjudicado del
// proyecto. Si no existe, lo crea. Devuelve { chatId }.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;

  const proyecto = await buscarProyectoGestion(id);
  if (!proyecto) return error('Proyecto no encontrado', 404);
  if (proyecto.id_empresario !== user.id) return error('Este proyecto no es tuyo', 403);

  const adj = await buscarEstudianteAdjudicado(id);
  if (!adj) return error('No hay estudiante adjudicado en este proyecto', 404);

  let chat = await buscarChatEntre(id, adj.id_estudiante, user.id);
  if (!chat) {
    chat = await crearChat(id, adj.id_estudiante, user.id);
  }

  return NextResponse.json({ chatId: chat.id });
}
