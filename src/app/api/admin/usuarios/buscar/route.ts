import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';
import { mismoOrigen } from '@/server/http/request';
import { buscarUsuariosParaGestion } from '@/server/repositories/usuario.repository';

export const dynamic = 'force-dynamic';

// GET /api/admin/usuarios/buscar?q=texto
// Devuelve hasta 15 usuarios que coincidan con el texto (nombre o correo).
// Requiere mínimo 2 caracteres.
export async function GET(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!puedeAccederPanelAdmin(user.roles.nombre)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';

  try {
    const usuarios = await buscarUsuariosParaGestion(q);
    // Serializamos el id del rol (BigInt → string) para que JSON.stringify no falle.
    const serializables = usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      correo: u.correo,
      estado: u.estado,
      rol: u.roles.nombre,
      idRol: u.roles.id.toString(),
    }));
    return NextResponse.json({ usuarios: serializables });
  } catch (error) {
    console.error('[API] buscar usuarios:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
