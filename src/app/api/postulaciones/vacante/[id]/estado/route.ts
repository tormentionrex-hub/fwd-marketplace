import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { estadoPostulacionDeEstudiante } from '@/server/services/postulacion.service';
import { errorInterno } from '@/server/http/responder';

// GET /api/postulaciones/vacante/[id]/estado — ¿el estudiante ya se postuló a
// esta vacante? Devuelve { existe, estado, fecha }.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ existe: false, estado: null, fecha: null });

  const { id } = await params;
  try {
    const resultado = await estadoPostulacionDeEstudiante(id, user.id);
    return NextResponse.json(resultado);
  } catch (e) {
    return errorInterno('postulaciones/vacante/estado', e);
  }
}
