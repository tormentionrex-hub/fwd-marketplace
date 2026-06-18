import 'server-only';
import { db } from '@/lib/db';

// Capa de datos: queries Prisma sobre el modelo usuarios. No mete lógica de
// negocio; solo lee/escribe. La usan los services.

export function buscarUsuarioPorCorreo(correo: string) {
  return db.usuarios.findFirst({
    where: { correo: { equals: correo, mode: 'insensitive' } },
    include: { roles: { select: { nombre: true } } },
  });
}


export function buscarUsuarioPorId(id: string) {
  return db.usuarios.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      correo: true,
      image_url: true,
      estado: true,
      id_rol: true,
      ultima_sesion: true,
      roles: { select: { nombre: true } },
    },
  });
}

// Crea un empresario: la fila en usuarios (rol empresario) y su perfil vacío,
// en una sola operación atómica (Prisma nested create) para que nunca quede un
// usuario sin su perfil.
export function crearEmpresario(datos: {
  nombre: string;
  segundoApellido?: string | undefined;
  nombreEmpresa?: string | undefined;
  numeroIdentificacion?: string | undefined;
  edad?: number | undefined;
  correo: string;
  hash: string;
  idRol: bigint;
  imageUrl?: string | undefined;
}) {
  return db.usuarios.create({
    data: {
      nombre: datos.nombre,
      segundo_apellido: datos.segundoApellido ?? null,
      edad: datos.edad ?? null,
      correo: datos.correo,
      hash_contrasena: datos.hash,
      id_rol: datos.idRol,
      image_url: datos.imageUrl ?? null,
      estado: 'pendiente',
      perfiles_empresario: {
        create: {
          nombre_empresa: datos.nombreEmpresa ?? null,
          numero_identificacion: datos.numeroIdentificacion ?? null,
        },
      },
    },
    select: {
      id: true,
      nombre: true,
      correo: true,
      image_url: true,
    },
  });
}

// Crea un estudiante: fila en usuarios (rol estudiante, estado 'pendiente') y su
// perfil vacío, en una sola operación atómica. El estado 'pendiente' bloquea el
// login hasta que el admin apruebe la cuenta en pending_verifications.
export function crearEstudiante(datos: {
  nombre: string;
  segundoApellido?: string | undefined;
  generacionFwd?: number | undefined;
  correo: string;
  hash: string;
  idRol: bigint;
}) {
  return db.usuarios.create({
    data: {
      nombre: datos.nombre,
      segundo_apellido: datos.segundoApellido ?? null,
      correo: datos.correo,
      hash_contrasena: datos.hash,
      id_rol: datos.idRol,
      estado: 'activo', // ya fue pre-aprobado por el admin al enviarlo la invitación
      perfiles_estudiante: {
        create: { generacion_fwd: datos.generacionFwd ?? null },
      },
    },
    select: {
      id: true,
      nombre: true,
      correo: true,
      image_url: true,
    },
  });
}

// Crea un estudiante por AUTO-REGISTRO: estado 'pendiente' (no invitado).
// Requiere aprobación del admin antes de poder acceder.
export function crearEstudiantePendiente(datos: {
  nombre: string;
  segundoApellido?: string | undefined;
  generacionFwd?: number | undefined;
  correo: string;
  hash: string;
  idRol: bigint;
}) {
  return db.usuarios.create({
    data: {
      nombre: datos.nombre,
      segundo_apellido: datos.segundoApellido ?? null,
      correo: datos.correo,
      hash_contrasena: datos.hash,
      id_rol: datos.idRol,
      estado: 'pendiente',
      perfiles_estudiante: {
        create: { generacion_fwd: datos.generacionFwd ?? null },
      },
    },
    select: {
      id: true,
      nombre: true,
      correo: true,
      image_url: true,
    },
  });
}

export async function obtenerHashContrasena(id: string): Promise<string | null> {
  const row = await db.usuarios.findUnique({
    where: { id },
    select: { hash_contrasena: true },
  });
  return row?.hash_contrasena ?? null;
}

// Actualiza el hash de contraseña de un usuario. Lo usa el flujo de recuperación
// tras verificar el código OTP. Devuelve id + correo para el correo de confirmación.
export function actualizarHashContrasena(id: string, hashContrasena: string) {
  return db.usuarios.update({
    where: { id },
    data: { hash_contrasena: hashContrasena },
    select: { id: true, correo: true },
  });
}
// Activa un usuario cambiando su estado a 'activo'. Lo llama el admin al aprobar.
export function activarUsuario(id: string) {
  return db.usuarios.update({
    where: { id },
    data: { estado: 'activo' },
    select: { id: true, nombre: true, correo: true },
  });
}

// Rechaza un usuario cambiando su estado a 'rechazado'. Lo llama el admin al denegar.
export function rechazarUsuario(id: string) {
  return db.usuarios.update({
    where: { id },
    data: { estado: 'rechazado' },
    select: { id: true, nombre: true, correo: true },
  });
}

// Busca el id (BigInt) de un rol por su nombre único. Evita hardcodear ids.
export async function buscarRolIdPorNombre(nombre: string): Promise<bigint | null> {
  const rol = await db.roles.findUnique({
    where: { nombre },
    select: { id: true },
  });
  return rol?.id ?? null;
}

// Lista los usuarios con estado 'pendiente' para la página de validaciones del admin.
export function listarUsuariosPendientes() {
  return db.usuarios.findMany({
    where: { estado: 'pendiente' },
    orderBy: { creado: 'desc' },
    select: {
      id: true,
      nombre: true,
      correo: true,
      creado: true,
      roles: { select: { nombre: true } },
    },
  });
}

// Cuenta los usuarios con estado 'pendiente' para la alerta del dashboard admin.
export async function contarUsuariosPendientes(): Promise<number> {
  return db.usuarios.count({ where: { estado: 'pendiente' } });
}

// Lista todos los usuarios con su rol (solo lectura) para el panel admin.
export function listarUsuarios() {
  return db.usuarios.findMany({
    orderBy: { creado: 'desc' },
    select: {
      id: true,
      nombre: true,
      segundo_nombre: true,
      segundo_apellido: true,
      correo: true,
      estado: true,
      creado: true,
      edad: true,
      fecha_nacimiento: true,
      ultima_sesion: true,
      image_url: true,
      roles: { select: { nombre: true } },
      perfiles_estudiante: {
        select: {
          titulo_profesional: true,
          estado_verificacion: true,
          reputacion: true,
          generacion_fwd: true,
          descripcion: true,
        },
      },
      perfiles_empresario: {
        select: {
          tipo: true,
          sector: true,
          nombre_empresa: true,
          numero_identificacion: true,
          descripcion: true,
        },
      },
    },
  });
}

// Registra la marca de tiempo de la sesión actual (último login exitoso).
// Lo llama el servicio de auth tras validar credenciales. Devuelve la cantidad
// de filas afectadas vía Prisma update; el llamador no necesita el resultado.
export function registrarUltimaSesion(id: string) {
  return db.usuarios.update({
    where: { id },
    data: { ultima_sesion: new Date() },
    select: { id: true },
  });
}

// Elimina un usuario por id. Los perfiles y datos relacionados se borran en
// cascada según las FK del esquema. Lo usa el panel admin.
export function eliminarUsuario(id: string) {
  return db.usuarios.delete({ where: { id } });
}

// ─── Gestión de suspensiones / reactivaciones ───────────────────────────

// Suspende una cuenta (estado 'suspendido') y registra en el historial.
export async function suspenderUsuario(
  id: string,
  motivo: string,
  adminId: string,
  adminNombre: string
) {
  return db.$transaction([
    db.usuarios.update({
      where: { id },
      data: { estado: 'suspendido' },
    }),
    db.suspensiones.create({
      data: {
        id_usuario: id,
        accion: 'suspender',
        motivo,
        id_admin: adminId,
        nombre_admin: adminNombre,
      },
    }),
  ]);
}

// Reactiva una cuenta suspendida (estado 'activo') y registra en el historial.
export async function reactivarUsuario(
  id: string,
  motivo: string | null,
  adminId: string,
  adminNombre: string
) {
  return db.$transaction([
    db.usuarios.update({
      where: { id },
      data: { estado: 'activo' },
    }),
    db.suspensiones.create({
      data: {
        id_usuario: id,
        accion: 'reactivar',
        motivo,
        id_admin: adminId,
        nombre_admin: adminNombre,
      },
    }),
  ]);
}

// Historial de suspensiones/reactivaciones de un usuario específico.
export function historialSuspensiones(idUsuario: string) {
  return db.suspensiones.findMany({
    where: { id_usuario: idUsuario },
    orderBy: { creado: 'desc' },
    select: {
      id: true,
      accion: true,
      motivo: true,
      nombre_admin: true,
      creado: true,
    },
  });
}

// Lista todos los usuarios suspendidos.
export function listarUsuariosSuspendidos() {
  return db.usuarios.findMany({
    where: { estado: 'suspendido' },
    orderBy: { creado: 'desc' },
    select: {
      id: true,
      nombre: true,
      correo: true,
      estado: true,
      creado: true,
      roles: { select: { nombre: true } },
    },
  });
}

// Cuenta las cuentas suspendidas actualmente.
export function contarUsuariosSuspendidos() {
  return db.usuarios.count({ where: { estado: 'suspendido' } });
}
