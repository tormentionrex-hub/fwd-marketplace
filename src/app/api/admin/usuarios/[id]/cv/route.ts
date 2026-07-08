import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';
import { obtenerCvDeUsuario } from '@/server/repositories/curriculum.repository';
import { urlFirmadaCv } from '@/server/storage/curriculum-storage';
import { mismoOrigen } from '@/server/http/request';

// Ruta admin protegida por cookie: siempre dinámica (sin optimización estática).
export const dynamic = 'force-dynamic';

// GET /api/admin/usuarios/:id/cv
// Devuelve las URLs firmadas de ver y descargar el CV de un estudiante por su ID de usuario.
// Protegido: solo para administradores.
export async function GET(
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

  try {
    const cv = await obtenerCvDeUsuario(id);
    if (!cv) {
      return NextResponse.json({ error: 'Este estudiante no tiene un currículum subido.' }, { status: 404 });
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
        viewUrl,
        downloadUrl,
      },
    });
  } catch (err) {
    console.error('[Admin CV GET]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
