import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { listarMisOfertas } from '@/server/services/oferta.service';

// GET /api/ofertas/mis-ofertas — todas las ofertas del estudiante autenticado,
// con proyecto, empresario, tecnologías, estado de la oferta y del proyecto.
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const ofertas = await listarMisOfertas(user.id);
  return NextResponse.json({ ofertas });
}
