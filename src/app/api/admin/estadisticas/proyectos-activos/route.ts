import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';
import { mismoOrigen } from '@/server/http/request';
import { listarProyectosActivosDetalle } from '@/server/repositories/estadisticas-admin.repository';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!puedeAccederPanelAdmin(user.roles.nombre)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  try {
    const proyectos = await listarProyectosActivosDetalle();
    return NextResponse.json({ proyectos });
  } catch (error) {
    console.error('[API] proyectos-activos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
