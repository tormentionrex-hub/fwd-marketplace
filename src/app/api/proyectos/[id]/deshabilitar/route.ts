import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { deshabilitarProyectoService } from '@/server/services/proyecto.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// PATCH /api/proyectos/:id/deshabilitar
// Regresa un proyecto publicado a borrador. Solo el dueño del proyecto puede hacerlo.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;

  try {
    const resultado = await deshabilitarProyectoService(id, user.id);
    if (resultado === 'no_encontrado') return error('Proyecto no encontrado', 404);
    if (resultado === 'no_autorizado') return error('No tienes permiso para deshabilitar este proyecto', 403);
    if (resultado === 'no_publicado') return error('Solo se pueden deshabilitar proyectos publicados', 409);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('proyectos/deshabilitar/PATCH', e);
  }
}
