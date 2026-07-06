import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";
import ParaTiCliente from "@/components/features/estudiante/ParaTiCliente";

interface ParaTiPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ParaTiPage({ params }: ParaTiPageProps) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  return <ParaTiCliente locale={locale} />;
}
