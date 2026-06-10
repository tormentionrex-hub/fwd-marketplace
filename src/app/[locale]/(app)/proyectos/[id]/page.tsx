import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EstadoProyectoBadge from "@/components/features/proyectos/EstadoProyectoBadge";
import OfertaPanel from "@/components/features/proyectos/OfertaPanel";
import { IconArrowLeft, IconClock } from "@/components/ui/icons";
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

export default async function ProyectoDetallePage({ params }: ProyectoDetallePageProps) {
  const { locale, id } = await params;

  // Datos reales del proyecto (título, descripción, área, tecnologías, días
  // restantes, empresario, sector, estado, vencido).  → Subtarea 1
  const proyecto = await obtenerDetalleProyecto(id);
  if (!proyecto) notFound();

  const cancelado = proyecto.estado === "cancelado";
  // Cerrado "por estado" (no por mero vencimiento del plazo, que se muestra aparte).
  const cerrado = proyecto.estado === "cerrado" && !proyecto.vencido;

  const plazoLabel = proyecto.vencido
    ? "Plazo vencido"
    : proyecto.fechaLimite === null
      ? "Sin fecha límite"
      : proyecto.estado === "abierto"
        ? `${proyecto.diasRestantes} ${proyecto.diasRestantes === 1 ? "día" : "días"} restantes`
        : "Sin plazo activo";

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8">
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
              ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
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
                ? "El empresario canceló este proyecto. Ya no recibe ofertas."
                : "Este proyecto ya no admite nuevas ofertas."}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* ── Columna principal ──────────────────────────────────────────── */}
        <main className="min-w-0">
          {/* Área (badge) + estado del proyecto */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="brand">{proyecto.area}</Badge>
            <EstadoProyectoBadge estado={proyecto.estado} />
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            {proyecto.titulo}
          </h1>

          {/* Empresario + sector + días restantes */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-fwd-soft text-xs font-semibold text-white">
                {proyecto.empresario.nombre.charAt(0)}
              </span>
              <span className="font-medium text-text">{proyecto.empresario.nombre}</span>
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span>{proyecto.empresario.sector}</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span
              className={`inline-flex items-center gap-1.5 ${
                proyecto.vencido ? "font-semibold text-red-600 dark:text-red-400" : ""
              }`}
            >
              <IconClock width={15} height={15} />
              {plazoLabel}
            </span>
          </div>

          {/* Descripción completa */}
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Descripción
            </h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-text">
              {proyecto.descripcion}
            </p>
          </section>

          {/* Tecnologías (chips) */}
          {proyecto.tecnologias.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                Tecnologías
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {proyecto.tecnologias.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-border bg-surface-2 px-3 py-1 text-sm font-medium text-text"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>

        {/* ── Panel lateral de acción (sticky) ───────────────────────────── */}
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text">Tu oferta</span>
              <EstadoProyectoBadge estado={proyecto.estado} />
            </div>

            {/*
              Subtareas 2, 3 y 4 (cliente):
              - Sin sesión  → botón que redirige a /login (con redirect de vuelta).
              - Plazo vencido o proyecto cerrado/cancelado → botón deshabilitado + mensaje.
              - El estudiante ya ofertó → muestra el estado de su oferta.
            */}
            <OfertaPanel
              locale={locale}
              proyectoId={proyecto.id}
              estadoProyecto={proyecto.estado}
              vencido={proyecto.vencido}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}
