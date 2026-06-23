"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowRight,
  X,
  Clock,
  Star,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Layers,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import {
  confirmarAccion,
  toastExito,
  alertaError,
} from "@/lib/sweetalert-admin";
import type {
  ProyectoActivoDetalle,
  ProyectoCerradoDetalle,
  OfertaPeriodo,
} from "@/server/repositories/estadisticas-admin.repository";

type ModalTipo = "activos" | "cerrados" | "ofertas" | null;

type Props = {
  operativas: {
    label: string;
    valor: number;
    hint: string;
    color: string;
    tipo: ModalTipo;
  }[];
};

const MAX_VISIBLES = 20;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatHora(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BadgeEstado({ estado }: { estado: string }) {
  const colores: Record<string, string> = {
    pendiente: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    aceptado: "bg-green-500/15 text-green-400 border-green-500/20",
    adjudicada: "bg-fwd-blue/15 text-fwd-blue border-fwd-blue/20",
    rechazada: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${
        colores[estado] ?? "bg-white/10 text-white/60 border-white/10"
      }`}
    >
      {estado}
    </span>
  );
}

// ── Lightbox de imágenes ──────────────────────────────────────────────────────

function Lightbox({
  imagenes,
  inicial,
  onClose,
}: {
  imagenes: string[];
  inicial: number;
  onClose: () => void;
}) {
  const [indice, setIndice] = useState(inicial);

  // Navegación con teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setIndice((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setIndice((i) => Math.min(imagenes.length - 1, i + 1));
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imagenes.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/92 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-3xl flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 right-0 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIndice((i) => Math.max(0, i - 1))}
            disabled={indice === 0}
            className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-30"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <img
            src={imagenes[indice]}
            alt={`Imagen ${indice + 1} de ${imagenes.length}`}
            className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
          />

          <button
            type="button"
            onClick={() => setIndice((i) => Math.min(imagenes.length - 1, i + 1))}
            disabled={indice === imagenes.length - 1}
            className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-30"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {imagenes.length > 1 && (
          <p className="text-sm text-white/50">
            {indice + 1} / {imagenes.length}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Modal descripción ─────────────────────────────────────────────────────────

function ModalDescripcion({
  titulo,
  descripcion,
  onClose,
}: {
  titulo: string;
  descripcion: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="flex w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[#111827] shadow-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-white/40">
              Descripción
            </p>
            <h3 className="text-base font-bold leading-snug text-white">
              {titulo}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 shrink-0 rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
            {descripcion || "Sin descripción."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de proyecto activo ────────────────────────────────────────────────

function TarjetaProyectoActivo({
  proyecto: p,
  locale,
  accionando,
  onRecomendar,
  onSugerir,
}: {
  proyecto: ProyectoActivoDetalle;
  locale: string;
  accionando: boolean;
  onRecomendar: () => void;
  onSugerir: () => void;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [verDesc, setVerDesc] = useState(false);

  const mostrarRecomendar = p.diasPublicado >= 15 && p.totalOfertas === 0;
  const mostrarSugerir = p.diasPublicado >= 25 && p.totalOfertas === 0;

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white/[0.04] transition-all ${
        p.recomendado
          ? "border-fwd-yellow/40 ring-1 ring-fwd-yellow/20"
          : "border-white/10"
      }`}
    >
      {/* Área de imagen */}
      <div
        className={`relative h-32 overflow-hidden rounded-t-2xl bg-white/5 ${
          p.imagenes.length > 0 ? "cursor-pointer" : ""
        }`}
        onClick={() => p.imagenes.length > 0 && setLightboxIdx(0)}
        title={p.imagenes.length > 0 ? "Ver imágenes" : undefined}
      >
        {p.imagenes.length > 0 ? (
          <>
            <img
              src={p.imagenes[0]}
              alt={p.titulo}
              className="h-full w-full object-cover transition hover:scale-105"
            />
            {p.imagenes.length > 1 && (
              <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                +{p.imagenes.length - 1}
              </span>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs font-medium text-red-400/70">
              Sin imagen
            </span>
          </div>
        )}
        {p.recomendado && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-fwd-yellow/90 px-2 py-0.5 text-xs font-bold text-white">
            <Star className="h-3 w-3" />
            Destacado
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Título → abre proyecto en marketplace */}
        <button
          type="button"
          onClick={() =>
            window.open(`/${locale}/marketplace/${p.id}`, "_blank")
          }
          className="text-left text-sm font-bold leading-snug text-white transition hover:text-fwd-blue hover:underline focus:outline-none"
          title="Ver proyecto en el marketplace"
        >
          {p.titulo}
          <ExternalLink className="ml-1 inline h-3 w-3 opacity-50" />
        </button>

        {/* Publicado por */}
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{p.empresario?.nombre ?? "—"}</span>
        </div>

        {/* Fecha y hora */}
        <div className="flex items-center gap-1 text-xs text-white/40">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>
            {formatFecha(p.publicado)} a las {formatHora(p.publicado)}
          </span>
        </div>

        {/* Días publicado */}
        {p.diasPublicado > 0 && (
          <span className="flex items-center gap-1 text-xs text-white/35">
            <Clock className="h-3 w-3" />
            {p.diasPublicado} día{p.diasPublicado !== 1 ? "s" : ""} publicado
          </span>
        )}

        {/* Ver descripción → modal */}
        <button
          type="button"
          onClick={() => setVerDesc(true)}
          className="flex w-fit items-center gap-1 text-xs text-fwd-blue/80 transition hover:text-fwd-blue focus:outline-none"
        >
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          Ver descripción
        </button>

        {/* Stack tecnológico */}
        {p.tecnologias.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.tecnologias.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-0.5 rounded bg-fwd-blue/10 px-1.5 py-0.5 text-[10px] font-medium text-fwd-blue"
              >
                <Layers className="h-2.5 w-2.5" />
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Badges de métricas */}
        <div className="mt-auto flex flex-wrap gap-1 border-t border-white/5 pt-2">
          {p.area_negocio && (
            <span className="rounded-full border border-fwd-teal/25 bg-fwd-teal/10 px-2 py-0.5 text-[10px] font-semibold text-fwd-teal">
              {p.area_negocio}
            </span>
          )}
          {p.plazo_dias && (
            <span className="rounded-full border border-fwd-purple/25 bg-fwd-purple/10 px-2 py-0.5 text-[10px] font-semibold text-fwd-purple">
              {p.plazo_dias} días plazo
            </span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              p.totalOfertas === 0
                ? "border-red-500/25 bg-red-500/10 text-red-400"
                : "border-green-500/25 bg-green-500/10 text-green-400"
            }`}
          >
            {p.totalOfertas} oferta{p.totalOfertas !== 1 ? "s" : ""}
          </span>
          {p.usa_ia && (
            <span className="rounded-full border border-fwd-purple/20 bg-fwd-purple/10 px-2 py-0.5 text-[10px] font-semibold text-fwd-purple">
              Usa IA
            </span>
          )}
          {p.empresario?.nombre_empresa && (
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/55">
              {p.empresario.nombre_empresa}
            </span>
          )}
        </div>

        {/* Acciones de atención */}
        {mostrarSugerir && (
          <button
            type="button"
            onClick={onSugerir}
            disabled={accionando}
            className="mt-1 inline-flex items-center justify-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1.5 text-xs font-semibold text-orange-400 transition hover:bg-orange-500/20 disabled:opacity-40"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Sugerir a gerencia
          </button>
        )}
        {mostrarRecomendar && !p.recomendado && (
          <button
            type="button"
            onClick={onRecomendar}
            disabled={accionando}
            className="mt-1 inline-flex items-center justify-center gap-1 rounded-lg border border-fwd-yellow/30 bg-fwd-yellow/10 px-2.5 py-1.5 text-xs font-semibold text-fwd-yellow transition hover:bg-fwd-yellow/20 disabled:opacity-40"
          >
            <Star className="h-3.5 w-3.5" />
            Recomendar
          </button>
        )}
        {p.recomendado && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-fwd-yellow/80">
            <CheckCircle className="h-3.5 w-3.5" />
            Ya destacado
          </span>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          imagenes={p.imagenes}
          inicial={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      {/* Modal descripción */}
      {verDesc && (
        <ModalDescripcion
          titulo={p.titulo}
          descripcion={p.descripcion}
          onClose={() => setVerDesc(false)}
        />
      )}
    </div>
  );
}

// ── Modal Proyectos Activos ───────────────────────────────────────────────────

function ModalProyectosActivos({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === "string" ? params.locale : "es";

  const [proyectos, setProyectos] = useState<ProyectoActivoDetalle[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionando, setAccionando] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/estadisticas/proyectos-activos")
      .then((r) => r.json())
      .then((d) => {
        setProyectos(d.proyectos ?? []);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los proyectos activos.");
        setCargando(false);
      });
  }, []);

  async function recomendar(p: ProyectoActivoDetalle) {
    const ok = await confirmarAccion({
      titulo: `Recomendar "${p.titulo}"`,
      texto:
        "Al recomendar este proyecto, quedará fijado en el marketplace como destacado y será más visible para los estudiantes.",
      confirmText: "Recomendar proyecto",
      icon: "info",
    });
    if (!ok) return;
    setAccionando(p.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "recomendar" }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        alertaError(d?.error ?? "No se pudo recomendar el proyecto.");
        return;
      }
      setProyectos((prev) =>
        prev
          ? prev.map((x) => (x.id === p.id ? { ...x, recomendado: true } : x))
          : prev
      );
      toastExito(`Proyecto "${p.titulo}" destacado en el marketplace.`);
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setAccionando(null);
    }
  }

  async function sugerirMejora(p: ProyectoActivoDetalle) {
    const ok = await confirmarAccion({
      titulo: `Sugerir mejora a "${p.titulo}"`,
      texto:
        "Se enviará una notificación al empresario sugiriéndole que revise el precio, la descripción o el stack tecnológico de su proyecto.",
      confirmText: "Enviar sugerencia",
      icon: "question",
    });
    if (!ok) return;
    setAccionando(p.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "sugerir_mejora" }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        alertaError(d?.error ?? "No se pudo enviar la sugerencia.");
        return;
      }
      toastExito("Sugerencia enviada al empresario.");
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setAccionando(null);
    }
  }

  const visibles = proyectos ? proyectos.slice(0, MAX_VISIBLES) : [];
  const hayMas = proyectos ? proyectos.length > MAX_VISIBLES : false;

  return (
    <ModalBase titulo="Proyectos activos" onClose={onClose}>
      {cargando && (
        <div className="flex items-center justify-center py-16 text-white/50 text-sm">
          Cargando proyectos…
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {!cargando && !error && proyectos && proyectos.length === 0 && (
        <p className="py-10 text-center text-sm text-white/40">
          No hay proyectos activos en este momento.
        </p>
      )}
      {!cargando && !error && visibles.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibles.map((p) => (
              <TarjetaProyectoActivo
                key={p.id}
                proyecto={p}
                locale={locale}
                accionando={accionando === p.id}
                onRecomendar={() => recomendar(p)}
                onSugerir={() => sugerirMejora(p)}
              />
            ))}
          </div>
          {hayMas && (
            <div className="mt-4 flex justify-center border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/${locale}/marketplace` as Parameters<typeof router.push>[0])}
                className="inline-flex items-center gap-2 rounded-xl bg-fwd-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-fwd-blue/90"
              >
                Ver más proyectos en el marketplace
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </ModalBase>
  );
}

// ── Tarjeta proyecto cerrado ──────────────────────────────────────────────────

function TarjetaProyectoCerrado({ proyecto: p }: { proyecto: ProyectoCerradoDetalle }) {
  const [verDesc, setVerDesc] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-bold leading-snug text-white">
          {p.titulo}
        </h4>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/50">
          Cerrado
        </span>
      </div>

      {p.empresario?.nombre && (
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <User className="h-3 w-3 shrink-0" />
          <span>{p.empresario.nombre}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatFecha(p.publicado)}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-400" />
          {formatFecha(p.cierre)}
        </span>
      </div>

      {p.diasDuracion !== null && (
        <div className="rounded-lg bg-fwd-purple/10 px-2.5 py-1.5 text-xs font-medium text-fwd-purple">
          Duración: {p.diasDuracion} día{p.diasDuracion !== 1 ? "s" : ""}
        </div>
      )}

      <button
        type="button"
        onClick={() => setVerDesc(true)}
        className="flex w-fit items-center gap-1 text-xs text-fwd-blue/80 transition hover:text-fwd-blue"
      >
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        Ver descripción
      </button>

      {p.tecnologias.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {p.tecnologias.map((t) => (
            <span
              key={t}
              className="rounded bg-fwd-purple/10 px-1.5 py-0.5 text-[10px] font-medium text-fwd-purple"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-1 border-t border-white/5 pt-2">
        {p.area_negocio && (
          <span className="rounded-full border border-fwd-teal/25 bg-fwd-teal/10 px-2 py-0.5 text-[10px] font-semibold text-fwd-teal">
            {p.area_negocio}
          </span>
        )}
        {p.usa_ia && (
          <span className="rounded-full border border-fwd-purple/20 bg-fwd-purple/10 px-2 py-0.5 text-[10px] font-semibold text-fwd-purple">
            Usa IA
          </span>
        )}
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/50">
          {p.totalOfertas} oferta{p.totalOfertas !== 1 ? "s" : ""}
        </span>
      </div>

      {verDesc && (
        <ModalDescripcion
          titulo={p.titulo}
          descripcion={p.descripcion}
          onClose={() => setVerDesc(false)}
        />
      )}
    </div>
  );
}

// ── Modal Proyectos Cerrados ──────────────────────────────────────────────────

function ModalProyectosCerrados({ onClose }: { onClose: () => void }) {
  const [proyectos, setProyectos] = useState<ProyectoCerradoDetalle[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/estadisticas/proyectos-cerrados")
      .then((r) => r.json())
      .then((d) => {
        setProyectos(d.proyectos ?? []);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los proyectos cerrados.");
        setCargando(false);
      });
  }, []);

  return (
    <ModalBase titulo="Proyectos cerrados este mes" onClose={onClose}>
      {cargando && (
        <div className="flex items-center justify-center py-16 text-white/50 text-sm">
          Cargando proyectos…
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {!cargando && !error && proyectos && proyectos.length === 0 && (
        <p className="py-10 text-center text-sm text-white/40">
          No hay proyectos cerrados este mes.
        </p>
      )}
      {!cargando && !error && proyectos && proyectos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proyectos.slice(0, MAX_VISIBLES).map((p) => (
            <TarjetaProyectoCerrado key={p.id} proyecto={p} />
          ))}
        </div>
      )}
    </ModalBase>
  );
}

// ── Modal Ofertas del Período ─────────────────────────────────────────────────

function ModalOfertasPeriodo({ onClose }: { onClose: () => void }) {
  const [ofertas, setOfertas] = useState<OfertaPeriodo[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proyectoAbierto, setProyectoAbierto] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/estadisticas/ofertas-periodo")
      .then((r) => r.json())
      .then((d) => {
        setOfertas(d.ofertas ?? []);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudieron cargar las ofertas.");
        setCargando(false);
      });
  }, []);

  const grupos = ofertas
    ? (() => {
        const mapa = new Map<string, { titulo: string; ofertas: OfertaPeriodo[] }>();
        for (const o of ofertas) {
          if (!mapa.has(o.id_proyecto)) {
            mapa.set(o.id_proyecto, { titulo: o.titulo_proyecto, ofertas: [] });
          }
          mapa.get(o.id_proyecto)!.ofertas.push(o);
        }
        return Array.from(mapa.entries()).map(([id, v]) => ({ id, ...v }));
      })()
    : [];

  return (
    <ModalBase titulo="Ofertas del período" onClose={onClose}>
      {cargando && (
        <div className="flex items-center justify-center py-16 text-white/50 text-sm">
          Cargando ofertas…
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {!cargando && !error && grupos.length === 0 && (
        <p className="py-10 text-center text-sm text-white/40">
          No hay ofertas registradas este período.
        </p>
      )}
      {!cargando && !error && grupos.length > 0 && (
        <div className="flex flex-col gap-3">
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <button
                type="button"
                onClick={() =>
                  setProyectoAbierto((prev) =>
                    prev === grupo.id ? null : grupo.id
                  )
                }
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="shrink-0 rounded-full border border-fwd-teal/20 bg-fwd-teal/15 px-2 py-0.5 text-xs font-bold text-fwd-teal">
                    {grupo.ofertas.length}
                  </span>
                  <span className="truncate text-sm font-semibold text-white">
                    {grupo.titulo}
                  </span>
                </div>
                {proyectoAbierto === grupo.id ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-white/40" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                )}
              </button>

              {proyectoAbierto === grupo.id && (
                <div className="divide-y divide-white/[0.06] border-t border-white/10">
                  {grupo.ofertas.map((o) => (
                    <div key={o.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <User className="h-4 w-4 shrink-0 text-white/40" />
                          <span className="truncate text-sm font-medium text-white">
                            {o.estudiante?.nombre ?? "Estudiante desconocido"}
                          </span>
                        </div>
                        <BadgeEstado estado={o.estado} />
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatFecha(o.enviado)} a las {formatHora(o.enviado)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {o.diasEsperando === 0
                            ? "Ofertó hoy"
                            : `Esperando ${o.diasEsperando} día${o.diasEsperando !== 1 ? "s" : ""}`}
                        </span>
                      </div>
                      {o.propuesta && (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/60">
                          {o.propuesta}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ModalBase>
  );
}

// ── Shell de modal reutilizable (con scroll lock definitivo) ─────────────────

function ModalBase({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // REGLA #7: solución definitiva de scroll lock.
  // Bloquear html + body + position:fixed para evitar que Next.js o cualquier
  // scroll container externo interfiera con la rueda del mouse en el modal.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      window.scrollTo(scrollX, scrollY);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex w-full max-w-6xl flex-col rounded-2xl border border-white/10 bg-[#111827] shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{titulo}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* min-h-0 + flex-1 + overscroll-contain = scroll interno con rueda garantizado */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Panel principal ───────────────────────────────────────────────────────────

export function EstadisticasOperativasPanel({ operativas }: Props) {
  const [modalAbierto, setModalAbierto] = useState<ModalTipo>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {operativas.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl p-5 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
            style={{ backgroundColor: m.color }}
          >
            <p className="text-sm font-medium text-white/80 select-none">{m.label}</p>
            <p className="mt-1 text-4xl font-black tabular-nums text-white select-none">
              {m.valor}
            </p>
            <p className="mt-1 text-xs text-white/70 select-none">{m.hint}</p>

            {m.tipo && (
              <button
                type="button"
                onClick={() => setModalAbierto(m.tipo)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Ver detalles
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {modalAbierto === "activos" && (
        <ModalProyectosActivos onClose={() => setModalAbierto(null)} />
      )}
      {modalAbierto === "cerrados" && (
        <ModalProyectosCerrados onClose={() => setModalAbierto(null)} />
      )}
      {modalAbierto === "ofertas" && (
        <ModalOfertasPeriodo onClose={() => setModalAbierto(null)} />
      )}
    </>
  );
}
