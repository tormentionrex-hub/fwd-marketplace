import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";
import { SinPermiso } from "@/components/layout/sin-permiso";

// Guard del grupo (admin): solo entra quien tenga rol 'admin'.
// - Sin sesión -> a /login.
// - Logueado con otro rol -> NO redirige; renderiza <SinPermiso>, que vuelve a la
//   página anterior del historial y dispara la alerta de permisos insuficientes.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (user.roles.nombre !== "admin") {
    return <SinPermiso locale={locale} />;
  }

  return <>{children}</>;
}
