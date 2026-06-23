import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';
import { listarReportes, resolverReporte } from '@/server/repositories/report.repository';
import { listarAuditorias, registrarAuditoria } from '@/server/repositories/audit-log.repository';

// GET /api/admin/reportes
// Devuelve la lista de reportes y los logs de auditoría. Solo staff.
export async function GET(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    return error('No autorizado', 401);
  }

  try {
    const [reportes, auditorias] = await Promise.all([
      listarReportes(),
      listarAuditorias(),
    ]);

    return NextResponse.json({ reportes, auditorias });
  } catch (e) {
    return errorInterno('admin/reportes/GET', e);
  }
}

// PATCH /api/admin/reportes
// Resuelve o desestima un reporte de moderación. Solo staff.
// Body: { id: string, accion: 'resuelto' | 'desestimado', resolucion: string }
export async function PATCH(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    return error('No autorizado', 401);
  }

  let body: { id?: string; accion?: 'resuelto' | 'desestimado'; resolucion?: string };
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const { id, accion, resolucion } = body;

  if (!id || !accion || !resolucion || resolucion.trim().length === 0) {
    return error('Datos incompletos', 400);
  }

  if (accion !== 'resuelto' && accion !== 'desestimado') {
    return error('Acción inválida', 400);
  }

  try {
    await resolverReporte(id, user.id, resolucion.trim(), accion);
    
    // Registrar acción en la auditoría inmutable
    await registrarAuditoria(
      user.id,
      user.nombre,
      `moderacion_${accion}`,
      `Se marco como ${accion} el reporte ID ${id}. Justificacion: ${resolucion.trim()}`,
      { reportId: id, action: accion }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('admin/reportes/PATCH', e);
  }
}
