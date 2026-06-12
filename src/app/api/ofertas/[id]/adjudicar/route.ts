import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { adjudicarOfertaService } from '@/server/services/gestion.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// POST /api/ofertas/[id]/adjudicar  — adjudica la oferta [id]. Solo el empresario dueño.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;

  try {
    const resultado = await adjudicarOfertaService(id, user.id);

    if (resultado === 'no_encontrado') return error('Oferta no encontrada', 404);
    if (resultado === 'no_autorizado') return error('Este proyecto no es tuyo', 403);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('ofertas/adjudicar', e);
  }
}
