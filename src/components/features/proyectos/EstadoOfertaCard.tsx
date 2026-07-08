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
      <div className={cn("flex items-center gap-3 rounded-xl px-3.5 py-3.5", meta.badge)}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/40 dark:bg-white/10">
          <Icon width={20} height={20} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-[15px] font-bold leading-tight">{meta.label}</span>
          {fecha && <span className="truncate text-xs opacity-80">Enviada el {fecha}</span>}
        </div>
      </div>
      <p className="text-xs text-text-muted">
        Ya enviaste una oferta a este proyecto. No es posible enviar más de una.
      </p>
    </div>
  );
}
