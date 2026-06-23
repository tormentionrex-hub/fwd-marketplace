import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import {
  suspenderUsuario,
  reactivarUsuario,
  buscarUsuarioPorId,
} from '@/server/repositories/usuario.repository';

// POST /api/admin/usuarios/:id/suspension — suspende una cuenta.
// Body: { motivo: string }
export async function POST(
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
  if (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json(
      { error: 'No puedes suspender tu propia cuenta' },
      { status: 400 }
    );
  }

  let body: { motivo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (!body.motivo || body.motivo.trim().length === 0) {
    return NextResponse.json(
      { error: 'El motivo de suspensión es obligatorio' },
      { status: 400 }
    );
  }

  // Verificar que el usuario existe y no está ya suspendido
  const objetivo = await buscarUsuarioPorId(id);
  if (!objetivo) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  if (objetivo.estado === 'suspendido') {
    return NextResponse.json(
      { error: 'La cuenta ya está suspendida' },
      { status: 400 }
    );
  }

  try {
    await suspenderUsuario(id, body.motivo.trim(), user.id, user.nombre);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo suspender la cuenta' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/usuarios/:id/suspension — reactiva una cuenta suspendida.
// Body: { motivo?: string }
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
  if (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { id } = await params;

  let body: { motivo?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Verificar que el usuario existe y está suspendido
  const objetivo = await buscarUsuarioPorId(id);
  if (!objetivo) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  if (objetivo.estado !== 'suspendido') {
    return NextResponse.json(
      { error: 'La cuenta no está suspendida' },
      { status: 400 }
    );
  }

  try {
    await reactivarUsuario(
      id,
      body.motivo?.trim() || null,
      user.id,
      user.nombre
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo reactivar la cuenta' },
      { status: 500 }
    );
  }
}
