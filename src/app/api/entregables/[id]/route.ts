import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  aprobarEntregableService,
  solicitarCambiosService,
  type ResultadoGestion,
} from '@/server/services/gestion.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { gestionEntregableSchema } from '@/server/validation/entregables.schema';

// PATCH /api/entregables/[id]  — Body: { accion: 'aprobar' | 'cambios', comentario? }
// Acciones del empresario sobre un entregable (Página 14, fase 3).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;

  const parseo = await parsearBody(request, gestionEntregableSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { accion, comentario } = parseo.data;

  try {
    let resultado: ResultadoGestion;
    if (accion === 'aprobar') {
      resultado = await aprobarEntregableService(id, user.id);
    } else {
      resultado = await solicitarCambiosService(id, user.id, comentario ?? '');
    }

    if (resultado === 'no_encontrado') return error('Entregable no encontrado', 404);
    if (resultado === 'no_autorizado') return error('Este proyecto no es tuyo', 403);
    if (resultado === 'comentario_requerido') return error('El comentario es obligatorio', 422);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('entregables/PATCH', e);
  }
}
