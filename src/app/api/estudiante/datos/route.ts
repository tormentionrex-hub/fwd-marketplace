import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { exportarDatosEstudiante } from '@/server/services/cuenta-estudiante.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/estudiante/datos — descarga un JSON con todos los datos del estudiante.
export async function GET() {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  try {
    const datos = await exportarDatosEstudiante(user.id);
    if (!datos) return error('No encontrado', 404);
    return new NextResponse(JSON.stringify({ exportadoEl: new Date().toISOString(), ...datos }, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mis-datos-fwd.json"',
      },
    });
  } catch (e) {
    return errorInterno('GET /api/estudiante/datos', e);
  }
}
