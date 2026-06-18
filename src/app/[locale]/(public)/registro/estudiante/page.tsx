import { redirect } from "next/navigation";

type RegistroEstudiantePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RegistroEstudiantePage({
  params,
}: RegistroEstudiantePageProps) {
  const { locale } = await params;

  redirect(`/${locale}/register-estudiante`);
}
