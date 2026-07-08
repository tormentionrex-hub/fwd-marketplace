import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  obtenerDetalleVacante,
  actualizarVacanteService,
  eliminarVacanteService,
} from '@/server/services/vacante.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { actualizarVacanteSchema } from '@/server/validation/vacantes.schema';

// GET /api/vacantes/[id] — detalle público de una vacante.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const vacante = await obtenerDetalleVacante(id);
    if (!vacante) return error('Vacante no encontrada', 404);
    return NextResponse.json({ vacante });
  } catch (e) {
    return errorInterno('vacantes/[id]/GET', e);
  }
}

// PATCH /api/vacantes/[id] — actualiza campos. Solo el empresario dueño.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;
  const parseo = await parsearBody(request, actualizarVacanteSchema);
  if (!parseo.ok) return parseo.respuesta;
  const d = parseo.data;

  try {
    const resultado = await actualizarVacanteService(id, user.id, {
      ...(d.titulo !== undefined && { titulo: d.titulo }),
      ...(d.descripcion !== undefined && { descripcion: d.descripcion }),
      ...(d.area !== undefined && { area: d.area }),
      ...(d.modalidad !== undefined && { modalidad: d.modalidad }),
      ...(d.tipoEmpleo !== undefined && { tipoEmpleo: d.tipoEmpleo }),
      ...(d.nivelExperiencia !== undefined && { nivelExperiencia: d.nivelExperiencia }),
      ...(d.ubicacion !== undefined && { ubicacion: d.ubicacion }),
      ...(d.salarioMin !== undefined && { salarioMin: d.salarioMin }),
      ...(d.salarioMax !== undefined && { salarioMax: d.salarioMax }),
      ...(d.salarioMoneda !== undefined && { salarioMoneda: d.salarioMoneda }),
      ...(d.salarioPeriodo !== undefined && { salarioPeriodo: d.salarioPeriodo }),
      ...(d.salarioVisible !== undefined && { salarioVisible: d.salarioVisible }),
      ...(d.responsabilidades !== undefined && { responsabilidades: d.responsabilidades }),
      ...(d.requisitos !== undefined && { requisitos: d.requisitos }),
      ...(d.beneficios !== undefined && { beneficios: d.beneficios }),
      ...(d.plazas !== undefined && { plazas: d.plazas }),
      ...(d.fechaCierre !== undefined && {
        fechaCierre: d.fechaCierre ? new Date(d.fechaCierre) : null,
      }),
      ...(d.tecnologias !== undefined && { tecnologias: d.tecnologias }),
      ...(d.imagenes !== undefined && { imagenes: d.imagenes }),
      ...(d.documentos !== undefined && { documentos: d.documentos }),
    });

    if (resultado === 'no_encontrado') return error('Vacante no encontrada', 404);
    if (resultado === 'no_autorizado') return error('Esta vacante no es tuya', 403);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('vacantes/[id]/PATCH', e);
  }
}

// DELETE /api/vacantes/[id] — elimina la vacante. Solo el empresario dueño.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const { id } = await params;
  try {
    const resultado = await eliminarVacanteService(id, user.id);
    if (resultado === 'no_encontrado') return error('Vacante no encontrada', 404);
    if (resultado === 'no_autorizado') return error('Esta vacante no es tuya', 403);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('vacantes/[id]/DELETE', e);
  }
}
