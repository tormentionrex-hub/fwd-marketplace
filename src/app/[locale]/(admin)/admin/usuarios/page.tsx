import { listarUsuarios } from "@/server/repositories/usuario.repository";
import { getUser } from "@/server/auth/get-user";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { UsuariosTabla } from "@/components/features/admin/usuarios-tabla";

// URL: /es/admin/usuarios — gestión de usuarios registrados.
export default async function AdminUsuariosPage() {
  const [data, me] = await Promise.all([listarUsuarios(), getUser()]);

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
        title="Usuarios"
        subtitle="Buscá, filtrá y gestioná las cuentas registradas."
      />
      <UsuariosTabla usuarios={usuarios} currentUserId={me?.id ?? ""} />
    </AdminPageShell>
  );
}
