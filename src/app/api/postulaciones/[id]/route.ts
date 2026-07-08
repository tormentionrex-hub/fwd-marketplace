import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { retirarPostulacionService } from '@/server/services/postulacion.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// DELETE /api/postulaciones/[id] — el estudiante retira su postulación.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  const { id } = await params;
  try {
    const resultado = await retirarPostulacionService(id, user.id);
    if (resultado === 'no_encontrada') return error('Postulación no encontrada', 404);
    if (resultado === 'no_autorizado') return error('Esta postulación no es tuya', 403);
    if (resultado === 'ya_resuelta') {
      return error('No podés retirar una postulación ya aceptada', 409);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('postulaciones/[id]/DELETE', e);
  }
}
