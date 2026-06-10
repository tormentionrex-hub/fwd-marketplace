import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";
import { SinPermiso } from "@/components/layout/sin-permiso";
import SidebarEstudiante from "@/components/layout/SidebarEstudiante";

interface DashboardEstudianteLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

// Guard del dashboard del estudiante: requiere sesión y rol 'estudiante'.
// - Sin sesión -> /login.
// - Logueado con otro rol -> <SinPermiso> (vuelve atrás + alerta de permisos).
export default async function DashboardEstudianteLayout({
  children,
  params,
}: DashboardEstudianteLayoutProps) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (user.roles.nombre !== "estudiante") {
    return <SinPermiso locale={locale} />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <SidebarEstudiante locale={locale} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
