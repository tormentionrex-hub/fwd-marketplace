import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { enviarEntregable } from '@/server/services/entregable.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { crearEntregableSchema } from '@/server/validation/entregables.schema';

// POST /api/entregables — el estudiante adjudicado sube un entregable.
// Body JSON: { idProyecto, tipo?, archivoUrl }
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  const parseo = await parsearBody(request, crearEntregableSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { idProyecto, tipo, archivoUrl } = parseo.data;

  try {
    const r = await enviarEntregable({
      idProyecto,
      idEstudiante: user.id,
      tipo: tipo?.trim() ? tipo.trim() : null,
      archivoUrl,
    });

    if (r === 'sin_archivo') return error('Falta el archivo del entregable', 422);
    if (r === 'proyecto_no_activo') return error('El proyecto no está en desarrollo', 409);
    if (r === 'no_autorizado') return error('No sos el estudiante adjudicado', 403);
    return NextResponse.json({ ok: true, entregableId: r.entregableId }, { status: 201 });
  } catch (e) {
    return errorInterno('entregables/POST', e);
  }
}
