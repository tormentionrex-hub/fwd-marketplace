'use client';

import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import Swal from 'sweetalert2';

export function BotonRegresarHome({
  href,
  className,
  style,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();

  async function handleClick() {
    const result = await Swal.fire({
      imageUrl: '/imagenes/SweetalertsImagenes/FordyWarningAlert.jpeg',
      imageAlt: 'Fordy advierte',
      title: '¿Volver al inicio?',
      text: 'Asegurate de guardar tu trabajo antes de salir. Si no lo hacés, podrías perder el progreso de tu proyecto y las sugerencias que Fordy preparó especialmente para ti.',
      showCancelButton: true,
      confirmButtonText: 'Sí, volver al inicio',
      cancelButtonText: 'Quedarme aquí',
      confirmButtonColor: '#F7901E',
      cancelButtonColor: '#6B7280',
      showCloseButton: true,
      reverseButtons: true,
      showClass: { popup: '', backdrop: 'swal2-backdrop-show' },
      hideClass: { popup: '', backdrop: 'swal2-backdrop-hide' },
      didOpen: (popup) => {
        const img = popup.querySelector<HTMLElement>('.swal2-image');
        if (img) {
          img.style.width = '240px';
          img.style.height = 'auto';
          img.style.mixBlendMode = 'multiply';
          img.style.marginTop = '16px';
          img.style.marginBottom = '0';
        }
        gsap.fromTo(
          popup,
          { opacity: 0, scale: 0.82, y: -18 },
          { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.7)' },
        );
      },
    });

    if (result.isConfirmed) {
      router.push(href);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={style}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      <span className="tb-home-label">Regresar al home</span>
    </button>
  );
}
