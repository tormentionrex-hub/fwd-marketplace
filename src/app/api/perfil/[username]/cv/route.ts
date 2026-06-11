import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { obtenerCvPublicoDeEstudiante } from '@/server/services/curriculum.service';

// GET /api/perfil/:username/cv
// Devuelve el CV público de un estudiante. SOLO para empresarios autenticados.
// Registra el acceso en auditoría (quién, cuándo, acción, proyecto si aplica).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'empresario') {
    return NextResponse.json(
      { error: 'Solo los empresarios pueden ver el CV de un estudiante' },
      { status: 403 },
    );
  }

  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const accion = searchParams.get('accion') === 'descargar' ? 'descargar' : 'ver';
  const idProyecto = searchParams.get('proyecto');

  const cv = await obtenerCvPublicoDeEstudiante(username, user.id, { accion, idProyecto });
  if (!cv) {
    return NextResponse.json({ error: 'Este estudiante no tiene un CV público.' }, { status: 404 });
  }
  return NextResponse.json({ cv });
}
