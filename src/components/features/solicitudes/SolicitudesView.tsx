"use client";

import { useCallback, useEffect, useState } from "react";
import { IconBriefcase, IconCheck, IconMail, IconX } from "@/components/ui/icons";

interface SolicitudDTO {
  id: string;
  asunto: string;
  mensaje: string;
  estado: string;
  creado: string;
  empresario: { nombre: string; fotoUrl: string | null; sector: string | null };
  proyecto: { id: string; titulo: string } | null;
}

type Fase = "loading" | "ready" | "error";

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" });
}

const META_ESTADO: Record<string, { label: string; badge: string }> = {
  pendiente: { label: "Pendiente", badge: "bg-fwd-naranja/10 text-fwd-naranja" },
  aceptada: { label: "Aceptada", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  rechazada: { label: "Rechazada", badge: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

export default function SolicitudesView() {
  const [fase, setFase] = useState<Fase>("loading");
  const [items, setItems] = useState<SolicitudDTO[]>([]);
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/solicitudes", { cache: "no-store" });
      if (!res.ok) {
        setFase("error");
        return;
      }
      const data: { solicitudes: SolicitudDTO[] } = await res.json();
      setItems(data.solicitudes);
      setFase("ready");
    } catch {
      setFase("error");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function responder(id: string, accion: "aceptar" | "rechazar") {
    setProcesando(id);
    try {
      const res = await fetch(`/api/solicitudes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      });
      if (res.ok) {
        const nuevoEstado = accion === "aceptar" ? "aceptada" : "rechazada";
        setItems((prev) => prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s)));
      }
    } catch {
      /* noop: el estado queda como estaba */
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-fwd-azul to-fwd-morado" />
          <span className="text-xs font-bold uppercase tracking-wider text-fwd-azul">Contacto</span>
        </span>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
          Solicitudes de mensaje
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Empresarios que quieren contactarte. Aceptá para habilitar el chat.
        </p>
      </header>

      {fase === "loading" && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      )}

      {fase === "error" && (
        <div className="glass rounded-2xl p-6 text-sm text-text-muted">
          No pudimos cargar tus solicitudes. Recargá la página.
        </div>
      )}

      {fase === "ready" && items.length === 0 && (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-fwd-soft text-white">
            <IconMail width={26} height={26} />
          </span>
          <p className="font-display text-lg font-bold text-text">Sin solicitudes por ahora</p>
          <p className="max-w-sm text-sm text-text-muted">
            Cuando un empresario quiera contactarte, su solicitud aparecerá acá.
          </p>
        </div>
      )}

      {fase === "ready" &&
        items.map((s) => {
          const meta = META_ESTADO[s.estado] ?? META_ESTADO.pendiente!;
          return (
            <div key={s.id} className="glass flex flex-col gap-4 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {s.empresario.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.empresario.fotoUrl}
                    alt={s.empresario.nombre}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-fwd-soft text-base font-bold text-white">
                    {s.empresario.nombre.charAt(0)}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="font-display font-bold text-text">{s.empresario.nombre}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>
                  {s.empresario.sector && (
                    <p className="text-xs text-text-muted">{s.empresario.sector}</p>
                  )}
                  <p className="mt-0.5 text-xs text-text-muted">{formatFecha(s.creado)}</p>
                </div>
              </div>

              {s.proyecto && (
                <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-fwd-azul/5 px-3 py-1 text-xs font-medium text-fwd-azul">
                  <IconBriefcase width={13} height={13} />
                  {s.proyecto.titulo}
                </p>
              )}

              <div className="rounded-xl bg-surface-2 p-3.5">
                <p className="text-sm font-semibold text-text">{s.asunto}</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-muted">
                  {s.mensaje}
                </p>
              </div>

              {s.estado === "pendiente" && (
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => responder(s.id, "rechazar")}
                    disabled={procesando === s.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                  >
                    <IconX width={15} height={15} />
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => responder(s.id, "aceptar")}
                    disabled={procesando === s.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-fwd-azul px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-fwd-morado disabled:opacity-50"
                  >
                    <IconCheck width={15} height={15} />
                    Aceptar
                  </button>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
