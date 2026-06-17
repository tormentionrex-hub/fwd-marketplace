import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import { obtenerPerfilEmpresarioDTO } from '@/server/services/perfil-empresario.service';
import { ESTADO_BADGE } from '@/components/features/empresario/lista-proyectos';
import EditarPerfilEmpresario from '@/components/features/empresario/editar-perfil-empresario';
import {
  IconBriefcase,
  IconLayers,
  IconMail,
  IconCalendar,
  IconFolder,
  IconTrophy,
  IconCheckCircle,
  IconUsers,
  IconStar,
} from '@/components/ui/fwd-icons';

// Color de marca FWD por área de negocio (RF-20). Las áreas libres caen a azul.
const AREA_COLOR: Record<string, string> = {
  Logística: 'var(--azul)',
  Operaciones: 'var(--morado)',
  'Servicio al cliente': 'var(--turquesa)',
  'Análisis de datos': 'var(--naranja)',
  Ventas: 'var(--magenta)',
  Mercadeo: 'var(--magenta)',
  TI: 'var(--azul)',
  Finanzas: 'var(--morado)',
  'Recursos Humanos': 'var(--turquesa)',
};
function areaColor(area: string): string {
  return AREA_COLOR[area] ?? 'var(--azul)';
}

function inicialesDe(nombre: string): string {
  return (
    nombre
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'E'
  );
}

export default async function PerfilEmpresarioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const perfil = await obtenerPerfilEmpresarioDTO(user.id);
  if (!perfil) redirect(`/${locale}/empresario`);

  const datos = [
    { Icon: IconBriefcase, valor: perfil.tipo, label: 'Tipo de cuenta' },
    { Icon: IconLayers, valor: perfil.sector ?? 'No especificado', label: 'Sector' },
    { Icon: IconMail, valor: perfil.correo || 'No especificado', label: 'Correo' },
    { Icon: IconCalendar, valor: perfil.miembroDesde, label: 'Miembro desde' },
  ];

  const resumen = [
    { Icon: IconFolder, n: perfil.stats.publicados, l: 'Proyectos publicados', c: 'var(--azul)' },
    { Icon: IconLayers, n: perfil.stats.enCurso, l: 'En curso', c: 'var(--naranja)' },
    { Icon: IconTrophy, n: perfil.stats.completados, l: 'Completados', c: 'var(--turquesa)' },
  ];

  const strip: { valor: string | number; label: string; star: boolean }[] = [
    {
      valor: perfil.ratingCliente != null ? perfil.ratingCliente.toFixed(1) : 'Nuevo',
      label: 'como cliente',
      star: perfil.ratingCliente != null,
    },
    { valor: perfil.stats.publicados, label: 'proyectos', star: false },
    { valor: perfil.stats.completados, label: 'completados', star: false },
  ];

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="tb-title">Perfil de la empresa</div>
          <div className="tb-sub">Así te ven los estudiantes en la plataforma</div>
        </div>
        <div className="tb-spacer" />
        <EditarPerfilEmpresario
          nombreInicial={perfil.responsable}
          nombreEmpresaInicial={perfil.nombreEmpresaRaw}
          fotoUrlInicial={perfil.fotoUrl}
          inicialesFallback={inicialesDe(perfil.empresa)}
          descripcionInicial={perfil.descripcion}
          sectorInicial={perfil.sector}
        />
      </div>

      <div className="page fade-in">
        <div className="grid-2col-responsive" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Columna izquierda — identidad */}
          <div className="sticky-col-responsive" style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 20 }}>
            <div className="card card-pad" style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 92, height: 92, margin: '0 auto 14px' }}>
                {perfil.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={perfil.fotoUrl}
                    alt={perfil.empresa}
                    style={{ width: 92, height: 92, borderRadius: 22, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="avatar"
                    style={{ width: 92, height: 92, background: 'var(--azul)', fontSize: 34, borderRadius: 22 }}
                  >
                    {inicialesDe(perfil.empresa)}
                  </div>
                )}
                {perfil.verificado && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--azul)',
                      border: '3px solid var(--surface)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                    }}
                  >
                    <IconCheckCircle size={14} />
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{perfil.empresa}</h2>
              {perfil.sector && (
                <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
                  {perfil.sector}
                </div>
              )}
              {perfil.verificado && (
                <div style={{ marginTop: 12 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: 'var(--font-head)',
                      fontWeight: 700,
                      fontSize: 11,
                      padding: '3px 9px 3px 7px',
                      borderRadius: 'var(--r-pill)',
                      background: 'linear-gradient(120deg, var(--azul-tint), #DEF5F6)',
                      color: 'var(--azul-700)',
                    }}
                  >
                    <IconCheckCircle size={13} />
                    Empresa verificada FWD
                  </span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  marginTop: 18,
                  paddingTop: 18,
                  borderTop: '1px solid var(--line-2)',
                }}
              >
                {strip.map((s, i) => (
                  <div key={s.label} style={{ flex: 1, borderLeft: i ? '1px solid var(--line-2)' : 'none' }}>
                    <div
                      className="font-display"
                      style={{
                        fontWeight: 800,
                        fontSize: 18,
                        color: 'var(--ink-900)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      {s.valor}
                      {s.star && <IconStar size={15} color="var(--amarillo)" />}
                    </div>
                    <div className="muted" style={{ fontSize: 11.5 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-pad">
              <h4 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>Datos de la empresa</h4>
              {datos.map((d) => (
                <div
                  key={d.label}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', color: 'var(--ink-400)' }}
                >
                  <d.Icon size={16} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--ink-800)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d.valor}
                    </div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {d.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha — contenido */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div className="card card-pad">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Sobre la empresa</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-700)' }}>
                {perfil.descripcion?.trim() || 'Esta empresa todavía no agregó una descripción.'}
              </p>
            </div>

            {/* Resumen de actividad */}
            <div className="grid-3col-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {resumen.map((r) => (
                <div key={r.l} className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: `color-mix(in srgb, ${r.c} 12%, transparent)`,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      color: r.c,
                    }}
                  >
                    <r.Icon size={21} />
                  </div>
                  <div>
                    <div
                      className="font-display"
                      style={{ fontWeight: 800, fontSize: 22, color: 'var(--ink-900)', lineHeight: 1 }}
                    >
                      {r.n}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                      {r.l}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Proyectos publicados */}
            <div className="card card-pad">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Proyectos publicados</h3>
                <Link href="/empresario/proyectos" className="btn btn-ghost btn-sm">
                  Ver todos
                </Link>
              </div>
              {perfil.proyectos.length === 0 ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Todavía no publicaste ningún proyecto.
                </p>
              ) : (
                perfil.proyectos.slice(0, 4).map((p, i) => {
                  const badge = ESTADO_BADGE[p.estado] ?? { cls: 'borrador', label: p.estado };
                  const col = areaColor(p.area);
                  return (
                    <Link
                      key={p.id}
                      href={`/empresario/gestion-proyectos/${p.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '13px 0',
                        borderTop: i ? '1px solid var(--line-2)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `color-mix(in srgb, ${col} 12%, transparent)`,
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          color: col,
                        }}
                      >
                        <IconFolder size={17} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="font-display"
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'var(--ink-900)',
                          }}
                        >
                          {p.titulo}
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {p.area}
                        </div>
                      </div>
                      <span className={`badge ${badge.cls}`}>
                        <span className="bdot" />
                        {badge.label}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Reseñas de estudiantes (RF-37) */}
            <div className="card card-pad">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Reseñas de estudiantes</h3>
              <p className="muted" style={{ fontSize: 12.5, marginBottom: perfil.resenas.length ? 16 : 0 }}>
                Lo que opinan los estudiantes que trabajaron con esta empresa.
              </p>
              {perfil.resenas.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '18px 16px',
                    background: 'var(--bg)',
                    borderRadius: 'var(--r)',
                    color: 'var(--ink-400)',
                  }}
                >
                  <IconUsers size={20} />
                  <span className="muted" style={{ fontSize: 13 }}>
                    Todavía no hay reseñas. Aparecerán cuando cierres proyectos con estudiantes.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {perfil.resenas.map((r, i) => (
                    <div
                      key={i}
                      style={{ display: 'flex', gap: 13, padding: '14px 16px', background: 'var(--bg)', borderRadius: 'var(--r)' }}
                    >
                      <div className="avatar" style={{ width: 42, height: 42, background: 'var(--morado)', fontSize: 15 }}>
                        {inicialesDe(r.de)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                          }}
                        >
                          <span className="font-display" style={{ fontWeight: 700, fontSize: 14 }}>
                            {r.de}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              color: 'var(--amarillo)',
                              fontFamily: 'var(--font-head)',
                              fontWeight: 700,
                              fontSize: 12.5,
                            }}
                          >
                            <IconStar size={14} />
                            <span style={{ color: 'var(--ink-700)' }}>{r.rating.toFixed(1)}</span>
                          </span>
                        </div>
                        <div className="muted" style={{ fontSize: 11.5, marginBottom: 7 }}>
                          Proyecto: {r.proyecto}
                        </div>
                        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-700)' }}>{r.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
