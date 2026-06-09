import EmptyState from "@/components/ui/EmptyState";
import { IconBriefcase } from "@/components/ui/icons";

interface ProyectoActivoPageProps {
  params: Promise<{ locale: string; id?: string }>;
}

export default async function ProyectoActivoPage({ params }: ProyectoActivoPageProps) {
  await params;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-text">Proyecto activo</h1>
        <p className="text-text-muted">Aquí verás el detalle del proyecto que tienes en curso.</p>
      </header>

      <EmptyState
        icon={<IconBriefcase width={28} height={28} />}
        title="No tienes un proyecto activo"
        description="Cuando una de tus ofertas sea adjudicada, el proyecto en curso aparecerá aquí."
      />
    </div>
  );
}
