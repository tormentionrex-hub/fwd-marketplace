import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';

// Layout del grupo empresario: monta el Sidebar una sola vez junto a {children},
// de modo que las páginas 12 y 14 (y futuras) lo comparten sin repetir markup.
export default async function EmpresarioLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="empresario-scope flex min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      {/* Fuentes (Figtree/Outfit) e iconos (Material Symbols) para todo el grupo empresario.
          Se cargan aquí (no en src/app/layout.tsx ni globals.css del Carril B) para evitar
          conflictos. Quedan scoped a .empresario-scope. */}
      <link
        href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .empresario-scope { font-family: 'Outfit', sans-serif; }
            .empresario-scope h1, .empresario-scope h2, .empresario-scope h3, .empresario-scope h4, .empresario-scope .font-display { font-family: 'Figtree', sans-serif; }
            .empresario-scope .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
              vertical-align: middle;
            }
            .empresario-scope .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .empresario-scope .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .empresario-scope .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
          `,
        }}
      />

      <Sidebar locale={locale} />
      <div className="ml-[280px] flex-1 min-w-0">{children}</div>
    </div>
  );
}
