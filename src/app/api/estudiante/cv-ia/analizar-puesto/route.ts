import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { analizarCvParaPuesto } from '@/lib/ia-cv';

const MAX_PDF_MB = 10;

// POST /api/estudiante/cv-ia/analizar-puesto
// Analiza un PDF adjunto evaluando su compatibilidad con el puesto indicado.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Solicitud invalida.' }, { status: 400 });
  }

  const puesto = (formData.get('puesto') as string | null)?.trim() ?? '';
  if (!puesto) {
    return NextResponse.json({ error: 'Debes indicar el puesto al que vas a aplicar.' }, { status: 400 });
  }

  const archivo = formData.get('archivo') as File | null;
  if (!archivo) {
    return NextResponse.json({ error: 'Debes adjuntar tu CV en formato PDF.' }, { status: 400 });
  }
  if (archivo.type !== 'application/pdf') {
    return NextResponse.json({ error: 'El archivo debe ser un PDF.' }, { status: 400 });
  }
  if (archivo.size > MAX_PDF_MB * 1024 * 1024) {
    return NextResponse.json({ error: `El PDF no puede superar ${MAX_PDF_MB} MB.` }, { status: 400 });
  }
  if (archivo.size === 0) {
    return NextResponse.json({ error: 'El archivo PDF esta vacio.' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await archivo.arrayBuffer());
    const analisis = await analizarCvParaPuesto(buffer, puesto);
    return NextResponse.json({ analisis });
  } catch (err) {
    console.error('[cv-ia/analizar-puesto]', err);
    return NextResponse.json(
      { error: 'No se pudo analizar el CV. Intenta de nuevo en unos momentos.' },
      { status: 503 },
    );
  }
}
