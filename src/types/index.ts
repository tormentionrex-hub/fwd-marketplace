// Modelo de datos compartido por las páginas 10, 11, 12 y 14.
// Estados como uniones de strings (no enums). Texto y datos en español.

// === Roles y usuarios ===
export type Rol = 'estudiante' | 'empresario';

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  avatarUrl?: string;
}

// === Proyecto ===
// publicado = recibiendo ofertas; en_desarrollo = adjudicado y trabajándose; cerrado = finalizado
export type EstadoProyecto = 'borrador' | 'publicado' | 'en_desarrollo' | 'cerrado';

export interface Proyecto {
  id: string;
  titulo: string;
  descripcion: string;
  requerimientos: string[];
  empresarioId: string;
  estado: EstadoProyecto;
  fechaCreacion: string; // ISO
  fechaLimite: string; // ISO — plazo para ofertar (usado por ContadorPlazo)
  presupuesto?: number;
  adjudicadaOfertaId?: string; // null/undefined si aún no se adjudica
  estudianteAdjudicadoId?: string;
  calificacionEstudiante?: number; // 1-5, la pone el empresario al cerrar
}

// === Oferta ===
export type EstadoOferta = 'enviada' | 'retirada' | 'adjudicada' | 'rechazada';

export interface Oferta {
  id: string;
  proyectoId: string;
  estudianteId: string;
  propuesta: string; // texto de la propuesta
  prototipoUrl?: string; // URL del prototipo (alternativa al archivo)
  prototipoArchivoNombre?: string; // nombre del archivo subido (alternativa a la URL)
  documentoUrl?: string; // documento opcional
  estado: EstadoOferta;
  calificacion?: number; // 1-5 estrellas que pone el empresario (Página 14, fase 1)
  fechaEnvio: string; // ISO
}

// === Entregable (hitos y entregable final, con historial de versiones) ===
export type TipoEntregable = 'hito' | 'final';
export type EstadoEntregable = 'enviado' | 'aprobado' | 'cambios_solicitados';

export interface Entregable {
  id: string;
  proyectoId: string;
  estudianteId: string;
  tipo: TipoEntregable;
  titulo: string;
  version: number; // historial de versiones
  archivoUrl?: string;
  archivoNombre?: string;
  estado: EstadoEntregable;
  comentarioEmpresario?: string; // se muestra si pidió cambios
  fecha: string; // ISO
}

// === Mensaje (chat empresario <-> estudiante; coordinado con Persona 4 más adelante) ===
export interface Mensaje {
  id: string;
  proyectoId: string;
  emisorId: string;
  emisorRol: Rol;
  contenido: string;
  fecha: string; // ISO
}
