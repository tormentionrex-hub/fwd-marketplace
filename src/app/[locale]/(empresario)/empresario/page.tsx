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
import {
  IconFolder,
  IconSend,
  IconLayers,
  IconTrophy,
  IconPlus,
  IconSpark,
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
        {/* Banner Resumen Ejecutivo */}
        <div className="emp-dash-banner">
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, color: 'rgba(255,255,255,0.9)' }}>
              Resumen Ejecutivo
            </div>
            <div className="emp-dash-banner-title">
              Tienes {resumen.ofertasRecibidas} {resumen.ofertasRecibidas === 1 ? 'oferta pendiente' : 'ofertas pendientes'} de revisión
            </div>
          </div>
          <Link href="/empresario/proyectos" className="btn emp-dash-btn-review">
            Revisar ofertas &rarr;
          </Link>
        </div>



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
            {/* Crear con IA (estilo Dark Neon AI basado en FWD Magenta) */}
            <div
              className="card card-pad"
              style={{
                background: 'linear-gradient(160deg, #0A0F1C 0%, #16102b 100%)',
                borderColor: 'rgba(236,0,140,0.3)',
                boxShadow: 'var(--sh-magenta)',
                color: '#fff',
              }}
            >
              <div className="bg-glow" style={{ background: 'var(--magenta)', width: 200, height: 200, bottom: -80, right: -80, opacity: 0.3 }} />
              <div className="bg-glow" style={{ background: 'var(--turquesa)', width: 150, height: 150, top: -50, left: -50, opacity: 0.15 }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(236,0,140,0.4)',
                    boxShadow: 'inset 0 0 15px rgba(236,0,140,0.2)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--magenta)',
                  }}
                  className="glow-magenta"
                >
                  <IconSpark size={22} />
                </div>
                <span className="font-display glow-magenta" style={{ fontWeight: 800, fontSize: 17 }}>
                  CREAR CON IA
                </span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-700)', marginBottom: 20, position: 'relative', zIndex: 1 }}>
                Describe tu idea en lenguaje natural y nuestro modelo la convierte en un proyecto
                estructurado al instante.
              </p>
              <Link
                href="/empresario/nuevo-proyecto"
                className="btn btn-block"
                style={{
                  background: 'var(--magenta)',
                  color: '#fff',
                  boxShadow: '0 0 15px rgba(236,0,140,0.6)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Empezar <IconArrowR size={16} />
              </Link>
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
