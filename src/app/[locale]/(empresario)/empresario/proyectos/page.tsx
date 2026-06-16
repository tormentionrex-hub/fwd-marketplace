import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import { dashboardEmpresario } from '@/server/services/proyecto.service';
import { ProyectoRow } from '@/components/features/empresario/lista-proyectos';
import { ProyectosTablaMock } from '@/components/features/empresario/proyectos-tabla-mock';
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
        <ProyectosTablaMock />
      </div>
    </>
  );
}
