import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { IconFile } from "@/components/ui/icons";

// Listado de solicitudes / postulaciones del usuario.
// URL: /es/applications
export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-text">Mis solicitudes</h1>
        <p className="mt-1 text-text-muted">Da seguimiento a tus postulaciones a proyectos.</p>
      </header>

      <EmptyState
        icon={<IconFile width={28} height={28} />}
        title="Aún no tienes solicitudes"
        description="Cuando te postules a un proyecto del marketplace, aparecerá aquí con su estado."
        action={
          <Button href={`/${locale}/marketplace`}>Explorar proyectos</Button>
        }
      />
    </div>
  );
}
