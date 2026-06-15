import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { obtenerConversacion, enviarMensaje } from '@/server/services/chat.service';

// GET /api/chats/:id/mensajes — mensajes de la conversación (marca leídos).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { id } = await params;
  const conversacion = await obtenerConversacion(id, user.id);
  if (!conversacion) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }
  return NextResponse.json(conversacion);
}

// POST /api/chats/:id/mensajes — envía un mensaje (solo participantes).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { id } = await params;

  let body: { contenido?: string; documentUrl?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const resultado = await enviarMensaje(
    id,
    user.id,
    body.contenido ?? null,
    body.documentUrl ?? null,
  );

  if (resultado === 'no_autorizado') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  if (resultado === 'vacio') {
    return NextResponse.json({ error: 'El mensaje está vacío' }, { status: 400 });
  }

  return NextResponse.json({ mensaje: resultado.mensaje }, { status: 201 });
}
