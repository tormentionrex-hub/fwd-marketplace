import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { BotonRegresarHome } from "@/components/layout/BotonRegresarHome";
import { getUser } from "@/server/auth/get-user";
import { generarAvatar } from "@/lib/avatar";
import { SinPermiso } from "@/components/layout/sin-permiso";
import SidebarEstudiante from "@/components/layout/SidebarEstudiante";
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
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" />
        <div className="animate-aurora absolute -left-32 -top-24 h-96 w-96 rounded-full bg-transparent blur-3xl" />
        <div className="animate-aurora absolute right-[-8%] top-32 h-80 w-80 rounded-full bg-transparent blur-3xl [animation-delay:5s]" />
        <div className="animate-aurora absolute bottom-[-10%] left-1/3 h-96 w-96 rounded-full bg-transparent blur-3xl [animation-delay:9s]" />
        <div className="absolute right-1/4 top-10 h-24 w-24 rounded-full bg-transparent blur-2xl" />
        <div className="absolute bottom-1/4 right-10 h-28 w-28 rounded-full bg-transparent blur-2xl" />
        <svg className="absolute inset-0 h-full w-full opacity-0" preserveAspectRatio="none">
          <defs>
            <linearGradient id="netline" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#008FD4" />
              <stop offset="50%" stopColor="#20BEC6" />
              <stop offset="100%" stopColor="#662D91" />
            </linearGradient>
          </defs>
          <g stroke="url(#netline)" strokeWidth="1" fill="none">
            <line x1="8%" y1="12%" x2="28%" y2="30%" />
            <line x1="28%" y1="30%" x2="52%" y2="18%" />
            <line x1="52%" y1="18%" x2="78%" y2="36%" />
            <line x1="78%" y1="36%" x2="92%" y2="14%" />
            <line x1="18%" y1="70%" x2="40%" y2="84%" />
            <line x1="40%" y1="84%" x2="66%" y2="72%" />
            <line x1="66%" y1="72%" x2="88%" y2="88%" />
          </g>
          <g fill="url(#netline)">
            {[
              ["8%", "12%"], ["28%", "30%"], ["52%", "18%"], ["78%", "36%"], ["92%", "14%"],
              ["18%", "70%"], ["40%", "84%"], ["66%", "72%"], ["88%", "88%"],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="3" />
            ))}
          </g>
        </svg>
      </div>

      <div className="flex min-h-screen flex-col lg:flex-row">
        <SidebarEstudiante
          locale={locale}
          nombre={user.nombre}
          fotoUrl={user.image_url || generarAvatar(user.nombre)}
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
