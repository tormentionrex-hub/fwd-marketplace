import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { listarConversaciones } from '@/server/services/chat.service';

// GET /api/chats — conversaciones del usuario autenticado (estudiante o empresario).
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const conversaciones = await listarConversaciones(user.id);
  return NextResponse.json({ conversaciones });
}
