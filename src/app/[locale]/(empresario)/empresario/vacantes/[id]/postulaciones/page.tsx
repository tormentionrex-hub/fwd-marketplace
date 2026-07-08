import { redirect, notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import {
  obtenerVacanteDeEmpresario,
} from '@/server/services/vacante.service';
import { listarPostulantesDeVacante } from '@/server/services/postulacion.service';
import GestionPostulaciones from '@/components/features/empresario/GestionPostulaciones';
import { IconArrowR } from '@/components/ui/fwd-icons';

export default async function PostulacionesVacantePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const vacante = await obtenerVacanteDeEmpresario(id, user.id);
  if (!vacante) notFound();

  const resultado = await listarPostulantesDeVacante(id, user.id);
  const postulantes = Array.isArray(resultado) ? resultado : [];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Postulantes</div>
          <div className="tb-sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/empresario/vacantes" style={{ color: 'var(--ink-400)', textDecoration: 'none' }}>Vacantes</Link>
            <IconArrowR size={13} />
            <span>{vacante.titulo}</span>
          </div>
        </div>
      </div>

      <div className="page fade-in">
        <div className="card card-pad">
          <GestionPostulaciones postulantes={postulantes} locale={locale} />
        </div>
      </div>
    </>
  );
}
