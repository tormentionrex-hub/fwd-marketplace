import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { cerrarProyectoService } from '@/server/services/gestion.service';

// POST /api/proyectos/[id]/cerrar  — Body: { puntuacion: number (1-5), comentario? }
// Cierra el proyecto [id] y guarda la evaluación del estudiante. Solo el empresario dueño.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'empresario') {
    return NextResponse.json({ error: 'Solo empresarios' }, { status: 403 });
  }

  const { id } = await params;

  let body: { puntuacion?: number; comentario?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const puntuacion = Number(body.puntuacion);
  if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return NextResponse.json({ error: 'Calificación inválida (1 a 5)' }, { status: 422 });
  }

  const resultado = await cerrarProyectoService({
    idProyecto: id,
    idEmpresario: user.id,
    puntuacion,
    comentario: body.comentario ?? null,
  });

  if (resultado === 'no_autorizado') {
    return NextResponse.json({ error: 'Este proyecto no es tuyo' }, { status: 403 });
  }
  if (resultado === 'no_encontrado') {
    return NextResponse.json({ error: 'No hay un estudiante adjudicado' }, { status: 404 });
  }
  if (resultado === 'falta_entregable_final') {
    return NextResponse.json(
      { error: 'Primero tenés que aprobar el entregable final' },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
}
