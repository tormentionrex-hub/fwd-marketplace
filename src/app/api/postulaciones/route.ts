import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { postularse } from '@/server/services/postulacion.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { crearPostulacionSchema } from '@/server/validation/postulaciones.schema';

// POST /api/postulaciones — el estudiante se postula a una vacante.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') {
    return error('Solo los estudiantes pueden postularse', 403);
  }

  const parseo = await parsearBody(request, crearPostulacionSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { idVacante, mensaje, cvUrl } = parseo.data;

  try {
    const resultado = await postularse({
      idVacante,
      idEstudiante: user.id,
      mensaje,
      cvUrl: cvUrl ? cvUrl : null,
    });

    if (resultado === 'no_verificado') {
      return error('Tu cuenta aún no está verificada por FWD Costa Rica', 403);
    }
    if (resultado === 'vacante_no_encontrada') return error('Vacante no encontrada', 404);
    if (resultado === 'vacante_cerrada') {
      return error('Esta vacante ya no recibe postulaciones', 403);
    }
    if (resultado === 'ya_postulado') {
      return error('Ya te postulaste a esta vacante', 409);
    }

    return NextResponse.json(
      { ok: true, postulacionId: resultado.postulacionId },
      { status: 201 },
    );
  } catch (e) {
    return errorInterno('postulaciones/POST', e);
  }
}
