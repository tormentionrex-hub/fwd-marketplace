import 'server-only';
import { listarProyectosDeEmpresario } from '@/server/repositories/proyecto.repository';

// Lógica del dashboard del empresario (Página 12): agrega y mapea los datos
// que consume la UI. Devuelve formas planas (fechas ya en ISO) listas para el RSC.

export type ResumenEmpresario = {
  activos: number;
  ofertasRecibidas: number;
  enDesarrollo: number;
  cerrados: number;
};

export type FilaProyectoEmpresario = {
  id: string;
  titulo: string;
  estado: string;
  candidatos: number;
  fechaLimite: string | null; // ISO; null si el proyecto no tiene plazo definido
};

// Deriva la fecha límite a partir de `cierre`, o de `publicado` + `plazo_dias`
// (mismo criterio que la Página 10 ya migrada).
function calcularFechaLimite(p: {
  cierre: Date | null;
  publicado: Date | null;
  plazo_dias: number | null;
}): string | null {
  if (p.cierre) return p.cierre.toISOString();
  if (p.publicado && p.plazo_dias != null) {
    return new Date(p.publicado.getTime() + p.plazo_dias * 86400000).toISOString();
  }
  return null;
}

export async function dashboardEmpresario(idEmpresario: string): Promise<{
  resumen: ResumenEmpresario;
  proyectos: FilaProyectoEmpresario[];
}> {
  const filas = await listarProyectosDeEmpresario(idEmpresario);

  const proyectos: FilaProyectoEmpresario[] = filas.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    estado: p.estado,
    candidatos: p._count.ofertas,
    fechaLimite: calcularFechaLimite(p),
  }));

  const resumen: ResumenEmpresario = {
    activos: filas.filter((p) => p.estado === 'publicado').length,
    enDesarrollo: filas.filter((p) => p.estado === 'en_desarrollo').length,
    cerrados: filas.filter((p) => p.estado === 'cerrado').length,
    ofertasRecibidas: filas.reduce((acc, p) => acc + p._count.ofertas, 0),
  };

  return { resumen, proyectos };
}
