import EstadoBadge from '@/components/ui/EstadoBadge';

// Oferta tal como la consume la Página 14 (datos reales mapeados). Tipo local
// (no @/types) para no acoplar el componente al contrato de mocks.
type OfertaVista = {
  id: string;
  propuesta: string;
  prototipoUrl: string | null;
  documentacionUrl: string | null;
  estado: string;
  calificacion?: number; // estrellas efímeras de la P14 (no se persiste)
};

// Tarjeta de presentación de una oferta (usada en la Página 14).
export default function OfertaCard({ oferta }: { oferta: OfertaVista }) {
  return (
    <div className="p-6 rounded-xl bg-white border border-slate-300 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <EstadoBadge estado={oferta.estado} tipo="oferta" />

        {typeof oferta.calificacion === 'number' && (
          <div
            className="flex text-[#F9B233] text-lg"
            aria-label={`Calificación: ${oferta.calificacion} de 5`}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n}>{n <= oferta.calificacion! ? '★' : '☆'}</span>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-[#0b1c30] leading-relaxed mb-4">{oferta.propuesta}</p>

      <div className="flex flex-wrap gap-3 text-sm">
        {oferta.prototipoUrl && (
          <a
            href={oferta.prototipoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#008FD4] font-semibold hover:underline"
          >
            Ver prototipo
          </a>
        )}

        {oferta.documentacionUrl && (
          <a
            href={oferta.documentacionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#008FD4] font-semibold hover:underline"
          >
            Ver documento
          </a>
        )}
      </div>
    </div>
  );
}
