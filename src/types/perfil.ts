// Tipos del perfil público del estudiante: /perfil/[username]

export type SkillCategoria =
  | "Frontend"
  | "Backend"
  | "Bases de Datos"
  | "Cloud"
  | "IA"
  | "Herramientas";

export interface SkillItem {
  nombre: string;
  /** Nivel 0–100. */
  nivel: number;
}

export interface SkillGrupo {
  categoria: SkillCategoria;
  skills: SkillItem[];
}

export interface ProyectoPublico {
  id: string;
  titulo: string;
  descripcion: string;
  tecnologias: string[];
  fecha: string;
  estado: string;
  calificacion: number;
  /** Cantidad de evaluaciones asociadas al proyecto. */
  evaluaciones?: number;
  comentario?: string;
  repoUrl?: string;
  demoUrl?: string;
  /** Captura o imagen representativa del proyecto. Fallback: cover de color. */
  imagenUrl?: string;
  /** Color de marca (hex) para el cover. */
  color: string;
}

export interface ContactoPerfil {
  email?: string;
  linkedin?: string;
  github?: string;
  portafolio?: string;
  sitio?: string;
}

export type TipoTimeline = "proyecto" | "certificacion" | "logro" | "verificacion";

export interface ItemTimeline {
  fecha: string;
  titulo: string;
  descripcion: string;
  tipo: TipoTimeline;
}

export interface Certificacion {
  nombre: string;
  institucion: string;
  fecha: string;
  color: string;
}

export interface Logro {
  titulo: string;
  emoji: string;
  color: string;
}

/** Insignia ganada en los quizzes de Logros FWD (visible en el perfil). */
export interface InsigniaPerfil {
  id: string;
  titulo: string;
  temaNombre: string;
  categoriaNombre: string;
  /** Color de marca (hex) de la categoría. */
  color: string;
  fase: number;
  dificultad: string;
}

export interface PerfilPublico {
  /** Id real del usuario estudiante; null en el perfil de ejemplo (demo). */
  id?: string | null;
  username: string;
  nombre: string;
  rol: string;
  ubicacion: string;
  fotoUrl?: string;
  /** Imagen de portada profesional. Si no hay, se usa el banner de marca. */
  portadaUrl?: string;
  verificadoFwd: boolean;
  reputacion: number;
  evaluaciones: number;
  satisfaccion: number;
  proyectosCompletados: number;
  resumen: string;
  especialidades: string[];
  objetivos: string;
  intereses: string[];
  mostrarContacto: boolean;
  contacto: ContactoPerfil;
  skills: SkillGrupo[];
  proyectos: ProyectoPublico[];
  estadisticas: {
    tecnologiasDominadas: number;
    empresasAtendidas: number;
    participaciones: number;
  };
  timeline: ItemTimeline[];
  certificaciones: Certificacion[];
  logros: Logro[];
  /** Insignias destacadas ganadas en los quizzes (fase más alta por tema). */
  insignias: InsigniaPerfil[];
  /** Total de insignias (fases completadas) en todos los temas. */
  totalInsignias: number;
}
