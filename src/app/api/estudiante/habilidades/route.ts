import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { agregarHabilidadAlCatalogo } from '@/server/services/perfil-estudiante.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// POST /api/estudiante/habilidades
// Body: { nombre: string }. Agrega una tecnología al catálogo (reutiliza si ya
// existe; valida con IA que sea del dominio de programación antes de crearla).
// Devuelve { id, nombre } para que el cliente la seleccione. Solo estudiantes.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo los estudiantes', 403);

  let body: { nombre?: unknown };
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre : '';

  try {
    const resultado = await agregarHabilidadAlCatalogo(nombre);
    if (resultado === 'nombre_invalido') return error('Nombre inválido', 400);
    if (resultado === 'no_es_tecnologia') {
      return error('Ese término no parece una tecnología o lenguaje de programación', 422);
    }
    return NextResponse.json({ ok: true, id: resultado.id, nombre: resultado.nombre }, { status: 201 });
  } catch (e) {
    return errorInterno('estudiante/habilidades/POST', e);
  }
}
