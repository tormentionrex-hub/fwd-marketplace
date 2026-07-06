"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SVGProps } from "react";

// Espejo del tipo devuelto por recomendaciones-estudiante.service.ts
interface ProyectoRecomendado {
  id: string;
  titulo: string;
  empresa: string;
  area: string | null;
  plazoDias: number | null;
  usaIa: boolean;
  imagen: string | null;
  tecnologias: string[];
  techCoinciden: string[];
  areaCoincide: boolean;
  score: number;
  razon: string;
  faltante: string | null;
}
type Modo = "ok" | "sin-preferencias" | "sin-match" | "sin-proyectos";
interface Respuesta {
  modo: Modo;
  recomendaciones: ProyectoRecomendado[];
  mensajeMentor: string | null;
  completitudPrefs: number;
  total: number;
  offset: number;
  hayMas: boolean;
}

function IconSparkles(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" />
      <path d="M19 3v4M21 5h-4" />
    </svg>
  );
}
function IconArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

export default function ParaTiCliente({ locale }: { locale: string }) {
  const [items, setItems] = useState<ProyectoRecomendado[]>([]);
  const [meta, setMeta] = useState<{ modo: Modo; mensajeMentor: string | null } | null>(null);
  const [estado, setEstado] = useState<"loading" | "cargando-mas" | "ready" | "error">("loading");

  useEffect(() => {
    let vivo = true;
    const LIMITE = 5;

    // Carga progresiva: trae un lote de LIMITE, lo muestra, y sigue pidiendo el
    // siguiente hasta que no queden más. Así los primeros 5 aparecen rápido.
    async function cargarLote(offset: number, acumulado: ProyectoRecomendado[]) {
      try {
        const res = await fetch(
          `/api/estudiante/recomendaciones?offset=${offset}&limit=${LIMITE}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("bad status");
        const json: Respuesta = await res.json();
        if (!vivo) return;

        const nuevos = [...acumulado, ...json.recomendaciones];
        setItems(nuevos);
        if (offset === 0) setMeta({ modo: json.modo, mensajeMentor: json.mensajeMentor });

        if (json.hayMas && json.recomendaciones.length > 0) {
          setEstado("cargando-mas");
          cargarLote(offset + LIMITE, nuevos); // siguiente lote en segundo plano
        } else {
          setEstado("ready");
        }
      } catch {
        if (!vivo) return;
        // Si ya cargamos algo, lo mostramos igual; si no, mostramos error.
        setEstado(acumulado.length > 0 ? "ready" : "error");
      }
    }

    cargarLote(0, []);
    return () => {
      vivo = false;
    };
  }, []);

  const modo = meta?.modo;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Encabezado */}
      <header className="mb-6">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-10 w-10 place-items-center rounded-2xl text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #662D91, #EC008C)" }}
          >
            <IconSparkles width={20} height={20} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-text">Para ti</h1>
            <p className="text-sm text-text-muted">
              Proyectos del marketplace elegidos según tus preferencias, con una explicación de por qué encajan.
            </p>
          </div>
        </div>
      </header>

      {estado === "loading" && <Cargando />}

      {estado === "error" && (
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-text-muted">
            No pudimos generar tus recomendaciones en este momento. Intentá recargar la página en un momento.
          </p>
        </div>
      )}

      {(estado === "ready" || estado === "cargando-mas") && (
        <>
          {meta?.mensajeMentor && (
            <MentorBanner locale={locale} modo={meta.modo} mensaje={meta.mensajeMentor} />
          )}

          {items.length === 0 ? (
            <div className="glass mt-4 rounded-2xl p-8 text-center">
              <p className="text-sm text-text-muted">
                No hay proyectos para mostrar por ahora.
              </p>
              <Link
                href={`/${locale}/marketplace`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#662D91] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                Explorar el marketplace <IconArrow width={16} height={16} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {items.map((p) => (
                  <Tarjeta key={p.id} p={p} locale={locale} mostrarScore={modo === "ok"} />
                ))}
              </div>
              {estado === "cargando-mas" && <CargandoMas />}
            </>
          )}
        </>
      )}
    </div>
  );
}

function CargandoMas() {
  return (
    <div className="mt-5 flex items-center justify-center gap-2 py-2 text-sm font-medium text-text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-fwd-morado/30 border-t-fwd-morado" />
      Cargando más proyectos…
    </div>
  );
}

function Cargando() {
  return (
    <div>
      <div className="glass flex items-center gap-3 rounded-2xl p-4">
        <span className="grid h-9 w-9 shrink-0 animate-pulse place-items-center rounded-xl bg-fwd-morado/10 text-fwd-morado">
          <IconSparkles width={18} height={18} />
        </span>
        <p className="text-sm font-medium text-text-muted">
          Analizando los proyectos abiertos para encontrar los que mejor encajan con vos…
        </p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
            <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-surface-2" />
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-surface-2" />
            <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MentorBanner({ locale, modo, mensaje }: { locale: string; modo: Modo; mensaje: string }) {
  const irAPreferencias = modo === "sin-preferencias" || modo === "sin-match";
  return (
    <div className="rounded-2xl border border-fwd-morado/20 bg-fwd-morado/[0.06] p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-fwd-morado/10 text-fwd-morado">
          <IconSparkles width={18} height={18} />
        </span>
        <div className="flex-1">
          <p className="text-sm text-text">{mensaje}</p>
          {irAPreferencias && (
            <Link
              href={`/${locale}/dashboard/estudiante/configuracion`}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-fwd-morado transition-colors hover:underline"
            >
              Configurar mis preferencias <IconArrow width={15} height={15} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Tarjeta({
  p,
  locale,
  mostrarScore,
}: {
  p: ProyectoRecomendado;
  locale: string;
  mostrarScore: boolean;
}) {
  return (
    <article className="glass flex flex-col overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md">
      {/* Imagen o placeholder */}
      <div className="relative h-28 w-full overflow-hidden bg-surface-2">
        {p.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imagen} alt={p.titulo} className="h-full w-full object-cover" />
        ) : (
          <div
            className="grid h-full w-full place-items-center text-white/90"
            style={{ background: "linear-gradient(135deg, #662D91, #EC008C)" }}
          >
            <span className="font-display text-sm font-bold">{p.area ?? "Proyecto"}</span>
          </div>
        )}
        {mostrarScore && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-bold text-white backdrop-blur">
            <IconTarget width={12} height={12} /> {p.score}% afín
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-base font-bold leading-snug text-text">{p.titulo}</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          {p.empresa}
          {p.area ? ` · ${p.area}` : ""}
          {p.plazoDias ? ` · ${p.plazoDias} días` : ""}
        </p>

        {/* Tecnologías (resaltando las que el estudiante ya maneja/le interesan) */}
        {p.tecnologias.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tecnologias.slice(0, 6).map((t) => {
              const coincide = p.techCoinciden.includes(t);
              return (
                <span
                  key={t}
                  className={
                    coincide
                      ? "rounded-full bg-fwd-morado/10 px-2 py-0.5 text-[11px] font-semibold text-fwd-morado ring-1 ring-fwd-morado/20"
                      : "rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted"
                  }
                >
                  {t}
                </span>
              );
            })}
          </div>
        )}

        {/* Explicación de la IA */}
        <div className="mt-3 rounded-xl bg-fwd-morado/[0.05] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-fwd-morado">
            <IconSparkles width={12} height={12} /> Por qué encaja
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text">{p.razon}</p>
          {p.faltante && (
            <p className="mt-2 text-xs text-text-muted">
              <span className="font-semibold text-text">Para destacar:</span> {p.faltante}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-4 flex items-center gap-2 pt-1">
          <Link
            href={`/${locale}/marketplace/${p.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#662D91] px-3 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Ver proyecto <IconArrow width={15} height={15} />
          </Link>
          <Link
            href={`/${locale}/proyectos/${p.id}/ofertar`}
            className="inline-flex items-center justify-center rounded-xl border border-fwd-morado/30 px-3 py-2 text-sm font-semibold text-fwd-morado transition-colors hover:bg-fwd-morado/10"
          >
            Postularme
          </Link>
        </div>
      </div>
    </article>
  );
}
