'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

const REFRESH_MS = 60_000;

// Mantiene fresco el dashboard del empresario (RSC). Como las stat cards, los
// proyectos recientes y la actividad se renderizan en el servidor, no se
// actualizan solos mientras estás en la página. Este componente invisible
// dispara router.refresh() —que vuelve a ejecutar el server component— cada 60s
// y cada vez que vuelves a la pestaña. No renderiza nada.
export default function DashboardRefresher() {
  const router = useRouter();

  useEffect(() => {
    const refrescar = () => router.refresh();

    const intervalo = setInterval(refrescar, REFRESH_MS);
    const alVolver = () => {
      if (document.visibilityState === 'visible') refrescar();
    };
    document.addEventListener('visibilitychange', alVolver);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [router]);

  return null;
}
