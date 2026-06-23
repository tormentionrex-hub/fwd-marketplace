// Catálogo de roles de staff (equipo FWD) y helpers de autorización.
// Sin dependencias de DB → seguro de importar tanto en servidor como en cliente.

// Roles internos del equipo (no son estudiantes ni empresarios).
export const ROLES_STAFF = ['owner', 'admin', 'editor', 'moderator'] as const;
export type RolStaff = (typeof ROLES_STAFF)[number];

// Roles de staff que HOY pueden entrar al panel /admin.
// Por ahora solo owner y admin; editor/moderator existen en la BD pero su
// acceso al panel se habilitará más adelante.
export const ROLES_PANEL_ADMIN = ['owner', 'admin'] as const;

// Roles que se pueden invitar por correo con rol asignado desde el panel.
// OWNER queda EXCLUIDO a propósito: es un rol exclusivo (único) y no se invita.
// Incluye staff (admin/editor/moderator) y usuarios normales (estudiante/empresario).
export const ROLES_INVITABLES = ['admin', 'editor', 'moderator', 'estudiante', 'empresario'] as const;
export type RolInvitable = (typeof ROLES_INVITABLES)[number];

// ¿Este rol puede acceder al panel de administración?
export function puedeAccederPanelAdmin(rol: string | null | undefined): boolean {
  return !!rol && (ROLES_PANEL_ADMIN as readonly string[]).includes(rol);
}

// ¿Es un rol de staff del equipo (sin perfil estudiante/empresario)?
export function esRolStaff(rol: string | null | undefined): boolean {
  return !!rol && (ROLES_STAFF as readonly string[]).includes(rol);
}

// ¿Es un rol válido para invitar con rol asignado? (owner NO lo es)
export function esRolInvitable(rol: string | null | undefined): rol is RolInvitable {
  return !!rol && (ROLES_INVITABLES as readonly string[]).includes(rol);
}
