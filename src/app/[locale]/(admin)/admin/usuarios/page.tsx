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
    segundo_nombre: u.segundo_nombre,
    segundo_apellido: u.segundo_apellido,
    correo: u.correo,
    rol: u.roles.nombre,
    estado: u.estado,
    edad: u.edad,
    fecha_nacimiento: u.fecha_nacimiento instanceof Date ? u.fecha_nacimiento.toISOString() : (u.fecha_nacimiento ?? null),
    creado: u.creado instanceof Date ? u.creado.toISOString() : u.creado,
    ultima_sesion: u.ultima_sesion instanceof Date ? u.ultima_sesion.toISOString() : (u.ultima_sesion ?? null),
    image_url: u.image_url,
    perfiles_estudiante: u.perfiles_estudiante,
    perfiles_empresario: u.perfiles_empresario,
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
