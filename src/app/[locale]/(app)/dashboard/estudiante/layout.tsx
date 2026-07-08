import type { ReactNode } from "react";
import EstudianteShell from "@/components/layout/EstudianteShell";

interface DashboardEstudianteLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardEstudianteLayout({
  children,
  params,
}: DashboardEstudianteLayoutProps) {
  const { locale } = await params;
  return <EstudianteShell locale={locale}>{children}</EstudianteShell>;
}
