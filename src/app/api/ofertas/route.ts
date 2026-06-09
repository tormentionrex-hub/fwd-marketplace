import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { crearOfertaValidada, type CrearOfertaError } from '@/server/services/oferta.service';

const HTTP_POR_ERROR: Record<CrearOfertaError, number> = {
  propuesta_requerida: 400,
  proyecto_no_encontrado: 404,
  proyecto_cancelado: 409,
  proyecto_cerrado: 409,
  proyecto_vencido: 409,
  oferta_duplicada: 409,
};

const MENSAJE_POR_ERROR: Record<CrearOfertaError, string> = {
  propuesta_requerida: 'La propuesta es obligatoria.',
  proyecto_no_encontrado: 'El proyecto no existe.',
  proyecto_cancelado: 'El proyecto fue cancelado y no admite ofertas.',
  proyecto_cerrado: 'El proyecto está cerrado y no admite nuevas ofertas.',
  proyecto_vencido: 'El período para enviar ofertas ha finalizado.',
  oferta_duplicada: 'Ya enviaste una oferta a este proyecto.',
};

// POST /api/ofertas — crea la oferta del estudiante autenticado aplicando las
// reglas de negocio (proyecto activo, no vencido, una sola oferta por proyecto).
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Debes iniciar sesión para enviar una oferta.' },
      { status: 401 },
    );
  }

  if (user.roles.nombre.toLowerCase() !== 'estudiante') {
    return NextResponse.json(
      { error: 'Solo los estudiantes pueden enviar ofertas.' },
      { status: 403 },
    );
  }

  let body: { proyectoId?: string; propuesta?: string; prototipoUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (!body.proyectoId || !body.propuesta) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
  }

  const resultado = await crearOfertaValidada({
    idProyecto: body.proyectoId,
    idEstudiante: user.id,
    propuesta: body.propuesta,
    prototipoUrl: body.prototipoUrl ?? null,
  });

  if (!resultado.ok) {
    return NextResponse.json(
      { error: MENSAJE_POR_ERROR[resultado.error] },
      { status: HTTP_POR_ERROR[resultado.error] },
    );
  }

  return NextResponse.json({ oferta: resultado.oferta }, { status: 201 });
}
