import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { cambiarPrivacidadMiCv } from '@/server/services/curriculum.service';

// PATCH /api/estudiante/cv/privacidad  body: { esPublico: boolean }
export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }

  let body: { esPublico?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }
  if (typeof body.esPublico !== 'boolean') {
    return NextResponse.json({ error: 'esPublico debe ser booleano' }, { status: 422 });
  }

  const cv = await cambiarPrivacidadMiCv(user.id, body.esPublico);
  if (!cv) return NextResponse.json({ error: 'No tenés un CV cargado' }, { status: 404 });
  return NextResponse.json({ ok: true, cv });
}
