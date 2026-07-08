"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  IconAward,
  IconBell,
  IconBriefcase,
  IconCheck,
  IconMail,
} from "@/components/ui/icons";
import type { NotificacionDTO, NotificacionesPayload } from "@/types/notificacion";

const POLL_MS = 30_000;

function metaTipo(tipo: string): {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge: string;
} {
  const t = (tipo ?? "").toLowerCase();
  if (t.includes("oportun") || t.includes("proyecto"))
    return { Icon: IconBriefcase, badge: "bg-fwd-azul/10 text-fwd-azul" };
  if (t.includes("logro") || t.includes("reputa") || t.includes("adjudic"))
    return { Icon: IconAward, badge: "bg-fwd-amarillo/15 text-fwd-naranja" };
  if (t.includes("mensaje") || t.includes("empresar"))
    return { Icon: IconMail, badge: "bg-fwd-morado/10 text-fwd-morado" };
  if (t.includes("oferta") || t.includes("respuesta") || t.includes("acept"))
    return { Icon: IconCheck, badge: "bg-fwd-turquesa/10 text-fwd-turquesa" };
  return { Icon: IconBell, badge: "bg-fwd-magenta/10 text-fwd-magenta" };
}

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
    setNoLeidas(0);
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
    await fetch("/api/notificaciones/read", { method: "PATCH" }).catch(() => {});
    cargar();
  }

  return (
    <div className="glass flex flex-col rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-fwd-morado/10 text-fwd-morado">
            <IconBell width={18} height={18} />
          </span>
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
        <ul className="mt-3 flex flex-col gap-1">
          {items.map((n) => {
            const meta = metaTipo(n.tipo);
            return (
              <li
                key={n.id}
                className={`flex items-start gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-colors ${
                  n.leida ? "" : "bg-fwd-azul/[0.04]"
                }`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.badge}`}>
                  <meta.Icon width={16} height={16} />
                </span>
                <span className="flex-1 text-text-muted">
                  <span className={n.leida ? "" : "font-medium text-text"}>{n.mensaje}</span>
                  <span className="ml-1 text-xs text-text-muted/70">· {tiempoRelativo(n.creado)}</span>
                </span>
                {!n.leida && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-fwd-azul" aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
