// Tipos para el Marketplace y la comunidad FWD.

export type CategoriaProducto =
  | "Tecnología"
  | "Educación"
  | "Servicios"
  | "Emprendimiento"
  | "Innovación";

export type EstadoProducto = "Disponible" | "Destacado" | "Nuevo" | "Agotado";

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
