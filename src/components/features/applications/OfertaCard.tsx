import type { Oferta } from '@/types';
import EstadoBadge from '@/components/ui/EstadoBadge';

// Tarjeta de presentación de una oferta (usada en la Página 14).
// Solo presentación: las acciones (adjudicar, poner estrellas) se cablean en la Fase 4.
export default function OfertaCard({
  oferta,
  mostrarAcciones = false,
}: {
  oferta: Oferta;
  mostrarAcciones?: boolean;
}) {
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
        {oferta.prototipoUrl ? (
          <a
            href={oferta.prototipoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#008FD4] font-semibold hover:underline"
          >
            Ver prototipo
          </a>
        ) : oferta.prototipoArchivoNombre ? (
          <span className="text-slate-500">Prototipo: {oferta.prototipoArchivoNombre}</span>
        ) : null}

        {oferta.documentoUrl && (
          <a
            href={oferta.documentoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#008FD4] font-semibold hover:underline"
          >
            Ver documento
          </a>
        )}
      </div>

      {mostrarAcciones && (
        <div className="flex gap-2 mt-5 pt-4 border-t border-slate-200">
          {/* TODO Fase 4: cablear "Adjudicar" y la calificación con estrellas */}
          <button className="bg-[#008FD4] text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Adjudicar
          </button>
          <button className="text-[#008FD4] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#008FD4]/5">
            Ver detalle
          </button>
        </div>
      )}
    </div>
  );
}
