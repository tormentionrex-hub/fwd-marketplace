import Badge from "@/components/ui/Badge";
import { IconMapPin } from "@/components/ui/icons";
import type { EventoCard as EventoCardType } from "@/types/marketplace";

interface EventCardProps {
  evento: EventoCardType;
}

export default function EventCard({ evento }: EventCardProps) {
  const [dia, mes] = evento.fecha.split(" ");

  return (
    <div className="group flex h-full gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/30 dark:hover:shadow-black/40">
      <div
        className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: evento.color }}
      >
        <span className="font-display text-xl font-bold leading-none">{dia}</span>
        <span className="text-xs uppercase tracking-wide">{mes}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <Badge variant="accent">{evento.modalidad}</Badge>
          <span className="text-xs text-text-muted">{evento.categoria}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 font-display text-base font-bold text-text">
          {evento.titulo}
        </h3>
        <p className="mt-auto inline-flex items-center gap-1 pt-2 text-xs text-text-muted">
          <IconMapPin width={13} height={13} />
          {evento.lugar}
        </p>
      </div>
    </div>
  );
}
