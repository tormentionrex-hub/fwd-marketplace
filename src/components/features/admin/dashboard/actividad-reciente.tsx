import { UserPlus, FolderPlus, FileText, ShieldAlert } from "lucide-react";
import { PanelCard } from "./panel-card";
import type { ActividadItem } from "@/server/services/dashboard-admin.service";

// Mapa de tipo de evento → ícono + color de acento (marca FWD).
const META: Record<
  ActividadItem["tipo"],
  { icono: typeof UserPlus; color: string; tint: string }
> = {
  usuario: { icono: UserPlus, color: "#008FD4", tint: "rgba(0,143,212,0.12)" },
  proyecto: { icono: FolderPlus, color: "#20BEC6", tint: "rgba(32,190,198,0.14)" },
  oferta: { icono: FileText, color: "#EC008C", tint: "rgba(236,0,140,0.12)" },
  suspension: { icono: ShieldAlert, color: "#F7901E", tint: "rgba(247,144,30,0.14)" },
};

// Feed de actividad reciente (componente de servidor, solo lectura).
export function ActividadReciente({ items }: { items: ActividadItem[] }) {
  return (
    <PanelCard title="Actividad reciente">
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/40">
          Todavía no hay actividad registrada.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((a) => {
            const meta = META[a.tipo];
            const Icono = meta.icono;
            return (
              <li key={a.id} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: meta.tint, color: meta.color }}
                  aria-hidden
                >
                  <Icono className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {a.texto}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {a.detalle ? `${a.detalle} · ` : ""}
                    {a.relativo ?? ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}
