import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/server/auth/get-user';

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (q.length < 2) {
    return NextResponse.json({ usuarios: [] });
  }

  // Si es empresario, solo busca estudiantes
  // Si es estudiante, busca empresarios y otros estudiantes
  const targetRoles =
    user.roles?.nombre === 'empresario' ? ['estudiante'] : ['empresario', 'estudiante'];

  const results = await db.usuarios.findMany({
    where: {
      id: { not: user.id },
      estado: 'activo',
      nombre: {
        contains: q,
        mode: 'insensitive',
      },
      roles: {
        nombre: { in: targetRoles },
      },
    },
    take: 12,
    select: {
      id: true,
      nombre: true,
      image_url: true,
      roles: { select: { nombre: true } },
    },
  });

  const usuarios = results.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    fotoUrl: u.image_url ?? null,
    rol: u.roles?.nombre ?? 'usuario',
  }));

  return NextResponse.json({ usuarios });
}
