import { NextResponse } from 'next/server';
import { listarTecnologiasService } from '@/server/services/proyecto.service';
import { errorInterno } from '@/server/http/responder';

// GET /api/tecnologias — Lista todas las tecnologías disponibles (selector del form).
export async function GET() {
  try {
    const tecnologias = await listarTecnologiasService();
    return NextResponse.json({ tecnologias });
  } catch (e) {
    return errorInterno('tecnologias/GET', e);
  }
}
