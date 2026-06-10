import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import {
  buscarProyectoActivo,
  buscarEstudianteAdjudicado,
} from '@/server/repositories/proyecto.repository';
import { listarEntregablesDeProyecto } from '@/server/repositories/entregable.repository';
import EntregablesEstudiante from '@/components/features/marketplace/EntregablesEstudiante';

// El tipo del entregable es opcional en la DB; lo normalizamos a las dos variantes.
function normalizarTipo(tipo: string | null): 'hito' | 'final' {
  return tipo === 'final' ? 'final' : 'hito';
}

export default async function ProyectoActivoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (user.roles.nombre !== 'estudiante') {
    redirect(`/${locale}/dashboard/estudiante`);
  }

  const proyecto = await buscarProyectoActivo(id);
  if (!proyecto) notFound();

  // Solo accede el estudiante adjudicado de un proyecto en desarrollo.
  const adjudicado = await buscarEstudianteAdjudicado(id);
  const tieneAcceso =
    proyecto.estado === 'en_desarrollo' && adjudicado?.id_estudiante === user.id;

  if (!tieneAcceso) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Proyecto activo</h1>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          No tenés acceso a este proyecto. Solo el estudiante adjudicado puede verlo.
        </div>
      </main>
    );
  }

  const entregables = await listarEntregablesDeProyecto(id);

  return (
    <EntregablesEstudiante
      proyecto={{ id: proyecto.id, titulo: proyecto.titulo }}
      entregablesIniciales={entregables.map((e) => ({
        id: e.id,
        tipo: normalizarTipo(e.tipo),
        version: e.version,
        archivoUrl: e.archivo_url,
        estado: e.estado,
        comentarioEmpresario: e.comentario_empresario,
        creado: e.creado.toISOString(),
      }))}
    />
  );
}
