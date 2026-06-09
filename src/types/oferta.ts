import type { EstadoProyecto } from "@/types/sefora";
import type { EstadoOfertaDetalle } from "@/lib/oferta-estado";

// Estado visible en la tarjeta de "Mis Ofertas": el estado real de la oferta
// más el derivado "proyecto_cerrado" (cuando el proyecto se cerró/venció
// mientras la oferta seguía activa).
export type EstadoBadgeOferta = EstadoOfertaDetalle | "proyecto_cerrado";

export interface MiOfertaDTO {
  id: string;
  /** Estado real de la oferta. */
  estado: EstadoOfertaDetalle;
  /** Estado a mostrar en el badge (incluye "proyecto_cerrado"). */
  badge: EstadoBadgeOferta;
  /** Mensaje/propuesta enviada al empresario. */
  propuesta: string;
  /** Monto ofertado, si aplica (el schema actual no lo almacena → null). */
  monto: number | null;
  /** Fecha de envío de la oferta (ISO). */
  fechaEnvio: string;
  proyecto: {
    id: string;
    titulo: string;
    area: string;
    empresario: string;
    sector: string;
    tecnologias: string[];
    estado: EstadoProyecto;
    /** Fecha límite del proyecto (ISO) o null. */
    fechaLimite: string | null;
  };
}

export interface EstadisticasOfertas {
  total: number;
  enRevision: number;
  preseleccionadas: number;
  aceptadas: number;
  rechazadas: number;
  canceladas: number;
  /** Ofertas aún sin resolución (enviada + en revisión + preseleccionado). */
  activas: number;
}
