// Mapa de rol -> ruta de destino tras login/registro. El servidor calcula esto y
// solo devuelve la RUTA al cliente, así el rol se mantiene privado.
// Las rutas van SIN prefijo de locale; el router de next-intl (@/i18n/navigation)
// le antepone el locale (/es, /en) automáticamente.
export function rutaPorRol(rol: string): string {
  switch (rol) {
    case 'admin':
      return '/admin';
    case 'empresario':
      return '/empresario';
    case 'estudiante':
      return '/dashboard/estudiante';
    default:
      return '/';
  }
}
