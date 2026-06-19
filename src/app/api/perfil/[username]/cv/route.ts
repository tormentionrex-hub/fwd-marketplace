import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { obtenerCvPublicoDeEstudiante } from '@/server/services/curriculum.service';
import { buscarIdEstudiantePorSlug, obtenerCvDeUsuario } from '@/server/repositories/curriculum.repository';
import { urlFirmadaCv } from '@/server/storage/curriculum-storage';

// GET /api/perfil/:username/cv
// Devuelve el CV público de un estudiante. Para empresarios o administradores autenticados.
// Para empresarios registra el acceso en auditoría; para admins no se audita en cv_accesos.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'empresario' && user.roles.nombre !== 'admin') {
    return NextResponse.json(
      { error: 'Solo los empresarios y administradores pueden ver el CV de un estudiante' },
      { status: 403 },
    );
  }

  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const accion = searchParams.get('accion') === 'descargar' ? 'descargar' : 'ver';
  const idProyecto = searchParams.get('proyecto');

  if (user.roles.nombre === 'admin') {
    const idEstudiante = await buscarIdEstudiantePorSlug(username);
    if (!idEstudiante) {
      return NextResponse.json({ error: 'Estudiante no encontrado.' }, { status: 404 });
    }

    const cv = await obtenerCvDeUsuario(idEstudiante);
    if (!cv || !cv.es_publico) {
      return NextResponse.json({ error: 'Este estudiante no tiene un CV público.' }, { status: 404 });
    }

    const [viewUrl, downloadUrl] = await Promise.all([
      urlFirmadaCv(cv.storage_path),
      urlFirmadaCv(cv.storage_path, cv.file_name),
    ]);

    if (!viewUrl || !downloadUrl) {
      return NextResponse.json({ error: 'No se pudieron generar los enlaces para el currículum.' }, { status: 500 });
    }

    return NextResponse.json({
      cv: {
        fileName: cv.file_name,
        fileType: cv.file_type,
        actualizado: cv.actualizado.toISOString(),
        viewUrl,
        downloadUrl,
      },
    });
  }

  const cv = await obtenerCvPublicoDeEstudiante(username, user.id, { accion, idProyecto });
  if (!cv) {
    return NextResponse.json({ error: 'Este estudiante no tiene un CV público.' }, { status: 404 });
  }
  return NextResponse.json({ cv });
}
