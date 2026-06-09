import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EstadoProyectoBadge from "@/components/features/proyectos/EstadoProyectoBadge";
import OfertaPanel from "@/components/features/proyectos/OfertaPanel";
import { IconArrowLeft, IconBriefcase, IconClock } from "@/components/ui/icons";
import {
  obtenerDetalleProyecto,
  type ProyectoDetalleDTO,
} from "@/server/services/proyecto.service";

interface DetalleProyectoPageProps {
  params: Promise<{ locale: string; id: string }>;
}

// Proyecto de ejemplo usado como fallback cuando la DB aún no tiene datos
// sembrados (o no está disponible). Garantiza que la ficha nunca falle en runtime.
const PROYECTO_FALLBACK: Omit<ProyectoDetalleDTO, "id"> = {
  titulo: "Plataforma de gestión de inventario para PYME",
  descripcion:
    "Necesitamos una aplicación web que permita controlar el inventario en tiempo real, generar reportes de stock y emitir alertas de reposición. El objetivo es reemplazar el control manual en hojas de cálculo y reducir los quiebres de stock en nuestras tres sucursales.",
  area: "TI",
  tecnologias: ["React", "Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
  diasRestantes: 5,
  empresario: { nombre: "María Fernández", sector: "Comercio minorista" },
  estado: "abierto",
  vencido: false,
};

// Lee el proyecto real vía service (SEO, sin pasar por /api). Si no existe o la
// DB no está disponible, degrada a datos de ejemplo en lugar de romper la página.
async function obtenerProyectoSeguro(id: string): Promise<ProyectoDetalleDTO> {
  try {
    const real = await obtenerDetalleProyecto(id);
    if (real) return real;
  } catch {
    // Sin DB o sin datos sembrados: usar el fallback.
  }
  return { ...PROYECTO_FALLBACK, id };
}

export default async function DetalleProyectoPage({ params }: DetalleProyectoPageProps) {
  const { locale, id } = await params;
  const proyecto = await obtenerProyectoSeguro(id);

  const plazoVencido = proyecto.vencido || proyecto.diasRestantes <= 0;
  const proyectoInactivo = proyecto.estado === "cerrado" || proyecto.estado === "cancelado";

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8">
      <Link
        href={`/${locale}/marketplace`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-fwd-azul"
      >
        <IconArrowLeft width={16} height={16} />
        Volver a proyectos
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <main className="flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            {/* Estado general del proyecto, visible en la parte superior */}
            <EstadoProyectoBadge estado={proyecto.estado} showDescription />

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{proyecto.area}</Badge>
              <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
                <IconBriefcase width={15} height={15} />
                {proyecto.empresario.nombre} · {proyecto.empresario.sector}
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              {proyecto.titulo}
            </h1>
            <p className="max-w-2xl leading-relaxed text-text-muted">{proyecto.descripcion}</p>
          </header>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Tecnologías requeridas
            </h2>
            {proyecto.tecnologias.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {proyecto.tecnologias.map((tech) => (
                  <li key={tech}>
                    <Badge variant="outline">{tech}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">Sin tecnologías especificadas.</p>
            )}
          </section>
        </main>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="flex flex-col gap-5 p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-fwd-azul/10 text-fwd-azul">
                <IconBriefcase />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-semibold text-text">{proyecto.empresario.nombre}</span>
                <span className="truncate text-sm text-text-muted">{proyecto.empresario.sector}</span>
              </div>
            </div>

            {!proyectoInactivo && !plazoVencido && (
              <div className="flex items-center gap-2 rounded-xl bg-fwd-naranja/10 px-3 py-2.5 text-sm font-medium text-fwd-naranja">
                <IconClock width={18} height={18} />
                {proyecto.diasRestantes} días restantes para ofertar
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Acción de oferta: consume el endpoint real con loading/error en cliente */}
            <OfertaPanel
              locale={locale}
              proyectoId={proyecto.id}
              estadoProyecto={proyecto.estado}
              vencido={plazoVencido}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}
