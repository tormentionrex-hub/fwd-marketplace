import { cn } from "@/lib/utils/cn";
import {
  IconCheck,
  IconClock,
  IconLock,
  IconStar,
  IconUpload,
  IconX,
} from "@/components/ui/icons";
import type { EstadoBadgeOferta } from "@/types/oferta";

const META: Record<
  EstadoBadgeOferta,
  { label: string; classes: string; Icon: typeof IconCheck }
> = {
  enviada: {
    label: "Enviada",
    classes: "bg-fwd-azul/10 text-fwd-azul ring-fwd-azul/20",
    Icon: IconUpload,
  },
  en_revision: {
    label: "En revisión",
    classes: "bg-fwd-amarillo/15 text-amber-500 ring-fwd-amarillo/30",
    Icon: IconClock,
  },
  preseleccionado: {
    label: "Preseleccionado",
    classes: "bg-fwd-turquesa/10 text-fwd-turquesa ring-fwd-turquesa/25",
    Icon: IconStar,
  },
  aceptado: {
    label: "Aceptado",
    classes: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
    Icon: IconCheck,
  },
  rechazado: {
    label: "Rechazado",
    classes: "bg-red-500/10 text-red-500 ring-red-500/20",
    Icon: IconX,
  },
  cancelado: {
    label: "Cancelado",
    classes: "bg-slate-500/10 text-slate-400 ring-slate-500/20",
    Icon: IconX,
  },
  proyecto_cerrado: {
    label: "Proyecto cerrado",
    classes: "bg-fwd-naranja/10 text-fwd-naranja ring-fwd-naranja/25",
    Icon: IconLock,
  },
};

interface OfertaBadgeProps {
  estado: EstadoBadgeOferta;
  className?: string;
}

/** Badge del estado de la oferta: color, icono y texto distintivos. */
export default function OfertaBadge({ estado, className }: OfertaBadgeProps) {
  const m = META[estado];
  const Icon = m.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        m.classes,
        className,
      )}
    >
      <Icon width={13} height={13} />
      {m.label}
    </span>
  );
}
