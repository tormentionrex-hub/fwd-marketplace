import { NextResponse } from 'next/server';
import { registrarEmpresario } from '@/server/services/auth.service';
import { crearCookieSesion } from '@/server/auth/session';

// Registro principal: SOLO crea empresarios. El alta de estudiantes irá luego
// por el panel admin.
export async function POST(request: Request) {
  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { firstName, lastName, email, password } = body;
  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      { error: 'Faltan datos obligatorios' },
      { status: 400 }
    );
  }

  const nombre = `${firstName.trim()} ${lastName.trim()}`.trim();

  const resultado = await registrarEmpresario(nombre, email, password);
  if (!resultado) {
    return NextResponse.json(
      { error: 'Ese correo ya está registrado' },
      { status: 409 }
    );
  }

  await crearCookieSesion({
    uid: resultado.usuario.id,
    rol: resultado.usuario.rol,
    correo: resultado.usuario.correo,
    token: resultado.token,
  });

  return NextResponse.json({
    perfil: {
      nombre: resultado.usuario.nombre,
      image_url: resultado.usuario.image_url,
    },
  });
}
