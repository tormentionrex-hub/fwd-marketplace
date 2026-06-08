import SidebarEstudiante from "@/components/layout/SidebarEstudiante";

// Layout del área del estudiante (Sefora · Página 08).
// Coloca el menú lateral a la izquierda y el contenido de cada página
// a la derecha. Envuelve a /dashboard/estudiante y sus sub-rutas
// (Mi perfil, Mis ofertas, etc.).
export default async function DashboardEstudianteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <SidebarEstudiante locale={locale} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
