import { NextResponse } from 'next/server';
import { obtenerDetalleProyecto } from '@/server/services/proyecto.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/proyectos/:id — información completa de la ficha pública del proyecto.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const proyecto = await obtenerDetalleProyecto(id);
    if (!proyecto) return error('Proyecto no encontrado', 404);
    return NextResponse.json({ proyecto });
  } catch (e) {
    return errorInterno('proyectos/GET', e);
  }
}
