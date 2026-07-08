import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { BotonRegresarHome } from "@/components/layout/BotonRegresarHome";
import { getUser } from "@/server/auth/get-user";
import { SinPermiso } from "@/components/layout/sin-permiso";
import SidebarEstudiante from "@/components/layout/SidebarEstudiante";
import FondoEstudiante from "@/components/layout/FondoEstudiante";
import { resumenDashboardEstudiante } from "@/server/services/dashboard.service";

interface EstudianteShellProps {
  locale: string;
  children: ReactNode;
}

export default async function EstudianteShell({ locale, children }: EstudianteShellProps) {
  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (user.roles.nombre !== "estudiante") {
    return <SinPermiso locale={locale} rolActual={user.roles.nombre} rolRequerido="estudiante" />;
  }

  const resumen = await resumenDashboardEstudiante(user.id);
  const nivel =
    resumen.proyectosCompletados >= 5
      ? "Profesional"
      : resumen.proyectosCompletados >= 1
        ? "En desarrollo"
        : "Talento emergente";

  return (
    <div className="relative min-h-screen">
      <FondoEstudiante />

      <div className="flex min-h-screen flex-col lg:flex-row">
        <SidebarEstudiante
          locale={locale}
          nombre={user.nombre}
          fotoUrl={user.image_url ?? null}
          reputacion={resumen.reputacion}
          nivel={nivel}
        />
        <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex justify-end">
              <BotonRegresarHome
                href={`/${locale}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#E4E9F1] bg-white px-5 py-2.5 text-sm font-extrabold text-[#344563] transition-colors hover:bg-[#F4F6FB] hover:text-[#0C1B33]"
              />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
