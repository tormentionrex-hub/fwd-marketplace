import EmptyState from "@/components/ui/EmptyState";
import { IconBriefcase } from "@/components/ui/icons";

export default async function GestionProyectoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-text">
          Gestión del proyecto
        </h1>
        <p className="mt-1 text-text-muted">Proyecto #{id}</p>
      </header>

      <EmptyState
        icon={<IconBriefcase width={28} height={28} />}
        title="Gestión en construcción"
        description="Aquí podrás revisar ofertas recibidas, seleccionar talento y dar seguimiento al proyecto."
      />
    </div>
  );
}
