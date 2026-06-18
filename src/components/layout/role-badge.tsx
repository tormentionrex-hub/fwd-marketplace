import { getUser } from "@/server/auth/get-user";
import { RoleBadgeClient } from "@/components/layout/role-badge-client";

// Server Component: lee rol y nombre en servidor, delega renderizado al cliente.
export async function RoleBadge() {
  const user = await getUser();

  const clientUser = user
    ? { nombre: user.nombre, rol: user.roles.nombre }
    : undefined;

  return <RoleBadgeClient user={clientUser} />;
}
