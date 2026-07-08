import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { retirarOfertaService } from '@/server/services/oferta.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// DELETE /api/ofertas/[id]
// Retira una oferta del estudiante autenticado.
// No se puede retirar si ya fue adjudicada.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('No autorizado', 403);

  const { id } = await params;

  try {
    const resultado = await retirarOfertaService(id, user.id);

    if (resultado === 'no_encontrada') return error('Oferta no encontrada', 404);
    if (resultado === 'no_autorizado') return error('No podés retirar esta oferta', 403);
    if (resultado === 'adjudicada') {
      return error('No podés retirar una oferta que ya fue adjudicada', 403);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('ofertas/DELETE', e);
  }
}
