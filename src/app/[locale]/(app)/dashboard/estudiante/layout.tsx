import type { ReactNode } from "react";
import SidebarEstudiante from "@/components/layout/SidebarEstudiante";

interface DashboardEstudianteLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardEstudianteLayout({
  children,
  params,
}: DashboardEstudianteLayoutProps) {
  const { locale } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <SidebarEstudiante locale={locale} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
