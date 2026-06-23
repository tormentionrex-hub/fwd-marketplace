import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';
import { mismoOrigen } from '@/server/http/request';
import {
  buscarOfertaPorId,
  actualizarEstadoOfertaAdmin,
  eliminarOfertaAdmin,
} from '@/server/repositories/oferta.repository';
import { editarOfertaSchema } from '@/server/validation/admin.schema';

// Ruta de mutación protegida por cookie: siempre dinámica (sin optimización
// estática que, en dev con poca memoria, levanta un worker que puede crashear).
export const dynamic = 'force-dynamic';

// PATCH /api/admin/ofertas/:id — el admin cambia el estado de una oferta.
// Body: { estado: 'enviada' | 'en_revision' | 'preseleccionado' | 'aceptado' | 'rechazado' | 'cancelado' }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!puedeAccederPanelAdmin(user.roles.nombre)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { id } = await params;

  let crudo: unknown;
  try {
    crudo = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const parseo = editarOfertaSchema.safeParse(crudo);
  if (!parseo.success) {
    const mensaje = parseo.error.issues[0]?.message ?? 'Datos inválidos';
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }

  const oferta = await buscarOfertaPorId(id);
  if (!oferta) {
    return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
  }

  try {
    await actualizarEstadoOfertaAdmin(id, parseo.data.estado);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/ofertas/PATCH]', e);
    return NextResponse.json(
      { error: 'No se pudo actualizar la oferta' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ofertas/:id — el admin elimina una oferta.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!puedeAccederPanelAdmin(user.roles.nombre)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { id } = await params;

  const oferta = await buscarOfertaPorId(id);
  if (!oferta) {
    return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
  }

  try {
    await eliminarOfertaAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/ofertas/DELETE]', e);
    return NextResponse.json(
      { error: 'No se pudo eliminar la oferta' },
      { status: 500 }
    );
  }
}
