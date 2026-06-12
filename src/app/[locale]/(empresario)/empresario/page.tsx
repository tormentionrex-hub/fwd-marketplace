import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import {
  dashboardEmpresario,
  actividadRecienteEmpresario,
  type ActividadItem,
  type ActividadTipo,
} from '@/server/services/proyecto.service';
import { ProyectoRow } from '@/components/features/empresario/lista-proyectos';
import BuscadorProyectos from '@/components/features/empresario/buscador-proyectos';
import { tiempoRelativo } from '@/lib/tiempo';
import {
  IconFolder,
  IconSend,
  IconLayers,
  IconTrophy,
  IconPlus,
  IconSpark,
  IconArrowR,
  IconUpload,
  IconCheckCircle,
  IconTrend,
} from '@/components/ui/fwd-icons';

// Estilo (icono + color de marca) por tipo de evento del feed de actividad.
const ACTIVIDAD_ESTILO: Record<
  ActividadTipo,
  { Icon: typeof IconSend; color: string }
> = {
  oferta: { Icon: IconSend, color: 'var(--magenta)' },
  entrega: { Icon: IconUpload, color: 'var(--naranja)' },
  cierre: { Icon: IconCheckCircle, color: 'var(--turquesa)' },
};

export default async function DashboardEmpresarioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const [{ resumen, proyectos }, actividad] = await Promise.all([
    dashboardEmpresario(user.id),
    actividadRecienteEmpresario(user.id),
  ]);

  // `delta` = novedades reales de los últimos 7 días (0 = sin chip). El diseño
  // solo muestra tendencia en las cards con movimiento; el resto va sin chip.
  const stats = [
    { label: 'Proyectos activos', value: resumen.activos, Icon: IconFolder, color: 'var(--azul)', delta: resumen.nuevosActivosSemana },
    { label: 'Ofertas recibidas', value: resumen.ofertasRecibidas, Icon: IconSend, color: 'var(--magenta)', delta: resumen.nuevasOfertasSemana },
    { label: 'En desarrollo', value: resumen.enDesarrollo, Icon: IconLayers, color: 'var(--naranja)', delta: 0 },
    { label: 'Proyectos cerrados', value: resumen.cerrados, Icon: IconTrophy, color: 'var(--turquesa)', delta: 0 },
  ];

  const primerNombre = user.nombre.split(' ')[0];
  const ultimaSesion = tiempoRelativo(user.ultima_sesion);

  return (
    <>
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
        <BuscadorProyectos />
        <Link href="/empresario/nuevo-proyecto" className="btn btn-primary">
          <IconPlus size={17} />
          Publicar nuevo proyecto
        </Link>
      </div>

      <div className="page fade-in">
        {/* Tarjetas resumen (datos reales de resumenEmpresario) */}
        <div className="stat-grid" style={{ marginBottom: 28 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="card card-pad"
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                    display: 'grid',
                    placeItems: 'center',
                    color: s.color,
                  }}
                >
                  <s.Icon size={21} />
                </div>
                {s.delta > 0 && (
                  <span
                    title="Nuevas en los últimos 7 días"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: 'var(--font-head)',
                      fontWeight: 600,
                      fontSize: 12.5,
                      padding: '4px 10px',
                      borderRadius: 'var(--r-pill)',
                      background: 'var(--azul-tint)',
                      color: 'var(--azul-700)',
                    }}
                  >
                    <IconTrend size={13} />+{s.delta}
                  </span>
                )}
              </div>
              <div>
                <div
                  className="font-display"
                  style={{ fontSize: 30, fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1 }}
                >
                  {s.value}
                </div>
                <div className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
                  {s.label}
                </div>
              </div>
            </div>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Crear con IA (lleva a la ruta de IA — Página 13, de otra persona) */}
            <div
              className="card card-pad"
              style={{
                background: 'linear-gradient(150deg, var(--morado), #4d2270)',
                border: 'none',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,.16)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--amarillo)',
                  }}
                >
                  <IconSpark size={18} />
                </div>
                <span className="font-display" style={{ fontWeight: 700, fontSize: 15 }}>
                  Crear con IA
                </span>
              </div>
              <p style={{ fontSize: 13.2, lineHeight: 1.55, color: 'rgba(255,255,255,.82)', marginBottom: 16 }}>
                Describe tu idea en lenguaje natural y el asistente la convierte en un proyecto
                estructurado, listo para publicar.
              </p>
              <Link href="/empresario/nuevo-proyecto" className="btn btn-block" style={{ background: '#fff', color: 'var(--morado)' }}>
                Empezar <IconArrowR size={16} />
              </Link>
            </div>

            {/* Actividad reciente (datos reales: ofertas, entregas y cierres) */}
            <div className="card card-pad">
              <h4 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 14 }}>Actividad reciente</h4>
              {actividad.length === 0 ? (
                <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  Acá vas a ver las últimas ofertas y entregas de tus proyectos.
                </p>
              ) : (
                actividad.map((a: ActividadItem, i) => {
                  const { Icon, color } = ACTIVIDAD_ESTILO[a.tipo];
                  return (
                    <Link
                      key={a.id}
                      href={`/empresario/gestion-proyectos/${a.idProyecto}`}
                      className="fwd-act"
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '9px 0',
                        borderTop: i ? '1px solid var(--line-2)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: `color-mix(in srgb, ${color} 12%, transparent)`,
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          color,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          className="font-display fwd-act-t"
                          style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-800)' }}
                        >
                          {a.titulo}
                        </div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 1 }}>
                          {a.proyecto} · {a.cuando}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
