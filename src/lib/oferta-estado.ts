// Modelo canónico del estado de una oferta dentro de la ficha de proyecto.
// Módulo puro (sin JSX ni server-only): lo importan tanto el backend (para
// normalizar la cadena libre de la DB) como los componentes de la ficha.

export type EstadoOfertaDetalle =
  | "enviada"
  | "en_revision"
  | "preseleccionado"
  | "aceptado"
  | "rechazado"
  | "cancelado";

export interface EstadoOfertaMeta {
  label: string;
  emoji: string;
  /** Color del punto/acento (hex). */
  dot: string;
  /** Clases Tailwind del badge (fondo + texto), theme-aware. */
  badge: string;
}

export const ESTADO_OFERTA_META: Record<EstadoOfertaDetalle, EstadoOfertaMeta> = {
  enviada: { label: "Oferta enviada", emoji: "📨", dot: "#008FD4", badge: "bg-fwd-azul/10 text-fwd-azul" },
  en_revision: { label: "En revisión", emoji: "🟡", dot: "#F7901E", badge: "bg-fwd-naranja/10 text-fwd-naranja" },
  preseleccionado: { label: "Preseleccionado", emoji: "⭐", dot: "#20BEC6", badge: "bg-fwd-turquesa/10 text-fwd-turquesa" },
  aceptado: { label: "Aceptado", emoji: "🟢", dot: "#10B981", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  rechazado: { label: "Rechazado", emoji: "🔴", dot: "#EF4444", badge: "bg-red-500/10 text-red-600 dark:text-red-400" },
  cancelado: { label: "Cancelado", emoji: "⚪", dot: "#94A3B8", badge: "bg-surface-2 text-text-muted" },
};

/** Normaliza una cadena libre de la DB (p. ej. "pendiente") al estado canónico. */
export function normalizarEstadoOferta(raw: string | null | undefined): EstadoOfertaDetalle {
  switch ((raw ?? "").toLowerCase().trim()) {
    case "enviada":
    case "pendiente":
      return "enviada";
    case "en_revision":
    case "revision":
    case "en revisión":
      return "en_revision";
    case "preseleccionado":
    case "preseleccionada":
      return "preseleccionado";
    case "aceptado":
    case "aceptada":
    case "adjudicada":
      return "aceptado";
    case "rechazado":
    case "rechazada":
    case "no_seleccionada":
      return "rechazado";
    case "cancelado":
    case "cancelada":
      return "cancelado";
    default:
      return "enviada";
  }
}
