import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { estadoOfertaDeEstudiante } from '@/server/services/oferta.service';

// GET /api/ofertas/proyecto/:id/estado — indica si el estudiante autenticado ya
// envió una oferta a este proyecto y, de ser así, su estado actual.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const resultado = await estadoOfertaDeEstudiante(id, user.id);
  return NextResponse.json(resultado);
}
