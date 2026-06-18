// Tipos para el Marketplace y la comunidad FWD.

export type CategoriaProducto =
  | "Tecnología"
  | "Educación"
  | "Servicios"
  | "Emprendimiento"
  | "Innovación";

export type EstadoProducto = "Disponible" | "Destacado" | "Nuevo" | "Agotado";

export type TipoProyecto =
  | "Turismo"
  | "Skills"
  | "Resolución de problemas"
  | "Automatizaciones";

export type Prioridad = "Alta" | "Media" | "Baja";
export type Complejidad = "Principiante" | "Intermedio" | "Avanzado";

export interface ProductoMarketplace {
  id: string;
  nombre: string;
  categoria: CategoriaProducto;
  descripcion: string;
  precio: string;
  estado: EstadoProducto;
  autor: string;
  /** Color de marca (hex) para el cover flat de la tarjeta. */
  color: string;
  calificacion: number;
  destacado?: boolean;
  lenguajes?: string[];
  tipoProyecto?: TipoProyecto;
  prioridad?: Prioridad;
  complejidad?: Complejidad;
}

export interface EmpresaCard {
  id: string;
  nombre: string;
  sector: string;
  proyectos: number;
  verificada?: boolean;
  color: string;
}

export interface EventoCard {
  id: string;
  titulo: string;
  fecha: string;
  modalidad: "Presencial" | "Virtual" | "Híbrido";
  lugar: string;
  categoria: string;
  color: string;
}

export interface UsuarioCard {
  username: string;
  nombre: string;
  rol: string;
  reputacion: number;
  habilidades: string[];
  verificadoFwd?: boolean;
  fotoUrl?: string;
}

export interface ProyectoMarketplace {
  id: string;
  titulo: string;
  descripcion: string;
  areaNegocio: string | null;
  plazoDias: number | null;
  publicado: string | null;
  tecnologias: string[];
  empresario: {
    nombre: string;
    nombreEmpresa: string | null;
    sector: string | null;
  };
}
