import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { IconBriefcase } from "@/components/ui/icons";

// Dashboard de empresario.
// URL: /es/empresario
export default async function DashboardEmpresarioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-text">
          Panel de empresario
        </h1>
        <p className="mt-1 text-text-muted">
          Publica proyectos y encuentra al mejor talento de la comunidad FWD.
        </p>
      </header>

      <EmptyState
        icon={<IconBriefcase width={28} height={28} />}
        title="Aún no has publicado proyectos"
        description="Crea tu primer proyecto para empezar a recibir ofertas de talentos verificados."
        action={<Button href={`/${locale}/marketplace`}>Ver marketplace</Button>}
      />
    </div>
  );
}
