import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import { dashboardEmpresario } from '@/server/services/proyecto.service';
import ProyectosLista from '@/components/features/empresario/ProyectosLista';
import { IconPlus, IconSearch } from '@/components/ui/fwd-icons';

const FILTROS: Array<[string, string]> = [
  ['', 'Todos'],
  ['borrador', 'Borradores'],
  ['publicado', 'Publicados'],
  ['en_desarrollo', 'En desarrollo'],
  ['cerrado', 'Cerrados'],
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
              : `${proyectos.length} ${proyectos.length === 1 ? 'proyecto' : 'proyectos'} en total`}
          </div>
        </div>
        <div className="tb-spacer" />
        <Link href="/empresario/nuevo-proyecto" className="btn btn-primary">
          <IconPlus size={17} />
          Nuevo proyecto
        </Link>
      </div>

      <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Busqueda y filtros */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {/* Buscador URL-based */}
          <form method="GET" action="/empresario/proyectos" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 220px' }}>
            {filtro && <input type="hidden" name="estado" value={filtro} />}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg)',
                border: '1.5px solid var(--line)',
                borderRadius: 10,
                padding: '8px 14px',
                flex: 1,
              }}
            >
              <IconSearch size={15} color="var(--ink-400)" />
              <input
                name="q"
                type="text"
                defaultValue={consulta}
                placeholder="Buscar proyecto..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 13.5,
                  color: 'var(--ink-900)',
                  width: '100%',
                }}
              />
            </div>
          </form>

          {/* Chips de filtro por estado */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTROS.map(([k, label]) => (
              <Link
                key={k}
                href={hrefFiltro(k)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: activo === k ? 700 : 500,
                  background: activo === k ? 'var(--ink-900)' : 'transparent',
                  color: activo === k ? '#fff' : 'var(--ink-600)',
                  border: activo === k ? '1.5px solid var(--ink-900)' : '1.5px solid var(--line)',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Lista de proyectos */}
        <div className="card">
          <ProyectosLista proyectos={lista} />
        </div>
      </div>
    </>
  );
}
