import { notFound } from 'next/navigation';
import { getProyectoById, getOfertaDeEstudiante, ESTUDIANTE_ACTUAL_ID } from '@/lib/mocks';
import FormularioOferta from '@/components/features/applications/FormularioOferta';

export default async function OfertarProyectoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const proyecto = getProyectoById(id);
  if (!proyecto) notFound();

  const ofertaExistente = getOfertaDeEstudiante(id, ESTUDIANTE_ACTUAL_ID);

  return (
    <FormularioOferta proyecto={proyecto} ofertaExistente={ofertaExistente} locale={locale} />
  );
}
