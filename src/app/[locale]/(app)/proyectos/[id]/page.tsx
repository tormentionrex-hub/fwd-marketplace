import { notFound } from 'next/navigation';
import {
  getProyectoById,
  getEntregablesByProyecto,
  ESTUDIANTE_ACTUAL_ID,
} from '@/lib/mocks';
import EntregablesEstudiante from '@/components/features/marketplace/EntregablesEstudiante';

export default async function ProyectoActivoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  const proyecto = getProyectoById(id);
  if (!proyecto) notFound();

  // Regla 1: solo accede el estudiante adjudicado de un proyecto en desarrollo.
  const tieneAcceso =
    proyecto.estado === 'en_desarrollo' &&
    proyecto.estudianteAdjudicadoId === ESTUDIANTE_ACTUAL_ID;

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

  const entregables = getEntregablesByProyecto(id);

  return (
    <EntregablesEstudiante
      proyecto={proyecto}
      entregablesIniciales={entregables}
      estudianteId={ESTUDIANTE_ACTUAL_ID}
    />
  );
}
