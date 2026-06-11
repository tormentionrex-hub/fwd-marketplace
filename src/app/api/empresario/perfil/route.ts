import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { guardarPerfilEmpresario } from '@/server/services/perfil-empresario.service';

// PUT /api/empresario/perfil — guarda el nombre de la empresa y la foto de perfil.
export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'empresario') {
    return NextResponse.json({ error: 'Solo los empresarios' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const resultado = await guardarPerfilEmpresario(
    user.id,
    body as Parameters<typeof guardarPerfilEmpresario>[1],
  );

  if (resultado === 'datos_invalidos') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 });
  }
  if (resultado === 'no_existe') {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
