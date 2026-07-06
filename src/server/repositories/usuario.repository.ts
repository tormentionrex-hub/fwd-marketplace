import 'server-only';
import { Prisma } from '@prisma/client';
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

// Variante extendida solo para la página de editar perfil del admin.
// Selecciona campos adicionales sin afectar buscarUsuarioPorId (usado en auth).
export function buscarPerfilAdminPorId(id: string) {
  return db.usuarios.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      segundo_nombre: true,
      segundo_apellido: true,
      correo: true,
      image_url: true,
      estado: true,
      id_rol: true,
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
  telefono?: string | undefined;
  moduloCompletado?: string | undefined;
  sede?: string | undefined;
  provincia?: string | undefined;
  canton?: string | undefined;
  distrito?: string | undefined;
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
        create: {
          generacion_fwd: datos.generacionFwd ?? null,
          telefono: datos.telefono ?? null,
          modulo_completado: datos.moduloCompletado ?? null,
          sede: datos.sede ?? null,
          provincia: datos.provincia ?? null,
          canton: datos.canton ?? null,
          distrito: datos.distrito ?? null,
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

// Crea una cuenta de STAFF (owner/admin/staff/moderator): fila en usuarios con
// el rol indicado y estado 'activo', SIN perfil de estudiante ni empresario.
// La usa el registro por invitación cuando la invitación trae un rol de staff.
export function crearUsuarioConRol(datos: {
  nombre: string;
  segundoApellido?: string | undefined;
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
      estado: 'activo', // la invitación es la aprobación del admin
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

// ── Configuración de cuenta del estudiante ──────────────────────────────────

export function actualizarNombreUsuario(id: string, nombre: string) {
  return db.usuarios.update({ where: { id }, data: { nombre }, select: { id: true } });
}

export function actualizarCorreoUsuario(id: string, correo: string) {
  return db.usuarios.update({ where: { id }, data: { correo }, select: { id: true } });
}

export function actualizarTelefonoEstudiante(idUsuario: string, telefono: string | null) {
  return db.perfiles_estudiante.update({
    where: { id_usuario: idUsuario },
    data: { telefono },
    select: { id_usuario: true },
  });
}

// Cambia el estado de la cuenta (p. ej. 'inactivo' al deshabilitarla).
export function cambiarEstadoUsuario(id: string, estado: string) {
  return db.usuarios.update({ where: { id }, data: { estado }, select: { id: true } });
}

// (El borrado permanente reutiliza `eliminarUsuario`, ya definido más abajo.)

// Preferencias del estudiante (JSON en perfiles_estudiante.preferencias).
export async function leerPreferenciasEstudiante(id: string): Promise<unknown> {
  const row = await db.perfiles_estudiante.findUnique({
    where: { id_usuario: id },
    select: { preferencias: true },
  });
  return row?.preferencias ?? null;
}

export function escribirPreferenciasEstudiante(id: string, value: object) {
  return db.perfiles_estudiante.update({
    where: { id_usuario: id },
    data: { preferencias: value as Prisma.InputJsonValue },
    select: { id_usuario: true },
  });
}

// Todos los datos del estudiante para el export "Descargar mis datos" (Ley 8968).
export function cargarExportEstudiante(id: string) {
  return db.usuarios.findUnique({
    where: { id },
    select: {
      nombre: true,
      segundo_apellido: true,
      correo: true,
      edad: true,
      creado: true,
      perfiles_estudiante: {
        select: {
          titulo_profesional: true,
          descripcion: true,
          generacion_fwd: true,
          telefono: true,
          modulo_completado: true,
          sede: true,
          provincia: true,
          canton: true,
          distrito: true,
          reputacion: true,
          preferencias: true,
        },
      },
    },
  });
}

// Datos para el apartado de Configuración > Cuenta del estudiante.
export function cargarDatosCuentaEstudiante(id: string) {
  return db.usuarios.findUnique({
    where: { id },
    select: {
      nombre: true,
      correo: true,
      perfiles_estudiante: { select: { telefono: true, reputacion: true } },
    },
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
          curriculums: {
            select: {
              file_name: true,
              file_type: true,
              actualizado: true,
            },
          },
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

// Edita los datos básicos de un usuario (nombre, apellidos, correo, edad).
// PATCH semántico: solo toca los campos presentes. El estado y el rol se
// gestionan por flujos propios (suspensión, validación), no acá.
export function actualizarUsuario(
  id: string,
  data: {
    nombre?: string | undefined;
    segundo_nombre?: string | null | undefined;
    segundo_apellido?: string | null | undefined;
    correo?: string | undefined;
    edad?: number | null | undefined;
    image_url?: string | null | undefined;
  }
) {
  return db.usuarios.update({
    where: { id },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.segundo_nombre !== undefined && { segundo_nombre: data.segundo_nombre }),
      ...(data.segundo_apellido !== undefined && { segundo_apellido: data.segundo_apellido }),
      ...(data.correo !== undefined && { correo: data.correo }),
      ...(data.edad !== undefined && { edad: data.edad }),
      ...(data.image_url !== undefined && { image_url: data.image_url }),
    },
    select: { id: true, nombre: true, correo: true },
  });
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

// Busca usuarios por nombre o correo para el panel de gestión de roles.
// Requiere al menos 2 caracteres para evitar cargar todos los usuarios.
export function buscarUsuariosParaGestion(q: string, limite = 15) {
  const termino = q.trim();
  if (termino.length < 2) return Promise.resolve([]);
  return db.usuarios.findMany({
    where: {
      OR: [
        { nombre: { contains: termino, mode: 'insensitive' } },
        { correo: { contains: termino, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      nombre: true,
      correo: true,
      estado: true,
      roles: { select: { id: true, nombre: true } },
    },
    orderBy: { nombre: 'asc' },
    take: limite,
  });
}

// Cambia el rol de un usuario por su ID de rol numérico.
export function cambiarRolUsuario(id: string, idRol: bigint) {
  return db.usuarios.update({
    where: { id },
    data: { id_rol: idRol },
    select: { id: true, roles: { select: { nombre: true } } },
  });
}
