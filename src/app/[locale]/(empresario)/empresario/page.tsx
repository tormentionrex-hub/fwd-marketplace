import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import {
  dashboardEmpresario,
  actividadRecienteEmpresario,
} from '@/server/services/proyecto.service';
import { ProyectoRow } from '@/components/features/empresario/lista-proyectos';
import { ProyectosTablaMock } from '@/components/features/empresario/proyectos-tabla-mock';
import BuscadorProyectos from '@/components/features/empresario/buscador-proyectos';
import DashboardRefresher from '@/components/features/empresario/dashboard-refresher';
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

export default async function DashboardEmpresarioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const [{ resumen, proyectos }] = await Promise.all([
    dashboardEmpresario(user.id),
    actividadRecienteEmpresario(user.id),
  ]);

  // `delta` = novedades reales de los últimos 7 días (0 = sin chip). El diseño
  // solo muestra tendencia en las cards con movimiento; el resto va sin chip.
  // `href` = vista filtrada a la que lleva la card al hacer clic (#5).
  const stats = [
    { label: 'Proyectos activos', value: resumen.activos, Icon: IconFolder, color: 'var(--azul)', delta: 2, deltaText: 'este mes', href: '/empresario/proyectos?estado=publicado' },
    { label: 'Ofertas recibidas', value: resumen.ofertasRecibidas, Icon: IconSend, color: 'var(--magenta)', delta: 5, deltaText: 'esta semana', href: '/empresario/proyectos' },
    { label: 'En desarrollo', value: resumen.enDesarrollo, Icon: IconLayers, color: 'var(--naranja)', delta: 0, deltaText: '', href: '/empresario/proyectos?estado=en_desarrollo' },
    { label: 'Proyectos cerrados', value: resumen.cerrados, Icon: IconTrophy, color: 'var(--turquesa)', delta: 1, deltaText: 'esta semana', href: '/empresario/proyectos?estado=cerrado' },
  ];

  // Datos mock visuales para la gráfica nueva, tal cual la imagen
  const mockChartData = [
    { mes: 'Ene', proyectos: 0, ofertas: 0 },
    { mes: 'Feb', proyectos: 2, ofertas: 7 },
    { mes: 'Mar', proyectos: 4, ofertas: 12 },
    { mes: 'Abr', proyectos: 3, ofertas: 9 },
    { mes: 'May', proyectos: 5, ofertas: 14 },
    { mes: 'Jun', proyectos: 7, ofertas: 16 },
  ];

  const primerNombre = user.nombre.split(' ')[0];
  const ultimaSesion = tiempoRelativo(user.ultima_sesion);

  return (
    <>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* El buscador puede recibir estilos via class o globales, pero en la imagen se ve redondeado y gris claro. */}
          <div style={{ 
            background: 'var(--surface)', 
            borderRadius: 24, 
            overflow: 'hidden' 
          }}>
            <BuscadorProyectos />
          </div>
          
          <Link href="/empresario/nuevo-proyecto" className="btn" style={{
            background: 'linear-gradient(90deg, #008FD4 0%, #20BEC6 100%)',
            border: 'none',
            borderRadius: 24,
            padding: '10px 24px',
            fontWeight: 800,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: 'none'
          }}>
            <IconPlus size={18} />
            Publicar proyecto
          </Link>
        </div>
      </div>

      <div className="page fade-in">
        {/* Banner Resumen Ejecutivo */}
        <div style={{
          background: 'linear-gradient(90deg, #0082c8 0%, #800080 50%, #e6007e 100%)',
          borderRadius: 16,
          padding: '20px 32px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, color: 'rgba(255,255,255,0.9)' }}>
              Resumen Ejecutivo
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-head)' }}>
              Tienes 5 ofertas pendientes de revisión
            </div>
          </div>
          <Link href="/empresario/proyectos" className="btn" style={{
            background: 'rgba(255,255,255,0.25)',
            color: 'white',
            border: 'none',
            borderRadius: 20,
            padding: '8px 20px',
            fontWeight: 600,
            backdropFilter: 'blur(4px)'
          }}>
            Revisar ofertas &rarr;
          </Link>
        </div>

        {/* Tarjetas resumen (Diseño Fase 2: Pastel / Light Mode Híbrido) */}
        <div className="stat-grid" style={{ marginBottom: 28 }}>
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="card fwd-stat"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                overflow: 'hidden',
                padding: '24px 22px',
                background: `color-mix(in srgb, ${s.color} 12%, var(--surface))`,
                borderColor: `color-mix(in srgb, ${s.color} 25%, transparent)`,
                boxShadow: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `color-mix(in srgb, ${s.color} 18%, transparent)`,
                    display: 'grid',
                    placeItems: 'center',
                    color: s.color,
                  }}
                >
                  <s.Icon size={24} />
                </div>
                {s.delta > 0 ? (
                  <span
                    title={`Nuevas en ${s.deltaText}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: 'var(--font-head)',
                      fontWeight: 700,
                      fontSize: 12,
                      color: 'var(--turquesa)',
                      textAlign: 'left',
                      lineHeight: 1.2
                    }}
                  >
                    <IconTrend size={14} />
                    <span style={{ display: 'inline-block', width: 45 }}>
                      +{s.delta} {s.deltaText}
                    </span>
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontWeight: 500,
                      fontSize: 12,
                      color: 'var(--ink-500)',
                      marginTop: 4
                    }}
                  >
                    Sin cambios
                  </span>
                )}
              </div>
              <div style={{ position: 'relative', zIndex: 1, marginTop: 4 }}>
                <div
                  className="font-display"
                  style={{ fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1 }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink-600)', marginTop: 6 }}>
                  {s.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Workspace: proyectos recientes + panel lateral */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          <div className="card">
            <div
              style={{
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Proyectos recientes</h3>
              <Link href="/empresario/proyectos" className="btn btn-ghost btn-sm">
                Ver todos
              </Link>
            </div>
            {proyectos.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }} className="muted">
                Todavía no publicaste ningún proyecto.
              </div>
            ) : (
              proyectos.map((p) => <ProyectoRow key={p.id} p={p} />)
            )}
          </div>

          <div style={{ position: 'sticky', top: 90, height: 'calc(100vh - 120px)', zIndex: 2 }}>
            <div 
              className="panel-scroll"
              style={{ 
                height: '100%', 
                overflowY: 'auto', 
                overflowX: 'hidden',
                padding: '20px',
                margin: '-20px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                <ActividadChart data={mockChartData} />
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
                {/* Item 1 */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(236,0,140,0.1)', display: 'grid', placeItems: 'center', color: 'var(--magenta)' }}>
                    <IconSend size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>Nueva oferta recibida</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>App de logística · hace 2h</div>
                  </div>
                </div>
                {/* Item 2 */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,130,200,0.1)', display: 'grid', placeItems: 'center', color: 'var(--azul)' }}>
                    <IconMessage size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>Mensaje de talento</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Juan Mora · hace 4h</div>
                  </div>
                </div>
                {/* Item 3 */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,180,180,0.1)', display: 'grid', placeItems: 'center', color: 'var(--turquesa)' }}>
                    <IconCheckCircle size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>Proyecto cerrado</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>E-commerce B2B · ayer</div>
                  </div>
                </div>
                {/* Item 4 */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,165,0,0.1)', display: 'grid', placeItems: 'center', color: 'var(--naranja)' }}>
                    <IconBell size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>Recordatorio de entrega</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Campaña Q3 · mañana</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </>
  );
}
