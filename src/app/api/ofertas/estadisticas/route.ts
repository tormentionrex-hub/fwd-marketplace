import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { estadisticasMisOfertas } from '@/server/services/oferta.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/ofertas/estadisticas — contadores de ofertas del estudiante:
// total, en revisión, preseleccionadas, aceptadas, rechazadas, canceladas.
export async function GET() {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);

  try {
    const estadisticas = await estadisticasMisOfertas(user.id);
    return NextResponse.json({ estadisticas });
  } catch (e) {
    return errorInterno('ofertas/estadisticas', e);
  }
}
