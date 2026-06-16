import 'server-only';
import { db } from '@/lib/db';

// Capa de datos del chat (conversaciones + mensajes).

// Busca una conversación existente para el trío (proyecto puede ser null).
export function buscarChatEntre(
  idProyecto: string | null,
  idEstudiante: string,
  idEmpresario: string,
) {
  return db.chats.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { id_proyecto: idProyecto as any, id_estudiante: idEstudiante, id_empresario: idEmpresario },
    select: { id: true },
  });
}

// TODO: id_estudiante_destino y perfiles_estudiante_destino faltan en schema.prisma.
// Cuando se agregue la migración correspondiente, quitar los casts `as any`.
export function buscarChatEstudiante(
  idEstudiante1: string,
  idEstudiante2: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.chats as any).findFirst({
    where: {
      OR: [
        { id_estudiante: idEstudiante1, id_estudiante_destino: idEstudiante2 },
        { id_estudiante: idEstudiante2, id_estudiante_destino: idEstudiante1 }
      ]
    },
    select: { id: true },
  });
}

export function crearChat(idProyecto: string | null, idEstudiante: string, idEmpresario: string) {
  return db.chats.create({
    data: {
      id_proyecto: idProyecto,
      id_estudiante: idEstudiante,
      id_empresario: idEmpresario,
      ultimo_mensaje: new Date(),
    },
    select: { id: true },
  });
}

export function crearChatEstudiante(idEstudiante1: string, idEstudiante2: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.chats as any).create({
    data: {
      id_estudiante: idEstudiante1,
      id_estudiante_destino: idEstudiante2,
      ultimo_mensaje: new Date(),
    },
    select: { id: true },
  });
}

// Conversaciones del usuario (sea estudiante o empresario), con el otro
// participante, último mensaje y cantidad de no leídos para ese usuario.
export function listarChatsDeUsuario(idUsuario: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.chats as any).findMany({
    where: { OR: [{ id_estudiante: idUsuario }, { id_empresario: idUsuario }, { id_estudiante_destino: idUsuario }] },
    orderBy: [{ ultimo_mensaje: { sort: 'desc', nulls: 'last' } }, { creado: 'desc' }],
    select: {
      id: true,
      id_estudiante: true,
      id_empresario: true,
      id_estudiante_destino: true,
      ultimo_mensaje: true,
      perfiles_estudiante: { select: { usuarios: { select: { nombre: true, image_url: true } } } },
      perfiles_empresario: { select: { usuarios: { select: { nombre: true, image_url: true } } } },
      perfiles_estudiante_destino: { select: { usuarios: { select: { nombre: true, image_url: true } } } },
      proyectos: { select: { titulo: true } },
      mensajes: {
        orderBy: { creado: 'desc' },
        take: 1,
        select: { contenido: true, document_url: true, creado: true },
      },
      _count: {
        select: { mensajes: { where: { leido: false, id_remitente: { not: idUsuario } } } },
      },
    },
  });
}

// Trae el chat con sus participantes (para validar acceso).
export function buscarChatPorId(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.chats as any).findUnique({
    where: { id },
    select: {
      id: true,
      id_estudiante: true,
      id_empresario: true,
      id_estudiante_destino: true,
      perfiles_estudiante: { select: { usuarios: { select: { nombre: true, image_url: true } } } },
      perfiles_empresario: { select: { usuarios: { select: { nombre: true, image_url: true } } } },
      perfiles_estudiante_destino: { select: { usuarios: { select: { nombre: true, image_url: true } } } },
    },
  });
}

export function listarMensajes(idChat: string) {
  return db.mensajes.findMany({
    where: { id_chat: idChat },
    orderBy: { creado: 'asc' },
    select: { id: true, id_remitente: true, contenido: true, document_url: true, leido: true, creado: true },
  });
}

export function crearMensaje(datos: {
  idChat: string;
  idRemitente: string;
  contenido: string | null;
  documentUrl: string | null;
}) {
  return db.mensajes.create({
    data: {
      id_chat: datos.idChat,
      id_remitente: datos.idRemitente,
      contenido: datos.contenido,
      document_url: datos.documentUrl,
    },
    select: { id: true, id_remitente: true, contenido: true, document_url: true, leido: true, creado: true },
  });
}

// Marca como leídos los mensajes que el OTRO participante envió en este chat.
export function marcarMensajesLeidos(idChat: string, idLector: string) {
  return db.mensajes.updateMany({
    where: { id_chat: idChat, leido: false, id_remitente: { not: idLector } },
    data: { leido: true },
  });
}

export function tocarUltimoMensaje(idChat: string) {
  return db.chats.update({
    where: { id: idChat },
    data: { ultimo_mensaje: new Date() },
    select: { id: true },
  });
}
