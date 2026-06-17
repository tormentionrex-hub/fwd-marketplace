import { NextResponse } from 'next/server';
import { registrarEmpresario } from '@/server/services/auth.service';
import { crearCookieSesion } from '@/server/auth/session';
import { rutaPorRol } from '@/server/auth/rutas';
import { permitido } from '@/server/auth/rate-limit';
import { clienteIp, mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { registerSchema } from '@/server/validation/auth.schema';

const QUINCE_MIN = 15 * 60_000;

// Registro de auto-servicio: estudiantes y empresarios. Ambos quedan en estado
// 'pendiente' hasta que un administrador apruebe la cuenta.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  // Rate limit por IP para frenar el alta masiva de cuentas falsas.
  const ip = clienteIp(request);
  if (!permitido(`register-ip:${ip}`, 10, QUINCE_MIN)) {
    return error('Demasiadas solicitudes. Intentá de nuevo más tarde.', 429);
  }

  const parseo = await parsearBody(request, registerSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { firstName, lastName, secondLastName, identificationNumber, age, companyName, email, password } = parseo.data;

  const nombre = `${firstName} ${lastName}`.trim();

  try {
    const resultado = await registrarEmpresario(nombre, email, password, {
      segundoApellido: secondLastName,
      nombreEmpresa: companyName,
      numeroIdentificacion: identificationNumber,
      edad: age,
    });
    if (!resultado) {
      return error('Ese correo ya está registrado', 409);
    }

    // Crear sesión inmediatamente — el empresario entra al dashboard en estado
    // 'pendiente' con acceso limitado hasta que el admin apruebe la cuenta.
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
      pendiente: true,
      redirectTo: rutaPorRol(resultado.usuario.rol),
    });
  } catch (e) {
    return errorInterno('auth/register', e);
  }
}
