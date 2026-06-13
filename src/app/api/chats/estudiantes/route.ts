import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { buscarChatEstudiante, crearChatEstudiante } from '@/server/repositories/chat.repository';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/chats/estudiantes — Crea o recupera un chat entre dos estudiantes.
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  // Permitimos iniciar chat solo a estudiantes
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo estudiantes pueden iniciar chats con estudiantes' }, { status: 403 });
  }

  let body: { idEstudianteDestino?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const idDestino = (body.idEstudianteDestino ?? '').trim();
  if (!UUID_RE.test(idDestino) || idDestino === user.id) {
    return NextResponse.json({ error: 'ID de estudiante inválido' }, { status: 400 });
  }

  // Buscar si ya existe el chat
  const existente = await buscarChatEstudiante(user.id, idDestino);
  if (existente) {
    return NextResponse.json({ ok: true, id: existente.id }, { status: 200 });
  }

  // Crear el nuevo chat
  const nuevo = await crearChatEstudiante(user.id, idDestino);
  return NextResponse.json({ ok: true, id: nuevo.id }, { status: 201 });
}
