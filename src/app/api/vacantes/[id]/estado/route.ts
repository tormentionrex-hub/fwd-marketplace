import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/server/auth/get-user';
import { cambiarEstadoVacanteService } from '@/server/services/vacante.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';

// El empresario puede mover la vacante entre estados de cierre. Publicar tiene su
// propia ruta (/publicar) porque además fija la fecha de publicación.
const bodySchema = z.object({
  estado: z.enum(['borrador', 'en_contratacion', 'cerrada', 'finalizada']),
});

// PATCH /api/vacantes/[id]/estado — cambia el estado de la vacante. Solo el dueño.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;
  const parseo = await parsearBody(request, bodySchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const resultado = await cambiarEstadoVacanteService(id, user.id, parseo.data.estado);
    if (resultado === 'no_encontrado') return error('Vacante no encontrada', 404);
    if (resultado === 'no_autorizado') return error('Esta vacante no es tuya', 403);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('vacantes/estado', e);
  }
}
