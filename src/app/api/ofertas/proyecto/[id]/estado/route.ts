import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { estadoOfertaDeEstudiante } from '@/server/services/oferta.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/ofertas/proyecto/:id/estado — indica si el estudiante autenticado ya
// envió una oferta a este proyecto y, de ser así, su estado actual.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);

  const { id } = await params;

  try {
    const resultado = await estadoOfertaDeEstudiante(id, user.id);
    return NextResponse.json(resultado);
  } catch (e) {
    return errorInterno('ofertas/proyecto/estado', e);
  }
}
