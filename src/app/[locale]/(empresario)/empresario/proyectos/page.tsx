import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import { dashboardEmpresario } from '@/server/services/proyecto.service';
import { ProyectoRow } from '@/components/features/empresario/lista-proyectos';
import { IconPlus } from '@/components/ui/fwd-icons';

const FILTROS: Array<[string, string]> = [
  ['', 'Todos'],
  ['publicado', 'Publicados'],
  ['en_desarrollo', 'En desarrollo'],
  ['cerrado', 'Cerrados'],
  ['borrador', 'Borradores'],
];

export default async function MisProyectosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const { locale } = await params;
  const { estado: filtro, q } = await searchParams;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const { proyectos } = await dashboardEmpresario(user.id);
  const consulta = (q ?? '').trim();
  const consultaLower = consulta.toLowerCase();
  const lista = proyectos.filter(
    (p) =>
      (!filtro || p.estado === filtro) &&
      (!consultaLower || p.titulo.toLowerCase().includes(consultaLower)),
  );
  const activo = filtro ?? '';

  // Conserva la búsqueda (?q) al cambiar de chip de estado.
  const hrefFiltro = (k: string) => {
    const sp = new URLSearchParams();
    if (k) sp.set('estado', k);
    if (consulta) sp.set('q', consulta);
    const qs = sp.toString();
    return qs ? `/empresario/proyectos?${qs}` : '/empresario/proyectos';
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Mis proyectos</div>
          <div className="tb-sub">
            {consulta
              ? `${lista.length} ${lista.length === 1 ? 'resultado' : 'resultados'} para "${consulta}"`
              : `${proyectos.length} ${proyectos.length === 1 ? 'proyecto publicado' : 'proyectos publicados'}`}
          </div>
        </div>
        <div className="tb-spacer" />
        <Link href="/empresario/nuevo-proyecto" className="btn btn-primary">
          <IconPlus size={17} />
          Nuevo proyecto
        </Link>
      </div>

      <div className="page fade-in">
        {/* Filtros por estado */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {FILTROS.map(([k, label]) => {
            const on = activo === k;
            return (
              <Link
                key={k || 'todos'}
                href={hrefFiltro(k)}
                className="btn btn-sm"
                style={
                  on
                    ? { background: 'var(--ink-900)', color: '#fff' }
                    : { background: 'var(--surface)', color: 'var(--ink-600)', border: '1px solid var(--line)' }
                }
              >
                {label}
              </Link>
            );
          })}
        </div>

        {consulta && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
              fontSize: 13,
              color: 'var(--ink-600)',
            }}
          >
            <span>
              Resultados para <strong style={{ color: 'var(--ink-900)' }}>&ldquo;{consulta}&rdquo;</strong>
            </span>
            <Link
              href={filtro ? `/empresario/proyectos?estado=${filtro}` : '/empresario/proyectos'}
              style={{ color: 'var(--azul-700)', fontWeight: 600 }}
            >
              Limpiar búsqueda
            </Link>
          </div>
        )}

        <div className="card">
          {lista.length === 0 ? (
            <div className="muted" style={{ padding: 48, textAlign: 'center' }}>
              {consulta
                ? 'No encontramos proyectos que coincidan con tu búsqueda.'
                : 'No hay proyectos en este estado.'}
            </div>
          ) : (
            lista.map((p) => <ProyectoRow key={p.id} p={p} />)
          )}
        </div>
      </div>
    </>
  );
}
