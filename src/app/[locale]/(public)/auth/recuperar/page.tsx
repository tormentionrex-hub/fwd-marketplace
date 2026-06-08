import FormularioRecuperar from "@/components/features/auth/FormularioRecuperar";

// Recuperar contraseña (Sefora · Página 07).
// URL: /es/auth/recuperar            -> Paso 1 (solicitar enlace)
//      /es/auth/recuperar?paso=nueva -> Paso 2 (definir nueva contraseña,
//                                       se llega desde el enlace del correo)
//
// La interfaz interactiva vive en el Client Component FormularioRecuperar;
// aquí solo resolvemos locale y el paso inicial desde la URL.
export default async function RecuperarContrasenaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ paso?: string }>;
}) {
  const { locale } = await params;
  const { paso } = await searchParams;

  const pasoInicial = paso === "nueva" ? "nueva" : "solicitar";

  return (
    <section className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        {pasoInicial === "nueva" ? "Nueva contraseña" : "Recuperar contraseña"}
      </h1>
      <FormularioRecuperar locale={locale} pasoInicial={pasoInicial} />
    </section>
  );
}
