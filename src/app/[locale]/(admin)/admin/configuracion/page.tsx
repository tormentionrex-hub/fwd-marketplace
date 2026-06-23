import { getUser } from "@/server/auth/get-user";
import { buscarPerfilAdminPorId } from "@/server/repositories/usuario.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { LogoutButton } from "@/components/features/admin/logout-button";
import { GestionRolesPanel } from "@/components/features/admin/gestion-roles-panel";
import { EditarPerfilPanel } from "@/components/features/admin/editar-perfil-panel";

// URL: /es/admin/configuracion — datos de la cuenta del admin.
export default async function AdminConfiguracionPage() {
  const user = await getUser();
  const perfil = user ? await buscarPerfilAdminPorId(user.id) : null;

  const rolActual = user?.roles.nombre ?? "admin";

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Configuración"
        subtitle="Datos de tu cuenta de administrador."
      />

      <div className="flex flex-col gap-8">
        {/* Editar perfil */}
        <EditarPerfilPanel
          nombre={perfil?.nombre ?? ""}
          segundoApellido={perfil?.segundo_apellido ?? null}
          correo={perfil?.correo ?? ""}
          imageUrl={perfil?.image_url ?? null}
          rol={rolActual}
        />

        {/* Cerrar sesión */}
        <div className="max-w-sm">
          <LogoutButton />
        </div>

        {/* Panel de gestión de roles */}
        <GestionRolesPanel rolActual={rolActual} />
      </div>
    </AdminPageShell>
  );
}
