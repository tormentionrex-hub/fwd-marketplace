import SectionHeading from "@/components/ui/SectionHeading";
import {
  IconExternalLink,
  IconGithub,
  IconGlobe,
  IconLinkedin,
} from "@/components/ui/icons";
import { isValidHttpUrl, prettyHost } from "@/lib/utils/url";
import type { ContactoPerfil, ProyectoPublico } from "@/types/perfil";

interface ProfileLinksProps {
  contacto: ContactoPerfil;
  proyectos: ProyectoPublico[];
}

interface LinkItem {
  url: string;
  label: string;
  Icon: typeof IconGithub;
  sub?: string;
}

function LinkCard({ url, label, Icon, sub }: LinkItem) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-fwd-azul/40 hover:shadow-md"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-text-muted transition-colors group-hover:bg-fwd-azul/10 group-hover:text-fwd-azul">
        <Icon width={20} height={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text">{label}</span>
        <span className="block truncate text-xs text-text-muted">{sub ?? prettyHost(url)}</span>
      </span>
      <IconExternalLink
        width={16}
        height={16}
        className="shrink-0 text-text-muted transition-colors group-hover:text-fwd-azul"
      />
    </a>
  );
}

/**
 * Sección "Enlaces profesionales": perfiles públicos (GitHub, LinkedIn, sitio) y
 * los repositorios/demos destacados extraídos del portafolio. Solo se muestran
 * enlaces http(s) válidos; si no hay ninguno, la sección no se renderiza.
 */
export default function ProfileLinks({ contacto, proyectos }: ProfileLinksProps) {
  const perfiles: LinkItem[] = [
    { url: contacto.github, label: "GitHub", Icon: IconGithub },
    { url: contacto.linkedin, label: "LinkedIn", Icon: IconLinkedin },
    { url: contacto.portafolio ?? contacto.sitio, label: "Sitio web", Icon: IconGlobe },
  ]
    .filter((p): p is LinkItem & { url: string } => isValidHttpUrl(p.url))
    .map((p) => ({ ...p, url: p.url }));

  const repos: LinkItem[] = proyectos
    .filter((p) => isValidHttpUrl(p.repoUrl))
    .map((p) => ({ url: p.repoUrl as string, label: p.titulo, Icon: IconGithub, sub: "Repositorio" }));

  const demos: LinkItem[] = proyectos
    .filter((p) => isValidHttpUrl(p.demoUrl))
    .map((p) => ({ url: p.demoUrl as string, label: p.titulo, Icon: IconGlobe, sub: "Demo en vivo" }));

  if (perfiles.length === 0 && repos.length === 0 && demos.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeading
        eyebrow="Enlaces"
        title="Enlaces profesionales"
        description="Perfiles, repositorios destacados y demos en vivo."
      />

      {perfiles.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {perfiles.map((p) => (
            <LinkCard key={p.label} {...p} />
          ))}
        </div>
      )}

      {(repos.length > 0 || demos.length > 0) && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Repositorios y demos destacados
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...repos, ...demos].map((item) => (
              <LinkCard key={`${item.sub}-${item.url}`} {...item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
