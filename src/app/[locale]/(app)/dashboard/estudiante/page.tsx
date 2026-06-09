import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import MiniChart from "@/components/ui/MiniChart";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/features/cards/ProjectCard";
import EventCard from "@/components/features/cards/EventCard";
import {
  IconArrowRight,
  IconAward,
  IconBriefcase,
  IconFile,
  IconShieldCheck,
  IconStar,
} from "@/components/ui/icons";
import { EVENTOS, PROYECTOS } from "@/lib/marketplace-data";
import { getUser } from "@/server/auth/get-user";
import { obtenerVerificacionEstudiante } from "@/server/services/verificacion.service";
import type { EstadoOferta, Oferta, ResumenDashboard } from "@/types/sefora";

const estadoConfig: Record<EstadoOferta, { label: string; variant: BadgeVariant }> = {
  enviada: { label: "Enviada", variant: "neutral" },
  en_revision: { label: "En revisión", variant: "info" },
  adjudicada: { label: "Adjudicada", variant: "success" },
  no_seleccionada: { label: "No seleccionada", variant: "danger" },
};

export default async function DashboardEstudiantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // El layout ya garantiza sesión + rol 'estudiante'; aquí derivamos la
  // verificación FWD desde la DB (no un flag hardcodeado).
  const user = await getUser();
  const verif = user
    ? await obtenerVerificacionEstudiante(user.id)
    : { verificado: false, estado: null, solicitado: null };
  const nombre = user?.nombre?.trim().split(/\s+/)[0] ?? "Estudiante";

  const resumen: ResumenDashboard = {
    totalOfertas: 12,
    proyectosCompletados: 4,
    calificacionPromedio: 4.6,
    reputacion: 4.6,
    proyectosActivos: 1,
  };

  const ofertas: Oferta[] = [
    { id: "1", proyectoId: "1", proyecto: "Plataforma de inventario para PYME", estado: "en_revision", fecha: "2026-06-01" },
    { id: "2", proyectoId: "2", proyecto: "App de reservas para clínica dental", estado: "adjudicada", fecha: "2026-05-28" },
    { id: "3", proyectoId: "3", proyecto: "Rediseño de sitio corporativo", estado: "no_seleccionada", fecha: "2026-05-20" },
    { id: "4", proyectoId: "4", proyecto: "Bot de atención al cliente", estado: "enviada", fecha: "2026-06-04" },
  ];

  const notificaciones: string[] = [
    "Tu oferta en 'App de reservas' fue adjudicada.",
    "Un empresario revisó tu perfil.",
    "Nuevo proyecto de TI que coincide con tus habilidades.",
  ];

  if (!verif.verificado) {
    const solicitado = verif.solicitado
      ? new Date(verif.solicitado).toLocaleDateString("es-CR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";
    return (
      <Card className="mx-auto flex max-w-lg flex-col items-center gap-4 p-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-fwd-naranja/10 text-fwd-naranja">
          <IconShieldCheck width={28} height={28} />
        </span>
        <h1 className="font-display text-xl font-bold text-text">
          Cuenta pendiente de verificación
        </h1>
        <p className="max-w-md text-sm text-text-muted">
          Tu cuenta aún está siendo revisada por FWD Costa Rica. Cuando la verificación sea
          aprobada podrás enviar ofertas, aplicar a proyectos, participar en adjudicaciones y
          acceder al dashboard completo.
        </p>
        <dl className="mt-1 grid w-full max-w-sm grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-surface-2 px-4 py-3 text-left">
            <dt className="text-xs uppercase tracking-wide text-text-muted">Estado</dt>
            <dd className="font-semibold capitalize text-text">{verif.estado ?? "pendiente"}</dd>
          </div>
          <div className="rounded-xl bg-surface-2 px-4 py-3 text-left">
            <dt className="text-xs uppercase tracking-wide text-text-muted">Fecha de envío</dt>
            <dd className="font-semibold text-text">{solicitado}</dd>
          </div>
        </dl>
        <p className="text-xs text-text-muted">
          Tiempo estimado de revisión: 24–72 horas hábiles.
        </p>
        <Button href={`/${locale}/dashboard/estudiante/perfil`}>Actualizar información</Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text">
            Hola, {nombre} 👋
          </h1>
          <p className="mt-1 text-text-muted">Este es el resumen de tu actividad en la plataforma.</p>
        </div>
        <Button href={`/${locale}/marketplace`}>
          Explorar proyectos
          <IconArrowRight width={18} height={18} />
        </Button>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ofertas enviadas" value={resumen.totalOfertas} icon={<IconFile width={22} height={22} />} color="#008fd4" delta="+3 este mes" />
        <StatCard label="Proyectos activos" value={resumen.proyectosActivos} icon={<IconBriefcase width={22} height={22} />} color="#20bec6" />
        <StatCard label="Completados" value={resumen.proyectosCompletados} icon={<IconAward width={22} height={22} />} color="#662d91" delta="+1" />
        <StatCard label="Reputación" value={resumen.reputacion.toFixed(1)} icon={<IconStar width={22} height={22} />} color="#f7901e" />
      </div>

      {/* Actividad + Notificaciones */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text">Actividad semanal</h2>
            <Badge variant="success">+18%</Badge>
          </div>
          <p className="mt-1 text-sm text-text-muted">Ofertas e interacciones de los últimos 7 días.</p>
          <div className="mt-6">
            <MiniChart data={[4, 7, 5, 9, 6, 11, 8]} color="#008fd4" height={88} />
            <div className="mt-2 flex justify-between text-xs text-text-muted">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col p-6">
          <h2 className="font-display text-lg font-bold text-text">Notificaciones</h2>
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {notificaciones.map((nota, index) => (
              <li key={index} className="flex gap-3 py-3 text-sm text-text-muted">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-fwd-azul" />
                {nota}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Mis ofertas */}
      <section>
        <h2 className="font-display text-lg font-bold text-text">Mis ofertas</h2>
        <Card className="mt-3 divide-y divide-border">
          {ofertas.map((oferta) => {
            const { label, variant } = estadoConfig[oferta.estado];
            return (
              <div key={oferta.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <span className="truncate text-sm font-medium text-text">{oferta.proyecto}</span>
                <Badge variant={variant}>{label}</Badge>
              </div>
            );
          })}
        </Card>
      </section>

      {/* Oportunidades */}
      <section>
        <SectionHeading
          eyebrow="Oportunidades para ti"
          title="Proyectos que coinciden con tu perfil"
        />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROYECTOS.map((proyecto) => (
            <ProjectCard key={proyecto.id} proyecto={proyecto} locale={locale} />
          ))}
        </div>
      </section>

      {/* Eventos */}
      <section>
        <SectionHeading eyebrow="Comunidad" title="Próximos eventos" />
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {EVENTOS.map((evento) => (
            <EventCard key={evento.id} evento={evento} />
          ))}
        </div>
      </section>
    </div>
  );
}
