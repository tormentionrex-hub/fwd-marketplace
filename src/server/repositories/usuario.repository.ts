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
      roles: { select: { nombre: true } },
    },
  });
}

// Crea un empresario: la fila en usuarios (rol empresario) y su perfil vacío,
// en una sola operación atómica (Prisma nested create) para que nunca quede un
// usuario sin su perfil.
export function crearEmpresario(datos: {
  nombre: string;
  correo: string;
  hash: string;
  idRol: bigint;
}) {
  return db.usuarios.create({
    data: {
      nombre: datos.nombre,
      correo: datos.correo,
      hash_contrasena: datos.hash,
      id_rol: datos.idRol,
      perfiles_empresario: { create: {} },
    },
    select: {
      id: true,
      nombre: true,
      correo: true,
      image_url: true,
    },
  });
}

// Actualiza el hash de contraseña de un usuario (usado por el flujo de recuperación).
export function actualizarHashContrasena(idUsuario: string, hash: string) {
  return db.usuarios.update({
    where: { id: idUsuario },
    data: { hash_contrasena: hash },
    select: { id: true, correo: true },
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
