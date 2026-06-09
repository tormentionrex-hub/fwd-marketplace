import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { cerrarProyecto } from '@/server/services/gestion.service';

// POST /api/proyectos/[id]/cerrar — el empresario cierra el proyecto y califica
// al estudiante. Body JSON: { puntuacion, comentario? }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'empresario') {
    return NextResponse.json({ error: 'Solo empresarios' }, { status: 403 });
  }

  const { id } = await params;

  let body: { puntuacion?: unknown; comentario?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const puntuacion = body.puntuacion;
  if (
    typeof puntuacion !== 'number' ||
    !Number.isInteger(puntuacion) ||
    puntuacion < 1 ||
    puntuacion > 5
  ) {
    return NextResponse.json(
      { error: 'La puntuación debe ser un entero de 1 a 5' },
      { status: 400 }
    );
  }

  const r = await cerrarProyecto({
    idProyecto: id,
    idEmpresario: user.id,
    puntuacion,
    comentario: body.comentario?.trim() ? body.comentario.trim() : null,
  });

  if (r === 'falta_entregable_final') {
    return NextResponse.json({ error: 'Falta aprobar el entregable final' }, { status: 409 });
  }
  if (r === 'no_encontrado') {
    return NextResponse.json({ error: 'Proyecto o estudiante no encontrado' }, { status: 404 });
  }
  if (r === 'no_autorizado') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  return NextResponse.json({ ok: true });
}
