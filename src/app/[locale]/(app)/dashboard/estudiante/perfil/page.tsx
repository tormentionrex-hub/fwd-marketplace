import FormularioEditarPerfil from "@/components/features/estudiante/FormularioEditarPerfil";

// Editar perfil y portafolio (Sefora · Página 09).
// URL: /es/dashboard/estudiante/perfil
//
// Vive bajo el layout del estudiante, por lo que hereda el menú lateral.
// La interfaz interactiva (subir foto, habilidades, portafolio) está en el
// Client Component FormularioEditarPerfil; aquí solo resolvemos el locale.
export default async function EditarPerfilPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <FormularioEditarPerfil locale={locale} />;
}
