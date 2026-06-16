import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EventCard from "@/components/features/cards/EventCard";
import NotificacionesPanel from "@/components/features/dashboard/NotificacionesPanel";
import {
  IconArrowRight,
  IconAward,
  IconBriefcase,
  IconCheck,
  IconClock,
  IconCpu,
  IconFile,
  IconRocket,
  IconShieldCheck,
  IconSparkles,
  IconStar,
  IconTrendingUp,
} from "@/components/ui/icons";
import { EVENTOS, PROYECTOS } from "@/lib/marketplace-data";
import { ESTADO_OFERTA_META } from "@/lib/oferta-estado";
import { tiempoRelativo } from "@/lib/tiempo";
import type { ProyectoDetalle } from "@/types/sefora";
import { getUser } from "@/server/auth/get-user";
import { obtenerVerificacionEstudiante } from "@/server/services/verificacion.service";
import { resumenDashboardEstudiante } from "@/server/services/dashboard.service";
import { listarMisOfertas } from "@/server/services/oferta.service";
import { cargarPerfilEditable } from "@/server/services/perfil-estudiante.service";
import { obtenerMiCv } from "@/server/services/curriculum.service";
import MatchEmpleabilidad from "@/components/features/dashboard/MatchEmpleabilidad";

const GRADIENTES_PROYECTO = [
  "linear-gradient(135deg,#008FD4,#20BEC6)",
  "linear-gradient(135deg,#662D91,#EC008C)",
  "linear-gradient(135deg,#F7901E,#FFCB05)",
  "linear-gradient(135deg,#20BEC6,#008FD4)",
  "linear-gradient(135deg,#EC008C,#662D91)",
  "linear-gradient(135deg,#008FD4,#662D91)",
];

function compatibilidad(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000;
  return 70 + (h % 29);
}

function presupuesto(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 131 + id.charCodeAt(i)) % 100000;
  const base = Math.round((600 + (h % 5400)) / 100) * 100;
  return `$${base.toLocaleString("en-US")}`;
}

function compatColor(v: number): { bar: string; text: string } {
  if (v >= 85) return { bar: "linear-gradient(90deg,#10B981,#34D399)", text: "text-emerald-600 dark:text-emerald-400" };
  if (v >= 70) return { bar: "linear-gradient(90deg,#FFCB05,#F7901E)", text: "text-fwd-naranja" };
  return { bar: "linear-gradient(90deg,#F7901E,#EC008C)", text: "text-fwd-naranja" };
}

export default async function DashboardEstudiantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  const verif = await obtenerVerificacionEstudiante(user.id);
  const nombre = user.nombre.trim().split(/\s+/)[0] || "Estudiante";
  const ultimaSesion = tiempoRelativo(user.ultima_sesion);

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

  const [resumen, misOfertas, perfil, cv] = await Promise.all([
    resumenDashboardEstudiante(user.id),
    listarMisOfertas(user.id),
    cargarPerfilEditable(user.id),
    obtenerMiCv(user.id),
  ]);
  const ofertasRecientes = misOfertas.slice(0, 5);

  const señales = [
    Boolean(perfil.correo),
    Boolean(perfil.fotoUrl),
    perfil.resumen.trim().length > 0,
    perfil.habilidades.length > 0,
    perfil.portafolio.length > 0,
  ];
  const perfilCompletado = Math.round((señales.filter(Boolean).length / señales.length) * 100);
  const habilidadesVerificadas = perfil.habilidades.length;

  let nivelEstudiante = "🌱 Talento Emergente";
  if (resumen.proyectosCompletados >= 10 || resumen.reputacion >= 4.5) {
    nivelEstudiante = "👑 Talento Elite FWD";
  } else if (resumen.proyectosCompletados >= 5 || resumen.reputacion >= 4.0) {
    nivelEstudiante = "🏆 Profesional Avanzado";
  } else if (resumen.proyectosCompletados >= 3 || resumen.reputacion >= 3.0) {
    nivelEstudiante = "⭐ Profesional Intermedio";
  } else if (resumen.proyectosCompletados >= 1 || resumen.reputacion >= 1.0) {
    nivelEstudiante = "🚀 Profesional Junior";
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden rounded-[20px] bg-gradient-to-br from-fwd-azul via-fwd-morado to-fwd-turquesa p-6 text-white shadow-xl shadow-fwd-morado/25 duration-500 sm:p-8">
        <span aria-hidden className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
        <span aria-hidden className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-fwd-amarillo/20 blur-3xl" />
        <span aria-hidden className="absolute right-1/3 top-4 h-20 w-20 rounded-full bg-fwd-magenta/30 blur-2xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-extrabold tracking-tight drop-shadow-sm sm:text-4xl">
              Hola, {nombre}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
              Bienvenido a tu centro de oportunidades profesionales. Descubrí proyectos, gestioná
              tus ofertas y construí tu reputación dentro del ecosistema FWD Costa Rica.
            </p>
            {ultimaSesion && (
              <p className="mt-2 text-xs text-white/70">Última sesión: {ultimaSesion}</p>
            )}
            <Link
              href={`/${locale}/marketplace`}
              className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-fwd-azul shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <IconRocket width={18} height={18} />
              Explorar proyectos
            </Link>
          </div>

          <div className="flex items-center gap-5 rounded-2xl bg-white/10 p-5 backdrop-blur-sm ring-1 ring-white/20">
            <ProgressRing value={perfilCompletado} size={104} label="Perfil" track="rgba(255,255,255,0.25)" bar="#FFCB05" />
            <div className="flex flex-1 flex-col gap-2">
              <QuickStat label="ofertas enviadas" value={resumen.totalOfertas} />
              <QuickStat label="proyectos activos" value={resumen.proyectosActivos} />
              <QuickStat label="reputación" value={resumen.reputacion.toFixed(1)} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Ofertas enviadas" value={resumen.totalOfertas} icon={<IconFile width={24} height={24} />} gradient="linear-gradient(135deg,#008FD4,#23a8e6)" i={0} />
        <StatTile label="Proyectos activos" value={resumen.proyectosActivos} icon={<IconBriefcase width={24} height={24} />} gradient="linear-gradient(135deg,#20BEC6,#14B8A6)" i={1} />
        <StatTile label="Completados" value={resumen.proyectosCompletados} icon={<IconAward width={24} height={24} />} gradient="linear-gradient(135deg,#662D91,#EC008C)" i={2} />
        <StatTile label="Reputación" value={resumen.reputacion.toFixed(1)} icon={<IconStar width={24} height={24} />} gradient="linear-gradient(135deg,#F7901E,#FFCB05)" i={3} />
      </div>

      <MatchEmpleabilidad 
        locale={locale}
        perfilCompletado={perfilCompletado}
        nivel={nivelEstudiante}
        habilidades={perfil.habilidades.map(h => perfil.catalogo.find(c => c.id === h.id)?.nombre || "")}
        tieneCV={Boolean(cv)}
        tienePortafolio={perfil.portafolio.length > 0}
        proyectosCompletados={resumen.proyectosCompletados}
      />

      <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
        <SeccionTitulo
          eyebrow="Tu crecimiento"
          eyebrowColor="text-fwd-morado"
          dot="from-fwd-morado to-fwd-magenta"
          titulo="Mi progreso profesional"
        />
        <div className="glass mt-5 grid items-center gap-6 rounded-[20px] p-6 sm:grid-cols-[auto_1fr]">
          <div className="flex justify-center">
            <ProgressRing
              value={perfilCompletado}
              size={148}
              label="completado"
              track="var(--surface-2)"
              bar="url(#fwdring)"
              brandDefs
              big
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Logro icon={<IconCheck width={18} height={18} />} valor={`${perfilCompletado}%`} label="Perfil completado" color="#008FD4" />
            <Logro icon={<IconBriefcase width={18} height={18} />} valor={resumen.proyectosCompletados} label="Proyectos realizados" color="#20BEC6" />
            <Logro icon={<IconStar width={18} height={18} />} valor={resumen.reputacion.toFixed(1)} label="Reputación" color="#F7901E" />
            <Logro icon={<IconCpu width={18} height={18} />} valor={habilidadesVerificadas} label="Habilidades" color="#662D91" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass flex flex-col rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-fwd-azul/10 text-fwd-azul">
                <IconFile width={18} height={18} />
              </span>
              <h2 className="font-display text-lg font-bold text-text">Mis ofertas</h2>
            </div>
            <Link href={`/${locale}/mis-ofertas`} className="text-sm font-semibold text-fwd-azul hover:underline">
              Ver todas
            </Link>
          </div>

          {ofertasRecientes.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-fwd-soft text-white">
                <IconSparkles width={22} height={22} />
              </span>
              <p className="text-sm text-text-muted">
                Aún no enviaste ofertas.{" "}
                <Link href={`/${locale}/marketplace`} className="font-semibold text-fwd-azul hover:underline">
                  Explorá proyectos
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {ofertasRecientes.map((o) => {
                const meta = ESTADO_OFERTA_META[o.estado];
                return (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="truncate text-sm font-medium text-text">{o.proyecto.titulo}</span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <NotificacionesPanel />
      </div>

      <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-8 animate-pulse rounded-full bg-gradient-to-r from-fwd-azul to-fwd-morado" />
              <span className="text-xs font-bold uppercase tracking-wider text-fwd-azul">
                Para vos
              </span>
            </span>
            <h2 className="text-gradient-fwd mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              🚀 Oportunidades recomendadas para ti
            </h2>
            <p className="mt-1 text-sm text-text-muted">Basadas en tu perfil y habilidades.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-fwd px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm">
            <IconSparkles width={14} height={14} />
            Recomendado para ti
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROYECTOS.map((proyecto, i) => (
            <OpportunityCard key={proyecto.id} proyecto={proyecto} locale={locale} i={i} />
          ))}
        </div>
      </section>

      <section>
        <SeccionTitulo
          eyebrow="Comunidad"
          eyebrowColor="text-fwd-turquesa"
          dot="from-fwd-turquesa to-fwd-azul"
          titulo="Próximos eventos"
        />
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {EVENTOS.map((evento) => (
            <EventCard key={evento.id} evento={evento} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SeccionTitulo({
  eyebrow,
  eyebrowColor,
  dot,
  titulo,
}: {
  eyebrow: string;
  eyebrowColor: string;
  dot: string;
  titulo: string;
}) {
  return (
    <div>
      <span className="inline-flex items-center gap-2">
        <span className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${dot}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${eyebrowColor}`}>{eyebrow}</span>
      </span>
      <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-text">{titulo}</h2>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/25">
      <span className="font-bold">{value}</span>
      <span className="text-white/80">{label}</span>
    </span>
  );
}

function ProgressRing({
  value,
  size,
  label,
  track,
  bar,
  brandDefs = false,
  big = false,
}: {
  value: number;
  size: number;
  label: string;
  track: string;
  bar: string;
  brandDefs?: boolean;
  big?: boolean;
}) {
  const stroke = big ? 12 : 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {brandDefs && (
          <defs>
            <linearGradient id="fwdring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#008FD4" />
              <stop offset="50%" stopColor="#20BEC6" />
              <stop offset="100%" stopColor="#662D91" />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={bar}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-display font-extrabold leading-none ${big ? "text-3xl text-text" : "text-xl text-white"}`}>
          {value}%
        </span>
        <span className={`text-[10px] font-medium uppercase tracking-wide ${big ? "text-text-muted" : "text-white/75"}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  gradient,
  i,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  gradient: string;
  i: number;
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards group relative overflow-hidden rounded-[20px] p-5 text-white shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
      style={{ backgroundImage: gradient, animationDelay: `${i * 80}ms`, animationDuration: "500ms" }}
    >
      <span aria-hidden className="absolute inset-0 bg-white/5" />
      <span aria-hidden className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-white/20 blur-md transition-transform duration-500 group-hover:scale-125" />
      <span aria-hidden className="absolute -bottom-9 -left-5 h-24 w-24 rounded-full bg-black/10 blur-lg" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
            {icon}
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-white/25">
            <IconTrendingUp width={12} height={12} />
          </span>
        </div>
        <p className="mt-4 font-display text-4xl font-extrabold leading-none drop-shadow-sm">{value}</p>
        <p className="mt-1.5 text-sm font-medium text-white/90">{label}</p>
      </div>
    </div>
  );
}

function Logro({
  icon,
  valor,
  label,
  color,
}: {
  icon: ReactNode;
  valor: ReactNode;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface/60 p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ backgroundColor: color }}>
        {icon}
      </span>
      <p className="mt-1 font-display text-2xl font-extrabold text-text">{valor}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

function OpportunityCard({
  proyecto,
  locale,
  i,
}: {
  proyecto: ProyectoDetalle;
  locale: string;
  i: number;
}) {
  const gradiente = GRADIENTES_PROYECTO[i % GRADIENTES_PROYECTO.length]!;
  const compat = compatibilidad(proyecto.id);
  const cc = compatColor(compat);

  return (
    <Link
      href={`/${locale}/proyectos/${proyecto.id}`}
      style={{ animationDelay: `${i * 70}ms`, animationDuration: "500ms" }}
      className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-surface/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-fwd-azul/40 hover:shadow-xl"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundImage: gradiente }} />

      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
          style={{ backgroundImage: gradiente }}
        >
          {proyecto.area}
        </span>
        <span className={`text-xs font-bold ${cc.text}`}>{compat}% compatible</span>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-text transition-colors group-hover:text-fwd-azul">
        {proyecto.titulo}
      </h3>
      <p className="mt-0.5 text-xs font-medium text-text-muted">{proyecto.empresario.nombre}</p>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-text-muted">
        {proyecto.descripcion}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {proyecto.tecnologias.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center gap-1 rounded-full border border-fwd-azul/15 bg-fwd-azul/5 px-2.5 py-0.5 text-xs font-medium text-fwd-azul dark:border-fwd-turquesa/20 dark:bg-fwd-turquesa/10 dark:text-fwd-turquesa"
          >
            <IconCpu width={12} height={12} className="opacity-70" />
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${compat}%`, backgroundImage: cc.bar }} />
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 text-text-muted">
            <IconClock width={15} height={15} />
            {proyecto.diasRestantes}d restantes
          </span>
          <span className="font-semibold text-text">{presupuesto(proyecto.id)}</span>
        </div>
        <span className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-fwd-azul px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 group-hover:bg-fwd-morado group-hover:shadow-md">
          Ver proyecto
          <IconArrowRight width={15} height={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
