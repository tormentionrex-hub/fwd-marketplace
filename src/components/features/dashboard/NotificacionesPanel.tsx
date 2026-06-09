"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import type { NotificacionDTO, NotificacionesPayload } from "@/types/notificacion";

// Refresco periódico (near real-time vía polling; no websockets).
const POLL_MS = 30_000;

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export default function NotificacionesPanel() {
  const [items, setItems] = useState<NotificacionDTO[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [estado, setEstado] = useState<"loading" | "ready" | "error">("loading");

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/notificaciones", { cache: "no-store" });
      if (!res.ok) {
        setEstado("error");
        return;
      }
      const data: NotificacionesPayload = await res.json();
      setItems(data.notificaciones);
      setNoLeidas(data.noLeidas);
      setEstado("ready");
    } catch {
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, POLL_MS);
    return () => clearInterval(t);
  }, [cargar]);

  async function marcarLeidas() {
    // Optimista: limpia el contador ya y confirma contra el backend.
    setNoLeidas(0);
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
    await fetch("/api/notificaciones/read", { method: "PATCH" }).catch(() => {});
    cargar();
  }

  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-text">Notificaciones</h2>
          {noLeidas > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-fwd-azul px-1.5 text-xs font-bold text-white">
              {noLeidas}
            </span>
          )}
        </div>
        {noLeidas > 0 && (
          <button
            type="button"
            onClick={marcarLeidas}
            className="text-xs font-medium text-fwd-azul transition-colors hover:underline"
          >
            Marcar leídas
          </button>
        )}
      </div>

      {estado === "loading" ? (
        <ul className="mt-4 flex flex-col gap-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-4 animate-pulse rounded bg-surface-2" />
          ))}
        </ul>
      ) : estado === "error" ? (
        <p className="mt-4 text-sm text-text-muted">No pudimos cargar tus notificaciones.</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">No tenés notificaciones por ahora.</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {items.map((n) => (
            <li key={n.id} className="flex gap-3 py-3 text-sm">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.leida ? "bg-border" : "bg-fwd-azul"}`}
                aria-hidden
              />
              <span className="flex-1 text-text-muted">
                {n.mensaje}
                <span className="ml-1 text-xs text-text-muted/70">· {tiempoRelativo(n.creado)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
