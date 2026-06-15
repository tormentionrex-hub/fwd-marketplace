'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { IconSearch } from '@/components/ui/fwd-icons';

// Buscador del topbar (panel empresario). Al enviar (Enter), navega a
// "Mis proyectos" con ?q=… para mostrar los resultados filtrados por título.
export default function BuscadorProyectos({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const termino = q.trim();
    router.push(
      termino ? `/empresario/proyectos?q=${encodeURIComponent(termino)}` : '/empresario/proyectos',
    );
  }

  return (
    <form className="tb-search" onSubmit={onSubmit} role="search">
      <IconSearch size={17} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar proyectos…"
        aria-label="Buscar proyectos"
      />
    </form>
  );
}
