import AuthLayout from "@/components/features/auth/AuthLayout";
import FormularioRecuperar from "@/components/features/auth/FormularioRecuperar";

interface RecuperarPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ paso?: string }>;
}

export default async function RecuperarContrasenaPage({
  params,
  searchParams,
}: RecuperarPageProps) {
  const { locale } = await params;
  const { paso } = await searchParams;

  const pasoInicial = paso === "nueva" ? "nueva" : "solicitar";

  return (
    <AuthLayout
      locale={locale}
      title={pasoInicial === "nueva" ? "Nueva contraseña" : "Recuperar contraseña"}
      subtitle="Plataforma de talento FWD Costa Rica"
    >
      <FormularioRecuperar locale={locale} pasoInicial={pasoInicial} />
    </AuthLayout>
  );
}
