import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { sugerirTecnologiasService } from '@/server/services/perfil-estudiante.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// POST /api/estudiante/habilidades/buscar
// Body: { q: string }. Devuelve tecnologías del catálogo + sugerencias de IA
// (solo del dominio de programación/tecnología). Solo estudiantes.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo los estudiantes', 403);

  let body: { q?: unknown };
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const q = typeof body.q === 'string' ? body.q : '';
  if (q.trim().length < 2) {
    return NextResponse.json({ enCatalogo: [], nuevas: [] });
  }

  try {
    const resultado = await sugerirTecnologiasService(q);
    return NextResponse.json(resultado);
  } catch (e) {
    return errorInterno('estudiante/habilidades/buscar', e);
  }
}
