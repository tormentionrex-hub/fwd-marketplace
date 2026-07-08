import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";
import MisNoticias from "@/components/features/noticias/MisNoticias";

interface Props {
  params: Promise<{ locale: string }>;
}

// URL: /es/dashboard/estudiante/noticias — gestión de las noticias propias.
export default async function NoticiasEstudiantePage({ params }: Props) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  return <MisNoticias />;
}
