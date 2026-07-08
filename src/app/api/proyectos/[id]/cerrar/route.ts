import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { cerrarProyectoService } from '@/server/services/gestion.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { cerrarProyectoSchema } from '@/server/validation/proyectos.schema';

// POST /api/proyectos/[id]/cerrar  — Body: { puntuacion: number (1-5), comentario? }
// Cierra el proyecto [id] y guarda la evaluación del estudiante. Solo el empresario dueño.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;

  const parseo = await parsearBody(request, cerrarProyectoSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { puntuacion, comentario } = parseo.data;

  try {
    const resultado = await cerrarProyectoService({
      idProyecto: id,
      idEmpresario: user.id,
      puntuacion,
      comentario: comentario ?? null,
    });

    if (resultado === 'no_autorizado') return error('Este proyecto no es tuyo', 403);
    if (resultado === 'no_encontrado') return error('No hay un estudiante adjudicado', 404);
    if (resultado === 'falta_entregable_final') {
      return error('Primero tenés que aprobar el entregable final', 409);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('proyectos/cerrar', e);
  }
}
