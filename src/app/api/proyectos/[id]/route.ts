import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  obtenerDetalleProyecto,
  actualizarProyectoService,
  eliminarProyectoService,
} from '@/server/services/proyecto.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { actualizarProyectoSchema } from '@/server/validation/proyectos.schema';

// GET /api/proyectos/:id — información completa de la ficha pública del proyecto.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const proyecto = await obtenerDetalleProyecto(id);
    if (!proyecto) return error('Proyecto no encontrado', 404);
    return NextResponse.json({ proyecto });
  } catch (e) {
    return errorInterno('proyectos/GET', e);
  }
}

// PATCH /api/proyectos/:id — Actualiza campos del proyecto. Solo el empresario dueño.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;

  const parseo = await parsearBody(request, actualizarProyectoSchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const resultado = await actualizarProyectoService(id, user.id, parseo.data);
    if (resultado === 'no_encontrado') return error('Proyecto no encontrado', 404);
    if (resultado === 'no_autorizado') return error('Este proyecto no es tuyo', 403);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('proyectos/PATCH', e);
  }
}

// DELETE /api/proyectos/:id — Elimina el proyecto. Solo borradores, solo el dueño.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;

  try {
    const resultado = await eliminarProyectoService(id, user.id);
    if (resultado === 'no_encontrado') return error('Proyecto no encontrado', 404);
    if (resultado === 'no_autorizado') return error('Este proyecto no es tuyo', 403);
    if (resultado === 'no_borrador') return error('Solo se pueden eliminar proyectos en borrador', 409);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('proyectos/DELETE', e);
  }
}
