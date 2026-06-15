import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/motion";
import ProfileHeader from "@/components/features/perfil/ProfileHeader";
import ProfileSidebar from "@/components/features/perfil/ProfileSidebar";
import SkillBars from "@/components/features/perfil/SkillBars";
import ProjectShowcaseCard from "@/components/features/perfil/ProjectShowcaseCard";
import Timeline from "@/components/features/perfil/Timeline";
import Certifications from "@/components/features/perfil/Certifications";
import Achievements from "@/components/features/perfil/Achievements";
import ProfileLinks from "@/components/features/perfil/ProfileLinks";
import CvPublicoSection from "@/components/features/perfil/CvPublicoSection";
import ContactarEstudianteButton from "@/components/features/solicitudes/ContactarEstudianteButton";
import { getUser } from "@/server/auth/get-user";
import { metadataCvPublico } from "@/server/services/curriculum.service";
import {
  IconAward,
  IconBolt,
  IconBriefcase,
  IconCpu,
  IconStar,
} from "@/components/ui/icons";
import { getPerfilPublico } from "@/lib/perfil-data";

interface PerfilPublicoPageProps {
  params: Promise<{ locale: string; username: string }>;
}

export async function generateMetadata({
  params,
}: PerfilPublicoPageProps): Promise<Metadata> {
  const { username } = await params;
  const perfil = await getPerfilPublico(username);
  const title = `${perfil.nombre} (@${perfil.username}) · FWD Marketplace`;
  const description = perfil.resumen.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "FWD Marketplace Costa Rica",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PerfilPublicoPage({ params }: PerfilPublicoPageProps) {
  const { locale, username } = await params;
  const perfil = await getPerfilPublico(username);

  // Currículum público: solo lo ve un empresario autenticado, si el estudiante lo habilitó.
  const viewer = await getUser();
  const cvPublico =
    viewer?.roles.nombre === "empresario" ? await metadataCvPublico(username) : null;

  // Proyectos ordenados por relevancia: calificación ponderada por nº de evaluaciones.
  const proyectosOrdenados = [...perfil.proyectos].sort(
    (a, b) =>
      b.calificacion * (b.evaluaciones ?? 1) - a.calificacion * (a.evaluaciones ?? 1),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: perfil.nombre,
    alternateName: `@${perfil.username}`,
    jobTitle: perfil.rol,
    url: `/${locale}/perfil/${perfil.username}`,
    address: { "@type": "PostalAddress", addressLocality: perfil.ubicacion, addressCountry: "CR" },
    knowsAbout: perfil.skills.flatMap((g) => g.skills.map((s) => s.nombre)),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: perfil.reputacion,
      reviewCount: perfil.evaluaciones,
      bestRating: 5,
    },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProfileHeader perfil={perfil} profilePath={`/${locale}/perfil/${perfil.username}`} />

      {viewer?.roles.nombre === "empresario" && perfil.id && (
        <div className="mt-6 flex justify-end">
          <ContactarEstudianteButton idEstudiante={perfil.id} nombreEstudiante={perfil.nombre} />
        </div>
      )}

      {cvPublico && (
        <div className="mt-8">
          <CvPublicoSection
            username={username}
            fileName={cvPublico.fileName}
            fileType={cvPublico.fileType}
            actualizado={cvPublico.actualizado}
          />
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <main className="flex min-w-0 flex-col gap-14">
          {/* Acerca de mí */}
          <Reveal>
            <section>
              <SectionHeading eyebrow="Perfil" title="Acerca de mí" />
              <p className="mt-4 max-w-2xl leading-relaxed text-text-muted">{perfil.resumen}</p>
              <p className="mt-4 max-w-2xl leading-relaxed text-text-muted">
                <span className="font-semibold text-text">Objetivo profesional:</span>{" "}
                {perfil.objetivos}
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                    Especialidades
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {perfil.especialidades.map((e) => (
                      <li key={e}>
                        <Badge variant="brand">{e}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                    Intereses tecnológicos
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {perfil.intereses.map((i) => (
                      <li key={i}>
                        <Badge variant="accent">{i}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </Reveal>

          {/* Estadísticas profesionales */}
          <Reveal>
            <section>
              <SectionHeading eyebrow="Dashboard" title="Estadísticas profesionales" />
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                <StatCard label="Proyectos" value={perfil.proyectosCompletados} icon={<IconBriefcase width={20} height={20} />} color="#008fd4" />
                <StatCard label="Reputación" value={perfil.reputacion.toFixed(1)} icon={<IconStar width={20} height={20} />} color="#f7901e" />
                <StatCard label="Tecnologías" value={perfil.estadisticas.tecnologiasDominadas} icon={<IconCpu width={20} height={20} />} color="#662d91" />
                <StatCard label="Empresas" value={perfil.estadisticas.empresasAtendidas} icon={<IconAward width={20} height={20} />} color="#20bec6" />
                <StatCard label="Participaciones" value={perfil.estadisticas.participaciones} icon={<IconBolt width={20} height={20} />} color="#ec008c" />
              </div>
            </section>
          </Reveal>

          {/* Habilidades técnicas */}
          <Reveal>
            <section>
              <SectionHeading
                eyebrow="Skills"
                title="Habilidades técnicas"
                description="Nivel de dominio por categoría."
              />
              <div className="mt-6">
                <SkillBars grupos={perfil.skills} />
              </div>
            </section>
          </Reveal>

          {/* Proyectos completados */}
          <Reveal>
            <section>
              <SectionHeading
                eyebrow="Portafolio"
                title="Proyectos completados"
                description="Trabajos reales realizados dentro del ecosistema FWD."
              />
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {proyectosOrdenados.map((proyecto) => (
                  <ProjectShowcaseCard key={proyecto.id} proyecto={proyecto} />
                ))}
              </div>
            </section>
          </Reveal>

          {/* Enlaces profesionales */}
          <Reveal>
            <ProfileLinks contacto={perfil.contacto} proyectos={perfil.proyectos} />
          </Reveal>

          {/* Timeline */}
          <Reveal>
            <section>
              <SectionHeading eyebrow="Trayectoria" title="Cronología profesional" />
              <div className="mt-6">
                <Timeline items={perfil.timeline} />
              </div>
            </section>
          </Reveal>

          {/* Certificaciones */}
          <Reveal>
            <section>
              <SectionHeading eyebrow="Credenciales" title="Certificaciones" />
              <div className="mt-6">
                <Certifications items={perfil.certificaciones} />
              </div>
            </section>
          </Reveal>

          {/* Logros */}
          <Reveal>
            <section>
              <SectionHeading eyebrow="Reconocimientos" title="Logros y reconocimientos" />
              <div className="mt-6">
                <Achievements items={perfil.logros} />
              </div>
            </section>
          </Reveal>
        </main>

        <ProfileSidebar perfil={perfil} />
      </div>
    </div>
  );
}
