import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { enviarOferta } from '@/server/services/oferta.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { crearOfertaSchema } from '@/server/validation/ofertas.schema';

// POST /api/ofertas
// Crea una nueva oferta. Solo estudiantes autenticados.
// Body: { idProyecto, propuesta, prototipoUrl?, documentacionUrl? }
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') {
    return error('Solo los estudiantes pueden enviar ofertas', 403);
  }

  const parseo = await parsearBody(request, crearOfertaSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { idProyecto, propuesta, prototipoUrl, documentacionUrl } = parseo.data;

  try {
    const resultado = await enviarOferta({
      idProyecto,
      idEstudiante: user.id,
      propuesta, // ya viene recortada por el schema
      prototipoUrl: prototipoUrl ? prototipoUrl : null,
      documentacionUrl: documentacionUrl ? documentacionUrl : null,
    });

    if (resultado === 'no_verificado') {
      return error('Tu cuenta aún no está verificada por FWD Costa Rica', 403);
    }
    if (resultado === 'proyecto_no_encontrado') return error('Proyecto no encontrado', 404);
    if (resultado === 'proyecto_cerrado') {
      return error('Este proyecto ya cerró su período de recepción de ofertas', 403);
    }
    if (resultado === 'ya_oferto') {
      return error('Ya enviaste una oferta a este proyecto', 409);
    }
    if (resultado === 'sin_prototipo') {
      return error('Debés adjuntar al menos un prototipo (archivo o URL)', 422);
    }

    return NextResponse.json({ ok: true, ofertaId: resultado.ofertaId }, { status: 201 });
  } catch (e) {
    return errorInterno('ofertas/POST', e);
  }
}
