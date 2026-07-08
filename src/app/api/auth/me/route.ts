import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';

export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json({
    id: user.id,
    nombre: user.nombre,
    image_url: user.image_url ?? null,
    rol: user.roles?.nombre ?? null,
  });
}
