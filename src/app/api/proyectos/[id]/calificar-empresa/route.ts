import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { calificarEmpresa } from '@/server/services/evaluacion-empresa.service';
import { parsearBody, error } from '@/server/http/responder';
import { calificarEmpresaSchema } from '@/server/validation/evaluaciones.schema';

// POST /api/proyectos/[id]/calificar-empresa
// El estudiante adjudicado califica al empresario al finalizar el proyecto.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  const { id: idProyecto } = await params;

  const parseo = await parsearBody(request, calificarEmpresaSchema);
  if (!parseo.ok) return parseo.respuesta;

  const resultado = await calificarEmpresa({
    idProyecto,
    idEstudiante: user.id,
    puntuacion: parseo.data.puntuacion,
    comentario: parseo.data.comentario,
  });

  if (resultado === 'proyecto_no_encontrado') return error('Proyecto no encontrado', 404);
  if (resultado === 'proyecto_no_cerrado') return error('Solo se puede calificar cuando el proyecto está cerrado', 400);
  if (resultado === 'no_es_adjudicado') return error('No eres el estudiante adjudicado a este proyecto', 403);

  return NextResponse.json({ ok: true });
}
