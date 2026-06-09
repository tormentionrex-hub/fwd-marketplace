import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/features/cards/ProjectCard";
import EventCard from "@/components/features/cards/EventCard";
import NotificacionesPanel from "@/components/features/dashboard/NotificacionesPanel";
import {
  IconArrowRight,
  IconAward,
  IconBriefcase,
  IconFile,
  IconShieldCheck,
  IconStar,
} from "@/components/ui/icons";
import { EVENTOS, PROYECTOS } from "@/lib/marketplace-data";
import { ESTADO_OFERTA_META } from "@/lib/oferta-estado";
import { getUser } from "@/server/auth/get-user";
import { obtenerVerificacionEstudiante } from "@/server/services/verificacion.service";
import { resumenDashboardEstudiante } from "@/server/services/dashboard.service";
import { listarMisOfertas } from "@/server/services/oferta.service";

export default async function DashboardEstudiantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // El layout ya garantiza sesión + rol 'estudiante'; reforzamos por seguridad.
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  // Verificación FWD: fuente de verdad en la DB (no un flag hardcodeado).
  const verif = await obtenerVerificacionEstudiante(user.id);
  const nombre = user.nombre.trim().split(/\s+/)[0] || "Estudiante";

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

  // Datos reales del dashboard (en paralelo).
  const [resumen, misOfertas] = await Promise.all([
    resumenDashboardEstudiante(user.id),
    listarMisOfertas(user.id),
  ]);
  const ofertasRecientes = misOfertas.slice(0, 5);

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

      {/* KPIs (datos reales) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ofertas enviadas" value={resumen.totalOfertas} icon={<IconFile width={22} height={22} />} color="#008fd4" />
        <StatCard label="Proyectos activos" value={resumen.proyectosActivos} icon={<IconBriefcase width={22} height={22} />} color="#20bec6" />
        <StatCard label="Completados" value={resumen.proyectosCompletados} icon={<IconAward width={22} height={22} />} color="#662d91" />
        <StatCard label="Reputación" value={resumen.reputacion.toFixed(1)} icon={<IconStar width={22} height={22} />} color="#f7901e" />
      </div>

      {/* Mis ofertas + Notificaciones */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text">Mis ofertas</h2>
            <a href={`/${locale}/mis-ofertas`} className="text-sm font-medium text-fwd-azul hover:underline">
              Ver todas
            </a>
          </div>

          {ofertasRecientes.length === 0 ? (
            <p className="mt-4 text-sm text-text-muted">
              Aún no enviaste ofertas.{" "}
              <a href={`/${locale}/marketplace`} className="font-medium text-fwd-azul hover:underline">
                Explorá proyectos
              </a>
              .
            </p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {ofertasRecientes.map((o) => {
                const meta = ESTADO_OFERTA_META[o.estado];
                return (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="truncate text-sm font-medium text-text">{o.proyecto.titulo}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}
                    >
                      {meta.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <NotificacionesPanel />
      </div>

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
