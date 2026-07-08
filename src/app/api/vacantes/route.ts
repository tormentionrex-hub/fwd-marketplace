import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { crearVacanteService } from '@/server/services/vacante.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { crearVacanteSchema } from '@/server/validation/vacantes.schema';

// POST /api/vacantes — crea una vacante nueva (queda en borrador). Solo empresarios.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const parseo = await parsearBody(request, crearVacanteSchema);
  if (!parseo.ok) return parseo.respuesta;
  const d = parseo.data;

  try {
    const { id } = await crearVacanteService(user.id, {
      titulo: d.titulo,
      descripcion: d.descripcion,
      area: d.area ?? null,
      modalidad: d.modalidad ?? null,
      tipoEmpleo: d.tipoEmpleo ?? null,
      nivelExperiencia: d.nivelExperiencia ?? null,
      ubicacion: d.ubicacion ?? null,
      salarioMin: d.salarioMin ?? null,
      salarioMax: d.salarioMax ?? null,
      salarioMoneda: d.salarioMoneda ?? 'CRC',
      salarioPeriodo: d.salarioPeriodo ?? null,
      salarioVisible: d.salarioVisible ?? true,
      responsabilidades: d.responsabilidades ?? null,
      requisitos: d.requisitos ?? null,
      beneficios: d.beneficios ?? null,
      plazas: d.plazas ?? 1,
      fechaCierre: d.fechaCierre ? new Date(d.fechaCierre) : null,
      tecnologias: d.tecnologias ?? [],
      imagenes: d.imagenes ?? [],
      documentos: d.documentos ?? [],
    });

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return errorInterno('vacantes/POST', e);
  }
}
