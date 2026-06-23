import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { PanelCard } from "./panel-card";
import type { ProyectoRecienteItem } from "@/server/services/dashboard-admin.service";

// Últimos proyectos publicados, con su empresario y nº de ofertas recibidas.
// Componente de servidor (solo lectura).
export function ProyectosRecientes({ items }: { items: ProyectoRecienteItem[] }) {
  return (
    <PanelCard
      title="Proyectos recientes"
      action={
        <Link
          href="/admin/proyectos"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-fwd-turquoise transition hover:text-fwd-blue"
        >
          Ver todos <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/40">
          Todavía no hay proyectos publicados.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/[0.07]">
          {items.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {p.titulo}
                </p>
                <p className="mt-0.5 truncate text-xs text-white/45">
                  {p.empresario}
                  {p.area ? ` · ${p.area}` : ""}
                  {p.relativo ? ` · ${p.relativo}` : ""}
                </p>
              </div>
              <span className="flex-shrink-0 rounded-full bg-fwd-blue/15 px-2.5 py-0.5 text-xs font-semibold text-fwd-blue">
                {p.ofertas} oferta{p.ofertas === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
