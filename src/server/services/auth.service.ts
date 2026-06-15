import 'server-only';
import {
  buscarUsuarioPorCorreo,
  crearEmpresario,
  crearEstudiante,
  buscarRolIdPorNombre,
  registrarUltimaSesion,
} from '@/server/repositories/usuario.repository';
import { verifyPassword, hashPassword } from '@/server/auth/password';
import { generarToken } from '@/server/auth/token';
import {
  buscarInvitacionPendientePorEmail,
  marcarRegistrado,
} from '@/server/repositories/pending-verification.repository';
import {
  enviarEmailCuentaAprobada,
} from '@/lib/email';

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

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// Retornos:
//   null        → credenciales incorrectas (no distinguimos cuál)
//   'pendiente' → credenciales ok, pero la cuenta aún no fue aprobada
//   ResultadoAuth → login exitoso
export async function login(
  correo: string,
  password: string
): Promise<ResultadoAuth | 'pendiente' | null> {
  const usuario = await buscarUsuarioPorCorreo(correo);
  if (!usuario) return null;

  if (!verifyPassword(password, usuario.hash_contrasena)) return null;

  if (usuario.estado === 'pendiente') return 'pendiente';

  // Marca el inicio de esta sesión. No bloquea el login si la escritura falla:
  // registrar la sesión es secundario frente a dejar entrar al usuario.
  try {
    await registrarUltimaSesion(usuario.id);
  } catch (e) {
    console.error('[auth] no se pudo registrar ultima_sesion', e);
  }

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

// ─── REGISTRO EMPRESARIO ─────────────────────────────────────────────────────
// Solo empresarios se registran libremente. Estado activo desde el inicio.
// Devuelve null si el correo ya está registrado (route → 409).
export async function registrarEmpresario(
  nombre: string,
  correo: string,
  password: string,
  extra: {
    segundoApellido?: string | undefined;
    nombreEmpresa?: string | undefined;
    edad?: number | undefined;
  } = {}
): Promise<ResultadoAuth | null> {
  const existente = await buscarUsuarioPorCorreo(correo);
  if (existente) return null;

  const idRol = await buscarRolIdPorNombre('empresario');
  if (!idRol) throw new Error("No existe el rol 'empresario' en la BD");

  const usuario = await crearEmpresario({
    nombre,
    segundoApellido: extra.segundoApellido,
    nombreEmpresa: extra.nombreEmpresa,
    edad: extra.edad,
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

// ─── REGISTRO ESTUDIANTE (con validación de invitación) ──────────────────────
// El flujo completo:
//  1. Verifica que el correo exista en pending_verifications (fue invitado).
//     Si no → devuelve 'no_invitado'.
//  2. Verifica que el correo no esté ya registrado en usuarios.
//     Si sí → devuelve null (409).
//  3. Crea el usuario con estado='activo' (ya fue pre-aprobado por el admin
//     al invitarlo — no necesita aprobación adicional).
//  4. Cierra la invitación (pending=false, id_usuario=nuevo id).
//  5. Envía email de bienvenida.
//  6. Devuelve ResultadoAuth para crear la sesión inmediatamente.
export async function registrarEstudiante(
  nombre: string,
  correo: string,
  password: string,
  extra: { segundoApellido?: string | undefined; generacionFwd?: number | undefined } = {}
): Promise<ResultadoAuth | 'no_invitado' | null> {
  // 1. ¿Fue invitado?
  const invitacion = await buscarInvitacionPendientePorEmail(correo);
  if (!invitacion || !invitacion.pending) return 'no_invitado';

  // 2. ¿Ya tiene cuenta?
  const existente = await buscarUsuarioPorCorreo(correo);
  if (existente) return null;

  const idRol = await buscarRolIdPorNombre('estudiante');
  if (!idRol) throw new Error("No existe el rol 'estudiante' en la BD");

  // 3. Crear usuario activo (la invitación es la aprobación del admin)
  const usuario = await crearEstudiante({
    nombre,
    segundoApellido: extra.segundoApellido,
    generacionFwd: extra.generacionFwd,
    correo,
    hash: hashPassword(password),
    idRol,
  });

  // 4. Cerrar la invitación
  await marcarRegistrado(correo, usuario.id);

  // 5. Email de bienvenida
  await enviarEmailCuentaAprobada(correo, nombre);

  // 6. Sesión inmediata
  return {
    token: generarToken(),
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      image_url: usuario.image_url,
      rol: 'estudiante',
    },
  };
}
