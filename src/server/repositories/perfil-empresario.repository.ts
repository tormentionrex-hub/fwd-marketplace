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

// Actualiza el nombre del empresario (usuarios.nombre) y la foto de perfil
// (usuarios.image_url), más el nombre de la empresa (perfiles_empresario), en
// una sola operación. Lo usa el CRUD "Editar perfil".
export function actualizarPerfilEmpresario(
  idUsuario: string,
  datos: { nombre: string; nombreEmpresa: string | null; imageUrl: string | null },
) {
  return db.perfiles_empresario.update({
    where: { id_usuario: idUsuario },
    data: {
      nombre_empresa: datos.nombreEmpresa,
      usuarios: { update: { nombre: datos.nombre, image_url: datos.imageUrl } },
    },
  });
}
