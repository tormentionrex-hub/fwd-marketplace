import { NextResponse } from 'next/server';
import { registrarEstudiante } from '@/server/services/auth.service';
import { crearCookieSesion } from '@/server/auth/session';
import { rutaPorRol } from '@/server/auth/rutas';

// POST /api/auth/register-estudiante
// Solo acepta correos que ya fueron invitados por el admin (en pending_verifications).
// Si el correo no fue invitado → 403 con mensaje explicativo.
// Si fue invitado → crea cuenta activa + sesión inmediata (el admin ya pre-aprobó).
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

  const resultado = await registrarEstudiante(nombre, email, password);

  if (resultado === 'no_invitado') {
    return NextResponse.json(
      {
        error:
          'Este correo no ha sido invitado aún. Pedile al equipo de FWD una invitación.',
      },
      { status: 403 }
    );
  }

  if (resultado === null) {
    return NextResponse.json(
      { error: 'Ese correo ya está registrado' },
      { status: 409 }
    );
  }

  // Invitación válida → cuenta creada → sesión inmediata
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
    redirectTo: rutaPorRol(resultado.usuario.rol),
  });
}
