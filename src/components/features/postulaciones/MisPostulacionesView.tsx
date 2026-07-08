"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBriefcase, IconX } from "@/components/ui/icons";
import {
  ESTADO_POSTULACION_META,
  ESTADO_VACANTE_META,
  type MiPostulacionDTO,
} from "@/types/vacante";
import { labelModalidad, labelTipoEmpleo } from "@/lib/vacante-format";

interface Props {
  locale: string;
}

export default function MisPostulacionesView({ locale }: Props) {
  const [postulaciones, setPostulaciones] = useState<MiPostulacionDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retirando, setRetirando] = useState<string | null>(null);

  const cargar = async () => {
    try {
      const res = await fetch("/api/postulaciones/mis-postulaciones", { cache: "no-store" });
      if (!res.ok) { setError("No pudimos cargar tus postulaciones."); return; }
      const data = (await res.json()) as { postulaciones: MiPostulacionDTO[] };
      setPostulaciones(data.postulaciones);
    } catch {
      setError("Ocurrió un error de red.");
    }
  };

  useEffect(() => { void cargar(); }, []);

  const retirar = async (id: string) => {
    if (!window.confirm("¿Retirar esta postulación?")) return;
    setRetirando(id);
    const res = await fetch(`/api/postulaciones/${id}`, { method: "DELETE" });
    setRetirando(null);
    if (res.ok) setPostulaciones((prev) => (prev ?? []).filter((p) => p.id !== id));
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "No se pudo retirar la postulación.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-black text-text">Mis postulaciones</h1>
        <p className="mt-1 text-sm text-text-muted">Seguimiento del estado de las vacantes a las que te postulaste.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {postulaciones === null && !error && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      )}

      {postulaciones !== null && postulaciones.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-20 text-center">
          <IconBriefcase width={44} height={44} className="text-text-muted/40" />
          <p className="mt-4 text-lg font-semibold text-text">Todavía no te postulaste a ninguna vacante</p>
          <p className="mt-1 text-sm text-text-muted">Explorá las vacantes abiertas y postulate a las que te interesen.</p>
          <Link href={`/${locale}/marketplace/vacantes`} className="mt-5 rounded-full bg-fwd-blue px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105">
            Explorar vacantes
          </Link>
        </div>
      )}

      {postulaciones !== null && postulaciones.length > 0 && (
        <div className="flex flex-col gap-4">
          {postulaciones.map((p) => {
            const meta = ESTADO_POSTULACION_META[p.estado];
            const vacMeta = ESTADO_VACANTE_META[p.vacante.estado];
            const sub = [labelModalidad(p.vacante.modalidad), labelTipoEmpleo(p.vacante.tipoEmpleo), p.vacante.area].filter(Boolean).join(" · ");
            const puedeRetirar = p.estado !== "aceptado" && p.estado !== "retirada";
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl" style={{ background: `${meta.color}18`, color: meta.color }}>
                    <IconBriefcase width={22} height={22} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/${locale}/marketplace/vacantes/${p.vacante.id}`} className="font-heading text-base font-black text-text hover:underline">
                      {p.vacante.titulo}
                    </Link>
                    <p className="text-sm text-text-muted">{p.vacante.empresa}</p>
                    {sub && <p className="mt-0.5 text-xs text-text-muted/70">{sub}</p>}
                    <p className="mt-1 text-xs text-text-muted/70">
                      Postulaste el {new Date(p.fecha).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: meta.color }}>
                      {meta.label}
                    </span>
                    {p.vacante.estado !== "abierta" && (
                      <span className="text-[11px] font-semibold" style={{ color: vacMeta.color }}>
                        Vacante {vacMeta.label.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>

                {p.mensaje && (
                  <p className="mt-3 line-clamp-2 border-t border-border pt-3 text-sm text-text-muted">{p.mensaje}</p>
                )}

                {puedeRetirar && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => retirar(p.id)}
                      disabled={retirando === p.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-text-muted transition-colors hover:border-red-400 hover:text-red-600 disabled:opacity-60"
                    >
                      <IconX width={13} height={13} />
                      {retirando === p.id ? "Retirando..." : "Retirar"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
