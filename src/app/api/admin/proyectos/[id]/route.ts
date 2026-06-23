import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';
import { mismoOrigen } from '@/server/http/request';
import { db } from '@/lib/db';
import {
  suspenderProyectoRepo,
  vistoBuenoProyectoRepo,
  eliminarProyectoRepo,
  actualizarProyecto,
} from '@/server/repositories/proyecto.repository';
import { editarProyectoSchema } from '@/server/validation/admin.schema';

// Ruta de mutación protegida por cookie: siempre dinámica (sin optimización
// estática que, en dev con poca memoria, levanta un worker que puede crashear).
export const dynamic = 'force-dynamic';

// DELETE /api/admin/proyectos/:id — elimina un proyecto.
// Body: { motivo: string }
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

  let body: { motivo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (!body.motivo || body.motivo.trim().length === 0) {
    return NextResponse.json(
      { error: 'El motivo de eliminación es obligatorio' },
      { status: 400 }
    );
  }

  // Verificar que el proyecto existe
  const proyecto = await db.proyectos.findUnique({
    where: { id },
  });
  if (!proyecto) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  try {
    // Registramos en consola el motivo de la eliminación
    console.log(
      `[ADMIN DELETE] Proyecto "${proyecto.titulo}" (ID: ${id}) eliminado por admin ${user.nombre} (${user.id}). Motivo: ${body.motivo.trim()}`
    );
    await eliminarProyectoRepo(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar el proyecto' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/proyectos/:id — suspende o da visto bueno a un proyecto.
// Body: { accion: 'suspender' | 'visto_bueno', motivo?: string }
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

  let body: {
    accion?: 'suspender' | 'visto_bueno' | 'editar';
    motivo?: string;
    titulo?: string;
    descripcion?: string;
    area_negocio?: string | null;
    plazo_dias?: number | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (
    !body.accion ||
    (body.accion !== 'suspender' &&
      body.accion !== 'visto_bueno' &&
      body.accion !== 'editar')
  ) {
    return NextResponse.json(
      { error: 'Acción no permitida o no especificada' },
      { status: 400 }
    );
  }

  // Verificar que el proyecto existe
  const proyecto = await db.proyectos.findUnique({
    where: { id },
  });
  if (!proyecto) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  // ── Editar campos del proyecto ──────────────────────────────────────────
  if (body.accion === 'editar') {
    const parseo = editarProyectoSchema.safeParse(body);
    if (!parseo.success) {
      const mensaje = parseo.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json({ error: mensaje }, { status: 400 });
    }
    const { titulo, descripcion, area_negocio, plazo_dias } = parseo.data;
    try {
      await actualizarProyecto(id, {
        titulo,
        descripcion,
        areaNegocio: area_negocio ?? null,
        plazoDias: plazo_dias ?? null,
      });
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error('Error al editar proyecto:', error);
      return NextResponse.json(
        { error: 'No se pudo editar el proyecto' },
        { status: 500 }
      );
    }
  }

  if (body.accion === 'suspender') {
    if (!body.motivo || body.motivo.trim().length === 0) {
      return NextResponse.json(
        { error: 'El motivo de suspensión es obligatorio' },
        { status: 400 }
      );
    }
    if (proyecto.estado === 'pendiente_revision') {
      return NextResponse.json(
        { error: 'El proyecto ya se encuentra pendiente de revisión' },
        { status: 400 }
      );
    }

    try {
      await suspenderProyectoRepo(id, body.motivo.trim(), proyecto.estado);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error('Error al suspender proyecto:', error);
      return NextResponse.json(
        { error: 'No se pudo suspender el proyecto' },
        { status: 500 }
      );
    }
  } else {
    // visto_bueno
    if (proyecto.estado !== 'pendiente_revision') {
      return NextResponse.json(
        { error: 'El proyecto no está pendiente de revisión' },
        { status: 400 }
      );
    }

    try {
      await vistoBuenoProyectoRepo(id, proyecto.estado_previo);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error('Error al dar visto bueno al proyecto:', error);
      return NextResponse.json(
        { error: 'No se pudo dar el visto bueno al proyecto' },
        { status: 500 }
      );
    }
  }
}
