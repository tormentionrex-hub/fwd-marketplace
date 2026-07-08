import 'server-only';
import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { chatConCv } from '@/lib/ia-cv';
import type { MensajeChat } from '@/lib/ia-cv';

const MAX_PDF_MB = 10;
const MAX_PDFS = 3;
const MAX_HISTORIAL = 40;

export async function POST(request: Request) {
  const usuario = await getUser();
  if (!usuario) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  if (usuario.roles?.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo estudiantes pueden usar esta funcion.' }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Solicitud invalida.' }, { status: 400 });
  }

  const mensaje = (formData.get('mensaje') as string | null)?.trim() ?? '';
  if (!mensaje) {
    return NextResponse.json({ error: 'El mensaje no puede estar vacio.' }, { status: 400 });
  }

  let historial: MensajeChat[] = [];
  const historialRaw = formData.get('historial') as string | null;
  if (historialRaw) {
    try {
      const parsed = JSON.parse(historialRaw);
      if (Array.isArray(parsed)) {
        historial = parsed
          .filter(
            (m): m is MensajeChat =>
              m &&
              typeof m === 'object' &&
              (m.rol === 'usuario' || m.rol === 'asistente') &&
              typeof m.contenido === 'string' &&
              m.contenido.length > 0,
          )
          .slice(-MAX_HISTORIAL);
      }
    } catch {
      // ignore malformed history
    }
  }

  const archivos = formData.getAll('archivos') as File[];
  const pdfBuffers: Buffer[] = [];
  for (const archivo of archivos.slice(0, MAX_PDFS)) {
    if (!archivo.type.includes('pdf')) continue;
    if (archivo.size > MAX_PDF_MB * 1024 * 1024) continue;
    const arrayBuf = await archivo.arrayBuffer();
    pdfBuffers.push(Buffer.from(arrayBuf));
  }

  try {
    const respuesta = await chatConCv(
      historial,
      mensaje,
      pdfBuffers.length > 0 ? pdfBuffers : undefined,
    );
    return NextResponse.json({ respuesta });
  } catch (err) {
    console.error('[cv-ia/chat] Error:', err);
    return NextResponse.json(
      { error: 'El servicio de IA no esta disponible. Intenta de nuevo en unos segundos.' },
      { status: 503 },
    );
  }
}
