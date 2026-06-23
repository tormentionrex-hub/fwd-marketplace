import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { analizarMiCv } from '@/server/services/cv-analyzer.service';

// POST /api/estudiante/cv/analizar — analiza el CV del estudiante con IA.
// No recibe body: el CV ya está en Supabase Storage, se identifica por sesión.
export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }

  const resultado = await analizarMiCv(user.id);

  if (resultado === 'sin_cv') {
    return NextResponse.json({ error: 'No tenés un CV cargado' }, { status: 404 });
  }
  if (resultado === 'solo_pdf') {
    return NextResponse.json(
      { error: 'El análisis IA solo está disponible para archivos PDF. Reemplazá tu CV en formato PDF.' },
      { status: 422 },
    );
  }
  if (resultado === 'error_descarga') {
    return NextResponse.json(
      { error: 'No se pudo acceder al archivo. Intentá de nuevo.' },
      { status: 500 },
    );
  }
  if (resultado === 'error_ia') {
    return NextResponse.json(
      { error: 'El servicio de IA no está disponible en este momento. Intentá más tarde.' },
      { status: 503 },
    );
  }

  return NextResponse.json({ analisis: resultado.analisis });
}
