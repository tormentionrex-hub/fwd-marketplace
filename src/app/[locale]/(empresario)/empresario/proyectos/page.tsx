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
  searchParams: Promise<{ estado?: string }>;
}) {
  const { locale } = await params;
  const { estado: filtro } = await searchParams;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const { proyectos } = await dashboardEmpresario(user.id);
  const lista = filtro ? proyectos.filter((p) => p.estado === filtro) : proyectos;
  const activo = filtro ?? '';

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Mis proyectos</div>
          <div className="tb-sub">
            {proyectos.length} {proyectos.length === 1 ? 'proyecto publicado' : 'proyectos publicados'}
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
                href={k ? `/empresario/proyectos?estado=${k}` : '/empresario/proyectos'}
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

        <div className="card">
          {lista.length === 0 ? (
            <div className="muted" style={{ padding: 48, textAlign: 'center' }}>
              No hay proyectos en este estado.
            </div>
          ) : (
            lista.map((p) => <ProyectoRow key={p.id} p={p} />)
          )}
        </div>
      </div>
    </>
  );
}
