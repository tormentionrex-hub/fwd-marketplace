import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// El equipo DEBE importar Link, useRouter, usePathname y redirect DESDE AQUÍ,
// no desde next/link ni next/navigation, para que respeten el locale.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
