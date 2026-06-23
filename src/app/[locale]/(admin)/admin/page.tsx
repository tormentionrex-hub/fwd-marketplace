import { Link } from '@/i18n/navigation';
import {
  obtenerKPIsAdmin,
  obtenerDatosGraficoAdmin,
  obtenerAlertasCriticasAdmin,
} from '@/server/repositories/dashboard-admin.repository';
import { AdminPageShell } from '@/components/features/admin/admin-page-header';
import { DashboardChart } from '@/components/features/admin/dashboard-chart';
import AnimatedProjectsTitle from '@/components/AnimatedProjectsTitle';
import {
  GraduationCap,
  Building2,
  FolderCode,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

function TendenciaBadge({ valor }: { valor: number }) {
  const esPositivo = valor > 0;
  const esNegativo = valor < 0;

  if (!esPositivo && !esNegativo) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/50">
        0%
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
        esPositivo
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-rose-500/10 text-rose-400'
      }`}
    >
      {esPositivo ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {esPositivo ? `+${valor}%` : `${valor}%`}
    </span>
  );
}

export default async function AdminPage() {
  const [kpis, graficoData, alertas] = await Promise.all([
    obtenerKPIsAdmin(),
    obtenerDatosGraficoAdmin(),
    obtenerAlertasCriticasAdmin(),
  ]);

  const cards = [
    {
      titulo: 'Estudiantes Verificados',
      valor: kpis.estudiantesVerificados.total,
      tendencia: kpis.estudiantesVerificados.tendencia,
      icon: GraduationCap,
      color: '#008fd4',
    },
    {
      titulo: 'Empresarios Registrados',
      valor: kpis.empresariosRegistrados.total,
      tendencia: kpis.empresariosRegistrados.tendencia,
      icon: Building2,
      color: '#662d91',
    },
    {
      titulo: 'Proyectos Publicados',
      valor: kpis.proyectosPublicados.total,
      tendencia: kpis.proyectosPublicados.tendencia,
      icon: FolderCode,
      color: '#ec008c',
    },
    {
      titulo: 'Validaciones Pendientes',
      valor: kpis.validacionesPendientes.total,
      tendencia: kpis.validacionesPendientes.tendencia,
      icon: ShieldCheck,
      color: '#20bec6',
    },
  ];

  return (
    <AdminPageShell>
      <header className="flex flex-col gap-1">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-fwd-turquoise">
          <span className="text-fwd-blue">▶▶</span> FWD · Costa Rica
        </p>
        <AnimatedProjectsTitle
          text="Dashboard de Staff"
          className="!text-3xl sm:!text-4xl"
        />
        <p className="mt-1 text-sm text-white/50">
          Resumen operativo del sistema y moderación en tiempo real.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.titulo}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:border-white/20"
          >
            <span
              className="absolute inset-y-0 left-0 w-1.5"
              style={{ backgroundColor: c.color }}
              aria-hidden
            />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-white/50">{c.titulo}</p>
                <p className="mt-1 text-3xl font-black tabular-nums text-white">
                  {c.valor}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div
                  className="rounded-lg p-2 text-white/80"
                  style={{ backgroundColor: `${c.color}15` }}
                >
                  <c.icon className="h-5 w-5" style={{ color: c.color }} />
                </div>
                <TendenciaBadge valor={c.tendencia} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico de Crecimiento */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-white">
              Crecimiento de la Plataforma
            </h2>
            <p className="text-xs text-white/50">
              Registros y proyectos creados en los últimos 6 meses.
            </p>
          </div>
          <div className="pt-2">
            <DashboardChart data={graficoData} />
          </div>
        </div>

        {/* Alertas Críticas */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-white">
              Alertas Críticas
            </h2>
            <p className="text-xs text-white/50">
              Eventos que requieren moderación o revisión inmediata.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-1">
            {alertas.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <ShieldCheck className="h-10 w-10 text-emerald-500 opacity-60" />
                <p className="mt-2 text-sm text-white/60">Todo en orden</p>
                <p className="text-xs text-white/40">No hay alertas pendientes de resolver.</p>
              </div>
            ) : (
              alertas.map((a) => {
                const esAlta = a.prioridad === 'alta';
                const Icon = a.tipo === 'demora' ? Clock : (esAlta ? AlertOctagon : AlertTriangle);
                const colorClase = a.tipo === 'demora' ? 'text-amber-400 bg-amber-400/10' : (esAlta ? 'text-rose-400 bg-rose-400/10' : 'text-yellow-400 bg-yellow-400/10');
                const enlace = a.tipo === 'demora' ? '/admin/validaciones' : '/admin/reportes';

                return (
                  <div
                    key={a.id}
                    className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 rounded-lg p-1.5 ${colorClase}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/90 truncate">
                          {a.titulo}
                        </p>
                        <p className="mt-0.5 text-xs text-white/50 line-clamp-2 leading-relaxed">
                          {a.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5 text-[10px] text-white/40">
                      <span>
                        {new Date(a.creado).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <Link
                        href={enlace}
                        className="inline-flex items-center gap-1 font-semibold text-fwd-turquoise hover:text-white transition-colors"
                      >
                        Atender <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
