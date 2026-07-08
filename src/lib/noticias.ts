// Tipos y helpers del foro de noticias, seguros para usar en el cliente.
// (Los DTO se mantienen en paralelo con noticia.service.ts del servidor.)

export const CATEGORIAS_NOTICIA = [
  'Inteligencia Artificial',
  'Desarrollo Web',
  'Ciberseguridad',
  'Móvil',
  'Datos y Cloud',
  'Hardware',
  'Startups',
  'Diseño y UX',
  'Marketing Digital',
  'Otro',
] as const;

export type CategoriaNoticia = (typeof CATEGORIAS_NOTICIA)[number];

// Color FWD asociado a cada categoría (para las etiquetas del feed).
export const COLOR_CATEGORIA: Record<string, string> = {
  'Inteligencia Artificial': '#662D91',
  'Desarrollo Web': '#008FD5',
  Ciberseguridad: '#EC008C',
  'Móvil': '#20BEC6',
  'Datos y Cloud': '#008FD5',
  Hardware: '#F7901E',
  Startups: '#20BEC6',
  'Diseño y UX': '#EC008C',
  'Marketing Digital': '#F7901E',
  Otro: '#662D91',
};

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
  // Solo en comentarios raíz: su hilo de respuestas (modelo plano estilo YouTube).
  respuestas?: ComentarioDTO[];
}

export interface SesionUsuario {
  id: string;
  nombre: string;
  image_url: string | null;
  rol: string | null;
}

// Roles de staff que pueden moderar (ocultar/eliminar cualquier noticia).
const ROLES_STAFF = ['owner', 'admin', 'staff', 'moderator'];
export function puedeModerar(rol: string | null | undefined): boolean {
  return !!rol && ROLES_STAFF.includes(rol);
}

// Etiqueta legible del rol del autor.
export function etiquetaRol(rol: string): string {
  const mapa: Record<string, string> = {
    estudiante: 'Estudiante',
    empresario: 'Empresa',
    admin: 'Administrador',
    owner: 'Administrador',
    staff: 'Equipo FWD',
    moderator: 'Moderador',
  };
  return mapa[rol] ?? 'Miembro';
}

// Tiempo relativo compacto en español ("hace 5 min", "hace 2 h", "hace 3 d").
export function tiempoRelativo(iso: string): string {
  const fecha = new Date(iso).getTime();
  const ahora = Date.now();
  const seg = Math.max(0, Math.round((ahora - fecha) / 1000));
  if (seg < 60) return 'ahora';
  const min = Math.round(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const horas = Math.round(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias < 7) return `hace ${dias} d`;
  const semanas = Math.round(dias / 7);
  if (semanas < 5) return `hace ${semanas} sem`;
  return new Date(iso).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function inicial(nombre: string): string {
  return (nombre.trim().charAt(0) || 'U').toUpperCase();
}
