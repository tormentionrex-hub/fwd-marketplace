import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";

// Guard del grupo (admin): solo entra quien tenga rol 'admin'. Cualquier otro
// (o sin sesión) se va al inicio. Demuestra la separación de roles.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();

  if (!user || user.roles.nombre !== "admin") {
    redirect(`/${locale}`);
  }

  return <>{children}</>;
}
