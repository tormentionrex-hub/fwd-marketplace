import 'server-only';
import {
  buscarUsuarioPorCorreo,
  crearEmpresario,
  crearEstudiante,
  crearEstudiantePendiente,
  crearUsuarioConRol,
  buscarRolIdPorNombre,
  registrarUltimaSesion,
  activarUsuario,
  actualizarUsuario,
} from '@/server/repositories/usuario.repository';

import { verifyPassword, hashPassword } from '@/server/auth/password';
import { esRolStaff } from '@/server/auth/roles';
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
  pendiente?: boolean;
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
//   null              → credenciales incorrectas, cuenta rechazada o suspendida
//   ResultadoAuth     → login exitoso (pendiente?: true si aún no fue aprobada)
export async function login(
  correo: string,
  password: string
): Promise<ResultadoAuth | null> {
  const emailNorm = correo.trim().toLowerCase();
  const usuario = await buscarUsuarioPorCorreo(emailNorm);
  if (!usuario) return null;

  if (!verifyPassword(password, usuario.hash_contrasena)) return null;

  if (usuario.estado === 'rechazado' || usuario.estado === 'suspendido') return null;

  // Marca el inicio de esta sesión. No bloquea el login si la escritura falla:
  // registrar la sesión es secundario frente a dejar entrar al usuario.
  try {
    await registrarUltimaSesion(usuario.id);
  } catch (e) {
    console.error('[auth] no se pudo registrar ultima_sesion', e);
  }

  return {
    token: generarToken(),
    ...(usuario.estado === 'pendiente' && { pendiente: true }),
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
    numeroIdentificacion?: string | undefined;
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
    numeroIdentificacion: extra.numeroIdentificacion,
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

// ─── REGISTRO ESTUDIANTE LIBRE (auto-registro) ───────────────────────────────
// El estudiante se registra directamente y queda 'pendiente' hasta que el admin
// lo apruebe (mismo flujo que el empresario). Devuelve null si el correo ya
// existe (route → 409).
export async function registrarEstudianteLibre(
  nombre: string,
  correo: string,
  password: string,
  extra: { segundoApellido?: string | undefined; generacionFwd?: number | undefined } = {}
): Promise<ResultadoAuth | null> {
  const existente = await buscarUsuarioPorCorreo(correo);
  if (existente) return null;

  const idRol = await buscarRolIdPorNombre('estudiante');
  if (!idRol) throw new Error("No existe el rol 'estudiante' en la BD");

  const usuario = await crearEstudiantePendiente({
    nombre,
    segundoApellido: extra.segundoApellido,
    generacionFwd: extra.generacionFwd,
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
      rol: 'estudiante',
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
  // 1. ¿Fue invitado? (debe ser tipo 'invitacion' y estar pendiente)
  const invitacion = await buscarInvitacionPendientePorEmail(correo);
  if (!invitacion || !invitacion.pending || invitacion.tipo !== 'invitacion') return 'no_invitado';

  // 2. ¿Ya tiene cuenta?
  const existente = await buscarUsuarioPorCorreo(correo);
  if (existente) return null;

  // 2.b. Si la invitación trae un rol de STAFF (owner/admin/editor/moderator),
  // se crea una cuenta de staff con ese rol (sin perfil estudiante/empresario).
  const rolInvitado = invitacion.rol;
  if (esRolStaff(rolInvitado)) {
    const idRolStaff = await buscarRolIdPorNombre(rolInvitado as string);
    if (!idRolStaff) throw new Error(`No existe el rol '${rolInvitado}' en la BD`);

    const staff = await crearUsuarioConRol({
      nombre,
      segundoApellido: extra.segundoApellido,
      correo,
      hash: hashPassword(password),
      idRol: idRolStaff,
    });

    await marcarRegistrado(correo, staff.id);
    await enviarEmailCuentaAprobada(correo, nombre);

    return {
      token: generarToken(),
      usuario: {
        id: staff.id,
        nombre: staff.nombre,
        correo: staff.correo,
        image_url: staff.image_url,
        rol: rolInvitado as string,
      },
    };
  }

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

// ─── REGISTRO POR INVITACIÓN CON TOKEN ───────────────────────────────────────
// Flujo de la página /unirse: el rol viene del TOKEN firmado (no del cliente).
// Igual valida que la invitación siga vigente en la BD (permite revocarla).
// Crea la cuenta según el rol y la deja activa (la invitación es la aprobación).
export async function registrarConInvitacion(datos: {
  email: string;
  rol: string;
  nombre: string;
  segundoApellido?: string | undefined;
  edad?: number | undefined;
  password: string;
}): Promise<ResultadoAuth | 'no_invitado' | null> {
  const emailNorm = datos.email.trim().toLowerCase();

  // La invitación debe seguir pendiente (si el admin la revocó, se rechaza).
  const invitacion = await buscarInvitacionPendientePorEmail(emailNorm);
  if (!invitacion || !invitacion.pending || invitacion.tipo !== 'invitacion') {
    return 'no_invitado';
  }

  // ¿Ya tiene cuenta?
  if (await buscarUsuarioPorCorreo(emailNorm)) return null;

  const idRol = await buscarRolIdPorNombre(datos.rol);
  if (!idRol) throw new Error(`No existe el rol '${datos.rol}' en la BD`);

  const hash = hashPassword(datos.password);
  const base = {
    nombre: datos.nombre,
    segundoApellido: datos.segundoApellido,
    correo: emailNorm,
    hash,
    idRol,
  };

  let usuario: { id: string; nombre: string; correo: string; image_url: string | null };

  if (datos.rol === 'empresario') {
    usuario = await crearEmpresario(base);
    // Invitado por el admin: queda activo (crearEmpresario nace 'pendiente').
    await activarUsuario(usuario.id);
  } else if (esRolStaff(datos.rol)) {
    usuario = await crearUsuarioConRol(base); // staff: cuenta sin perfil, activa
  } else {
    usuario = await crearEstudiante(base); // estudiante invitado: activo
  }

  // Edad (opcional) en la fila de usuarios.
  if (datos.edad != null) {
    await actualizarUsuario(usuario.id, { edad: datos.edad });
  }

  // Cerrar la invitación y avisar por correo.
  await marcarRegistrado(emailNorm, usuario.id);
  await enviarEmailCuentaAprobada(emailNorm, datos.nombre);

  return {
    token: generarToken(),
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      image_url: usuario.image_url,
      rol: datos.rol,
    },
  };
}
