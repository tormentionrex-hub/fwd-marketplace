import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  cargarPerfilEditable,
  guardarPerfilEditable,
} from '@/server/services/perfil-estudiante.service';

// GET /api/estudiante/perfil — datos para precargar el editor de perfil.
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }

  const perfil = await cargarPerfilEditable(user.id);
  return NextResponse.json(perfil);
}

// PUT /api/estudiante/perfil — guarda datos personales + habilidades.
export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const resultado = await guardarPerfilEditable(
    user.id,
    body as Parameters<typeof guardarPerfilEditable>[1],
  );

  if (resultado === 'datos_invalidos') {
    return NextResponse.json({ error: 'Nombre o correo inválidos' }, { status: 422 });
  }
  if (resultado === 'correo_en_uso') {
    return NextResponse.json({ error: 'Ese correo ya está en uso' }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
