import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/motion";
import {
  IconAward,
  IconBolt,
  IconBriefcase,
  IconShieldCheck,
  IconStar,
} from "@/components/ui/icons";
import { obtenerPerfilEmpresarioDTO } from "@/server/services/perfil-empresario.service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface EmpresaPublicaPageProps {
  params: Promise<{ locale: string; id: string }>;
}

// Etiquetas públicas de estado (nunca mostramos "borrador" aquí).
const ESTADO_LABEL: Record<string, string> = {
  publicado: "Abierto",
  en_desarrollo: "En curso",
  adjudicado: "Adjudicado",
  cerrado: "Cerrado",
};

export async function generateMetadata({
  params,
}: EmpresaPublicaPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_RE.test(id)) return { title: "Empresa · FWD Marketplace" };

  const perfil = await obtenerPerfilEmpresarioDTO(id);
  if (!perfil) return { title: "Empresa · FWD Marketplace" };

  const title = `${perfil.empresa} · FWD Marketplace`;
  const description =
    perfil.descripcion?.slice(0, 160) ??
    `Perfil de ${perfil.empresa} en FWD Marketplace Costa Rica.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "FWD Marketplace Costa Rica",
    },
  };
}

export default async function EmpresaPublicaPage({
  params,
}: EmpresaPublicaPageProps) {
  const { locale, id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const perfil = await obtenerPerfilEmpresarioDTO(id);
  if (!perfil) notFound();

  // Solo lo público: nunca borradores.
  const proyectosPublicos = perfil.proyectos.filter((p) => p.estado !== "borrador");
  const inicial = perfil.empresa.charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Encabezado de la empresa ── */}
      <Reveal>
        <section className="overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="h-28 bg-gradient-fwd" aria-hidden />
          <div className="px-6 pb-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
              {/* Avatar / logo de la empresa. La imagen llena el marco
                  (object-cover), como una foto de perfil normal. Sin imagen,
                  la inicial sobre el color de marca. */}
              <div
                className={`-mt-12 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-surface shadow-lg ${
                  perfil.fotoUrl ? "bg-surface" : "bg-fwd-azul text-4xl font-black text-white"
                }`}
              >
                {perfil.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={perfil.fotoUrl}
                    alt={perfil.empresa}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  inicial
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">
                    {perfil.empresa}
                  </h1>
                  {perfil.verificado && (
                    <Badge variant="success">
                      <IconShieldCheck width={13} height={13} /> Empresa verificada
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                  {perfil.sector && (
                    <span className="inline-flex items-center gap-1.5">
                      <IconBriefcase width={14} height={14} /> {perfil.sector}
                    </span>
                  )}
                  <span>{perfil.tipo}</span>
                  <span>Miembro desde {perfil.miembroDesde}</span>
                </div>

                <p className="mt-3 text-sm text-text-muted">
                  Cuenta administrada por{" "}
                  <span className="font-semibold text-text">{perfil.responsable}</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Estadísticas ── */}
      <Reveal>
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Proyectos publicados"
            value={perfil.stats.publicados}
            icon={<IconBriefcase width={20} height={20} />}
            color="#008fd4"
          />
          <StatCard
            label="En curso"
            value={perfil.stats.enCurso}
            icon={<IconBolt width={20} height={20} />}
            color="#662d91"
          />
          <StatCard
            label="Completados"
            value={perfil.stats.completados}
            icon={<IconAward width={20} height={20} />}
            color="#20bec6"
          />
          <StatCard
            label="Reputación"
            value={perfil.ratingCliente != null ? perfil.ratingCliente.toFixed(1) : "—"}
            icon={<IconStar width={20} height={20} />}
            color="#f7901e"
          />
        </section>
      </Reveal>

      {/* ── Sobre la empresa ── */}
      {perfil.descripcion && (
        <Reveal>
          <section className="mt-14">
            <SectionHeading eyebrow="Perfil" title="Sobre la empresa" />
            <p className="mt-4 max-w-3xl leading-relaxed text-text-muted">
              {perfil.descripcion}
            </p>
          </section>
        </Reveal>
      )}

      {/* ── Proyectos de la empresa ── */}
      <Reveal>
        <section className="mt-14">
          <SectionHeading
            eyebrow="Marketplace"
            title="Proyectos de la empresa"
            description="Oportunidades publicadas por esta empresa en FWD."
          />
          {proyectosPublicos.length === 0 ? (
            <p className="mt-6 text-text-muted">
              Esta empresa aún no tiene proyectos publicados.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {proyectosPublicos.map((p) => (
                <Link
                  key={p.id}
                  href={`/${locale}/marketplace/${p.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Portada del proyecto */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
                    {p.imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imagen}
                        alt={p.titulo}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-fwd-soft text-4xl font-black text-white/90">
                        {p.titulo.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="brand">{p.area}</Badge>
                      <span className="text-xs font-semibold text-text-muted">
                        {ESTADO_LABEL[p.estado] ?? p.estado}
                      </span>
                    </div>
                    <p className="font-display font-bold text-text transition-colors group-hover:text-fwd-azul">
                      {p.titulo}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* ── Reseñas de estudiantes ── */}
      {perfil.resenas.length > 0 && (
        <Reveal>
          <section className="mt-14">
            <SectionHeading eyebrow="Reputación" title="Lo que dicen los estudiantes" />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {perfil.resenas.map((r, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="flex items-center gap-1 text-fwd-naranja">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s} style={{ opacity: s < r.rating ? 1 : 0.25 }}>
                        <IconStar width={14} height={14} />
                      </span>
                    ))}
                  </div>
                  {r.texto && (
                    <p className="text-sm leading-relaxed text-text-muted">“{r.texto}”</p>
                  )}
                  <p className="mt-1 text-xs text-text-muted">
                    <span className="font-semibold text-text">{r.de}</span> · {r.proyecto}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
