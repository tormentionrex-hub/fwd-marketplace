import 'server-only';
import {
  buscarUsuarioPorCorreo,
  crearEmpresario,
  buscarRolIdPorNombre,
} from '@/server/repositories/usuario.repository';
import { verifyPassword, hashPassword } from '@/server/auth/password';
import { generarToken } from '@/server/auth/token';

export interface ResultadoAuth {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    image_url: string | null;
    rol: string;
  };
}

// Valida credenciales contra la DB y, si son correctas, genera un token de sesión.
// Devuelve null si el correo no existe O la contraseña no coincide; no distingue
// cuál de los dos falló, para no filtrar qué correos están registrados.
export async function login(
  correo: string,
  password: string
): Promise<ResultadoAuth | null> {
  const usuario = await buscarUsuarioPorCorreo(correo);
  if (!usuario) return null;

  if (!verifyPassword(password, usuario.hash_contrasena)) return null;

  return {
    token: generarToken(),
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      image_url: usuario.image_url,
      rol: usuario.roles.nombre,
    },
  };
}

// Registra un EMPRESARIO (el registro principal solo crea empresarios). El alta
// de estudiantes vendrá luego desde el panel admin.
// Devuelve null si el correo ya está registrado (el route lo mapea a 409).
export async function registrarEmpresario(
  nombre: string,
  correo: string,
  password: string
): Promise<ResultadoAuth | null> {
  const existente = await buscarUsuarioPorCorreo(correo);
  if (existente) return null;

  const idRol = await buscarRolIdPorNombre('empresario');
  if (!idRol) throw new Error("No existe el rol 'empresario' en la BD");

  const usuario = await crearEmpresario({
    nombre,
    correo,
    hash: hashPassword(password),
    idRol,
  });

  return {
    token: generarToken(),
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      image_url: usuario.image_url,
      rol: 'empresario',
    },
  };
}
