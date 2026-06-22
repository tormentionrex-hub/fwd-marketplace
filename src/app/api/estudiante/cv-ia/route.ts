import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { optimizarPerfilParaPuesto } from '@/lib/ia-cv';

// POST /api/estudiante/cv-ia
// Optimiza el resumen y perfil del estudiante en base a un puesto objetivo.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let puesto: string, resumen: string, habilidades: string[];
  try {
    const body = await request.json();
    puesto = (body.puesto ?? '').trim();
    resumen = body.resumen ?? '';
    habilidades = Array.isArray(body.habilidades) ? body.habilidades : [];
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  if (!puesto) {
    return NextResponse.json({ error: 'Debes ingresar el puesto al que deseas aplicar.' }, { status: 400 });
  }

  try {
    const result = await optimizarPerfilParaPuesto(puesto, resumen, habilidades);
    return NextResponse.json({ result });
  } catch (err) {
    console.error('[cv-ia] Error optimizando perfil:', err);
    return NextResponse.json(
      { error: 'El servicio de IA no está disponible en este momento. Intentá más tarde.' },
      { status: 503 },
    );
  }
}
