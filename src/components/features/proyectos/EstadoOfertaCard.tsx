import { cn } from "@/lib/utils/cn";
import { ESTADO_OFERTA_META, type EstadoOfertaDetalle } from "@/lib/oferta-estado";
import {
  IconCheck,
  IconClock,
  IconStar,
  IconUpload,
  IconX,
} from "@/components/ui/icons";

const ICONO: Record<EstadoOfertaDetalle, typeof IconCheck> = {
  enviada: IconUpload,
  en_revision: IconClock,
  preseleccionado: IconStar,
  aceptado: IconCheck,
  rechazado: IconX,
  cancelado: IconX,
};

interface EstadoOfertaCardProps {
  estado: EstadoOfertaDetalle;
  fecha?: string | undefined;
}

/** Sección "Estado de mi oferta": muestra el estado actual con color e icono. */
export default function EstadoOfertaCard({ estado, fecha }: EstadoOfertaCardProps) {
  const meta = ESTADO_OFERTA_META[estado];
  const Icon = ICONO[estado];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-text">Estado de mi oferta</span>
      <div className={cn("flex items-center gap-3 rounded-xl px-3 py-3", meta.badge)}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/40 dark:bg-white/10">
          <Icon width={18} height={18} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-bold">{meta.label}</span>
          {fecha && <span className="truncate text-xs opacity-80">Enviada el {fecha}</span>}
        </div>
      </div>
      <p className="text-xs text-text-muted">
        Ya enviaste una oferta a este proyecto. No es posible enviar más de una.
      </p>
    </div>
  );
}
