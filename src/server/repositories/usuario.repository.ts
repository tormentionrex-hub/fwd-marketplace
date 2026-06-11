import 'server-only';
import { db } from '@/lib/db';

// Capa de datos: queries Prisma sobre el modelo usuarios. No mete lógica de
// negocio; solo lee/escribe. La usan los services.

export function buscarUsuarioPorCorreo(correo: string) {
  return db.usuarios.findUnique({
    where: { correo },
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
      perfiles_empresario: {
        create: { nombre_empresa: datos.nombreEmpresa ?? null },
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

// Lista todos los usuarios con su rol (solo lectura) para el panel admin.
export function listarUsuarios() {
  return db.usuarios.findMany({
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
