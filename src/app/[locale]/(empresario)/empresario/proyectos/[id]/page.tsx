import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import {
  buscarProyectoActivo,
  buscarEstudianteAdjudicado,
} from '@/server/repositories/proyecto.repository';
import { listarOfertasDeProyecto } from '@/server/repositories/oferta.repository';
import { listarEntregablesDeProyecto } from '@/server/repositories/entregable.repository';
import { buscarEvaluacion } from '@/server/repositories/evaluacion.repository';
import GestionProyecto from '@/components/features/marketplace/GestionProyecto';

// El tipo del entregable es opcional en la DB; lo normalizamos a las dos variantes.
function normalizarTipo(tipo: string | null): 'hito' | 'final' {
  return tipo === 'final' ? 'final' : 'hito';
}

export default async function GestionProyectoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (user.roles.nombre !== 'empresario') {
    redirect(`/${locale}`);
  }

  const proyecto = await buscarProyectoActivo(id);
  if (!proyecto) notFound();

  if (proyecto.id_empresario !== user.id) {
    return (
      <main className="p-10 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Gestión del proyecto</h1>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          No tenés acceso a este proyecto. Solo el empresario dueño puede gestionarlo.
        </div>
      </main>
    );
  }

  const ofertas = await listarOfertasDeProyecto(id);
  const entregables = await listarEntregablesDeProyecto(id);
  const adjudicado = await buscarEstudianteAdjudicado(id);

  // Calificación final ya registrada (si el proyecto se cerró antes), para
  // precargar el StarRating.
  let evaluacionInicial: number | null = null;
  if (adjudicado) {
    const evaluacion = await buscarEvaluacion(id, adjudicado.id_estudiante, user.id);
    evaluacionInicial = evaluacion?.puntuacion ?? null;
  }

  return (
    <main className="p-10">
      <GestionProyecto
        proyecto={{ id: proyecto.id, titulo: proyecto.titulo, estado: proyecto.estado }}
        ofertasIniciales={ofertas.map((o) => ({
          id: o.id,
          propuesta: o.propuesta,
          prototipoUrl: o.prototipo_url,
          documentacionUrl: o.documentacion_url,
          estado: o.estado,
        }))}
        entregablesIniciales={entregables.map((e) => ({
          id: e.id,
          tipo: normalizarTipo(e.tipo),
          version: e.version,
          archivoUrl: e.archivo_url,
          estado: e.estado,
          comentarioEmpresario: e.comentario_empresario,
          creado: e.creado.toISOString(),
        }))}
        evaluacionInicial={evaluacionInicial}
      />
    </main>
  );
}
