import ReputationDisplay from "./ReputationDisplay";
import {
  IconAward,
  IconBriefcase,
  IconCpu,
  IconGithub,
  IconGlobe,
  IconLinkedin,
  IconMail,
  IconShieldCheck,
} from "@/components/ui/icons";
import { isValidHttpUrl } from "@/lib/utils/url";
import type { PerfilPublico } from "@/types/perfil";

function QuickStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 p-3 text-center">
      <span className="text-fwd-azul">{icon}</span>
      <span className="font-display text-lg font-bold text-text">{value}</span>
      <span className="text-[11px] leading-tight text-text-muted">{label}</span>
    </div>
  );
}

export default function ProfileSidebar({ perfil }: { perfil: PerfilPublico }) {
  const { contacto } = perfil;
  const enlaces = [
    contacto.email && { href: `mailto:${contacto.email}`, label: "Correo", Icon: IconMail, external: false },
    isValidHttpUrl(contacto.linkedin) && { href: contacto.linkedin, label: "LinkedIn", Icon: IconLinkedin, external: true },
    isValidHttpUrl(contacto.github) && { href: contacto.github, label: "GitHub", Icon: IconGithub, external: true },
    isValidHttpUrl(contacto.portafolio) && { href: contacto.portafolio, label: "Portafolio", Icon: IconGlobe, external: true },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof IconMail; external: boolean }[];

  return (
    <aside className="lg:sticky lg:top-6 lg:h-fit">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {perfil.verificadoFwd && (
          <div className="flex items-center gap-3 rounded-xl bg-fwd-turquesa/10 p-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-fwd-turquesa text-white">
              <IconShieldCheck width={18} height={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-text">Verificado por FWD</p>
              <p className="text-xs text-text-muted">Egresado certificado</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Reputación
          </span>
          <ReputationDisplay
            value={perfil.reputacion}
            evaluaciones={perfil.evaluaciones}
            satisfaccion={perfil.satisfaccion}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <QuickStat icon={<IconBriefcase width={18} height={18} />} value={perfil.proyectosCompletados} label="Proyectos" />
          <QuickStat icon={<IconAward width={18} height={18} />} value={perfil.reputacion.toFixed(1)} label="Reputación" />
          <QuickStat icon={<IconCpu width={18} height={18} />} value={perfil.estadisticas.tecnologiasDominadas} label="Tecnologías" />
          <QuickStat icon={<IconBriefcase width={18} height={18} />} value={perfil.estadisticas.empresasAtendidas} label="Empresas" />
        </div>

        {perfil.mostrarContacto && enlaces.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Contacto
            </span>
            {enlaces.map(({ href, label, Icon, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-fwd-azul"
              >
                <Icon width={18} height={18} />
                {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
