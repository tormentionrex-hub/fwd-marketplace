import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { crearProyectoService } from '@/server/services/proyecto.service';
import { generarProyectoDesdeBrief } from '@/lib/ia-proyecto';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { generarProyectoIaSchema } from '@/server/validation/proyectos.schema';

// POST /api/proyectos/generar-ia
// Recibe un brief libre, lo estructura con IA (Gemini) y crea el proyecto como borrador.
// Devuelve { ok: true, id } para que el cliente redirija al formulario de edicion pre-llenado.
// Solo empresarios autenticados.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const parseo = await parsearBody(request, generarProyectoIaSchema);
  if (!parseo.ok) return parseo.respuesta;

  const { brief, contexto } = parseo.data;

  // Paso 1: generar estructura con IA (enriquecida con las respuestas a las preguntas guiadas si las hay)
  let datos;
  try {
    datos = await generarProyectoDesdeBrief(brief, contexto);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido en la IA';
    console.error('[generar-ia] Error en generacion:', msg);
    if (msg.includes('no configurada')) {
      return error('El servicio de IA no esta disponible. Contacta al administrador.', 503);
    }
    return error('No pudimos generar el proyecto. Intenta de nuevo en unos segundos.', 502);
  }

  // Paso 2: crear el borrador real con los datos generados
  try {
    const { id } = await crearProyectoService(user.id, {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      areaNegocio: datos.areaNegocio,
      plazoDias: datos.plazoDias,
      usaIA: false,
      tecnologias: datos.tecnologias,
      imagenes: [],
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return errorInterno('proyectos/generar-ia/POST', e);
  }
}
