import { listarUsuariosPendientes } from "@/server/repositories/usuario.repository";
import { listarPendingVerifications } from "@/server/repositories/pending-verification.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { ValidacionesLista } from "@/components/features/admin/validaciones-lista";

// URL: /es/staff/validaciones — aprobar/rechazar cuentas pendientes.
// Protegido por (staff)/layout.tsx (solo staff y moderator).
export default async function StaffValidacionesPage() {
  const [dataUsuarios, dataVerificaciones] = await Promise.all([
    listarUsuariosPendientes(),
    listarPendingVerifications(),
  ]);

  const pendientes = dataUsuarios.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.roles.nombre,
    creado: u.creado.toISOString(),
  }));

  const solicitudes = dataVerificaciones
    .filter((v) => v.tipo === "solicitud")
    .map((v) => ({
      id: v.id,
      email: v.email,
      solicitado: v.solicitado.toISOString(),
    }));

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Validaciones"
        subtitle="Gestioná las cuentas registradas pendientes de activación y las solicitudes de invitación."
      />
      <ValidacionesLista pendientes={pendientes} solicitudes={solicitudes} />
    </AdminPageShell>
  );
}
