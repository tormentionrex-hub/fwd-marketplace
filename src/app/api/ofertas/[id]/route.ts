import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { retirarOfertaService } from '@/server/services/oferta.service';

// DELETE /api/ofertas/[id]
// Retira una oferta del estudiante autenticado.
// No se puede retirar si ya fue adjudicada.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;

  const resultado = await retirarOfertaService(id, user.id);

  if (resultado === 'no_encontrada') {
    return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
  }
  if (resultado === 'no_autorizado') {
    return NextResponse.json({ error: 'No podés retirar esta oferta' }, { status: 403 });
  }
  if (resultado === 'adjudicada') {
    return NextResponse.json(
      { error: 'No podés retirar una oferta que ya fue adjudicada' },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
