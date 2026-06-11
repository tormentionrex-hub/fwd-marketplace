import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { urlDescargaMiCv } from '@/server/services/curriculum.service';

// GET /api/estudiante/cv/descargar — redirige a una URL firmada de descarga.
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }
  const url = await urlDescargaMiCv(user.id);
  if (!url) return NextResponse.json({ error: 'No tenés un CV cargado' }, { status: 404 });
  return NextResponse.redirect(url);
}
