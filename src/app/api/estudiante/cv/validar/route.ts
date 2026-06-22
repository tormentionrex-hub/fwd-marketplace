import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { analizarCv } from '@/lib/ia-cv';

const MAX_CV_BYTES = 10 * 1024 * 1024;

// POST /api/estudiante/cv/validar — analiza un PDF al vuelo sin almacenarlo.
// Permite validar el CV antes de subirlo oficialmente.
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 });
  }

  const archivo = formData.get('archivo') as File | null;
  if (!archivo) return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
  if (!archivo.type.includes('pdf')) {
    return NextResponse.json({ error: 'Solo se admiten archivos PDF.' }, { status: 422 });
  }
  if (archivo.size > MAX_CV_BYTES) {
    return NextResponse.json({ error: 'El archivo supera el máximo de 10 MB.' }, { status: 422 });
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());

  try {
    const analisis = await analizarCv(buffer);
    return NextResponse.json({ analisis });
  } catch (err) {
    console.error('[cv-validar] Error IA:', err);
    return NextResponse.json(
      { error: 'El servicio de IA no está disponible en este momento. Intentá más tarde.' },
      { status: 503 },
    );
  }
}
