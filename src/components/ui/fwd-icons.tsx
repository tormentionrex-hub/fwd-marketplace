import type { ReactNode, SVGProps } from 'react';

// Set de iconos FWD (SVG inline, stroke 1.8, 24x24) portado del prototipo de diseño.
// El color sale de `currentColor`, así que se controla con `color` en el contenedor.
function make(paths: ReactNode) {
  return function FwdIcon({
    size = 20,
    ...props
  }: { size?: number } & SVGProps<SVGSVGElement>) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const IconGrid = make(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </>,
);
export const IconFolder = make(
  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
);
export const IconPlus = make(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
);
export const IconSpark = make(
  <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
);
export const IconSend = make(
  <>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4z" />
  </>,
);
export const IconBriefcase = make(
  <>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
  </>,
);
export const IconBell = make(
  <>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </>,
);
export const IconSearch = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>,
);
export const IconChevR = make(<path d="M9 6l6 6-6 6" />);
export const IconArrowR = make(
  <>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </>,
);
export const IconLayers = make(
  <>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 13l9 5 9-5" />
  </>,
);
export const IconTrophy = make(
  <>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 6H4v2a3 3 0 0 0 3 3" />
    <path d="M17 6h3v2a3 3 0 0 1-3 3" />
  </>,
);
export const IconSettings = make(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13a7.8 7.8 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a7.6 7.6 0 0 0-1.7 1l-2.3-1-2 3.4L4.6 11a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 0 0 1.7 1l.3 2.6h4l.3-2.6a7.6 7.6 0 0 0 1.7-1l2.3 1 2-3.4z" />
  </>,
);
export const IconClock = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
);
export const IconUpload = make(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
  </>,
);
export const IconCheckCircle = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </>,
);
export const IconUsers = make(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 5.2A3 3 0 0 1 19 11" />
    <path d="M21 20a5 5 0 0 0-3.5-4.8" />
  </>,
);
export const IconMail = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </>,
);
export const IconCalendar = make(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </>,
);
export const IconStar = make(
  <path d="M12 3l2.6 5.6 6 .8-4.4 4.1 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z" />,
);
export const IconEdit = make(
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </>,
);
export const IconX = make(
  <>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </>,
);
export const IconCheck = make(<path d="M20 6L9 17l-5-5" />);
export const IconAlert = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4.5" />
    <path d="M12 16h.01" />
  </>,
);
export const IconFlag = make(
  <>
    <path d="M4 21V4" />
    <path d="M4 4h13l-2 4 2 4H4" />
  </>,
);
export const IconLink = make(
  <>
    <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
  </>,
);
export const IconFile = make(
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </>,
);
export const IconEye = make(
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);
export const IconDownload = make(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M12 4v12" />
    <path d="M7 11l5 5 5-5" />
  </>,
);
export const IconMessage = make(
  <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 21l1.9-4.5A8.4 8.4 0 1 1 21 11.5z" />,
);
export const IconDollar = make(
  <>
    <path d="M12 2v20" />
    <path d="M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6" />
  </>,
);
export const IconChevD = make(<path d="M6 9l6 6 6-6" />);
export const IconCode = make(
  <>
    <path d="M8 6l-6 6 6 6" />
    <path d="M16 6l6 6-6 6" />
  </>,
);
export const IconTrend = make(
  <>
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M17 7h4v4" />
  </>,
);

// Icono Comunidad FWD — seis flechas radiales multicolor (empty states).
export function IconComunidad({ size = 64 }: { size?: number }) {
  const cols = ['#008FD4', '#662D91', '#20BEC6', '#FFCB05', '#F7901E', '#EC008C'];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {cols.map((c, i) => (
        <g key={c} transform={`rotate(${i * 60} 50 50)`}>
          <path d="M50 14 L58 30 L50 25 L42 30 Z" fill={c} />
        </g>
      ))}
      <circle cx="50" cy="50" r="6" fill="#0C1B33" />
    </svg>
  );
}
