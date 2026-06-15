import 'server-only';
import { db } from '@/lib/db';

// Capa de datos (Prisma puro) para el perfil del empresario (pantalla "Mi perfil",
// SRS RF-16/17). Una sola query: datos de la empresa, el usuario dueño y la lista
// de proyectos publicados (para el resumen de actividad y la lista).
export function obtenerPerfilEmpresario(idUsuario: string) {
  return db.perfiles_empresario.findUnique({
    where: { id_usuario: idUsuario },
    select: {
      nombre_empresa: true,
      tipo: true,
      sector: true,
      descripcion: true,
      reputacion: true,
      usuarios: {
        select: {
          nombre: true,
          correo: true,
          image_url: true,
          estado: true,
          creado: true,
        },
      },
      proyectos: {
        select: { id: true, titulo: true, area_negocio: true, estado: true },
        orderBy: { publicado: 'desc' },
      },
      evaluaciones_empresa: {
        orderBy: { creado: 'desc' },
        select: {
          puntuacion: true,
          comentario: true,
          creado: true,
          proyectos: { select: { titulo: true } },
          perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
        },
      },
    },
  });
}

// Datos necesarios para detectar completitud y precargar el modal "Completá tu perfil".
export function obtenerDatosCompletitud(idUsuario: string) {
  return db.perfiles_empresario.findUnique({
    where: { id_usuario: idUsuario },
    select: {
      nombre_empresa: true,
      numero_identificacion: true,
      usuarios: {
        select: {
          nombre: true,
          segundo_nombre: true,
          segundo_apellido: true,
          edad: true,
          correo: true,
        },
      },
    },
  });
}

// Actualiza campos del modal de completitud: datos en usuarios + perfiles_empresario.
export function actualizarDatosCompletitud(
  idUsuario: string,
  datos: {
    nombre: string;
    segundoNombre: string | null;
    segundoApellido: string | null;
    edad: number | null;
    nombreEmpresa: string;
    numeroIdentificacion: string;
  },
) {
  return db.perfiles_empresario.update({
    where: { id_usuario: idUsuario },
    data: {
      nombre_empresa: datos.nombreEmpresa,
      numero_identificacion: datos.numeroIdentificacion,
      usuarios: {
        update: {
          nombre: datos.nombre,
          segundo_nombre: datos.segundoNombre,
          segundo_apellido: datos.segundoApellido,
          edad: datos.edad,
        },
      },
    },
  });
}

export const DEFAULT_PREFERENCIAS = {
  notif: { ofertas: true, mensajes: true, hitos: true, resumen: true, marketing: false },
  priv: { perfilPublico: true, mostrarRating: true, contactoDirecto: false },
};

export type Preferencias = typeof DEFAULT_PREFERENCIAS;

export async function obtenerPreferencias(idUsuario: string): Promise<Preferencias> {
  const row = await db.perfiles_empresario.findUnique({
    where: { id_usuario: idUsuario },
    select: { preferencias: true },
  });
  const raw = row?.preferencias;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_PREFERENCIAS;
  const r = raw as Record<string, unknown>;
  const notifRaw = (typeof r.notif === 'object' && r.notif && !Array.isArray(r.notif))
    ? r.notif as Record<string, unknown>
    : {};
  const privRaw = (typeof r.priv === 'object' && r.priv && !Array.isArray(r.priv))
    ? r.priv as Record<string, unknown>
    : {};
  return {
    notif: { ...DEFAULT_PREFERENCIAS.notif, ...Object.fromEntries(
      Object.keys(DEFAULT_PREFERENCIAS.notif).map((k) => [k, typeof notifRaw[k] === 'boolean' ? notifRaw[k] : DEFAULT_PREFERENCIAS.notif[k as keyof typeof DEFAULT_PREFERENCIAS.notif]])
    ) } as Preferencias['notif'],
    priv: { ...DEFAULT_PREFERENCIAS.priv, ...Object.fromEntries(
      Object.keys(DEFAULT_PREFERENCIAS.priv).map((k) => [k, typeof privRaw[k] === 'boolean' ? privRaw[k] : DEFAULT_PREFERENCIAS.priv[k as keyof typeof DEFAULT_PREFERENCIAS.priv]])
    ) } as Preferencias['priv'],
  };
}

export function guardarPreferencias(idUsuario: string, preferencias: Preferencias) {
  return db.perfiles_empresario.update({
    where: { id_usuario: idUsuario },
    data: { preferencias },
  });
}

export function actualizarReputacionEmpresa(idEmpresario: string, reputacion: number) {
  return db.perfiles_empresario.update({
    where: { id_usuario: idEmpresario },
    data: { reputacion },
  });
}

// Actualiza el nombre del empresario (usuarios.nombre) y la foto de perfil
// (usuarios.image_url), más el nombre de la empresa (perfiles_empresario), en
// una sola operación. Lo usa el CRUD "Editar perfil".
export function actualizarPerfilEmpresario(
  idUsuario: string,
  datos: {
    nombre: string;
    nombreEmpresa: string | null;
    imageUrl: string | null;
    descripcion: string | null;
    sector: string | null;
  },
) {
  return db.perfiles_empresario.update({
    where: { id_usuario: idUsuario },
    data: {
      nombre_empresa: datos.nombreEmpresa,
      descripcion: datos.descripcion,
      sector: datos.sector,
      usuarios: { update: { nombre: datos.nombre, image_url: datos.imageUrl } },
    },
  });
}
