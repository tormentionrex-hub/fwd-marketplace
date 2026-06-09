import FormularioEditarPerfil from "@/components/features/estudiante/FormularioEditarPerfil";

interface EditarPerfilPageProps {
  params: Promise<{ locale: string }>;
}

export default async function EditarPerfilPage({
  params,
}: EditarPerfilPageProps) {
  const { locale } = await params;

  return <FormularioEditarPerfil locale={locale} />;
}
