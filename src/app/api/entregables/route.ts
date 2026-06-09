import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { enviarEntregable } from '@/server/services/entregable.service';

// POST /api/entregables — el estudiante adjudicado sube un entregable.
// Body JSON: { idProyecto, tipo?, archivoUrl }
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo estudiantes' }, { status: 403 });
  }

  let body: { idProyecto?: string; tipo?: string; archivoUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }
  if (!body.idProyecto || !body.archivoUrl) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  const r = await enviarEntregable({
    idProyecto: body.idProyecto,
    idEstudiante: user.id,
    tipo: body.tipo?.trim() ? body.tipo.trim() : null,
    archivoUrl: body.archivoUrl,
  });

  if (r === 'sin_archivo') {
    return NextResponse.json({ error: 'Falta el archivo del entregable' }, { status: 422 });
  }
  if (r === 'proyecto_no_activo') {
    return NextResponse.json({ error: 'El proyecto no está en desarrollo' }, { status: 409 });
  }
  if (r === 'no_autorizado') {
    return NextResponse.json({ error: 'No sos el estudiante adjudicado' }, { status: 403 });
  }
  return NextResponse.json({ ok: true, entregableId: r.entregableId }, { status: 201 });
}
