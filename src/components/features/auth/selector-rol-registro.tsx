'use client';

// Alert de selección de rol al entrar al registro. Siempre que alguien llega a
// /register (por navegación o redirección) pregunta si quiere registrarse como
// empresario o estudiante. Empresario → se queda en este registro. Estudiante →
// redirige al registro de estudiante existente (/register-estudiante).
// Tematizado claro/oscuro y sin emojis (REGLA #6): usa los íconos de SweetAlert.

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

function tema(): { background: string; color: string } {
  const dark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');
  return dark
    ? { background: '#111827', color: '#F1F5F9' }
    : { background: '#FFFFFF', color: '#0C1B33' };
}

interface Props {
  locale: string;
}

export default function SelectorRolRegistro({ locale }: Props) {
  const router = useRouter();
  const mostrado = useRef(false);

  useEffect(() => {
    if (mostrado.current) return; // evita doble disparo (StrictMode en dev)
    mostrado.current = true;

    void Swal.fire({
      ...tema(),
      icon: 'info',
      title: 'Bienvenido a FWD Marketplace',
      html:
        '<p style="margin:0;font-size:15px;line-height:1.6;">' +
        '¿Cómo te gustaría registrarte? Elegí el tipo de cuenta que quieres ' +
        'crear para poder continuar.' +
        '</p>',
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: 'Empresario',
      denyButtonText: 'Estudiante',
      confirmButtonColor: '#008FD4',
      denyButtonColor: '#662D91',
      allowOutsideClick: true,
      allowEscapeKey: true,
      reverseButtons: true,
    }).then((r) => {
      // Estudiante → registro de estudiante. Empresario o cerrar → se queda acá.
      if (r.isDenied) {
        router.push(`/${locale}/register-estudiante`);
      }
    });
  }, [locale, router]);

  return null;
}
