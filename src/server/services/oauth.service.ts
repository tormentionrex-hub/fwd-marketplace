import 'server-only';
import { randomBytes } from 'crypto';
import {
  buscarUsuarioPorCorreo,
  buscarRolIdPorNombre,
  crearEmpresario,
  registrarUltimaSesion,
} from '@/server/repositories/usuario.repository';
import { hashPassword } from '@/server/auth/password';
import { generarToken } from '@/server/auth/token';

export interface ResultadoOAuth {
  uid: string;
  rol: string;
  correo: string;
  token: string;
}

// Crea o recupera un empresario a partir de la identidad que devuelve el proveedor
// OAuth (Google / GitHub). Si el correo ya existe en la DB simplemente loguea.
// Si no existe, crea un empresario nuevo con hash aleatorio (no usable para login
// por contraseña; el usuario puede crear una luego vía "Recuperar contraseña").
export async function sincronizarUsuarioOAuth(datos: {
  email: string;
  nombre: string;
  apellido: string;
  imageUrl?: string | undefined;
}): Promise<ResultadoOAuth> {
  const { email, nombre, apellido, imageUrl } = datos;

  const existente = await buscarUsuarioPorCorreo(email);
  if (existente) {
    try {
      await registrarUltimaSesion(existente.id);
    } catch {
      // no bloquea el login si falla
    }
    return {
      uid: existente.id,
      rol: existente.roles.nombre,
      correo: existente.correo,
      token: generarToken(),
    };
  }

  const idRol = await buscarRolIdPorNombre('empresario');
  if (!idRol) throw new Error("No existe el rol 'empresario' en la BD");

  const nombreCompleto = `${nombre} ${apellido}`.trim();
  const hash = hashPassword(randomBytes(32).toString('hex'));

  const usuario = await crearEmpresario({
    nombre: nombreCompleto,
    correo: email,
    hash,
    idRol,
    imageUrl,
  });

  return {
    uid: usuario.id,
    rol: 'empresario',
    correo: usuario.correo,
    token: generarToken(),
  };
}
