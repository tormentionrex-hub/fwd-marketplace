import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { enviarOferta } from '@/server/services/oferta.service';

// POST /api/ofertas
// Crea una nueva oferta. Solo estudiantes autenticados.
// Body: { idProyecto, propuesta, prototipoUrl?, documentacionUrl? }
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json(
      { error: 'Solo los estudiantes pueden enviar ofertas' },
      { status: 403 }
    );
  }

  let body: {
    idProyecto?: string;
    propuesta?: string;
    prototipoUrl?: string;
    documentacionUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { idProyecto, propuesta, prototipoUrl, documentacionUrl } = body;

  if (!idProyecto || !propuesta?.trim()) {
    return NextResponse.json(
      { error: 'Faltan datos obligatorios: idProyecto y propuesta' },
      { status: 400 }
    );
  }

  const resultado = await enviarOferta({
    idProyecto,
    idEstudiante: user.id,
    propuesta: propuesta.trim(),
    prototipoUrl: prototipoUrl || null,
    documentacionUrl: documentacionUrl || null,
  });

  if (resultado === 'proyecto_no_encontrado') {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }
  if (resultado === 'proyecto_cerrado') {
    return NextResponse.json(
      { error: 'Este proyecto ya cerró su período de recepción de ofertas' },
      { status: 403 }
    );
  }
  if (resultado === 'ya_oferto') {
    return NextResponse.json(
      { error: 'Ya enviaste una oferta a este proyecto' },
      { status: 409 }
    );
  }
  if (resultado === 'sin_prototipo') {
    return NextResponse.json(
      { error: 'Debés adjuntar al menos un prototipo (archivo o URL)' },
      { status: 422 }
    );
  }

  return NextResponse.json({ ok: true, ofertaId: resultado.ofertaId }, { status: 201 });
}
