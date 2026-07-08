import { listarUsuarios } from "@/server/repositories/usuario.repository";
import { getUser } from "@/server/auth/get-user";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { UsuariosTabla } from "@/components/features/admin/usuarios-tabla";

// URL: /es/admin/usuarios — gestión de usuarios registrados.
// Acepta ?rol=estudiante|empresario|staff|admin para abrir directamente filtrado por
// rol (lo usan los accesos del sidebar). Cualquier otro valor → "todos".
export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  const [{ rol }, data, me] = await Promise.all([
    searchParams,
    listarUsuarios(),
    getUser(),
  ]);

  const rolesValidos = ["estudiante", "empresario", "staff", "admin"];
  const rolInicial = rol && rolesValidos.includes(rol) ? rol : "todos";

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
    perfiles_estudiante: u.perfiles_estudiante
      ? {
          titulo_profesional: u.perfiles_estudiante.titulo_profesional,
          estado_verificacion: u.perfiles_estudiante.estado_verificacion,
          reputacion: u.perfiles_estudiante.reputacion,
          generacion_fwd: u.perfiles_estudiante.generacion_fwd,
          descripcion: u.perfiles_estudiante.descripcion,
          curriculums: u.perfiles_estudiante.curriculums
            ? {
                file_name: u.perfiles_estudiante.curriculums.file_name,
                file_type: u.perfiles_estudiante.curriculums.file_type,
                actualizado: u.perfiles_estudiante.curriculums.actualizado.toISOString(),
              }
            : null,
        }
      : null,
    perfiles_empresario: u.perfiles_empresario,
  }));

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Usuarios"
        subtitle="Buscá, filtrá y gestioná las cuentas registradas."
      />
      <UsuariosTabla
        usuarios={usuarios}
        currentUserId={me?.id ?? ""}
        rolInicial={rolInicial}
      />
    </AdminPageShell>
  );
}
