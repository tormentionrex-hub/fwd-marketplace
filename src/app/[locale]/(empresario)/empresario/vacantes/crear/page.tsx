import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import { listarTecnologiasService } from '@/server/services/proyecto.service';
import FormularioVacante from '@/components/features/empresario/FormularioVacante';

export default async function CrearVacantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const tecnologias = await listarTecnologiasService();

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Nueva vacante</div>
          <div className="tb-sub">Completá los datos del puesto y publicá o guardá como borrador</div>
        </div>
      </div>

      <div className="page fade-in">
        <div className="card card-pad" style={{ maxWidth: 860, margin: '0 auto' }}>
          <FormularioVacante tecnologiasDisponibles={tecnologias} modo="crear" />
        </div>
      </div>
    </>
  );
}
