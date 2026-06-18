import Link from "next/link";
import Button from "@/components/ui/Button";
import { IconArrowLeft, IconBriefcase, IconClock, IconCpu } from "@/components/ui/icons";
import { obtenerDetalleProyecto } from "@/server/services/proyecto.service";

export default async function MarketplaceItemPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const proyecto = await obtenerDetalleProyecto(id);

  if (!proyecto) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-text">Proyecto no encontrado</h1>
        <p className="mt-2 text-text-muted">El proyecto que buscas no está disponible.</p>
        <Button href={`/${locale}/marketplace`} className="mt-6">
          Volver al marketplace
        </Button>
      </div>
    );
  }

  const empresa = proyecto.empresario.nombre;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8">
      <Link
        href={`/${locale}/marketplace`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-fwd-azul"
      >
        <IconArrowLeft width={16} height={16} />
        Volver al marketplace
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">

        {/* Contenido principal */}
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {proyecto.estado === "abierto" ? "Abierto" : proyecto.estado === "cerrado" ? "Cerrado" : proyecto.estado}
              </span>
              {proyecto.area && proyecto.area !== "General" && (
                <span className="inline-flex items-center rounded-full bg-fwd-azul/10 px-3 py-1 text-xs font-bold text-fwd-azul">
                  {proyecto.area}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              {proyecto.titulo}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-text-muted">
              {proyecto.descripcion}
            </p>
          </div>

          {proyecto.tecnologias.length > 0 && (
            <div>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                Tecnologías requeridas
              </h2>
              <div className="flex flex-wrap gap-2">
                {proyecto.tecnologias.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 rounded-full border border-fwd-azul/20 bg-fwd-azul/5 px-3 py-1.5 text-sm font-medium text-fwd-azul"
                  >
                    <IconCpu width={13} height={13} className="opacity-70" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">

          {/* Empresa */}
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Empresa</p>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-fwd-soft font-black text-white text-lg shrink-0">
                {empresa.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-text truncate">{empresa}</p>
                <p className="text-xs text-text-muted">{proyecto.empresario.sector}</p>
              </div>
            </div>
          </div>

          {/* Plazo */}
          {proyecto.fechaLimite && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Plazo</p>
              <div className="flex items-center gap-2">
                <IconClock width={16} height={16} className="text-fwd-naranja shrink-0" />
                <span className="font-semibold text-text">
                  {proyecto.vencido
                    ? "Convocatoria vencida"
                    : `${proyecto.diasRestantes} día${proyecto.diasRestantes !== 1 ? "s" : ""} restantes`
                  }
                </span>
              </div>
            </div>
          )}

          {!proyecto.fechaLimite && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Plazo</p>
              <div className="flex items-center gap-2 text-text-muted">
                <IconBriefcase width={16} height={16} className="shrink-0" />
                <span className="text-sm">Sin fecha límite definida</span>
              </div>
            </div>
          )}

          {/* CTAs */}
          <Button href={`/${locale}/marketplace`} variant="outline" fullWidth>
            Ver más proyectos
          </Button>
        </div>

      </div>
    </div>
  );
}
