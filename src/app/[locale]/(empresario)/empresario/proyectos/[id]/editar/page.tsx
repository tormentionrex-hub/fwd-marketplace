import { notFound, redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import {
  buscarProyectoGestion,
  obtenerProyectoConDetalle,
} from '@/server/repositories/proyecto.repository';
import { listarTecnologiasService } from '@/server/services/proyecto.service';
import FormularioProyecto from '@/components/features/empresario/FormularioProyecto';

export default async function EditarProyectoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const base = await buscarProyectoGestion(id);
  if (!base) notFound();
  if (base.id_empresario !== user.id) {
    return (
      <main className="page">
        <div className="card card-pad">No tenés acceso a este proyecto.</div>
      </main>
    );
  }

  const [proyecto, tecnologias] = await Promise.all([
    obtenerProyectoConDetalle(id),
    listarTecnologiasService(),
  ]);

  if (!proyecto) notFound();

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Editar proyecto</div>
          <div className="tb-sub">{proyecto.titulo}</div>
        </div>
      </div>

      <div className="page fade-in">
        <div className="card card-pad" style={{ maxWidth: 760 }}>
          <FormularioProyecto
            tecnologiasDisponibles={tecnologias}
            modo="editar"
            proyecto={{
              id: proyecto.id,
              titulo: proyecto.titulo,
              descripcion: proyecto.descripcion,
              areaNegocio: proyecto.area_negocio ?? null,
              plazoDias: proyecto.plazo_dias ?? null,
              tecnologias: proyecto.proyectos_tecnologias.map((pt) => pt.tecnologias.nombre),
            }}
          />
        </div>
      </div>
    </>
  );
}
