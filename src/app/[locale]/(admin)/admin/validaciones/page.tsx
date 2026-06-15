import { listarUsuariosPendientes } from "@/server/repositories/usuario.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { ValidacionesLista } from "@/components/features/admin/validaciones-lista";

// URL: /es/admin/validaciones — aprobar/rechazar cuentas pendientes.
export default async function AdminValidacionesPage() {
  const data = await listarUsuariosPendientes();

  const pendientes = data.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.roles.nombre,
    creado: u.creado.toISOString(),
  }));

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Validaciones"
        subtitle="Cuentas que se registraron y esperan tu aprobación para poder acceder."
      />
      <ValidacionesLista pendientes={pendientes} />
    </AdminPageShell>
  );
}
