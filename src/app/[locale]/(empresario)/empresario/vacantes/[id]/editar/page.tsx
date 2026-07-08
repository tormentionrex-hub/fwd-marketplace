import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import { listarTecnologiasService } from '@/server/services/proyecto.service';
import { obtenerVacanteDeEmpresario } from '@/server/services/vacante.service';
import FormularioVacante from '@/components/features/empresario/FormularioVacante';

export default async function EditarVacantePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const [tecnologias, vacante] = await Promise.all([
    listarTecnologiasService(),
    obtenerVacanteDeEmpresario(id, user.id),
  ]);
  if (!vacante) notFound();

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Editar vacante</div>
          <div className="tb-sub">Actualizá los datos del puesto</div>
        </div>
      </div>

      <div className="page fade-in">
        <div className="card card-pad" style={{ maxWidth: 860, margin: '0 auto' }}>
          <FormularioVacante
            tecnologiasDisponibles={tecnologias}
            modo="editar"
            vacante={{
              id: vacante.id,
              titulo: vacante.titulo,
              descripcion: vacante.descripcion,
              area: vacante.area,
              modalidad: vacante.modalidad,
              tipoEmpleo: vacante.tipoEmpleo,
              nivelExperiencia: vacante.nivelExperiencia,
              ubicacion: vacante.ubicacion,
              salarioMin: vacante.salarioMin,
              salarioMax: vacante.salarioMax,
              salarioMoneda: vacante.salarioMoneda,
              salarioPeriodo: vacante.salarioPeriodo,
              salarioVisible: vacante.salarioVisible,
              responsabilidades: vacante.responsabilidades,
              requisitos: vacante.requisitos,
              beneficios: vacante.beneficios,
              plazas: vacante.plazas,
              fechaCierre: vacante.fechaCierre,
              tecnologias: vacante.tecnologias,
              imagenes: vacante.imagenes,
              documentos: vacante.documentos,
            }}
          />
        </div>
      </div>
    </>
  );
}
