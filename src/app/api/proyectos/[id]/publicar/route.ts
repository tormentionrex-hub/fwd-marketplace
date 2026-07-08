import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { publicarProyectoService } from '@/server/services/proyecto.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// PATCH /api/proyectos/:id/publicar — Cambia estado borrador → publicado. Solo el dueño.
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
    const resultado = await publicarProyectoService(id, user.id);
    if (resultado === 'no_encontrado') return error('Proyecto no encontrado', 404);
    if (resultado === 'no_autorizado') return error('Este proyecto no es tuyo', 403);
    if (resultado === 'ya_publicado') return error('El proyecto ya está publicado', 409);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('proyectos/publicar/PATCH', e);
  }
}
