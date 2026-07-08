import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { publicarVacanteService } from '@/server/services/vacante.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// PATCH /api/vacantes/[id]/publicar — publica la vacante (estado 'abierta').
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
    const resultado = await publicarVacanteService(id, user.id);
    if (resultado === 'no_encontrado') return error('Vacante no encontrada', 404);
    if (resultado === 'no_autorizado') return error('Esta vacante no es tuya', 403);
    if (resultado === 'ya_publicada') return error('La vacante ya está publicada', 409);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('vacantes/publicar', e);
  }
}
