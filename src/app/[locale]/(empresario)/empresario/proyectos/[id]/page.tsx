import { notFound } from 'next/navigation';
import {
  getProyectoById,
  getOfertasByProyecto,
  getEntregablesByProyecto,
} from '@/lib/mocks';
import GestionProyecto from '@/components/features/marketplace/GestionProyecto';

export default async function GestionProyectoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  const proyecto = getProyectoById(id);
  if (!proyecto) notFound();

  const ofertas = getOfertasByProyecto(id);
  const entregables = getEntregablesByProyecto(id);

  return (
    <main className="p-10">
      <GestionProyecto
        proyecto={proyecto}
        ofertasIniciales={ofertas}
        entregablesIniciales={entregables}
      />
    </main>
  );
}
