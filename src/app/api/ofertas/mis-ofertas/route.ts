import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { listarMisOfertas } from '@/server/services/oferta.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/ofertas/mis-ofertas — todas las ofertas del estudiante autenticado,
// con proyecto, empresario, tecnologías, estado de la oferta y del proyecto.
export async function GET() {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);

  try {
    const ofertas = await listarMisOfertas(user.id);
    return NextResponse.json({ ofertas });
  } catch (e) {
    return errorInterno('ofertas/mis-ofertas', e);
  }
}
