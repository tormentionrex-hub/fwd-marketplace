import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/server/auth/get-user';
import { buscarProyectoGestion } from '@/server/repositories/proyecto.repository';
import { buscarEstudianteAdjudicado } from '@/server/repositories/oferta-gestion.repository';
import { upsertEvaluacionEmpresa, promedioReputacionEmpresa } from '@/server/repositories/evaluacion-empresa.repository';
import { actualizarReputacionEmpresa } from '@/server/repositories/perfil-empresario.repository';
import { error } from '@/server/http/responder';

const bodySchema = z.object({
  puntuacion: z.number().int().min(1).max(5),
  comentario: z.string().trim().min(10, 'El comentario debe tener al menos 10 caracteres').max(500),
});

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

  const proyecto = await buscarProyectoGestion(idProyecto);
  if (!proyecto) return error('Proyecto no encontrado', 404);
  if (proyecto.estado !== 'cerrado') return error('Solo se puede calificar cuando el proyecto está cerrado', 400);

  const adj = await buscarEstudianteAdjudicado(idProyecto);
  if (!adj || adj.id_estudiante !== user.id) return error('No eres el estudiante adjudicado a este proyecto', 403);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return error(parsed.error.errors[0]?.message ?? 'Datos inválidos', 422);

  const { puntuacion, comentario } = parsed.data;

  await upsertEvaluacionEmpresa({
    idProyecto,
    idEstudiante: user.id,
    idEmpresario: proyecto.id_empresario,
    puntuacion,
    comentario,
  });

  const nuevaReputacion = await promedioReputacionEmpresa(proyecto.id_empresario);
  await actualizarReputacionEmpresa(proyecto.id_empresario, nuevaReputacion);

  return NextResponse.json({ ok: true });
}
