import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import { listarTecnologiasService } from '@/server/services/proyecto.service';
import FormularioProyecto from '@/components/features/empresario/FormularioProyecto';
import FordyPanel from '@/components/features/empresario/FordyPanel';

export default async function CrearProyectoPage({
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
          <div className="tb-title">Crear proyecto</div>
          <div className="tb-sub">Completa los datos y publica o guarda como borrador</div>
        </div>
      </div>

      <div className="page fade-in">
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Columna principal: formulario */}
          <div className="card card-pad" style={{ flex: '1 1 0', minWidth: 0 }}>
            <FormularioProyecto tecnologiasDisponibles={tecnologias} modo="crear" />
          </div>

          {/* Columna lateral: Fordy */}
          <FordyPanel />
        </div>
      </div>
    </>
  );
}
