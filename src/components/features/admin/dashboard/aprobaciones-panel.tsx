"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Check, ChevronRight, ClipboardCheck } from "lucide-react";
import { PanelCard } from "./panel-card";
import { confirmarAccion, toastExito, alertaError } from "@/lib/sweetalert-admin";
import type { AprobacionItem } from "@/server/services/dashboard-admin.service";

// Revisión de aprobaciones: proyectos en estado 'pendiente_revision'.
// Acción rápida "Visto bueno" (reutiliza PATCH /api/admin/proyectos/:id). La
// gestión completa (suspender/eliminar con motivo) vive en /admin/proyectos.
export function AprobacionesPanel({ items }: { items: AprobacionItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function darVistoBueno(p: AprobacionItem) {
    const ok = await confirmarAccion({
      titulo: `¿Dar visto bueno a "${p.titulo}"?`,
      texto: "El proyecto volverá a su estado anterior.",
      confirmText: "Dar visto bueno",
      icon: "question",
    });
    if (!ok) return;
    setBusy(p.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "visto_bueno" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alertaError(data?.error ?? "No se pudo dar el visto bueno.");
        return;
      }
      toastExito(`Proyecto "${p.titulo}" reactivado.`);
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <PanelCard
      title="Revisión de proyectos"
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
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <ClipboardCheck className="h-8 w-8 text-white/25" />
          <p className="text-sm text-white/40">
            No hay proyectos pendientes de revisión.
          </p>
        </div>
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
                  {p.area ? ` · ${p.area}` : ""} · {p.ofertas} oferta
                  {p.ofertas === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <span className="hidden rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-semibold text-orange-400 sm:inline">
                  En revisión
                </span>
                <button
                  type="button"
                  onClick={() => darVistoBueno(p)}
                  disabled={busy === p.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-500/25 disabled:opacity-50"
                  title="Dar visto bueno"
                >
                  <Check className="h-3.5 w-3.5" />
                  {busy === p.id ? "..." : "Visto bueno"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
