import { NextResponse } from 'next/server';
import { login } from '@/server/services/auth.service';
import { crearCookieSesion } from '@/server/auth/session';
import { rutaPorRol } from '@/server/auth/rutas';

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
  }

  const resultado = await login(email, password);
  if (!resultado) {
    return NextResponse.json(
      { error: 'Correo o contraseña incorrectos' },
      { status: 401 }
    );
  }

  // Lo privado (id, rol, correo, token) viaja en la cookie httpOnly.
  await crearCookieSesion({
    uid: resultado.usuario.id,
    rol: resultado.usuario.rol,
    correo: resultado.usuario.correo,
    token: resultado.token,
  });

  // Lo público (nombre, foto) vuelve en el body para que el cliente lo guarde
  // en localStorage. redirectTo se calcula acá según el rol, así el cliente sabe
  // a dónde ir sin conocer el rol (que es privado).
  return NextResponse.json({
    perfil: {
      nombre: resultado.usuario.nombre,
      image_url: resultado.usuario.image_url,
    },
    redirectTo: rutaPorRol(resultado.usuario.rol),
  });
}
