// Muestra los días restantes hasta una fecha límite (ISO).
// - Vencido  -> "Plazo vencido" en rojo (alerta).
// - <= 3 días -> ámbar (advertencia).
// - Resto    -> gris normal.
export default function ContadorPlazo({ fechaLimite }: { fechaLimite: string }) {
  const dias = Math.ceil((new Date(fechaLimite).getTime() - new Date().getTime()) / 86400000);

  if (dias < 0) {
    return <span className="text-sm font-semibold text-red-600">Plazo vencido</span>;
  }

  const texto =
    dias === 0 ? 'Vence hoy' : dias === 1 ? '1 día restante' : `${dias} días restantes`;
  const color = dias <= 3 ? 'text-amber-600' : 'text-slate-500';

  return <span className={`text-sm font-medium ${color}`}>{texto}</span>;
}
