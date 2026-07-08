import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import { listarVacantesDeEmpresarioService } from '@/server/services/vacante.service';
import VacantesLista from '@/components/features/empresario/VacantesLista';
import { IconPlus } from '@/components/ui/fwd-icons';

const FILTROS: Array<[string, string]> = [
  ['', 'Todas'],
  ['borrador', 'Borradores'],
  ['abierta', 'Abiertas'],
  ['en_contratacion', 'En contratación'],
  ['cerrada', 'Cerradas'],
  ['finalizada', 'Finalizadas'],
];

export default async function VacantesEmpresarioPage({
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

  const vacantes = await listarVacantesDeEmpresarioService(user.id);
  const activo = filtro ?? '';
  const lista = vacantes.filter((v) => !filtro || v.estado === filtro);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Vacantes</div>
          <div className="tb-sub">
            {vacantes.length} {vacantes.length === 1 ? 'vacante publicada o en borrador' : 'vacantes en total'}
          </div>
        </div>
        <div className="tb-spacer" />
        <Link href="/empresario/vacantes/crear" className="btn btn-primary">
          <IconPlus size={17} />
          Nueva vacante
        </Link>
      </div>

      <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Filtros por estado */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {FILTROS.map(([k, label]) => (
            <Link
              key={k}
              href={k ? `/empresario/vacantes?estado=${k}` : '/empresario/vacantes'}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12.5,
                fontWeight: activo === k ? 700 : 500,
                background: activo === k ? 'var(--ink-900)' : 'transparent',
                color: activo === k ? '#fff' : 'var(--ink-600)',
                border: activo === k ? '1.5px solid var(--ink-900)' : '1.5px solid var(--line)',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="card">
          <VacantesLista vacantes={lista} />
        </div>
      </div>
    </>
  );
}
