import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { estadisticasMisOfertas } from '@/server/services/oferta.service';

// GET /api/ofertas/estadisticas — contadores de ofertas del estudiante:
// total, en revisión, preseleccionadas, aceptadas, rechazadas, canceladas.
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const estadisticas = await estadisticasMisOfertas(user.id);
  return NextResponse.json({ estadisticas });
}
