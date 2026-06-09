"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import SearchInput from "@/components/ui/SearchInput";
import OfertaResumenCard from "./OfertaResumenCard";
import MiOfertaCard from "./MiOfertaCard";
import {
  IconBriefcase,
  IconCheck,
  IconClock,
  IconLock,
  IconSearch,
  IconX,
} from "@/components/ui/icons";
import { calcularEstadisticas } from "@/lib/oferta-estadisticas";
import type { EstadoOfertaDetalle } from "@/lib/oferta-estado";
import type { MiOfertaDTO } from "@/types/oferta";

// Datos de demostración: si el estudiante aún no tiene ofertas reales en la DB,
// se muestran estos para poder ver la interfaz completa. Poné USAR_DEMO=false
// para ver el estado vacío real con datos en producción.
const USAR_DEMO = false;
const DEMO_OFERTAS: MiOfertaDTO[] = [
  {
    id: "demo-1",
    estado: "aceptado",
    badge: "aceptado",
    propuesta:
      "Puedo construir la plataforma con Next.js y Supabase en 4 semanas, incluyendo panel de administración, reportes en tiempo real y alertas de stock.",
    monto: 850000,
    fechaEnvio: "2026-05-12T14:00:00.000Z",
    proyecto: {
      id: "demo-proj-1",
      titulo: "Plataforma de gestión de inventario para PYME",
      area: "TI",
      empresario: "María Fernández",
      sector: "Comercio minorista",
      tecnologias: ["React", "Next.js", "TypeScript", "Supabase"],
      estado: "cerrado",
      fechaLimite: "2026-05-20T00:00:00.000Z",
    },
  },
  {
    id: "demo-2",
    estado: "en_revision",
    badge: "en_revision",
    propuesta:
      "Propongo una app móvil con React Native y una API en Node.js. Tengo experiencia previa en sistemas de reservas y agendamiento.",
    monto: 620000,
    fechaEnvio: "2026-05-28T09:30:00.000Z",
    proyecto: {
      id: "demo-proj-2",
      titulo: "App de reservas para clínica dental",
      area: "Salud",
      empresario: "Clínica Sonrisas",
      sector: "Salud",
      tecnologias: ["React Native", "Node.js", "PostgreSQL"],
      estado: "abierto",
      fechaLimite: "2026-06-18T00:00:00.000Z",
    },
  },
  {
    id: "demo-3",
    estado: "preseleccionado",
    badge: "preseleccionado",
    propuesta:
      "Diseño e implemento el e-commerce headless con pasarela de pagos y métricas. Adjunto un prototipo navegable de la home.",
    monto: 1200000,
    fechaEnvio: "2026-05-30T17:10:00.000Z",
    proyecto: {
      id: "demo-proj-3",
      titulo: "Tienda en línea para artesanos",
      area: "E-commerce",
      empresario: "Marca País CR",
      sector: "Turismo",
      tecnologias: ["Next.js", "Stripe", "Tailwind CSS", "Prisma", "Vercel"],
      estado: "abierto",
      fechaLimite: "2026-06-25T00:00:00.000Z",
    },
  },
  {
    id: "demo-4",
    estado: "en_revision",
    badge: "proyecto_cerrado",
    propuesta:
      "Implementaría el dashboard analítico con visualizaciones interactivas y exportación de reportes para el equipo de ventas.",
    monto: null,
    fechaEnvio: "2026-04-15T11:00:00.000Z",
    proyecto: {
      id: "demo-proj-4",
      titulo: "Dashboard de métricas internas",
      area: "Datos",
      empresario: "Logística del Valle",
      sector: "Logística",
      tecnologias: ["React", "Node.js", "PostgreSQL"],
      estado: "cerrado",
      fechaLimite: "2026-05-01T00:00:00.000Z",
    },
  },
  {
    id: "demo-5",
    estado: "rechazado",
    badge: "rechazado",
    propuesta:
      "Propongo una landing con CMS headless y optimización SEO. Tiempos: 2 semanas.",
    monto: 300000,
    fechaEnvio: "2026-03-20T08:45:00.000Z",
    proyecto: {
      id: "demo-proj-5",
      titulo: "Sitio institucional con blog",
      area: "Marketing",
      empresario: "Grupo Aurora",
      sector: "Servicios",
      tecnologias: ["Next.js", "Sanity"],
      estado: "cerrado",
      fechaLimite: "2026-04-01T00:00:00.000Z",
    },
  },
  {
    id: "demo-6",
    estado: "cancelado",
    badge: "cancelado",
    propuesta:
      "Automatización de facturación electrónica integrada con Hacienda. Backend en Node.js.",
    monto: 540000,
    fechaEnvio: "2026-02-10T13:20:00.000Z",
    proyecto: {
      id: "demo-proj-6",
      titulo: "Automatización de facturación electrónica",
      area: "Fintech",
      empresario: "Contadores Asociados",
      sector: "Finanzas",
      tecnologias: ["Node.js", "Docker", "PostgreSQL"],
      estado: "cancelado",
      fechaLimite: "2026-03-15T00:00:00.000Z",
    },
  },
];

type Fase = "loading" | "error" | "ready";

type Filtro = "todas" | "en_revision" | "preseleccionado" | "aceptado" | "rechazado" | "cancelado";
type Orden = "fecha_desc" | "fecha_asc" | "estado";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "en_revision", label: "En revisión" },
  { id: "preseleccionado", label: "Preseleccionadas" },
  { id: "aceptado", label: "Aceptadas" },
  { id: "rechazado", label: "Rechazadas" },
  { id: "cancelado", label: "Canceladas" },
];

const ORDEN_ESTADO: Record<EstadoOfertaDetalle, number> = {
  aceptado: 0,
  preseleccionado: 1,
  en_revision: 2,
  enviada: 3,
  rechazado: 4,
  cancelado: 5,
};

function coincideFiltro(oferta: MiOfertaDTO, filtro: Filtro): boolean {
  if (filtro === "todas") return true;
  if (filtro === "en_revision") return oferta.estado === "en_revision" || oferta.estado === "enviada";
  return oferta.estado === filtro;
}

interface MisOfertasViewProps {
  locale: string;
}

export default function MisOfertasView({ locale }: MisOfertasViewProps) {
  const [fase, setFase] = useState<Fase>("loading");
  const [ofertas, setOfertas] = useState<MiOfertaDTO[]>([]);
  const [intento, setIntento] = useState(0);

  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>("fecha_desc");

  useEffect(() => {
    let cancelado = false;
    setFase("loading");

    (async () => {
      try {
        const res = await fetch("/api/ofertas/mis-ofertas", { cache: "no-store" });
        if (cancelado) return;
        if (!res.ok) {
          setFase("error");
          return;
        }
        const data: { ofertas?: MiOfertaDTO[] } = await res.json();
        if (cancelado) return;

        const reales = data.ofertas ?? [];
        setOfertas(reales.length === 0 && USAR_DEMO ? DEMO_OFERTAS : reales);
        setFase("ready");
      } catch {
        if (!cancelado) setFase("error");
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [intento]);

  const stats = useMemo(() => calcularEstadisticas(ofertas), [ofertas]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = ofertas.filter(
      (o) => coincideFiltro(o, filtro) && (!q || o.proyecto.titulo.toLowerCase().includes(q)),
    );
    const ordenadas = [...filtradas];
    ordenadas.sort((a, b) => {
      if (orden === "estado") return ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado];
      const ta = new Date(a.fechaEnvio).getTime();
      const tb = new Date(b.fechaEnvio).getTime();
      return orden === "fecha_asc" ? ta - tb : tb - ta;
    });
    return ordenadas;
  }, [ofertas, filtro, busqueda, orden]);

  // --- Encabezado (siempre visible) ---
  const encabezado = (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Mis <span className="text-gradient-fwd">Ofertas</span>
          </h1>
          <p className="mt-2 max-w-2xl text-text-muted">
            Consulta el estado de todas las ofertas que has enviado a proyectos dentro del
            marketplace.
          </p>
        </div>
        {fase === "ready" && (
          <div className="flex gap-2">
            <Contador valor={stats.total} label="Enviadas" />
            <Contador valor={stats.activas} label="Activas" tono="azul" />
            <Contador valor={stats.aceptadas} label="Aceptadas" tono="verde" />
          </div>
        )}
      </div>
    </header>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
      {encabezado}

      <div className="mt-8">
        {fase === "loading" && <CargandoSkeleton />}
        {fase === "error" && <PantallaError onRetry={() => setIntento((n) => n + 1)} />}
        {fase === "ready" && (
          <div className="flex flex-col gap-8">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <OfertaResumenCard
                label="Total de ofertas"
                value={stats.total}
                gradient="linear-gradient(135deg,#008FD4,#662D91)"
                icon={<IconBriefcase width={20} height={20} />}
              />
              <OfertaResumenCard
                label="En revisión"
                value={stats.enRevision}
                gradient="linear-gradient(135deg,#FFCB05,#F7901E)"
                icon={<IconClock width={20} height={20} />}
              />
              <OfertaResumenCard
                label="Aceptadas"
                value={stats.aceptadas}
                gradient="linear-gradient(135deg,#20BEC6,#10B981)"
                icon={<IconCheck width={20} height={20} />}
              />
              <OfertaResumenCard
                label="Rechazadas"
                value={stats.rechazadas}
                gradient="linear-gradient(135deg,#EC008C,#EF4444)"
                icon={<IconX width={20} height={20} />}
              />
              <OfertaResumenCard
                label="Canceladas"
                value={stats.canceladas}
                gradient="linear-gradient(135deg,#64748B,#334155)"
                icon={<IconLock width={20} height={20} />}
              />
            </div>

            {ofertas.length === 0 ? (
              <EmptyState
                icon={<IconBriefcase width={28} height={28} />}
                title="Aún no has enviado ofertas"
                description="Explora proyectos disponibles en el marketplace y comienza a postularte para oportunidades que impulsen tu crecimiento profesional."
                action={
                  <Button href={`/${locale}/marketplace`}>Explorar Marketplace</Button>
                }
              />
            ) : (
              <>
                {/* Filtros, búsqueda y orden */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {FILTROS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFiltro(f.id)}
                        className={
                          filtro === f.id
                            ? "rounded-full bg-fwd-azul px-4 py-1.5 text-sm font-semibold text-white shadow-sm"
                            : "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text-muted transition-colors hover:border-fwd-azul hover:text-fwd-azul"
                        }
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por nombre del proyecto…"
                      containerClassName="flex-1"
                    />
                    <select
                      value={orden}
                      onChange={(e) => setOrden(e.target.value as Orden)}
                      aria-label="Ordenar ofertas"
                      className="h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-text outline-none transition-colors focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10"
                    >
                      <option value="fecha_desc">Más recientes</option>
                      <option value="fecha_asc">Más antiguas</option>
                      <option value="estado">Por estado</option>
                    </select>
                  </div>
                </div>

                {/* Listado */}
                {visibles.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-text-muted">
                      <IconSearch width={22} height={22} />
                    </span>
                    <p className="font-medium text-text">Sin resultados</p>
                    <p className="text-sm text-text-muted">
                      No hay ofertas que coincidan con el filtro o la búsqueda.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {visibles.map((oferta, i) => (
                      <motion.div
                        key={oferta.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3), ease: [0.21, 0.5, 0.27, 1] }}
                      >
                        <MiOfertaCard oferta={oferta} locale={locale} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Contador({
  valor,
  label,
  tono = "neutro",
}: {
  valor: number;
  label: string;
  tono?: "neutro" | "azul" | "verde";
}) {
  const color =
    tono === "azul" ? "text-fwd-azul" : tono === "verde" ? "text-emerald-500" : "text-text";
  return (
    <div className="glass flex flex-col items-center rounded-xl px-4 py-2 text-center">
      <span className={`font-display text-xl font-bold ${color}`}>{valor}</span>
      <span className="text-[11px] text-text-muted">{label}</span>
    </div>
  );
}

function CargandoSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}

function PantallaError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="glass mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-fwd-magenta/10 px-4 py-1.5 text-sm font-medium text-fwd-magenta">
        <span className="h-2 w-2 rounded-full bg-fwd-magenta" />
        Error
      </span>
      <h2 className="font-display text-2xl font-bold text-text">
        No fue posible cargar tus ofertas
      </h2>
      <p className="max-w-md text-text-muted">
        Ha ocurrido un problema al obtener la información. Intenta nuevamente.
      </p>
      <Button onClick={onRetry}>Reintentar</Button>
    </div>
  );
}
