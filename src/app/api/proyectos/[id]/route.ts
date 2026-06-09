import { NextResponse } from 'next/server';
import { obtenerDetalleProyecto } from '@/server/services/proyecto.service';

// GET /api/proyectos/:id — información completa de la ficha pública del proyecto.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const proyecto = await obtenerDetalleProyecto(id);
  if (!proyecto) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ proyecto });
}
