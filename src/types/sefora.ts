export type NivelHabilidad = "básico" | "intermedio" | "avanzado";

export type EstadoProyecto = "abierto" | "cerrado" | "cancelado";

export type EstadoOferta =
  | "enviada"
  | "en_revision"
  | "adjudicada"
  | "no_seleccionada";

export interface Empresario {
  nombre: string;
  sector: string;
}

export interface ProyectoDetalle {
  id: string;
  titulo: string;
  descripcion: string;
  area: string;
  tecnologias: string[];
  diasRestantes: number;
  empresario: Empresario;
  estado: EstadoProyecto;
}

export interface Habilidad {
  nombre: string;
  nivel: NivelHabilidad;
}

export interface ProyectoPortafolio {
  id: string;
  titulo: string;
  descripcion?: string;
  tecnologias: string[];
  fecha?: string;
  calificacion?: number;
  repoUrl?: string;
  demoUrl?: string;
  automatico?: boolean;
}

export interface PerfilEstudiante {
  username: string;
  nombre: string;
  correo: string;
  mostrarCorreo: boolean;
  fotoUrl: string;
  resumen: string;
  reputacion: number;
  verificadoFwd: boolean;
  habilidades: Habilidad[];
  proyectos: ProyectoPortafolio[];
}

export interface Oferta {
  id: string;
  proyectoId: string;
  proyecto: string;
  estado: EstadoOferta;
  fecha: string;
}

export interface ResumenDashboard {
  totalOfertas: number;
  proyectosCompletados: number;
  calificacionPromedio: number;
  reputacion: number;
  proyectosActivos: number;
}
