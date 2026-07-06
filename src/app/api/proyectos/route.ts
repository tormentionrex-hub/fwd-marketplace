import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { crearProyectoService } from '@/server/services/proyecto.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { crearProyectoSchema } from '@/server/validation/proyectos.schema';

// POST /api/proyectos — Crea un proyecto nuevo (queda en borrador). Solo empresarios.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const parseo = await parsearBody(request, crearProyectoSchema);
  if (!parseo.ok) return parseo.respuesta;

  const { titulo, descripcion, areaNegocio, plazoDias, usaIA, tecnologias, imagenes } = parseo.data;

  try {
    const { id } = await crearProyectoService(user.id, {
      titulo,
      descripcion,
      areaNegocio: areaNegocio ?? null,
      plazoDias: plazoDias ?? null,
      usaIA: usaIA ?? false,
      tecnologias: tecnologias ?? [],
      imagenes: imagenes ?? [],
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return errorInterno('proyectos/POST', e);
  }
}
