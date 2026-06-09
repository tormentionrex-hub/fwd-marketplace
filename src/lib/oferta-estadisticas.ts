import type { EstadisticasOfertas, MiOfertaDTO } from "@/types/oferta";

// Calcula los contadores de "Mis Ofertas" a partir de la lista. Módulo puro:
// lo usan tanto el endpoint de estadísticas como la vista (para mantener los
// números consistentes con la lista que realmente se muestra).
export function calcularEstadisticas(ofertas: MiOfertaDTO[]): EstadisticasOfertas {
  const stats: EstadisticasOfertas = {
    total: ofertas.length,
    enRevision: 0,
    preseleccionadas: 0,
    aceptadas: 0,
    rechazadas: 0,
    canceladas: 0,
    activas: 0,
  };

  for (const o of ofertas) {
    switch (o.estado) {
      case "enviada":
      case "en_revision":
        stats.enRevision++;
        stats.activas++;
        break;
      case "preseleccionado":
        stats.preseleccionadas++;
        stats.activas++;
        break;
      case "aceptado":
        stats.aceptadas++;
        break;
      case "rechazado":
        stats.rechazadas++;
        break;
      case "cancelado":
        stats.canceladas++;
        break;
    }
  }

  return stats;
}
