import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";
import { rutaPorRol } from "@/server/auth/rutas";
import { puedeAccederPanelAdmin } from "@/server/auth/roles";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";

// El panel admin es SIEMPRE dinámico (auth por cookie + datos en vivo de la BD):
// nunca debe generarse de forma estática. Forzar render dinámico en todo el
// subárbol evita que Next intente "generar rutas estáticas" para /admin/* — ese
// paso levanta un worker de compilación que, en máquinas cargadas, crashea con
// "Jest worker encountered child process exceptions" (WorkerError) y tumba la
// navegación entre páginas del panel.
export const dynamic = "force-dynamic";

// Guard del grupo (admin): SOLO entra quien tenga rol 'admin'. Protege /admin y
// todas sus sub-rutas (se ejecuta en el servidor antes de renderizar, con el rol
// verificado contra la DB vía getUser — no se confía en la cookie del cliente).
// - Sin sesión        -> /login.
// - Logueado, no-admin -> a SU propio dashboard según el rol (rutaPorRol).
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

  if (!puedeAccederPanelAdmin(user.roles.nombre)) {
    // estudiante -> /dashboard/estudiante · empresario -> /empresario · etc.
    redirect(`/${locale}${rutaPorRol(user.roles.nombre)}`);
  }

  return (
    <div className="admin-panel min-h-screen" style={{ background: "var(--adm-bg)", color: "var(--adm-ink)" }}>
      <AdminSidebar tipoStaff={user.tipo_staff ?? ''} />
      <main className="admin-main min-h-screen lg:pl-[240px]">{children}</main>
    </div>
  );
}
