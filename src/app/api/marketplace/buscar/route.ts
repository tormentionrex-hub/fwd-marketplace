import { NextResponse } from 'next/server';
import { buscarProyectosSemantico } from '@/server/services/proyecto.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/marketplace/buscar?q=turismo&limite=20
// Devuelve IDs de proyectos publicados ordenados por similitud semántica.
// El cliente los usa para reordenar la lista ya cargada.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const limite = Math.min(parseInt(searchParams.get('limite') ?? '20', 10), 50);

  if (!q || q.length < 2) {
    return error('La búsqueda debe tener al menos 2 caracteres', 400);
  }

  try {
    const resultados = await buscarProyectosSemantico(q, limite);
    return NextResponse.json({ resultados });
  } catch (e) {
    return errorInterno('marketplace/buscar/GET', e);
  }
}
