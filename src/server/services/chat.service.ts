import 'server-only';
import {
  listarChatsDeUsuario,
  buscarChatPorId,
  listarMensajes,
  crearMensaje,
  marcarMensajesLeidos,
  tocarUltimoMensaje,
} from '@/server/repositories/chat.repository';

export interface ConversacionDTO {
  id: string;
  otro: { id: string; nombre: string; fotoUrl: string | null };
  proyectoTitulo: string | null;
  ultimoMensaje: { texto: string; creado: string } | null;
  noLeidos: number;
}

export interface MensajeDTO {
  id: string;
  mio: boolean;
  contenido: string | null;
  documentUrl: string | null;
  leido: boolean;
  creado: string;
}

export interface ConversacionDetalleDTO {
  id: string;
  otro: { id: string; nombre: string; fotoUrl: string | null };
  mensajes: MensajeDTO[];
}

function textoPreview(m?: { contenido: string | null; document_url: string | null }): string {
  if (!m) return '';
  if (m.contenido?.trim()) return m.contenido;
  if (m.document_url) return 'Archivo adjunto';
  return '';
}

// Lista las conversaciones del usuario con el otro participante y no leídos.
export async function listarConversaciones(idUsuario: string): Promise<ConversacionDTO[]> {
  const chats = await listarChatsDeUsuario(idUsuario);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return chats.map((c: any) => {
    // Alias para el perfil del estudiante destino (nombre largo autogenerado por Prisma)
    const perfilDestino = c.perfiles_estudiante_chats_id_estudiante_destinoToperfiles_estudiante;
    let otroId = '';
    let otroPerfil: { usuarios?: { nombre: string; image_url: string | null } | null } | null | undefined = null;
    if (c.id_estudiante_destino) {
      if (c.id_estudiante === idUsuario) {
        otroPerfil = perfilDestino;
        otroId = c.id_estudiante_destino;
      } else {
        otroPerfil = c.perfiles_estudiante;
        otroId = c.id_estudiante;
      }
    } else {
      const soyEstudiante = c.id_estudiante === idUsuario;
      otroPerfil = soyEstudiante ? c.perfiles_empresario : c.perfiles_estudiante;
      otroId = soyEstudiante ? (c.id_empresario ?? '') : c.id_estudiante;
    }
    const ultimo = c.mensajes[0];
    return {
      id: c.id,
      otro: {
        id: otroId,
        nombre: otroPerfil?.usuarios?.nombre ?? 'Usuario',
        fotoUrl: otroPerfil?.usuarios?.image_url ?? null,
      },
      proyectoTitulo: c.proyectos?.titulo ?? null,
      ultimoMensaje: ultimo ? { texto: textoPreview(ultimo), creado: ultimo.creado.toISOString() } : null,
      noLeidos: c._count.mensajes,
    };
  });
}

function esParticipante(
  chat: { id_estudiante: string; id_empresario: string | null; id_estudiante_destino: string | null },
  idUsuario: string,
): boolean {
  return chat.id_estudiante === idUsuario || chat.id_empresario === idUsuario || chat.id_estudiante_destino === idUsuario;
}

// Devuelve la conversación con sus mensajes y marca como leídos los recibidos.
// null si el chat no existe o el usuario no es participante.
export async function obtenerConversacion(
  idChat: string,
  idUsuario: string,
): Promise<ConversacionDetalleDTO | null> {
  const chat = await buscarChatPorId(idChat);
  if (!chat || !esParticipante(chat, idUsuario)) return null;

  await marcarMensajesLeidos(idChat, idUsuario);

  // Alias para el perfil del estudiante destino (nombre largo autogenerado por Prisma)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perfilDestino = (chat as any).perfiles_estudiante_chats_id_estudiante_destinoToperfiles_estudiante;
  let otroId = '';
  let otroPerfil: { usuarios?: { nombre: string; image_url: string | null } | null } | null | undefined = null;
  if (chat.id_estudiante_destino) {
    if (chat.id_estudiante === idUsuario) {
      otroPerfil = perfilDestino;
      otroId = chat.id_estudiante_destino;
    } else {
      otroPerfil = chat.perfiles_estudiante;
      otroId = chat.id_estudiante;
    }
  } else {
    const soyEstudiante = chat.id_estudiante === idUsuario;
    otroPerfil = soyEstudiante ? chat.perfiles_empresario : chat.perfiles_estudiante;
    otroId = soyEstudiante ? (chat.id_empresario ?? '') : chat.id_estudiante;
  }
  const mensajes = await listarMensajes(idChat);

  return {
    id: chat.id,
    otro: {
      id: otroId,
      nombre: otroPerfil?.usuarios?.nombre ?? 'Usuario',
      fotoUrl: otroPerfil?.usuarios?.image_url ?? null,
    },
    mensajes: mensajes.map((m) => ({
      id: m.id,
      mio: m.id_remitente === idUsuario,
      contenido: m.contenido,
      documentUrl: m.document_url,
      leido: m.leido,
      creado: m.creado.toISOString(),
    })),
  };
}

export type ResultadoEnviarMensaje = { ok: true; mensaje: MensajeDTO } | 'no_autorizado' | 'vacio';

// Envía un mensaje en un chat. Solo participantes. Requiere texto o adjunto.
export async function enviarMensaje(
  idChat: string,
  idUsuario: string,
  contenido: string | null,
  documentUrl: string | null,
): Promise<ResultadoEnviarMensaje> {
  const texto = contenido?.trim() ? contenido.trim() : null;
  const adjunto = documentUrl?.trim() ? documentUrl.trim() : null;
  if (!texto && !adjunto) return 'vacio';

  const chat = await buscarChatPorId(idChat);
  if (!chat || !esParticipante(chat, idUsuario)) return 'no_autorizado';

  const m = await crearMensaje({ idChat, idRemitente: idUsuario, contenido: texto, documentUrl: adjunto });
  await tocarUltimoMensaje(idChat);

  return {
    ok: true,
    mensaje: {
      id: m.id,
      mio: true,
      contenido: m.contenido,
      documentUrl: m.document_url,
      leido: m.leido,
      creado: m.creado.toISOString(),
    },
  };
}
