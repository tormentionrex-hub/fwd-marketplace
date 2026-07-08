import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { cambiarEstadoPostulacionService } from '@/server/services/postulacion.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { cambiarEstadoPostulacionSchema } from '@/server/validation/postulaciones.schema';

// PATCH /api/postulaciones/[id]/estado — el empresario cambia el estado de una
// postulación (pendiente/en_revision/aceptado/rechazado). Solo el dueño de la vacante.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;
  const parseo = await parsearBody(request, cambiarEstadoPostulacionSchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const resultado = await cambiarEstadoPostulacionService(id, user.id, parseo.data.estado);
    if (resultado === 'no_encontrado') return error('Postulación no encontrada', 404);
    if (resultado === 'no_autorizado') return error('Esta vacante no es tuya', 403);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('postulaciones/estado', e);
  }
}
