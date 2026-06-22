import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import {
  dashboardEmpresario,
  actividadRecienteEmpresario,
} from '@/server/services/proyecto.service';

import BuscadorProyectos from '@/components/features/empresario/buscador-proyectos';
import DashboardRefresher from '@/components/features/empresario/dashboard-refresher';
import { ProgresoProyectos } from '@/components/features/empresario/progreso-proyectos';
import { tiempoRelativo } from '@/lib/tiempo';
import { ActividadChart } from '@/components/features/empresario/actividad-chart';
import Image from 'next/image';
import {
  IconFolder,
  IconSend,
  IconLayers,
  IconTrophy,
  IconPlus,
  IconArrowR,
  IconCheckCircle,
  IconTrend,
  IconMessage,
  IconBell,
} from '@/components/ui/fwd-icons';

import './emp-dash-responsive.css';

export default async function DashboardEmpresarioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const [{ resumen, proyectos, chartData }, actividadReciente] = await Promise.all([
    dashboardEmpresario(user.id),
    actividadRecienteEmpresario(user.id),
  ]);

  // `delta` = novedades reales de los últimos 7 días (0 = sin chip). El diseño
  // solo muestra tendencia en las cards con movimiento; el resto va sin chip.
  // `href` = vista filtrada a la que lleva la card al hacer clic (#5).
  const stats = [
    { label: 'Proyectos activos', subLabel: 'Publicados actualmente', value: resumen.activos, Icon: IconFolder, delta: resumen.nuevosActivosSemana, deltaText: 'esta semana', href: '/empresario/proyectos?estado=publicado', tone: 'activos' as const },
    { label: 'Ofertas recibidas', subLabel: 'En todos tus proyectos', value: resumen.ofertasRecibidas, Icon: IconSend, delta: resumen.nuevasOfertasSemana, deltaText: 'esta semana', href: '/empresario/proyectos', tone: 'ofertas' as const },
    { label: 'En desarrollo', subLabel: 'Trabajo en progreso', value: resumen.enDesarrollo, Icon: IconLayers, delta: 0, deltaText: '', href: '/empresario/proyectos?estado=en_desarrollo', tone: 'desarrollo' as const },
    { label: 'Proyectos cerrados', subLabel: 'Finalizados exitosamente', value: resumen.cerrados, Icon: IconTrophy, delta: 0, deltaText: '', href: '/empresario/proyectos?estado=cerrado', tone: 'cerrados' as const },
  ];

  const primerNombre = user.nombre.split(' ')[0];
  const ultimaSesion = tiempoRelativo(user.ultima_sesion);

  return (
    <div className="emp-dash">
      {/* Refresco automático del dashboard (foco de pestaña + cada 60s) */}
      <DashboardRefresher />

      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="tb-title">Hola, {primerNombre}</div>
          <div className="tb-sub">
            {user.nombre} · Panel del empresario
            {ultimaSesion ? ` · última sesión ${ultimaSesion}` : ''}
          </div>
        </div>
        <div className="tb-spacer" />
        <div className="emp-dash-topbar-actions">
          <div className="emp-dash-search-wrap">
            <BuscadorProyectos />
          </div>

          <Link href="/empresario/nuevo-proyecto" className="btn emp-dash-btn-publish">
            <IconPlus size={18} />
            Publicar proyecto
          </Link>
        </div>
      </div>

      <div className="page fade-in">


        {/* Workspace: proyectos recientes + panel lateral */}
        <div className="emp-dash-workspace">
          <div>
            <div className="card emp-dash-card">
              <div className="emp-dash-metrics-head">
                <h2 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink-900)' }}>Métricas destacadas</h2>
                <div style={{ background: 'var(--bg-2)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, color: 'var(--ink-600)' }}>
                  {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
                </div>
              </div>

              <div className="emp-dash-stats">
                {stats.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    className={`fwd-stat fwd-stat--${s.tone}`}
                  >
                    <div className="fwd-stat-top">
                      <div className="fwd-stat-icon">
                        <s.Icon size={20} />
                      </div>
                      {s.delta > 0 ? (
                        <span className="fwd-stat-delta">
                          <IconTrend size={14} />
                          +{s.delta} {s.deltaText}
                        </span>
                      ) : (
                        <span className="fwd-stat-muted">Sin cambios</span>
                      )}
                    </div>
                    <div className="fwd-stat-body">
                      <div className="fwd-stat-value font-display">{s.value}</div>
                      <div className="fwd-stat-label">{s.label}</div>
                      <div className="fwd-stat-sublabel">{s.subLabel}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <ProgresoProyectos proyectos={proyectos} />
          </div>

          <div className="emp-dash-sidebar">
            <div className="panel-scroll emp-dash-sidebar-scroll">
              <div className="emp-dash-sidebar-stack">
            {/* Banner Fordy Crear con IA */}
            <div className="card" style={{ overflow: 'hidden', padding: 0, position: 'relative', height: 180 }}>
              <Image
                src="/imagenes/fordy crear 2.png"
                alt="Crear con IA"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '55%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '20px 20px 20px 20px' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ec008c', letterSpacing: '0.04em', lineHeight: 1.1 }}>CREAR CON IA</div>
                <div style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>Describe tu idea y la convertimos en un proyecto estructurado.</div>
                <Link
                  href="/empresario/nuevo-proyecto"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ec008c', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 999, padding: '7px 16px', textDecoration: 'none', alignSelf: 'flex-start' }}
                >
                  Empezar
                  <IconArrowR size={14} />
                </Link>
              </div>
            </div>

            {/* Gráfica Actividad 2026 (Diseño estático / Maqueta visual) */}
            <div className="card card-pad" style={{ background: 'var(--surface)', color: 'var(--ink-800)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h4 className="font-display" style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink-900)', marginBottom: 2 }}>Actividad 2026</h4>
                  <div className="muted" style={{ fontSize: 12.5 }}>Proyectos y ofertas</div>
                </div>
                <div style={{ color: 'var(--azul)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
              </div>

              {/* Contenedor del gráfico */}
              <div style={{ height: 160, width: '100%' }}>
                <ActividadChart data={chartData} />
              </div>

              {/* Leyenda */}
              <div style={{ display: 'flex', gap: 16, marginTop: 20, fontSize: 12.5, fontWeight: 500, color: 'var(--ink-500)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--azul)' }} />
                  Proyectos
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--magenta)' }} />
                  Ofertas
                </span>
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="card card-pad" style={{ background: 'var(--surface)', color: 'var(--ink-800)' }}>
              <h4 className="font-display" style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink-900)', marginBottom: 20 }}>Actividad reciente</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {actividadReciente.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>No hay actividad reciente.</div>
                ) : (
                  actividadReciente.map((item) => {
                    let Icon = IconBell;
                    let bgColor = 'rgba(255,165,0,0.1)';
                    let fgColor = 'var(--naranja)';

                    if (item.tipo === 'oferta') {
                      Icon = IconSend;
                      bgColor = 'rgba(236,0,140,0.1)';
                      fgColor = 'var(--magenta)';
                    } else if (item.tipo === 'entrega') {
                      Icon = IconMessage;
                      bgColor = 'rgba(0,130,200,0.1)';
                      fgColor = 'var(--azul)';
                    } else if (item.tipo === 'cierre') {
                      Icon = IconCheckCircle;
                      bgColor = 'rgba(0,180,180,0.1)';
                      fgColor = 'var(--turquesa)';
                    }

                    return (
                      <Link href={`/empresario/gestion-proyectos/${item.idProyecto}`} key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center', textDecoration: 'none' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: bgColor, display: 'grid', placeItems: 'center', color: fgColor }}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>{item.titulo}</div>
                          <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>{item.proyecto} · {item.cuando}</div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
