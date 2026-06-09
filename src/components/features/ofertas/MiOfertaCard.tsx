import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import OfertaBadge from "./OfertaBadge";
import {
  IconBriefcase,
  IconCalendar,
  IconClock,
  IconMail,
} from "@/components/ui/icons";
import type { EstadoBadgeOferta, MiOfertaDTO } from "@/types/oferta";

const MAX_TECH = 6;

function fmtFecha(iso: string | null): string {
  if (!iso) return "Sin fecha";
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Accion {
  label: string;
  href: string;
  variant: "primary" | "outline";
}

function accionesPara(badge: EstadoBadgeOferta, proyectoHref: string, ofertarHref: string): Accion[] {
  const ver: Accion = { label: "Ver proyecto", href: proyectoHref, variant: "primary" };
  switch (badge) {
    case "enviada":
    case "en_revision":
      return [ver, { label: "Editar oferta", href: ofertarHref, variant: "outline" }];
    case "aceptado":
      return [ver, { label: "Siguiente paso", href: proyectoHref, variant: "outline" }];
    case "preseleccionado":
    case "rechazado":
    case "cancelado":
    case "proyecto_cerrado":
      return [ver];
  }
}

interface MiOfertaCardProps {
  oferta: MiOfertaDTO;
  locale: string;
}

export default function MiOfertaCard({ oferta, locale }: MiOfertaCardProps) {
  const { proyecto } = oferta;
  const proyectoHref = `/${locale}/proyectos/${proyecto.id}`;
  const ofertarHref = `/${locale}/proyectos/${proyecto.id}/ofertar`;
  const acciones = accionesPara(oferta.badge, proyectoHref, ofertarHref);
  const techVisibles = proyecto.tecnologias.slice(0, MAX_TECH);
  const techRestantes = proyecto.tecnologias.length - techVisibles.length;

  return (
    <article className="glass flex flex-col gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-6">
      {/* Encabezado: título + estado */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="font-display text-lg font-bold leading-snug text-text">
            {proyecto.titulo}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Badge variant="brand">{proyecto.area}</Badge>
            <span className="inline-flex items-center gap-1">
              <IconBriefcase width={14} height={14} />
              {proyecto.empresario} · {proyecto.sector}
            </span>
          </div>
        </div>
        <OfertaBadge estado={oferta.badge} className="shrink-0" />
      </div>

      {/* Tecnologías */}
      {techVisibles.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {techVisibles.map((tech) => (
            <li key={tech}>
              <Badge variant="outline">{tech}</Badge>
            </li>
          ))}
          {techRestantes > 0 && (
            <li>
              <Badge variant="neutral">+{techRestantes}</Badge>
            </li>
          )}
        </ul>
      )}

      {/* Mensaje enviado al empresario */}
      <div className="rounded-xl border-l-2 border-fwd-azul/40 bg-surface-2/60 px-3 py-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted">
          <IconMail width={13} height={13} />
          Tu propuesta
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">{oferta.propuesta}</p>
      </div>

      {/* Metadatos: monto + fechas */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-muted">
        {oferta.monto != null && (
          <span className="font-semibold text-text">
            ₡{oferta.monto.toLocaleString("es-CR")}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <IconCalendar width={13} height={13} />
          Enviada: {fmtFecha(oferta.fechaEnvio)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconClock width={13} height={13} />
          Límite: {fmtFecha(proyecto.fechaLimite)}
        </span>
      </div>

      {/* Acciones según estado */}
      <div className="mt-1 flex flex-wrap gap-2 border-t border-border/60 pt-4">
        {acciones.map((a) => (
          <Button key={a.label} href={a.href} variant={a.variant} size="sm">
            {a.label}
          </Button>
        ))}
      </div>
    </article>
  );
}
