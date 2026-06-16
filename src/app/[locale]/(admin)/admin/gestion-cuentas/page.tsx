import { getUser } from "@/server/auth/get-user";
import {
  listarUsuarios,
  contarUsuariosSuspendidos,
} from "@/server/repositories/usuario.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { GestionCuentasPanel } from "@/components/features/admin/gestion-cuentas-panel";

// URL: /es/admin/gestion-cuentas — gestión de suspensiones y reactivaciones.
export default async function GestionCuentasPage() {
  const [data, me, suspendidos] = await Promise.all([
    listarUsuarios(),
    getUser(),
    contarUsuariosSuspendidos(),
  ]);

  const usuarios = data.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.roles.nombre,
    estado: u.estado,
    creado: u.creado.toISOString(),
  }));

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Gestión de cuentas"
        subtitle="Suspendé, reactivá y consultá el historial de estados de las cuentas."
      />
      <GestionCuentasPanel
        usuarios={usuarios}
        currentUserId={me?.id ?? ""}
        totalSuspendidos={suspendidos}
      />
    </AdminPageShell>
  );
}
