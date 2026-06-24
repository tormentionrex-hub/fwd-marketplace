import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";
import { rutaPorRol } from "@/server/auth/rutas";
import { puedeAccederPanelStaff } from "@/server/auth/roles";
import { StaffSidebar } from "@/components/features/staff/staff-sidebar";

// El panel staff es SIEMPRE dinámico (auth por cookie + datos en vivo de la BD).
export const dynamic = "force-dynamic";

// Guard del grupo (staff): SOLO entra quien tenga rol 'staff' o 'moderator'.
// - Sin sesión        -> /login
// - Rol distinto      -> su propio panel según rutaPorRol
export default async function StaffLayout({
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

  if (!puedeAccederPanelStaff(user.roles.nombre)) {
    redirect(`/${locale}${rutaPorRol(user.roles.nombre)}`);
  }

  return (
    <div
      className="admin-panel min-h-screen"
      style={{ background: "var(--adm-bg)", color: "var(--adm-ink)" }}
    >
      <StaffSidebar rol={user.roles.nombre} />
      <main className="admin-main min-h-screen lg:pl-[240px]">{children}</main>
    </div>
  );
}
