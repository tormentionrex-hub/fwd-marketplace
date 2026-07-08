import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { listarConversaciones } from '@/server/services/chat.service';

// GET /api/chats — conversaciones del usuario autenticado (estudiante o empresario).
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const conversaciones = await listarConversaciones(user.id);
    return NextResponse.json({
      conversaciones,
      currentUser: { id: user.id, rol: user.roles?.nombre }
    });
  } catch (error) {
    console.error("[GET /api/chats] ROUTE HANDLER ERROR:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
