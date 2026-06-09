// Etiqueta de color con el texto legible en español de un estado.
// Soporta estados de proyecto, oferta y entregable.

type Tipo = 'proyecto' | 'oferta' | 'entregable';

const CONFIG: Record<Tipo, Record<string, { label: string; cls: string; dot: string }>> = {
  proyecto: {
    borrador: { label: 'Borrador', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
    publicado: { label: 'Publicado', cls: 'bg-[#00B2B2]/10 text-[#00B2B2]', dot: 'bg-[#00B2B2]' },
    en_desarrollo: { label: 'En desarrollo', cls: 'bg-[#008FD4]/10 text-[#008FD4]', dot: 'bg-[#008FD4]' },
    cerrado: { label: 'Cerrado', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  },
  oferta: {
    enviada: { label: 'Enviada', cls: 'bg-[#008FD4]/10 text-[#008FD4]', dot: 'bg-[#008FD4]' },
    retirada: { label: 'Retirada', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
    adjudicada: { label: 'Adjudicada', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    rechazada: { label: 'Rechazada', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    // Estados reales de la DB (oferta).
    pendiente: { label: 'Enviada', cls: 'bg-[#008FD4]/10 text-[#008FD4]', dot: 'bg-[#008FD4]' },
    en_revision: { label: 'En revisión', cls: 'bg-orange-100 text-orange-600', dot: 'bg-orange-500' },
    no_seleccionada: { label: 'No seleccionada', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  },
  entregable: {
    enviado: { label: 'Enviado', cls: 'bg-[#008FD4]/10 text-[#008FD4]', dot: 'bg-[#008FD4]' },
    aprobado: { label: 'Aprobado', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    cambios_solicitados: {
      label: 'Con cambios solicitados',
      cls: 'bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
    },
  },
};

export default function EstadoBadge({
  estado,
  tipo = 'proyecto',
}: {
  estado: string;
  tipo?: Tipo;
}) {
  const item =
    CONFIG[tipo][estado] ?? { label: estado, cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${item.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.dot}`} />
      {item.label}
    </span>
  );
}
