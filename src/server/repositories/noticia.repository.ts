import 'server-only';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

// Capa de datos del foro de noticias. Las escrituras verifican pertenencia
// (autor) o rol de moderación en la capa de servicio; aquí solo consultas.

// Datos del autor que necesitamos para pintar la tarjeta (nombre para mostrar,
// avatar, rol y —si es empresa— el nombre de la empresa).
const autorSelect = {
  select: {
    id: true,
    nombre: true,
    image_url: true,
    roles: { select: { nombre: true } },
    perfiles_empresario: { select: { nombre_empresa: true } },
  },
} satisfies Prisma.usuariosDefaultArgs;

const noticiaInclude = {
  usuarios: autorSelect,
  _count: { select: { votos: true, comentarios: true } },
} satisfies Prisma.noticiasInclude;

export type Orden = 'recientes' | 'populares';

// Lista noticias activas paginadas. Si se pasa idUsuario, marca cuáles votó.
export async function listarNoticias(opciones: {
  orden: Orden;
  categoria?: string | undefined;
  cursor?: string | undefined;
  limite: number;
  idUsuario?: string | null;
  incluirOcultas?: boolean | undefined;
}) {
  const { orden, categoria, cursor, limite, idUsuario, incluirOcultas } = opciones;

  const where: Prisma.noticiasWhereInput = {
    ...(incluirOcultas ? {} : { estado: 'activa' }),
    ...(categoria ? { categoria } : {}),
  };

  const noticias = await db.noticias.findMany({
    where,
    include: noticiaInclude,
    orderBy: orden === 'populares' ? [{ votos: { _count: 'desc' } }, { creado: 'desc' }] : { creado: 'desc' },
    take: limite + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hayMas = noticias.length > limite;
  const pagina = hayMas ? noticias.slice(0, limite) : noticias;

  // Marca de "votada por mí" en un solo query (evita N+1).
  let votadas = new Set<string>();
  if (idUsuario && pagina.length > 0) {
    const votos = await db.noticias_votos.findMany({
      where: { id_usuario: idUsuario, id_noticia: { in: pagina.map((n) => n.id) } },
      select: { id_noticia: true },
    });
    votadas = new Set(votos.map((v) => v.id_noticia));
  }

  return {
    noticias: pagina.map((n) => ({ ...n, votada: votadas.has(n.id) })),
    siguienteCursor: hayMas ? pagina[pagina.length - 1]!.id : null,
  };
}

export async function obtenerNoticia(id: string, idUsuario?: string | null) {
  const noticia = await db.noticias.findUnique({ where: { id }, include: noticiaInclude });
  if (!noticia) return null;
  let votada = false;
  if (idUsuario) {
    const voto = await db.noticias_votos.findUnique({
      where: { id_noticia_id_usuario: { id_noticia: id, id_usuario: idUsuario } },
      select: { id: true },
    });
    votada = Boolean(voto);
  }
  return { ...noticia, votada };
}

export function crearNoticia(data: {
  idAutor: string;
  titulo: string;
  texto?: string | undefined;
  enlaceUrl?: string | undefined;
  imagenUrl?: string | undefined;
  videoUrl?: string | undefined;
  categoria?: string | undefined;
  ogTitulo?: string | null;
  ogDescripcion?: string | null;
  ogImagen?: string | null;
  ogSitio?: string | null;
}) {
  return db.noticias.create({
    data: {
      id_autor: data.idAutor,
      titulo: data.titulo,
      texto: data.texto ?? null,
      enlace_url: data.enlaceUrl ?? null,
      imagen_url: data.imagenUrl ?? null,
      video_url: data.videoUrl ?? null,
      categoria: data.categoria ?? null,
      og_titulo: data.ogTitulo ?? null,
      og_descripcion: data.ogDescripcion ?? null,
      og_imagen: data.ogImagen ?? null,
      og_sitio: data.ogSitio ?? null,
    },
    include: noticiaInclude,
  });
}

export function buscarNoticiaBasica(id: string) {
  return db.noticias.findUnique({ where: { id }, select: { id: true, id_autor: true, estado: true } });
}

// Todas las noticias de un autor (cualquier estado), más nuevas primero.
export function listarNoticiasDeAutor(idAutor: string) {
  return db.noticias.findMany({
    where: { id_autor: idAutor },
    include: noticiaInclude,
    orderBy: { creado: 'desc' },
  });
}

export function actualizarNoticia(
  id: string,
  data: {
    titulo: string;
    texto?: string | undefined;
    enlaceUrl?: string | undefined;
    imagenUrl?: string | undefined;
    videoUrl?: string | undefined;
    categoria?: string | undefined;
    ogTitulo?: string | null;
    ogDescripcion?: string | null;
    ogImagen?: string | null;
    ogSitio?: string | null;
  },
) {
  return db.noticias.update({
    where: { id },
    data: {
      titulo: data.titulo,
      texto: data.texto ?? null,
      enlace_url: data.enlaceUrl ?? null,
      imagen_url: data.imagenUrl ?? null,
      video_url: data.videoUrl ?? null,
      categoria: data.categoria ?? null,
      og_titulo: data.ogTitulo ?? null,
      og_descripcion: data.ogDescripcion ?? null,
      og_imagen: data.ogImagen ?? null,
      og_sitio: data.ogSitio ?? null,
      actualizado: new Date(),
    },
    include: noticiaInclude,
  });
}

export function eliminarNoticia(id: string) {
  return db.noticias.delete({ where: { id } });
}

export function cambiarEstadoNoticia(id: string, estado: string) {
  return db.noticias.update({ where: { id }, data: { estado, actualizado: new Date() }, select: { id: true, estado: true } });
}

// --- Votos ---------------------------------------------------------------

export async function alternarVoto(idNoticia: string, idUsuario: string): Promise<{ votada: boolean; total: number }> {
  const existente = await db.noticias_votos.findUnique({
    where: { id_noticia_id_usuario: { id_noticia: idNoticia, id_usuario: idUsuario } },
    select: { id: true },
  });

  if (existente) {
    await db.noticias_votos.delete({ where: { id: existente.id } });
  } else {
    await db.noticias_votos.create({ data: { id_noticia: idNoticia, id_usuario: idUsuario } });
  }

  const total = await db.noticias_votos.count({ where: { id_noticia: idNoticia } });
  return { votada: !existente, total };
}

// --- Comentarios (estilo YouTube: raíces paginadas + respuestas planas) ----

// Total de comentarios de una noticia (raíces + respuestas). Alimenta el badge.
export function contarComentarios(idNoticia: string) {
  return db.noticias_comentarios.count({ where: { id_noticia: idNoticia } });
}

// Lista comentarios RAÍZ (sin padre) paginados, más nuevos primero. Devuelve
// `limite` elementos y `siguienteCursor` (id del último) si hay más.
export async function listarComentariosRaiz(idNoticia: string, limite: number, cursor?: string) {
  const filas = await db.noticias_comentarios.findMany({
    where: { id_noticia: idNoticia, id_padre: null },
    orderBy: [{ creado: 'desc' }, { id: 'desc' }],
    include: { usuarios: autorSelect },
    take: limite + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hayMas = filas.length > limite;
  const pagina = hayMas ? filas.slice(0, limite) : filas;
  return {
    raices: pagina,
    siguienteCursor: hayMas ? pagina[pagina.length - 1]!.id : null,
  };
}

// Todas las respuestas de un conjunto de comentarios raíz, más viejas primero.
export function listarRespuestas(idsRaiz: string[]) {
  if (idsRaiz.length === 0) return Promise.resolve([]);
  return db.noticias_comentarios.findMany({
    where: { id_padre: { in: idsRaiz } },
    orderBy: { creado: 'asc' },
    include: { usuarios: autorSelect },
  });
}

export function crearComentario(data: { idNoticia: string; idAutor: string; texto: string; idPadre?: string | undefined }) {
  return db.noticias_comentarios.create({
    data: {
      id_noticia: data.idNoticia,
      id_autor: data.idAutor,
      texto: data.texto,
      id_padre: data.idPadre ?? null,
    },
    include: { usuarios: autorSelect },
  });
}

export function buscarComentarioBasico(id: string) {
  return db.noticias_comentarios.findUnique({
    where: { id },
    select: { id: true, id_autor: true, id_noticia: true, id_padre: true },
  });
}

export function eliminarComentario(id: string) {
  return db.noticias_comentarios.delete({ where: { id } });
}
