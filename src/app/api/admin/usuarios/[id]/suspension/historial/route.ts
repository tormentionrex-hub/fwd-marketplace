import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { historialSuspensiones } from '@/server/repositories/usuario.repository';

// GET /api/admin/usuarios/:id/suspension/historial — historial de suspensiones.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'admin') {
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
