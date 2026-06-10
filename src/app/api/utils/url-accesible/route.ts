import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';

// GET /api/utils/url-accesible?url=...
// Valida el formato de la URL y comprueba (server-side) que responda (< 400).
// Útil para verificar que un repo Git o una demo en vivo sean accesibles.
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const valor = new URL(request.url).searchParams.get('url') ?? '';

  let parsed: URL;
  try {
    parsed = new URL(valor);
  } catch {
    return NextResponse.json({ valida: false, accesible: false });
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ valida: false, accesible: false });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    let res = await fetch(parsed.toString(), {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });
    // Algunos servidores no soportan HEAD → reintento con GET.
    if (res.status === 405 || res.status === 501) {
      res = await fetch(parsed.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
    }
    return NextResponse.json({ valida: true, accesible: res.status < 400 });
  } catch {
    return NextResponse.json({ valida: true, accesible: false });
  } finally {
    clearTimeout(timeout);
  }
}
