import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { cargarQuizzes } from '@/server/services/quizzes.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/estudiante/quizzes — devuelve el progreso de quizzes del estudiante.
export async function GET() {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  try {
    const estado = await cargarQuizzes(user.id);
    return NextResponse.json({ estado });
  } catch (e) {
    return errorInterno('GET /api/estudiante/quizzes', e);
  }
}
