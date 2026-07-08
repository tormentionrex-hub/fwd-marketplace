import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EstadoProyectoBadge from "@/components/features/proyectos/EstadoProyectoBadge";
import OfertaPanel from "@/components/features/proyectos/OfertaPanel";
import {
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconClock,
  IconCpu,
  IconUser,
} from "@/components/ui/icons";
import { obtenerDetalleProyecto } from "@/server/services/proyecto.service";

interface ProyectoDetallePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ProyectoDetallePageProps): Promise<Metadata> {
  const { id } = await params;
  const proyecto = await obtenerDetalleProyecto(id);
  if (!proyecto) return { title: "Proyecto no encontrado · FWD" };
  return {
    title: `${proyecto.titulo} · FWD Marketplace`,
    description: proyecto.descripcion.slice(0, 160),
  };
}

/** Formatea una fecha ISO al formato largo es-CR; null → texto de respaldo. */
function formatearFecha(iso: string | null): string {
  if (!iso) return "Sin fecha límite";
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ProyectoDetallePage({ params }: ProyectoDetallePageProps) {
  const { locale, id } = await params;

  // Datos reales del proyecto (título, descripción, área, tecnologías, días
  // restantes, empresario, sector, estado, vencido).  → Subtarea 1
  const proyecto = await obtenerDetalleProyecto(id);
  if (!proyecto) notFound();

  const empresaHref = proyecto.empresario.id
    ? `/${locale}/empresa/${proyecto.empresario.id}`
    : null;
  const cancelado = proyecto.estado === "cancelado";
  // Cerrado "por estado" (no por mero vencimiento del plazo, que se muestra aparte).
  const cerrado = proyecto.estado === "cerrado" && !proyecto.vencido;

  const plazoLabel = proyecto.vencido
    ? "Plazo vencido"
    : proyecto.fechaLimite === null
      ? "Sin fecha límite"
      : proyecto.estado === "abierto"
        ? `${proyecto.diasRestantes} ${proyecto.diasRestantes === 1 ? "día restante" : "días restantes"}`
        : "Sin plazo activo";

  // El contador grande sólo tiene sentido cuando el proyecto sigue abierto con plazo.
  const muestraContador =
    proyecto.estado === "abierto" && !proyecto.vencido && proyecto.fechaLimite !== null;

  return (
    <div className="relative isolate">
      {/* Banda de marca de fondo (aurora sutil) detrás del encabezado */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-fwd-soft opacity-[0.07]" />
        <div className="animate-aurora absolute -left-24 -top-20 h-72 w-72 rounded-full bg-fwd-azul/20 blur-3xl" />
        <div className="animate-aurora absolute right-0 -top-10 h-64 w-64 rounded-full bg-fwd-morado/15 blur-3xl [animation-delay:3s]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
        <Link
          href={`/${locale}/marketplace`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-fwd-azul"
        >
          <IconArrowLeft width={16} height={16} />
          Volver al marketplace
        </Link>

        {/* ── Subtarea 5: banner llamativo si está cerrado o cancelado ───────── */}
        {(cerrado || cancelado) && (
          <div
            role="alert"
            className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 ${
              cancelado
                ? "border-red-700/40 bg-red-700/10 text-red-800 dark:border-red-500/30 dark:text-red-300"
                : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
            }`}
          >
            <span className="mt-0.5 text-lg leading-none" aria-hidden>
              {cancelado ? "⛔" : "🔒"}
            </span>
            <div>
              <p className="font-semibold">
                {cancelado ? "Proyecto cancelado" : "Proyecto cerrado"}
              </p>
              <p className="text-sm opacity-90">
                {cancelado
                  ? "Este proyecto ha sido cancelado por el empresario."
                  : "Este proyecto ha sido cerrado y ya no acepta nuevas ofertas."}
              </p>
            </div>
          </div>
        )}

        {/* ── Encabezado principal ─────────────────────────────────────────── */}
        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="brand">{proyecto.area}</Badge>
            <EstadoProyectoBadge estado={proyecto.estado} />
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl">
            {proyecto.titulo}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
            {empresaHref ? (
              <Link href={empresaHref} className="inline-flex items-center gap-1.5 hover:underline" title={`Ver perfil de ${proyecto.empresario.nombre}`}>
                <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-gradient-fwd-soft text-xs font-semibold text-white">
                  {proyecto.empresario.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proyecto.empresario.fotoUrl} alt={proyecto.empresario.nombre} className="h-full w-full object-cover" />
                  ) : (
                    proyecto.empresario.nombre.charAt(0)
                  )}
                </span>
                <span className="font-medium text-text">{proyecto.empresario.nombre}</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-gradient-fwd-soft text-xs font-semibold text-white">
                  {proyecto.empresario.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proyecto.empresario.fotoUrl} alt={proyecto.empresario.nombre} className="h-full w-full object-cover" />
                  ) : (
                    proyecto.empresario.nombre.charAt(0)
                  )}
                </span>
                <span className="font-medium text-text">{proyecto.empresario.nombre}</span>
              </span>
            )}
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <IconBuilding width={15} height={15} />
              {proyecto.empresario.sector}
            </span>
          </div>
        </header>

        {/* ── Layout de dos columnas (70 / 30) ─────────────────────────────── */}
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          {/* ── Columna principal ──────────────────────────────────────────── */}
          <main className="flex min-w-0 flex-col gap-6">
            {/* Tarjeta principal: descripción */}
            <Card className="p-6 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-fwd-azul">
                Descripción
              </h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-text">
                {proyecto.descripcion}
              </p>
            </Card>

            {/* Tecnologías requeridas (chips) */}
            {proyecto.tecnologias.length > 0 && (
              <Card className="p-6 sm:p-8">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-fwd-azul">
                  Tecnologías requeridas
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {proyecto.tecnologias.map((tech) => (
                    <li key={tech}>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-fwd-azul/20 bg-fwd-azul/5 px-3.5 py-1.5 text-sm font-medium text-fwd-azul transition-all duration-200 hover:-translate-y-0.5 hover:border-fwd-azul/40 hover:bg-fwd-azul/10 dark:text-fwd-turquesa dark:border-fwd-turquesa/25 dark:bg-fwd-turquesa/10">
                        <IconCpu width={14} height={14} className="opacity-70" />
                        {tech}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </main>

          {/* ── Columna lateral ────────────────────────────────────────────── */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:h-fit">
            {/* Contador de días restantes (destacado) */}
            {muestraContador && (
              <Card variant="gradient-border" className="overflow-hidden p-5 text-center">
                <p className="text-gradient-fwd font-display text-5xl font-extrabold leading-none">
                  {proyecto.diasRestantes}
                </p>
                <p className="mt-2 text-sm font-medium text-text-muted">
                  {proyecto.diasRestantes === 1 ? "día restante" : "días restantes"}
                </p>
              </Card>
            )}

            {/* Acciones / participación del estudiante (Subtareas 2, 3, 4) */}
            <Card className="flex flex-col gap-4 p-5">
              <span className="text-sm font-semibold text-text">Tu oferta</span>
              {/*
                - Sin sesión  → botón que redirige a /login (con redirect de vuelta).
                - Plazo vencido o proyecto cerrado/cancelado → botón deshabilitado + mensaje.
                - El estudiante ya ofertó → muestra el estado de su oferta (reemplaza el botón).
              */}
              <OfertaPanel
                locale={locale}
                proyectoId={proyecto.id}
                estadoProyecto={proyecto.estado}
                vencido={proyecto.vencido}
              />
            </Card>

            {/* Estado del proyecto */}
            <Card className="flex flex-col gap-3 p-5">
              <span className="text-sm font-semibold text-text">Estado del proyecto</span>
              <EstadoProyectoBadge estado={proyecto.estado} showDescription />
            </Card>

            {/* Información rápida */}
            <Card className="p-5">
              <span className="text-sm font-semibold text-text">Información</span>
              <dl className="mt-4 flex flex-col gap-3">
                <InfoRow icon={<IconUser width={16} height={16} />} label="Empresario">
                  {proyecto.empresario.nombre}
                </InfoRow>
                <InfoRow icon={<IconBuilding width={16} height={16} />} label="Sector">
                  {proyecto.empresario.sector}
                </InfoRow>
                <InfoRow icon={<IconCalendar width={16} height={16} />} label="Fecha límite">
                  {formatearFecha(proyecto.fechaLimite)}
                </InfoRow>
                <InfoRow
                  icon={<IconClock width={16} height={16} />}
                  label="Plazo"
                  highlight={proyecto.vencido}
                >
                  {plazoLabel}
                </InfoRow>
              </dl>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

/** Fila de dato con icono dentro del panel de información rápida. */
function InfoRow({
  icon,
  label,
  children,
  highlight = false,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-fwd-azul">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-text-muted">{label}</dt>
        <dd
          className={`text-sm font-medium ${
            highlight ? "text-red-600 dark:text-red-400" : "text-text"
          }`}
        >
          {children}
        </dd>
      </div>
    </div>
  );
}
