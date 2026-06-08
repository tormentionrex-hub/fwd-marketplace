// Punto de entrada de los datos mock: re-exporta los arrays y expone helpers tipados.

import type { Proyecto, Oferta, Entregable, Mensaje } from '@/types';
import { usuarios, proyectos, ofertas, entregables, mensajes } from './data';

export { usuarios, proyectos, ofertas, entregables, mensajes };

// === Sesión simulada mientras no hay auth real ===
export const EMPRESARIO_ACTUAL_ID = 'emp-1';
export const ESTUDIANTE_ACTUAL_ID = 'est-1';

// === Helpers ===
export function getProyectoById(id: string): Proyecto | undefined {
  return proyectos.find((p) => p.id === id);
}

export function getProyectosByEmpresario(empresarioId: string): Proyecto[] {
  return proyectos.filter((p) => p.empresarioId === empresarioId);
}

export function getOfertasByProyecto(proyectoId: string): Oferta[] {
  return ofertas.filter((o) => o.proyectoId === proyectoId);
}

export function getOfertaDeEstudiante(
  proyectoId: string,
  estudianteId: string,
): Oferta | undefined {
  return ofertas.find(
    (o) => o.proyectoId === proyectoId && o.estudianteId === estudianteId,
  );
}

export function getEntregablesByProyecto(proyectoId: string): Entregable[] {
  return entregables.filter((e) => e.proyectoId === proyectoId);
}

export function getMensajesByProyecto(proyectoId: string): Mensaje[] {
  return mensajes.filter((m) => m.proyectoId === proyectoId);
}

// Tarjetas resumen de la Página 12 (Dashboard empresario).
export function resumenEmpresario(empresarioId: string): {
  activos: number;
  ofertasRecibidas: number;
  enDesarrollo: number;
  cerrados: number;
} {
  const propios = getProyectosByEmpresario(empresarioId);

  // "activos" = proyectos publicados recibiendo ofertas
  const activos = propios.filter((p) => p.estado === 'publicado').length;
  const enDesarrollo = propios.filter((p) => p.estado === 'en_desarrollo').length;
  const cerrados = propios.filter((p) => p.estado === 'cerrado').length;

  // ofertas recibidas en todos los proyectos del empresario
  const idsPropios = new Set(propios.map((p) => p.id));
  const ofertasRecibidas = ofertas.filter((o) => idsPropios.has(o.proyectoId)).length;

  return { activos, ofertasRecibidas, enDesarrollo, cerrados };
}
