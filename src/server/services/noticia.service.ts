import 'server-only';
import * as repo from '@/server/repositories/noticia.repository';
import { obtenerLinkPreview, urlEmbedVideo } from '@/server/services/link-preview.service';
import { esRolStaff } from '@/server/auth/roles';
import type { CrearNoticiaInput } from '@/server/validation/noticia.schema';

// DTO que consume el frontend. No exponemos columnas crudas de DB.
export interface AutorDTO {
  id: string;
  nombre: string;
  avatarUrl: string | null;
  rol: string;
  perfilUrl: string | null;
}

export interface NoticiaDTO {
  id: string;
  titulo: string;
  texto: string | null;
  enlaceUrl: string | null;
  imagenUrl: string | null;
  videoUrl: string | null;
  videoEmbedUrl: string | null;
  categoria: string | null;
  estado: string;
  creado: string;
  votos: number;
  votada: boolean;
  comentarios: number;
  preview: {
    titulo: string | null;
    descripcion: string | null;
    imagen: string | null;
    sitio: string | null;
    dominio: string | null;
  } | null;
  autor: AutorDTO;
}

export interface ComentarioDTO {
  id: string;
  texto: string;
  creado: string;
  idPadre: string | null;
  autor: AutorDTO;
  // Presente solo en comentarios raíz: sus respuestas (hilo plano estilo YouTube).
  respuestas?: ComentarioDTO[];
}

export interface PaginaComentarios {
  comentarios: ComentarioDTO[];
  siguienteCursor: string | null;
  total: number;
}

const slug = (n: string) => n.trim().toLowerCase().replace(/\s+/g, '-');

type AutorRow = {
  id: string;
  nombre: string;
  image_url: string | null;
  roles: { nombre: string } | null;
  perfiles_empresario: { nombre_empresa: string | null } | null;
};

function mapAutor(u: AutorRow): AutorDTO {
  const rol = u.roles?.nombre ?? 'usuario';
  const esEmpresa = rol === 'empresario';
  const nombre = esEmpresa ? u.perfiles_empresario?.nombre_empresa || u.nombre : u.nombre;
  let perfilUrl: string | null = null;
  if (esEmpresa) perfilUrl = `/empresa/${u.id}`;
  else if (rol === 'estudiante') perfilUrl = `/perfil/${slug(u.nombre)}`;
  return { id: u.id, nombre, avatarUrl: u.image_url, rol, perfilUrl };
}

type NoticiaRow = Awaited<ReturnType<typeof repo.obtenerNoticia>>;

function mapNoticia(n: NonNullable<NoticiaRow>): NoticiaDTO {
  const tienePreview = n.enlace_url && (n.og_titulo || n.og_imagen || n.og_sitio);
  return {
    id: n.id,
    titulo: n.titulo,
    texto: n.texto,
    enlaceUrl: n.enlace_url,
    imagenUrl: n.imagen_url,
    videoUrl: n.video_url,
    videoEmbedUrl: n.video_url ? urlEmbedVideo(n.video_url) : null,
    categoria: n.categoria,
    estado: n.estado,
    creado: n.creado.toISOString(),
    votos: n._count.votos,
    votada: 'votada' in n ? Boolean(n.votada) : false,
    comentarios: n._count.comentarios,
    preview: tienePreview
      ? {
          titulo: n.og_titulo,
          descripcion: n.og_descripcion,
          imagen: n.og_imagen,
          sitio: n.og_sitio,
          dominio: n.enlace_url ? dominioDe(n.enlace_url) : null,
        }
      : null,
    autor: mapAutor(n.usuarios),
  };
}

function dominioDe(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export async function listarFeed(opciones: {
  orden: 'recientes' | 'populares';
  categoria?: string | undefined;
  cursor?: string | undefined;
  idUsuario?: string | null;
  incluirOcultas?: boolean | undefined;
}): Promise<{ noticias: NoticiaDTO[]; siguienteCursor: string | null }> {
  const { noticias, siguienteCursor } = await repo.listarNoticias({ ...opciones, limite: 12 });
  return { noticias: noticias.map(mapNoticia), siguienteCursor };
}

// Listado para el panel de moderación: incluye noticias ocultas.
export async function listarParaModeracion(limite = 60): Promise<NoticiaDTO[]> {
  const { noticias } = await repo.listarNoticias({ orden: 'recientes', limite, incluirOcultas: true });
  return noticias.map(mapNoticia);
}

// Noticias del usuario autenticado (cualquier estado), para su panel "Mis noticias".
export async function listarMias(idAutor: string): Promise<NoticiaDTO[]> {
  const filas = await repo.listarNoticiasDeAutor(idAutor);
  return filas.map((f) => mapNoticia({ ...f, votada: false }));
}

// Edita una noticia: solo el autor (o staff). Recalcula el preview OG si cambió
// el enlace. Devuelve el estado y —si salió bien— la noticia actualizada.
export async function actualizarNoticia(
  id: string,
  idUsuario: string,
  rol: string,
  input: CrearNoticiaInput,
): Promise<{ estado: ResultadoBorrado; noticia?: NoticiaDTO }> {
  const noticia = await repo.buscarNoticiaBasica(id);
  if (!noticia) return { estado: 'no_encontrada' };
  if (noticia.id_autor !== idUsuario && !esRolStaff(rol)) return { estado: 'no_autorizado' };

  let og: Awaited<ReturnType<typeof obtenerLinkPreview>> = null;
  if (input.enlaceUrl && !urlEmbedVideo(input.enlaceUrl)) {
    og = await obtenerLinkPreview(input.enlaceUrl);
  }

  const actualizada = await repo.actualizarNoticia(id, {
    titulo: input.titulo,
    texto: input.texto,
    enlaceUrl: input.enlaceUrl,
    imagenUrl: input.imagenUrl,
    videoUrl: input.videoUrl,
    categoria: input.categoria,
    ogTitulo: og?.titulo ?? null,
    ogDescripcion: og?.descripcion ?? null,
    ogImagen: og?.imagen ?? null,
    ogSitio: og?.sitio ?? null,
  });

  return { estado: 'ok', noticia: mapNoticia({ ...actualizada, votada: false }) };
}

export async function obtenerDetalle(id: string, idUsuario?: string | null): Promise<NoticiaDTO | null> {
  const n = await repo.obtenerNoticia(id, idUsuario);
  if (!n) return null;
  return mapNoticia(n);
}

export async function publicarNoticia(idAutor: string, input: CrearNoticiaInput): Promise<NoticiaDTO> {
  // Si hay enlace (y no es un video embebible), traemos el preview Open Graph.
  let og: Awaited<ReturnType<typeof obtenerLinkPreview>> = null;
  if (input.enlaceUrl && !urlEmbedVideo(input.enlaceUrl)) {
    og = await obtenerLinkPreview(input.enlaceUrl);
  }

  const creada = await repo.crearNoticia({
    idAutor,
    titulo: input.titulo,
    texto: input.texto,
    enlaceUrl: input.enlaceUrl,
    imagenUrl: input.imagenUrl,
    videoUrl: input.videoUrl,
    categoria: input.categoria,
    ogTitulo: og?.titulo ?? null,
    ogDescripcion: og?.descripcion ?? null,
    ogImagen: og?.imagen ?? null,
    ogSitio: og?.sitio ?? null,
  });

  return mapNoticia({ ...creada, votada: false });
}

export type ResultadoBorrado = 'ok' | 'no_encontrada' | 'no_autorizado';

// Elimina una noticia: solo el autor o un miembro del staff/moderación.
export async function eliminarNoticia(id: string, idUsuario: string, rol: string): Promise<ResultadoBorrado> {
  const noticia = await repo.buscarNoticiaBasica(id);
  if (!noticia) return 'no_encontrada';
  if (noticia.id_autor !== idUsuario && !esRolStaff(rol)) return 'no_autorizado';
  await repo.eliminarNoticia(id);
  return 'ok';
}

// Oculta/reactiva una noticia (solo moderación).
export async function moderarNoticia(
  id: string,
  rol: string,
  estado: 'activa' | 'oculta',
): Promise<ResultadoBorrado> {
  if (!esRolStaff(rol)) return 'no_autorizado';
  const noticia = await repo.buscarNoticiaBasica(id);
  if (!noticia) return 'no_encontrada';
  await repo.cambiarEstadoNoticia(id, estado);
  return 'ok';
}

export async function alternarVoto(idNoticia: string, idUsuario: string) {
  const noticia = await repo.buscarNoticiaBasica(idNoticia);
  if (!noticia || noticia.estado !== 'activa') return null;
  return repo.alternarVoto(idNoticia, idUsuario);
}

type ComentarioRow = {
  id: string;
  texto: string;
  creado: Date;
  id_padre: string | null;
  usuarios: AutorRow;
};

function mapComentario(c: ComentarioRow): ComentarioDTO {
  return {
    id: c.id,
    texto: c.texto,
    creado: c.creado.toISOString(),
    idPadre: c.id_padre,
    autor: mapAutor(c.usuarios),
  };
}

// Página de comentarios raíz (10 por defecto, más nuevos primero), cada uno con
// su hilo de respuestas. `siguienteCursor` permite el "ver más comentarios".
export async function listarComentarios(
  idNoticia: string,
  cursor?: string,
  limite = 10,
): Promise<PaginaComentarios> {
  const [{ raices, siguienteCursor }, total] = await Promise.all([
    repo.listarComentariosRaiz(idNoticia, limite, cursor),
    repo.contarComentarios(idNoticia),
  ]);

  const respuestas = await repo.listarRespuestas(raices.map((r) => r.id));
  const porRaiz = new Map<string, ComentarioDTO[]>();
  for (const r of respuestas) {
    if (!r.id_padre) continue;
    const arr = porRaiz.get(r.id_padre) ?? [];
    arr.push(mapComentario(r));
    porRaiz.set(r.id_padre, arr);
  }

  return {
    comentarios: raices.map((r) => ({ ...mapComentario(r), respuestas: porRaiz.get(r.id) ?? [] })),
    siguienteCursor,
    total,
  };
}

export async function comentar(
  idNoticia: string,
  idAutor: string,
  texto: string,
  idPadre?: string | undefined,
): Promise<ComentarioDTO | null> {
  const noticia = await repo.buscarNoticiaBasica(idNoticia);
  if (!noticia || noticia.estado !== 'activa') return null;

  // Las respuestas se cuelgan siempre de la RAÍZ del hilo (modelo plano estilo
  // YouTube): si se responde a una respuesta, se ata a su comentario raíz.
  let idPadreReal: string | undefined = undefined;
  if (idPadre) {
    const padre = await repo.buscarComentarioBasico(idPadre);
    if (padre && padre.id_noticia === idNoticia) {
      idPadreReal = padre.id_padre ?? padre.id;
    }
  }

  const c = await repo.crearComentario({ idNoticia, idAutor, texto, idPadre: idPadreReal });
  return mapComentario(c);
}

export async function eliminarComentario(id: string, idUsuario: string, rol: string): Promise<ResultadoBorrado> {
  const c = await repo.buscarComentarioBasico(id);
  if (!c) return 'no_encontrada';
  if (c.id_autor !== idUsuario && !esRolStaff(rol)) return 'no_autorizado';
  await repo.eliminarComentario(id);
  return 'ok';
}
