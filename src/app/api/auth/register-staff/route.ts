import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/server/auth/password';
import { generarToken } from '@/server/auth/token';
import { crearCookieSesion } from '@/server/auth/session';
import { rutaPorRol } from '@/server/auth/rutas';
import { permitido } from '@/server/auth/rate-limit';
import { clienteIp, mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';
import { registrarAuditoria } from '@/server/repositories/audit-log.repository';

const QUINCE_MIN = 15 * 60_000;

export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const ip = clienteIp(request);
  if (!permitido(`register-staff-ip:${ip}`, 10, QUINCE_MIN)) {
    return error('Demasiadas solicitudes. Intentá de nuevo más tarde.', 429);
  }

  let body: { email?: string; firstName?: string; lastName?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const { email, firstName, lastName, password } = body;
  if (!email || !firstName || !lastName || !password) {
    return error('Datos incompletos', 400);
  }

  const emailNorm = email.trim().toLowerCase();
  const nombreCompleto = `${firstName.trim()} ${lastName.trim()}`.trim();

  try {
    // 1. Verificar si hay invitación pendiente de staff
    const invitacion = await db.invitaciones_staff.findUnique({
      where: { email: emailNorm }
    });

    if (!invitacion || !invitacion.pending) {
      return error(
        'No tenés una invitación de staff activa para este correo. Pedile al administrador general que te invite.',
        403
      );
    }

    // 2. Verificar si el usuario ya está registrado en la base de datos
    const usuarioExistente = await db.usuarios.findUnique({
      where: { correo: emailNorm }
    });
    if (usuarioExistente) {
      return error('Este correo ya está registrado en la plataforma.', 409);
    }

    // 3. Obtener el rol 'staff'
    const rolStaff = await db.roles.findFirst({
      where: { nombre: 'staff' }
    });
    if (!rolStaff) {
      return error('El rol staff no está configurado en la base de datos.', 500);
    }

    // 4. Crear el usuario
    const nuevoUsuario = await db.usuarios.create({
      data: {
        nombre: nombreCompleto,
        correo: emailNorm,
        hash_contrasena: hashPassword(password),
        id_rol: rolStaff.id,
        tipo_staff: invitacion.tipo_staff,
        estado: 'activo',
      }
    });

    // 5. Marcar la invitación como resuelta
    await db.invitaciones_staff.update({
      where: { email: emailNorm },
      data: {
        pending: false,
        resuelto: new Date(),
        id_usuario: nuevoUsuario.id,
      }
    });

    // 6. Registrar la auditoría
    await registrarAuditoria(
      nuevoUsuario.id,
      nuevoUsuario.nombre,
      'registro_staff',
      `Se completo el registro del staff "${nombreCompleto}" como "${invitacion.tipo_staff}"`,
      { userId: nuevoUsuario.id, email: emailNorm, tipo_staff: invitacion.tipo_staff }
    );

    // 7. Autenticar inmediatamente
    const token = generarToken();
    await crearCookieSesion({
      uid: nuevoUsuario.id,
      rol: 'staff',
      correo: nuevoUsuario.correo,
      token,
    });

    return NextResponse.json({
      perfil: {
        nombre: nuevoUsuario.nombre,
        image_url: nuevoUsuario.image_url,
      },
      redirectTo: rutaPorRol('staff'),
    });
  } catch (e) {
    return errorInterno('auth/register-staff', e);
  }
}
