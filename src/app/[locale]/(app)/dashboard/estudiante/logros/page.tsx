import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";
import { cargarQuizzes } from "@/server/services/quizzes.service";
import LogrosCliente from "@/components/features/quizzes/LogrosCliente";

export default async function LogrosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  const estadoInicial = await cargarQuizzes(user.id);

  return <LogrosCliente estadoInicial={estadoInicial} />;
}
