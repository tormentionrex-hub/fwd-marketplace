export interface NotificacionDTO {
  id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  /** ISO timestamp de creación. */
  creado: string;
}

export interface NotificacionesPayload {
  notificaciones: NotificacionDTO[];
  noLeidas: number;
}
