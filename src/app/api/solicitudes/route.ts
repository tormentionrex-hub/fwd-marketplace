import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  enviarSolicitud,
  listarSolicitudesEstudiante,
} from '@/server/services/solicitud-mensaje.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/solicitudes — un empresario envía una solicitud de contacto.
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'empresario') {
    return NextResponse.json({ error: 'Solo los empresarios pueden enviar solicitudes' }, { status: 403 });
  }

  let body: {
    idEstudiante?: string;
    asunto?: string;
    mensaje?: string;
    idProyecto?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const idEstudiante = (body.idEstudiante ?? '').trim();
  const asunto = (body.asunto ?? '').trim();
  const mensaje = (body.mensaje ?? '').trim();
  const idProyecto = body.idProyecto?.trim() ? body.idProyecto.trim() : null;

  if (!UUID_RE.test(idEstudiante)) {
    return NextResponse.json({ error: 'Estudiante inválido' }, { status: 400 });
  }
  if (!asunto || asunto.length > 200) {
    return NextResponse.json({ error: 'El asunto es obligatorio (máx. 200 caracteres)' }, { status: 400 });
  }
  if (!mensaje) {
    return NextResponse.json({ error: 'El mensaje es obligatorio' }, { status: 400 });
  }
  if (idProyecto && !UUID_RE.test(idProyecto)) {
    return NextResponse.json({ error: 'Proyecto inválido' }, { status: 400 });
  }

  const resultado = await enviarSolicitud({
    idEmpresario: user.id,
    idEstudiante,
    idProyecto,
    asunto: asunto.slice(0, 200),
    mensaje,
  });

  if (resultado === 'duplicada') {
    return NextResponse.json(
      { error: 'Ya tenés una solicitud pendiente con este estudiante.' },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, id: resultado.id }, { status: 201 });
}

// GET /api/solicitudes — un estudiante lista las solicitudes que recibió.
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }

  const solicitudes = await listarSolicitudesEstudiante(user.id);
  return NextResponse.json({ solicitudes });
}
