import Link from "next/link";
import { IconArrowLeft } from "@/components/ui/icons";
import FormularioOferta from "@/components/features/proyectos/FormularioOferta";
import { obtenerDetalleProyecto } from "@/server/services/proyecto.service";

export default async function OfertarProyectoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  // Título del proyecto para contextualizar el formulario; si la DB no está
  // disponible o el proyecto no existe, se muestra un texto genérico.
  let titulo = `Proyecto #${id}`;
  try {
    const proyecto = await obtenerDetalleProyecto(id);
    if (proyecto) titulo = proyecto.titulo;
  } catch {
    // Sin DB / sin datos sembrados: se conserva el texto genérico.
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-8">
      <Link
        href={`/${locale}/proyectos/${id}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-fwd-azul"
      >
        <IconArrowLeft width={16} height={16} />
        Volver al proyecto
      </Link>

      <header className="mb-8 mt-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-text">Enviar oferta</h1>
        <p className="mt-1 text-text-muted">{titulo}</p>
      </header>

      <FormularioOferta proyectoId={id} />
    </div>
  );
}
