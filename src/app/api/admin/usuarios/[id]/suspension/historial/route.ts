import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';
import { historialSuspensiones } from '@/server/repositories/usuario.repository';

// Ruta admin protegida por cookie: siempre dinámica (sin optimización estática).
export const dynamic = 'force-dynamic';

// GET /api/admin/usuarios/:id/suspension/historial — historial de suspensiones.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!puedeAccederPanelAdmin(user.roles.nombre)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const historial = await historialSuspensiones(id);
    return NextResponse.json(historial);
  } catch {
    return NextResponse.json(
      { error: 'No se pudo obtener el historial' },
      { status: 500 }
    );
  }
}
