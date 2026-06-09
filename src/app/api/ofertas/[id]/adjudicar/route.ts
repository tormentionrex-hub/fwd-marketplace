import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { adjudicar } from '@/server/services/gestion.service';

// POST /api/ofertas/[id]/adjudicar — el empresario adjudica una oferta.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'empresario') {
    return NextResponse.json({ error: 'Solo empresarios' }, { status: 403 });
  }

  const { id } = await params;
  const r = await adjudicar(id, user.id);

  if (r === 'no_encontrado') {
    return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
  }
  if (r === 'no_autorizado') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  return NextResponse.json({ ok: true });
}
